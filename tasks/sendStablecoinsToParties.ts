import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { EuroStableCoin, OcnPaymentManager } from "../typechain";
import { DEFAULT_YEARLY_AMOUNT } from "../helper-hardhat-config";

task("send-stable-coins", "Sends stablecoins to the CPO operator").setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  const amountToSend = DEFAULT_YEARLY_AMOUNT * 10; // send 10 times the default amount
  const euroStableCoinContract: EuroStableCoin = await hre.ethers.getContract("EuroStableCoin");
  const { deployer, cpoOperator, emspOperator } = await hre.getNamedAccounts();

  const log = hre.deployments.log;
  log("Sending stablecoins to parties");
  log("--------------------------------------------------");
  log(`Sending ${amountToSend} stablecoins to ${cpoOperator}`);
  await euroStableCoinContract.transfer(cpoOperator, hre.ethers.parseUnits(amountToSend.toString()));
  log(`Sent ${amountToSend} stablecoins to ${cpoOperator}`);
  log("--------------------------------------------------");
  log(`Sending ${amountToSend} stablecoins to ${emspOperator}`);
  await euroStableCoinContract.transfer(emspOperator, hre.ethers.parseUnits(amountToSend.toString()));
  log(`Sent ${amountToSend} stablecoins to ${emspOperator}`);
  log("--------------------------------------------------");

  // Show balances
  log("Balances after transfer:");
  log(`Node Operator (deployer): ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(deployer))}`);
  log(`CPO Operator: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(cpoOperator))}`);
  log(`EMSP Operator: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(emspOperator))}`);
  log("--------------------------------------------------");

  // set approval to OCN Payment Manager
  const ocnPaymentManagerContract: OcnPaymentManager = await hre.ethers.getContract("OcnPaymentManager");
  log("Setting approval to OCN Payment Manager on behalf of deployer");
  await euroStableCoinContract.approve(ocnPaymentManagerContract.target, hre.ethers.MaxUint256);
  log("Setting approval to OCN Payment Manager on behalf of cpoOperator");
  await euroStableCoinContract.connect(await hre.ethers.getSigner(cpoOperator)).approve(ocnPaymentManagerContract.target, hre.ethers.MaxUint256);
  log("Setting approval to OCN Payment Manager on behalf of emspOperator");
  await euroStableCoinContract.connect(await hre.ethers.getSigner(emspOperator)).approve(ocnPaymentManagerContract.target, hre.ethers.MaxUint256);
  log("--------------------------------------------------");
  log("Done");
  log("--------------------------------------------------");
});
