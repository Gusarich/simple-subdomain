import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type SubdomainConfig = {
    owner: Address;
    records?: Cell;
};

export function subdomainConfigToCell(config: SubdomainConfig): Cell {
    return beginCell().storeAddress(config.owner).storeMaybeRef(config.records).endCell();
}

export class Subdomain implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Subdomain(address);
    }

    static createFromConfig(config: SubdomainConfig, code: Cell, workchain = 0) {
        const data = subdomainConfigToCell(config);
        const init = { code, data };
        return new Subdomain(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
