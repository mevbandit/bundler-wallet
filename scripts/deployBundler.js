const { deployBytes } = require('./hardhat.utils');
const Bundler = require('../build/artifacts/contracts/Bundler.json');

const main = async () => {
    const bundler = await deployBytes(
        'Bundler', [], Bundler.bytecode, true
    );
    console.log(bundler.address);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
