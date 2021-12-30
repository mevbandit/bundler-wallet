const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deploy, deployBytes, encodeBundle, toEther } = require('../scripts/hardhat.utils');
const Bundler = require('../build/artifacts/contracts/Bundler.json');

const { TEST_MNEMONIC } = process.env;

describe('[START] - Bundler.test.js', function () {
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
        // const numBundles = 20;
        const numTransfers = 10;
        const balance = toEther(1000);
        const transferValue = toEther(100);
        // const expectedBalance = balance.sub(transferValue.mul(numTransfers*numBundles));
        const expectedBalance = balance.sub(transferValue.mul(numTransfers));

        const bundledTxns = {
            targets: [],
            sendValues: [],
            calldatas: []
        };
        // for (let j = 0; j < numBundles; j++) {
            for (let i = 0; i < numTransfers; i++) {
                bundledTxns.targets.push(this.token.address);
                bundledTxns.sendValues.push(0);
                bundledTxns.calldatas.push(this.transferEncoder([this.accounts[i], transferValue]))
            };
        // };
        const bundle = encodeBundle(bundledTxns.targets, bundledTxns.sendValues, bundledTxns.calldatas);
        const beforeBalance = await this.token.balanceOf(this.bundler.address);

        const tx = await (await this.signer.sendTransaction({
            to: this.bundler.address,
            data: bundle,
        })).wait();

        if (0) console.log(tx);

        const afterBalance = await this.token.balanceOf(this.bundler.address);
        expect(beforeBalance).to.be.equal(balance);
        expect(afterBalance).to.be.equal(expectedBalance);

        // for (let i = 0; i < 10; i++) {
        //     expect(await this.token.balanceOf(this.accounts[i]))
        //         .to.be.equal(toEther(100))
        // };
    }).timeout(120000);
});