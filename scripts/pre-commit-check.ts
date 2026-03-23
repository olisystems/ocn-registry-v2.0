import { execSync } from 'child_process';
import { Wallet } from 'ethers';

// ANSI colors for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Well-known test private keys that are acceptable (Hardhat/Ganache defaults)
const KNOWN_TEST_KEYS = new Set([
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
  // Without 0x prefix
  'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
]);

interface FoundKey {
  key: string;
  file: string;
  line: number;
  isTestKey: boolean;
}

/**
 * Check if a token is a valid Ethereum private key by trying to create a wallet
 */
function isValidPrivateKey(token: string): boolean {
  // Clean the token - remove quotes, semicolons, etc.
  let cleaned = token.replace(/^["'`]|["'`]$/g, '').replace(/[,;]$/, '');
  
  // Skip if too short or too long to be a private key
  if (cleaned.length < 64 || cleaned.length > 66) {
    return false;
  }

  // Add 0x prefix if it looks like a hex string without it
  if (cleaned.length === 64 && /^[a-fA-F0-9]+$/.test(cleaned)) {
    cleaned = '0x' + cleaned;
  }

  // Must start with 0x and be 66 chars
  if (!cleaned.startsWith('0x') || cleaned.length !== 66) {
    return false;
  }

  try {
    // Try to create a wallet - if it succeeds, it's a valid private key
    new Wallet(cleaned);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize a private key to lowercase with 0x prefix for comparison
 */
function normalizeKey(key: string): string {
  let cleaned = key.replace(/^["'`]|["'`]$/g, '').replace(/[,;]$/, '').toLowerCase();
  if (!cleaned.startsWith('0x') && cleaned.length === 64) {
    cleaned = '0x' + cleaned;
  }
  return cleaned;
}

/**
 * Get the diff content for staged files
 */
function getStagedDiff(): string {
  try {
    return execSync('git diff --cached --diff-filter=d -U0', { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

/**
 * Parse diff to get file names and added lines
 */
function parseDiff(diff: string): Map<string, { lineNum: number; content: string }[]> {
  const fileChanges = new Map<string, { lineNum: number; content: string }[]>();
  let currentFile = '';
  let currentLineNum = 0;

  for (const line of diff.split('\n')) {
    // Match file header: +++ b/path/to/file
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6);
      if (!fileChanges.has(currentFile)) {
        fileChanges.set(currentFile, []);
      }
    }
    // Match hunk header: @@ -x,y +a,b @@
    else if (line.startsWith('@@')) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)/);
      if (match) {
        currentLineNum = parseInt(match[1], 10);
      }
    }
    // Match added lines (but not the +++ header)
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      const content = line.slice(1); // Remove the leading +
      if (currentFile && content.trim()) {
        fileChanges.get(currentFile)?.push({
          lineNum: currentLineNum,
          content,
        });
      }
      currentLineNum++;
    }
    // Track line numbers for context lines too
    else if (!line.startsWith('-')) {
      currentLineNum++;
    }
  }

  return fileChanges;
}

/**
 * Extract all tokens (whitespace-separated) from a line
 */
function extractTokens(line: string): string[] {
  // Split by whitespace and common delimiters
  return line.split(/[\s=:,;()\[\]{}]+/).filter(token => token.length > 0);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log(`${BOLD}🔍 Checking for private keys in staged changes...${RESET}\n`);

  const diff = getStagedDiff();
  
  if (!diff.trim()) {
    console.log(`${GREEN}✅ No staged changes to check${RESET}`);
    process.exit(0);
  }

  const fileChanges = parseDiff(diff);
  const foundKeys: FoundKey[] = [];
  const checkedTokens = new Set<string>(); // Avoid checking duplicates

  // Directories that only contain public blockchain data (tx hashes, block hashes, etc.)
  const EXCLUDED_PATHS = ['src/deployments/'];

  for (const [file, changes] of fileChanges) {
    if (EXCLUDED_PATHS.some(p => file.startsWith(p))) continue;
    for (const { lineNum, content } of changes) {
      const tokens = extractTokens(content);
      
      for (const token of tokens) {
        // Skip if we've already checked this token
        if (checkedTokens.has(token)) continue;
        checkedTokens.add(token);

        if (isValidPrivateKey(token)) {
          const normalized = normalizeKey(token);
          const isTestKey = KNOWN_TEST_KEYS.has(normalized);
          
          foundKeys.push({
            key: token,
            file,
            line: lineNum,
            isTestKey,
          });
        }
      }
    }
  }

  // Report findings
  const realKeys = foundKeys.filter(k => !k.isTestKey);
  const testKeys = foundKeys.filter(k => k.isTestKey);

  if (testKeys.length > 0) {
    console.log(`${YELLOW}⚠️  Known test private keys detected (Hardhat/Ganache defaults):${RESET}`);
    for (const { file, line, key } of testKeys) {
      const shortKey = key.length > 20 ? key.slice(0, 10) + '...' + key.slice(-8) : key;
      console.log(`   ${file}:${line} → ${shortKey}`);
    }
    console.log();
  }

  if (realKeys.length > 0) {
    console.log(`${RED}${BOLD}❌ REAL PRIVATE KEYS DETECTED:${RESET}`);
    for (const { file, line, key } of realKeys) {
      const shortKey = key.length > 20 ? key.slice(0, 10) + '...' + key.slice(-8) : key;
      console.log(`${RED}   ${file}:${line} → ${shortKey}${RESET}`);
    }
    console.log();
    console.log(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`${RED}${BOLD}🚫 COMMIT BLOCKED: Real private keys detected!${RESET}`);
    console.log();
    console.log(`${YELLOW}If these are intentional, you can:${RESET}`);
    console.log(`  1. Add the keys to KNOWN_TEST_KEYS in scripts/pre-commit-check.ts`);
    console.log(`  2. Use environment variables instead of hardcoding`);
    console.log(`  3. Skip this check with: git commit --no-verify`);
    console.log(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    process.exit(1);
  }

  // Check for .env files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=d', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  const envFiles = stagedFiles.filter(f => /\.env($|\.)/.test(f));
  if (envFiles.length > 0) {
    console.log(`${RED}❌ .ENV FILE STAGED FOR COMMIT:${RESET}`);
    envFiles.forEach(f => console.log(`   ${f}`));
    console.log(`${YELLOW}   These files typically contain secrets and should be in .gitignore${RESET}`);
    process.exit(1);
  }

  console.log(`${GREEN}${BOLD}✅ No private keys detected in staged changes${RESET}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Pre-commit check failed:', err);
  process.exit(1);
});

