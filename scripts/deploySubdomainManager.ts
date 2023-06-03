import { toNano } from 'ton-core';
import { SubdomainManager } from '../wrappers/SubdomainManager';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const subdomainManager = provider.open(
        SubdomainManager.createFromConfig(
            {
                owner: provider.sender().address!,
            },
            await compile('SubdomainManager')
        )
    );

    await subdomainManager.sendDeploy(provider.sender(), toNano('0.02'));
    await provider.waitForDeploy(subdomainManager.address);
}
