import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { EuroStableCoin, OcnPaymentManager } from "../typechain";
import { DEFAULT_YEARLY_AMOUNT } from "../helper-hardhat-config";

task("send-stable-coins", "Sends stablecoins to the CPO operator").setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  const amountToSend = DEFAULT_YEARLY_AMOUNT * 10; // send 10 times the default amount
  const euroStableCoinContract: EuroStableCoin = await hre.ethers.getContract("EuroStableCoin");
  const { deployer, nodeOperator, cpoOperator, emspOperator } = await hre.getNamedAccounts();

  console.log("Sending stablecoins to parties from DEPLOYER");
  console.log("--------------------------------------------------");
  console.log(`Sending ${amountToSend} stablecoins to ${nodeOperator}`);
  await euroStableCoinContract.connect(await hre.ethers.getSigner(deployer)).transfer(nodeOperator, hre.ethers.parseUnits(amountToSend.toString()));
  console.log(`Sent ${amountToSend} stablecoins to ${nodeOperator}`);
  console.log("--------------------------------------------------");
  console.log(`Sending ${amountToSend} stablecoins to ${cpoOperator}`);
  await euroStableCoinContract.connect(await hre.ethers.getSigner(deployer)).transfer(cpoOperator, hre.ethers.parseUnits(amountToSend.toString()));
  console.log(`Sent ${amountToSend} stablecoins to ${cpoOperator}`);
  console.log("--------------------------------------------------");
  console.log(`Sending ${amountToSend} stablecoins to ${emspOperator}`);
  await euroStableCoinContract.connect(await hre.ethers.getSigner(deployer)).transfer(emspOperator, hre.ethers.parseUnits(amountToSend.toString()));
  console.log(`Sent ${amountToSend} stablecoins to ${emspOperator}`);
  console.log("--------------------------------------------------");

  // Show balances
  console.log("Balances after transfer:");
  console.log(`Deployer: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(deployer))}`);
  console.log(`Node Operator: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(nodeOperator))}`);
  console.log(`CPO Operator: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(cpoOperator))}`);
  console.log(`EMSP Operator: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(emspOperator))}`);
  console.log("--------------------------------------------------");

  // set approval to OCN Payment Manager for the parties
  const ocnPaymentManagerContract: OcnPaymentManager = await hre.ethers.getContract("OcnPaymentManager");
  console.log("Setting approval to OCN Payment Manager on behalf of deployer");
  await euroStableCoinContract.approve(ocnPaymentManagerContract.target, hre.ethers.MaxUint256);
  console.log("Setting approval to OCN Payment Manager on behalf of cpoOperator");
  await euroStableCoinContract.connect(await hre.ethers.getSigner(cpoOperator)).approve(ocnPaymentManagerContract.target, hre.ethers.MaxUint256);
  console.log("Setting approval to OCN Payment Manager on behalf of emspOperator");
  await euroStableCoinContract.connect(await hre.ethers.getSigner(emspOperator)).approve(ocnPaymentManagerContract.target, hre.ethers.MaxUint256);
  console.log("--------------------------------------------------");
  console.log("Done");
  console.log("--------------------------------------------------");
});
