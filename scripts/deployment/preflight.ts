import path from "path";
import dotenv from "dotenv";
import { isAddress } from "ethers";

type Mode = "mock" | "external";

function fail(message: string): never {
  throw new Error(message);
}

function normalizePrivateKey(pk: string): string {
  return pk.startsWith("0x") ? pk : `0x${pk}`;
}

function assertPrivateKey(name: string, value: string | undefined): void {
  if (!value) fail(`${name} is required.`);
  const normalized = normalizePrivateKey(value);
  if (!/^0x[a-fA-F0-9]{64}$/.test(normalized)) {
    fail(`Invalid ${name} format. Expected 64 hex chars (0x prefix optional).`);
  }
}

function assertAddress(name: string, value: string | undefined): void {
  if (!value) fail(`${name} is required.`);
  if (!isAddress(value)) fail(`Invalid ${name}: ${value}`);
}

function parseAllowedVerifiers(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function main() {
  const [, , modeArg, stablecoinArg] = process.argv;
  const mode = modeArg as Mode;
  if (mode !== "mock" && mode !== "external") {
    fail('Usage: ts-node scripts/deployment/preflight.ts <mock|external> [stablecoin-address]');
  }

  dotenv.config({ path: path.resolve(process.cwd(), ".env") });

  assertPrivateKey("DEPLOYER_PRIVATE_KEY", process.env.DEPLOYER_PRIVATE_KEY);
  const hasGraphDeployKey = Boolean(process.env.GRAPH_DEPLOY_KEY);
  if (!hasGraphDeployKey) {
    console.warn(
      "Warning: GRAPH_DEPLOY_KEY is not set. Subgraph deployment will be skipped.",
    );
  }

  const defaultOperator = process.env.DEFAULT_OPERATOR;
  if (defaultOperator && !isAddress(defaultOperator)) {
    fail(`Invalid DEFAULT_OPERATOR: ${defaultOperator}`);
  }

  const allowedVerifiers = parseAllowedVerifiers(process.env.ALLOWED_VERIFIERS);
  for (const verifier of allowedVerifiers) {
    if (!isAddress(verifier)) fail(`Invalid verifier in ALLOWED_VERIFIERS: ${verifier}`);
  }

  if (mode === "mock") {
    const stablecoinFromEnv = process.env.STABLECOIN_ADDRESS;
    if (stablecoinFromEnv) {
      if (!isAddress(stablecoinFromEnv)) {
        fail(`Invalid STABLECOIN_ADDRESS in environment: ${stablecoinFromEnv}`);
      } else {
        console.warn(
          "Warning: STABLECOIN_ADDRESS is set but will be ignored by this mock deployment script.",
        );
      }
    }
  }

  if (mode === "external") {
    assertAddress("stablecoin-address argument", stablecoinArg);
  }

  console.log(`GRAPH_DEPLOY_KEY_PRESENT=${hasGraphDeployKey ? "1" : "0"}`);
}

main();
