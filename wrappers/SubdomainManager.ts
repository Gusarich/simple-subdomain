import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SubdomainManagerConfig = {
    owner: Address;
    domains?: Cell;
    seed?: bigint;
};

export function subdomainManagerConfigToCell(config: SubdomainManagerConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeMaybeRef(config.domains)
        .storeUint(config.seed || Math.floor(Math.random() * 1e9), 64)
        .endCell();
}

function convertDomainToBytes(domain: string): Buffer {
    const parts = domain.split('.').reverse();
    const nullTerminatedParts = parts.map((part) => part + '\0');
    const nullTerminatedString = nullTerminatedParts.join('');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(nullTerminatedString);
    return Buffer.from(bytes);
}

export class SubdomainManager implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SubdomainManager(address);
    }

    static createFromConfig(config: SubdomainManagerConfig, code: Cell, workchain = 0) {
        const data = subdomainManagerConfigToCell(config);
        const init = { code, data };
        return new SubdomainManager(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getResolve(provider: ContractProvider, subdomain: string, category: bigint): Promise<[number, Cell]> {
        const bytes = convertDomainToBytes(subdomain);
        const result = (
            await provider.get('dnsresolve', [
                { type: 'slice', cell: beginCell().storeBuffer(bytes).endCell() },
                { type: 'int', value: category },
            ])
        ).stack;
        return [result.readNumber(), result.readCell()];
    }

    async getWallet(provider: ContractProvider, subdomain: string): Promise<Address> {
        const [_, value] = await this.getResolve(
            provider,
            subdomain,
            BigInt('0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1b')
        );
        return value.beginParse().skip(16).loadAddress();
    }

    async sendUpdate(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        domain: string,
        recordKey: bigint,
        recordValue?: Cell
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x537a3491, 32)
                .storeRef(beginCell().storeStringTail(domain).endCell())
                .storeUint(recordKey, 256)
                .storeMaybeRef(recordValue)
                .endCell(),
        });
    }

    async sendSetNextResolver(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        domain: string,
        resolver: Address
    ) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            BigInt('0x19f02441ee588fdb26ee24b2568dd035c3c9206e11ab979be62e55558a1d17ff'),
            beginCell().storeUint(0xba93, 16).storeAddress(resolver).endCell()
        );
    }

    async sendSetWallet(provider: ContractProvider, via: Sender, value: bigint, domain: string, wallet: Address) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            BigInt('0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1b'),
            beginCell().storeUint(0x9fd3, 16).storeAddress(wallet).storeUint(0, 8).endCell()
        );
    }

    async sendSetSite(provider: ContractProvider, via: Sender, value: bigint, domain: string, adnlAddress: Buffer) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            BigInt('0xfbae041b02c41ed0fd8a4efb039bc780dd6af4a1f0c420f42561ae705dda43fe'),
            beginCell().storeUint(0xad01, 16).storeBuffer(adnlAddress).storeUint(0, 8).endCell()
        );
    }

    async sendSetStorage(provider: ContractProvider, via: Sender, value: bigint, domain: string, bagId: Buffer) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            BigInt('0x49a25f9feefaffecad0fcd30c50dc9331cff8b55ece53def6285c09e17e6f5d7'),
            beginCell().storeUint(0x7473, 16).storeBuffer(bagId).storeUint(0, 8).endCell()
        );
    }
}
