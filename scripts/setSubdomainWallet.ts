import { Address, toNano } from 'ton-core';
import { SubdomainManager } from '../wrappers/SubdomainManager';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const subdomainManager = provider.open(
        SubdomainManager.createFromAddress(Address.parse('EQApEmWDFvpO0HkLv-QxHucmhsZ2QNEOiBX5MmUsien0Uaqj'))
    );

    await subdomainManager.sendSetWallet(
        provider.sender(),
        toNano('0.02'),
        'test',
        Address.parse('EQBKgXCNLPexWhs2L79kiARR1phGH1LwXxRbNsCFF9doc2lN')
    );
}
