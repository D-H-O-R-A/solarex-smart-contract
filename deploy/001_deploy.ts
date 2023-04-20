import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as ethers from 'ethers';
import * as zk from 'zksync-web3';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import chalk from 'chalk';

// An example of a deploy script which will deploy and call a factory-like contract (meaning that the main contract
// may deploy other contracts).
//
// In terms of presentation it's mostly copied from `001_deploy.ts`, so this example acts more like an integration test
// for plugins/server capabilities.

const Seed = "grow present script laundry spring lizard resist party arctic arrange seed solution"

const WETH = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91"

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.era.zksync.io');


export default async function (hre: HardhatRuntimeEnvironment) {
    console.info(chalk.yellow(`Running deploy script for the Factory contract`));

    // Initialize an Ethereum wallet.
    const zkWallet = zk.Wallet.fromMnemonic(Seed, "m/44'/60'/0'/0/0");

    // Create deployer object and load desired artifact.
    const deployer = new Deployer(hre, zkWallet);
    console.info("Address:",chalk.red(deployer.zkWallet.address))

    // Get gas price from zkSync testnet gas price oracle
    const gasPrice = await provider.getGasPrice();

    console.log('Current gas price:', gasPrice.toString(), 'wei');

    // Deposit some funds to L2 in order to be able to perform deposits.
    // const depositHandle = await deployer.zkWallet.deposit({
    //     to: deployer.zkWallet.address,
    //     token: zk.utils.ETH_ADDRESS,
    //     amount: ethers.utils.parseEther('0.01'),
    // });
    // await depositHandle.wait();


    // Load the artifact we want to deploy.
    const artifact = await deployer.loadArtifact('SolarexSwapFactory');

    // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
    // This contract has no constructor arguments.
    const factoryContractGasEstimate = await deployer.estimateDeployGas(artifact, [deployer.zkWallet.address]);
    const factoryContractFeeEstimate = await deployer.estimateDeployFee(artifact, [deployer.zkWallet.address]);

    console.info(`Gas estimate for SolarexSwapFactory: ${(factoryContractGasEstimate).toString()} gas
Fee estimate for SolarexSwapFactory: ${(factoryContractFeeEstimate).toString()} wei
Total Fee: ${(factoryContractGasEstimate.mul(gasPrice)).toString()} wei
    `)
    const factoryContract = await deployer.deploy(artifact, [deployer.zkWallet.address]);

    // Show the contract info.
    const factorycontractAddress = factoryContract.address;
    console.info(chalk.green(`${artifact.contractName} was deployed to ${factorycontractAddress}!`));

    console.info(chalk.yellow(`Running deploy script for the Router contract`));

    const artifact1 = await deployer.loadArtifact('SolarexSwapRouter');

    const routerContractGasEstimate = await deployer.estimateDeployGas(artifact1, [factorycontractAddress,WETH]);
    const routerContractFeeEstimate = await deployer.estimateDeployFee(artifact1, [factorycontractAddress,WETH]);

    console.info(`Gas estimate for SolarexSwapRouter: ${(routerContractGasEstimate).toString()} gas
Fee estimate for SolarexSwapRouter: ${(routerContractFeeEstimate).toString()} wei
Total Fee: ${(routerContractGasEstimate.mul(gasPrice)).toString()} wei
    `)

    const routerContract = await deployer.deploy(artifact1, [factorycontractAddress,WETH]);

    const routercontractAddress = routerContract.address;

    console.info(chalk.green(`${artifact1.contractName} was deployed to ${routercontractAddress}!`));

    console.info(chalk.green(`Successful deploy from all contracts!`));

    console.info(`
    Factory: ${factorycontractAddress}
    Router: ${routercontractAddress}
    `)
}