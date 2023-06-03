import { Address, toNano } from 'ton-core';
import { SubdomainManager } from '../wrappers/SubdomainManager';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const subdomainManager = provider.open(
        SubdomainManager.createFromAddress(Address.parse('EQCuUtg1jrIuLDWHRoNWxALr5iAib5or4yUEOyyi5C43MHtf'))
    );

    await subdomainManager.sendSetWallet(
        provider.sender(),
        toNano('0.02'),
        '1',
        Address.parse('EQBKgXCNLPexWhs2L79kiARR1phGH1LwXxRbNsCFF9doc2lN')
    );

    // await subdomainManager.sendSetNextResolver(
    //     provider.sender(),
    //     toNano('0.02'),
    //     '2',
    //     Address.parse('EQCuUtg1jrIuLDWHRoNWxALr5iAib5or4yUEOyyi5C43MHtf')
    // );
}
