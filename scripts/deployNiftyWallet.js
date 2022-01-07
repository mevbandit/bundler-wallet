const { deploy } = require('./hardhat.utils');
const { labelhash } = require('@ensdomains/ensjs');

const getTokenId = name => {
    if (name.endsWith('.eth')) {
        return getTokenId(name.slice(0, name.length-4));
    } else {
        if (name.split('.').length > 1) {
            throw new Error('Subdomains are not supported!');
        }
        return hre.ethers.BigNumber.from(labelhash(name));
    }
}

const main = async () => {
    const tokenId = getTokenId('shadowysupercoder.eth');
    const bundler = await deploy(
        'NiftyWallet', ['0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85', tokenId], true
    );
    console.log(await bundler.deployTransaction.wait());

    const ownerNft = await bundler.ownerNft();
    console.log(ownerNft);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});