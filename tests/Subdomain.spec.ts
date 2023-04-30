import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Subdomain } from '../wrappers/Subdomain';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Subdomain', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Subdomain');
    });

    let blockchain: Blockchain;
    let subdomain: SandboxContract<Subdomain>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        subdomain = blockchain.openContract(Subdomain.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await subdomain.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: subdomain.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and subdomain are ready to use
    });
});
