const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deploy, encodeBundle, toEther } = require('../scripts/hardhat.utils');

const { TEST_MNEMONIC } = process.env;

describe('[START] - NiftyWallet.test.js', function () {
    before(async () => {
        this.accounts = [];
        for (let i = 0; i < 32; i++) {
            const wallet = ethers.Wallet.fromMnemonic(TEST_MNEMONIC, `m/44'/60'/0'/0/${i}`);
            this.accounts.push(wallet.address);
        }
        this.signers = await ethers.getSigners();
        this.signer = this.signers[0];
        this.token = await deploy(
            'Token',
            [toEther(1000), this.signer.address]
        );
        this.transferEncoder = (args) => 
            this.token.interface.encodeFunctionData('transfer', args);

        this.nft = await deploy('ERC721PresetMinterPauserAutoId', ['NftOwners', 'NFTO', '']);
        await this.nft.mint(this.signer.address);

        this.bundler = await deploy('NiftyWallet', [this.nft.address, 0]);
    });

    it('should transfer tokens to the bundler', async () => {
        await expect(
            this.token.transfer(this.bundler.address, toEther(1000))
        ).to.emit(this.token, 'Transfer')
            .withArgs(this.signer.address, this.bundler.address, toEther(1000));
    });

    it('should call an encoded bundle of token transfers', async () => {
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
    });

    it('should transfer ownership by the nft owner', async () => {
        const previousOwner = await this.bundler.owner();
        expect(previousOwner).to.be.equal(this.signer.address);
        await this.nft.transferFrom(this.signer.address, this.accounts[0], 0);
        const currentOwner = await this.bundler.owner();
        expect(currentOwner).to.be.equal(this.accounts[0]);
    });

    it('bundler should accept safeTransferFrom nfts', async () => {
        const func = 'safeTransferFrom(address,address,uint256)';
        await this.nft.mint(this.signer.address);
        await this.nft[func](this.signer.address, this.bundler.address, 1);
        expect(await this.nft.ownerOf(1)).to.be.equal(this.bundler.address);
    });
});
