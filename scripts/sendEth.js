const { ethers } = require('hardhat');
const { encodeBundle, toEther } = require('./hardhat.utils');

const { TEST_MNEMONIC } = process.env;

const bundlerAddr = "0x6B46727919640b45801fC126Bd6BE17161D8A40b";

const main = async () => {
    const recipients = [];
    const sendValues = [];
    const calldatas = [];
    for (let i = 0; i < 32; i++) {
        const wallet = ethers.Wallet.fromMnemonic(TEST_MNEMONIC, `m/44'/60'/0'/0/${i}`);
        recipients.push(wallet.address);
        sendValues.push(toEther('0.01'));
        calldatas.push('');
    }

    const bundle = encodeBundle(recipients, sendValues, calldatas);
    const signer = await ethers.getSigner();
    const tx = await (await signer.sendTransaction({
        to: bundlerAddr, 
        data: bundle,
        value: toEther(0.32)
    })).wait();
    console.log(tx.logs);
}

main().then(()=>process.exit()).catch(err => {
    console.error(err);
    process.exit(1);
});