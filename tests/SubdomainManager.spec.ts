import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
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

    it('should update records by admin', async () => {
        const result = await subdomainManager.sendUpdate(
            owner.getSender(),
            toNano('0.05'),
            1n,
            beginCell().storeUint(123, 64).endCell()
        );
        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: subdomainManager.address,
            success: true,
        });
    });

    it('should not update records not by admin', async () => {
        const wallet = await blockchain.treasury('wallet');
        const result = await subdomainManager.sendUpdate(
            wallet.getSender(),
            toNano('0.05'),
            1n,
            beginCell().storeUint(123, 64).endCell()
        );
        expect(result.transactions).toHaveTransaction({
            from: wallet.address,
            to: subdomainManager.address,
            success: false,
        });
    });
});
