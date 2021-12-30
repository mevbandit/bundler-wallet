const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deploy, deployBytes, encodeBundle, toEther } = require('../scripts/hardhat.utils');
const Bundler = require('../build/artifacts/contracts/BundlerV2.json');

const { TEST_MNEMONIC } = process.env;

describe('[START] - BundlerV2.test.js', function () {
    before(async () => {
        this.signers = await ethers.getSigners();
        this.signer = this.signers[0];
        this.bundler = await deployBytes(
            'Bundler', [], Bundler.bytecode
        );
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
        const bundledTxns = {
            targets: [],
            sendValues: [],
            calldatas: []
        };
        for (let i = 0; i < 10; i++) {
            bundledTxns.targets.push(this.token.address);
            bundledTxns.sendValues.push(0);
            bundledTxns.calldatas.push(this.transferEncoder([this.accounts[i], toEther(100)]))
        };
        const bundle = encodeBundle(bundledTxns.targets, bundledTxns.sendValues, bundledTxns.calldatas);
        const beforeBalance = await this.token.balanceOf(this.bundler.address);

        const tx = await (await this.signer.sendTransaction({
            to: this.bundler.address,
            data: bundle,
        })).wait();

        if (0) console.log(tx);

        const afterBalance = await this.token.balanceOf(this.bundler.address);
        expect(beforeBalance).to.be.equal(toEther(1000));
        expect(afterBalance).to.be.equal(0);

        for (let i = 0; i < 10; i++) {
            expect(await this.token.balanceOf(this.accounts[i]))
                .to.be.equal(toEther(100))
        };
    });
});
