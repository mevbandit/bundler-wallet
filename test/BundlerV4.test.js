const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deploy, encodeBundle, toEther } = require('../scripts/hardhat.utils');

const { TEST_MNEMONIC } = process.env;

describe('[START] - BundlerV4.test.js', function () {
    before(async () => {
        this.signers = await ethers.getSigners();
        this.signer = this.signers[0];
        this.bundler = await deploy('BundlerV4', []);
        this.token = await deploy(
            'Token',
            [toEther(1000), this.signer.address]
        );
        this.transferEncoder = (args) => 
            this.token.interface.encodeFunctionData('transfer', args);

        this.accounts = [];
        for (let i = 0; i < 32; i++) {
            const wallet = ethers.Wallet.fromMnemonic(TEST_MNEMONIC, `m/44'/60'/0'/0/${i}`);
            this.accounts.push(wallet.address);
        }
    });

    it('should transfer tokens to the bundler', async () => {
        await expect(
            this.token.transfer(this.bundler.address, toEther(1000))
        ).to.emit(this.token, 'Transfer')
            .withArgs(this.signer.address, this.bundler.address, toEther(1000));
    });

    it('should call an encoded a bundle', async () => {
        const numTransfers = 10;
        const balance = toEther(1000);
        const transferValue = toEther(100);
        const expectedBalance = balance.sub(transferValue.mul(numTransfers));

        const bundledTxns = {
            targets: [],
            sendValues: [],
            calldatas: []
        };
        for (let i = 0; i < numTransfers; i++) {
            bundledTxns.targets.push(this.token.address);
            bundledTxns.sendValues.push(0);
            bundledTxns.calldatas.push(this.transferEncoder([this.accounts[i], transferValue]))
        };
        const bundle = encodeBundle(bundledTxns.targets, bundledTxns.sendValues, bundledTxns.calldatas);
        const beforeBalance = await this.token.balanceOf(this.bundler.address);
        await this.bundler.submitBundle(bundle);
    
        const afterBalance = await this.token.balanceOf(this.bundler.address);
        expect(beforeBalance).to.be.equal(balance);
        expect(afterBalance).to.be.equal(expectedBalance);

        // for (let i = 0; i < 10; i++) {
        //     expect(await this.token.balanceOf(this.accounts[i]))
        //         .to.be.equal(toEther(100))
        // };
    });
});