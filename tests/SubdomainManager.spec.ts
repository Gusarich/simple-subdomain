import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { SubdomainManager } from '../wrappers/SubdomainManager';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Subdomain', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SubdomainManager');
    });

    let blockchain: Blockchain;
    let subdomainManager: SandboxContract<SubdomainManager>;
    let owner: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');

        subdomainManager = blockchain.openContract(
            SubdomainManager.createFromConfig(
                {
                    owner: owner.address,
                },
                code
            )
        );

        const deployResult = await subdomainManager.sendDeploy(owner.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: subdomainManager.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});
});
