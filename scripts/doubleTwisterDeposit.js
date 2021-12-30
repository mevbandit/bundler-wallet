// const { ethers } = require('hardhat');
// const { genDeposit } = require('twister-ethers');
// const { encodeBundle } = require('./hardhat.utils');

// const bundlerAddr = "0x6B46727919640b45801fC126Bd6BE17161D8A40b";
// const arbFraxAddr = "0x2f5b2ab6b28e132ad21e6f50018a4dce57d2ca17";
// const twisterAddr = "0x2Ea4BD061d69B4a31C35a05c36c700192f038400";
// const arbFraxAbi = [
//     'function approve(address spender, uint value) public returns (bool)',
//     'function allowance(address owner, address spender) public view returns (uint)'
// ];
// const twisterAbi = ['function deposit(bytes32 commitment) public'];

// const main = async () => {
//     const notes = [];
//     for (let i = 0; i < 2; i++) {
//         const deposit = genDeposit({currency: 'FRAX', denomination: 10000, netId: 421611 });
//         const noteString = deposit.noteString;
//         const commitmentHex = deposit.commitmentHex;
//         notes.push({noteString, commitmentHex});
//     }
//     console.log(notes);
//     const fraxIface = new ethers.utils.Interface(arbFraxAbi);
//     const twisterIface = new ethers.utils.Interface(twisterAbi);

//     const approveCalldata = fraxIface.encodeFunctionData('approve', [twisterAddr, ethers.utils.parseEther('10000')]);
//     const depositCalldata = twisterIface.encodeFunctionData('deposit', [notes[0].commitmentHex]);
    
//     const targets = [arbFraxAddr, twisterAddr];
//     const sendValues = [0, 0];
//     const calldatas = [approveCalldata, depositCalldata];
//     const bundle = encodeBundle(targets, sendValues, calldatas);
    
//     const signer = await ethers.getSigner();
//     const tx = await (await signer.sendTransaction({to: bundlerAddr, data: bundle, gasLimit: 1500000})).wait();
//     console.log(tx.logs);
//     const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.arbitrum.io/rpc');
//     const frax = new ethers.Contract(arbFraxAddr, arbFraxAbi, provider);
//     const allowance = await frax.allowance(bundlerAddr, twisterAddr);
//     console.log(allowance);
// }

// main().then(()=>process.exit()).catch(err => {
//     console.error(err);
//     process.exit(1);
// });