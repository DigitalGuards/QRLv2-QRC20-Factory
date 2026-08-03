const Q_ADDRESS_PATTERN = /^Q[0-9a-fA-F]{40}$/;

function requireRpcUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("RPC_URL is required");
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("RPC_URL must be a valid HTTP(S) URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("RPC_URL must use HTTP or HTTPS");
  }
  if (parsed.username || parsed.password) {
    throw new Error("RPC_URL must not contain embedded credentials");
  }
  return parsed.toString();
}

function requireExpectedChainId(value) {
  if (
    (typeof value !== "number" && typeof value !== "string" && typeof value !== "bigint") ||
    String(value).trim() === ""
  ) {
    throw new Error("config.chain_id is required");
  }

  let chainId;
  try {
    chainId = BigInt(value);
  } catch {
    throw new Error("config.chain_id must be a positive integer");
  }
  if (chainId <= 0n) {
    throw new Error("config.chain_id must be a positive integer");
  }
  return chainId;
}

function requireConfirmationCount(value) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error("config.tx_required_confirmations must be a positive integer");
  }
  return value;
}

function requireQAddress(value, label = "address") {
  if (typeof value !== "string" || !Q_ADDRESS_PATTERN.test(value)) {
    throw new Error(`${label} must use the current Q + 40-hex address format`);
  }
  return value;
}

function hasDeployedCode(code) {
  return typeof code === "string" && !/^0x0*$/i.test(code);
}

async function assertExpectedChain(web3, expectedChainId) {
  const actualChainId = BigInt(await web3.qrl.getChainId());
  if (actualChainId !== expectedChainId) {
    throw new Error(
      `Wrong network: expected chain ${expectedChainId}, received ${actualChainId}`
    );
  }
  return actualChainId;
}

async function assertContractCode(web3, address, label = "contract") {
  requireQAddress(address, `${label} address`);
  const code = await web3.qrl.getCode(address, "latest");
  if (!hasDeployedCode(code)) {
    throw new Error(`${label} has no deployed bytecode at ${address}`);
  }
  return code;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForTransactionConfirmations(
  web3,
  receipt,
  requiredConfirmations,
  { pollIntervalMs = 3000, maxAttempts = 300 } = {}
) {
  requireConfirmationCount(requiredConfirmations);
  if (
    !receipt ||
    receipt.blockNumber === undefined ||
    receipt.blockNumber === null ||
    !receipt.blockHash ||
    !receipt.transactionHash
  ) {
    throw new Error("Transaction receipt is missing block identity fields");
  }
  if (!Number.isSafeInteger(pollIntervalMs) || pollIntervalMs < 0) {
    throw new Error("pollIntervalMs must be a non-negative integer");
  }
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("maxAttempts must be a positive integer");
  }

  const receiptBlock = BigInt(receipt.blockNumber);
  const targetBlock = receiptBlock + BigInt(requiredConfirmations - 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const latestBlock = BigInt(await web3.qrl.getBlockNumber());
    if (latestBlock >= targetBlock) {
      const canonicalReceipt = await web3.qrl.getTransactionReceipt(receipt.transactionHash);
      if (!canonicalReceipt) {
        throw new Error("Transaction disappeared before reaching finality");
      }
      if (
        typeof canonicalReceipt.blockHash !== "string" ||
        canonicalReceipt.blockHash.toLowerCase() !== String(receipt.blockHash).toLowerCase()
      ) {
        throw new Error("Transaction block changed before reaching finality");
      }
      if (
        canonicalReceipt.status === false ||
        canonicalReceipt.status === 0 ||
        canonicalReceipt.status === 0n ||
        canonicalReceipt.status === "0x0"
      ) {
        throw new Error("Transaction reverted before reaching finality");
      }
      return canonicalReceipt;
    }

    if (attempt < maxAttempts) {
      await delay(pollIntervalMs);
    }
  }

  throw new Error(
    `Transaction did not reach ${requiredConfirmations} confirmations within the configured wait`
  );
}

module.exports = {
  assertContractCode,
  assertExpectedChain,
  hasDeployedCode,
  requireConfirmationCount,
  requireExpectedChainId,
  requireQAddress,
  requireRpcUrl,
  waitForTransactionConfirmations,
};
