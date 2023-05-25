import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SubdomainManagerConfig = {
    owner: Address;
    records?: Cell;
};

export function subdomainManagerConfigToCell(config: SubdomainManagerConfig): Cell {
    return beginCell().storeAddress(config.owner).storeMaybeRef(config.records).endCell();
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

    async sendUpdate(provider: ContractProvider, via: Sender, value: bigint, recordKey: bigint, recordValue?: Cell) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x6151f535, 32).storeUint(recordKey, 256).storeMaybeRef(recordValue).endCell(),
        });
    }
}
