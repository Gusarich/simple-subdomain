import { toNano } from 'ton-core';
import { Subdomain } from '../wrappers/Subdomain';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const subdomain = provider.open(Subdomain.createFromConfig({}, await compile('Subdomain')));

    await subdomain.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(subdomain.address);

    // run methods on `subdomain`
}
