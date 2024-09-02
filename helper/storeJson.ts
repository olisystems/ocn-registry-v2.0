import { network } from "hardhat";
import { proxiesFile } from "../helper-hardhat-config";
import fs from "fs";
import * as path from "path";

export async function storeProxyAddress(proxyAddress: string, contractName: string) {
  let proxies: any;
  console.log(`Storing proxy address ${proxyAddress} for ${contractName} at : ${proxiesFile}`);
  if (fs.existsSync(proxiesFile)) {
    proxies = JSON.parse(fs.readFileSync(proxiesFile, "utf8"));
    if (!proxies[network.name]) {
      proxies[network.name] = {};
      proxies[network.name][contractName] = {};
    } else {
      if (!proxies[network.name][contractName]) {
        proxies[network.name][contractName] = [];
      }
    }
  } else {
    proxies = {};
    proxies[network.name] = {};
    proxies[network.name][contractName] = [];
  }
  proxies[network.name][contractName].push(proxyAddress.toString());
  fs.writeFileSync(proxiesFile, JSON.stringify(proxies), "utf8");
}

export async function getLastProxyAddress(contractName: string) {
  let proxies: any;

  if (fs.existsSync(proxiesFile)) {
    proxies = JSON.parse(fs.readFileSync(proxiesFile, "utf8"));
    if (!proxies[network.name]) {
      return null;
    } else {
      if (!proxies[network.name][contractName]) {
        return null;
      }
    }
  } else {
    return null;
  }
  return proxies[network.name][contractName].at(-1);
}
