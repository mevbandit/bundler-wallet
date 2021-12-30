async function impersonateAccount(account) {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account]
    });
}

async function stopImpersonatingAccount(account) {
    await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [account]
    });
}

async function enableForking(rpcUrl, blocknumber) {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                jsonRpcUrl: rpcUrl,
                blockNumber: blocknumber
            }
        }]
    });
}

async function disableForking() {
    await hre.network.provider.request({
        method: "hardhat_reset"
    });
}

async function increaseTime(time) {
    await hre.network.provider.request({
        method: "evm_increaseTime",
        params: [time]
    });
    await mineBlock();
}

async function setNextBlockTimestamp(time) {
    await hre.network.provider.request({
        method: "evm_setNextBlockTimestamp",
        params: [time]
    });
}

async function mineBlock() {
    await hre.network.provider.request({
        method: "evm_mine",
    });
}

async function snapshot() {
    const snapshotId = await hre.network.provider.request({
        method: "evm_snapshot",
    });
    return snapshotId;
}

async function revertSnapshot(snapshotId) {
    await hre.network.provider.request({
        method: "evm_revert",
        params: [snapshotId]
    });
}

async function deploy(contractName, constructorArgs=[], verbose=false) {
    let contract;
    let factory = await hre.ethers.getContractFactory(contractName);
    if (constructorArgs == []) {
        contract = await factory.deploy();
    } else {
        contract = await factory.deploy(...constructorArgs);
    }
    await contract.deployed();
    if (verbose)
        console.log(`Deployed ${contractName} at ${contract.address}`);
    return contract;
}

async function deployBytes(contractName, abi, bytecode, verbose=false) {
    const [signer] = await hre.ethers.getSigners();
    const interface = new hre.ethers.utils.Interface(abi);
    const factory = new hre.ethers.ContractFactory(interface, bytecode, signer);

    const contract = await factory.deploy();
    await contract.deployed();
    if (verbose)
        console.log(`Deployed ${contractName} at ${contract.address}`);
    return contract;
}

function encodeBundle(targets, sendValues, calldatas, tokenReceiver) {
    if (!Array.isArray(targets) || !Array.isArray(sendValues) || !Array.isArray(calldatas)) {
        throw new Error('Invalid input: expected Array types');
    }
    if ((targets.length !== sendValues.length) && (targets.length !== calldatas.length)) {
        throw new Error('Bundle size mismatch');
    }

    if (tokenReceiver) {
        const firstTarget = targets[0].toLowerCase();
        if (firstTarget.startsWith('0x8da5cb5b')) {
            throw new Error('First address in bundle collides with owner function!');
        }
        if (firstTarget.startsWith('0x2cab7521')) {
            throw new Error('First address in bundle collides with ownerNft function!');
        }
        if (firstTarget.startsWith('0x150b7a02')) {
            throw new Error('First address in bundle collides with onERC721Received function!');
        }
        if (firstTarget.startsWith('0xf23a6e61')) {
            throw new Error('First address in bundle collides with onERC1155Received function!');
        }
        if (firstTarget.startsWith('0xbc197c81')) { 
            throw new Error('First address in bundle collides with onERC1155BatchReceived function!');
        }
    }

    const bundle = [];
    for (let i = 0; i < targets.length; i++) {
        if (!calldatas[i].length) {
            bundle.push(
                hre.ethers.utils.solidityPack(
                    ['address', 'uint80', 'uint16'],
                    [
                        targets[i], 
                        sendValues[i], 
                        0
                    ]
                ).slice(2)    
            )
        } else {
            bundle.push(
                hre.ethers.utils.solidityPack(
                    ['address', 'uint80', 'uint16', 'bytes'],
                    [
                        targets[i], 
                        sendValues[i], 
                        ((calldatas[i].length - 2) / 2),
                        calldatas[i]
                    ]
                ).slice(2)
            );
        }
    }
    return '0x'.concat(...bundle);
}

const toEther = val => hre.ethers.utils.parseEther(val.toString());

module.exports = {
    impersonateAccount,
    stopImpersonatingAccount,
    enableForking,
    disableForking,
    increaseTime,
    setNextBlockTimestamp,
    mineBlock,
    snapshot,
    revertSnapshot,
    deploy,
    deployBytes,
    encodeBundle,
    toEther
}