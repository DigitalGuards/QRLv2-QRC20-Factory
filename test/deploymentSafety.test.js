const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertContractCode,
  assertExpectedChain,
  hasDeployedCode,
  requireConfirmationCount,
  requireExpectedChainId,
  requireQAddress,
  requireRpcUrl,
  waitForTransactionConfirmations,
} = require("../utils/deploymentSafety");

test("accepts current Q + 40-hex addresses", () => {
  const address = `Q${"aB".repeat(20)}`;
  assert.equal(requireQAddress(address), address);
});

test("rejects zero-width, 0x-prefixed, and longer addresses", () => {
  assert.throws(() => requireQAddress("Q"), /Q \+ 40-hex/);
  assert.throws(() => requireQAddress(`0x${"ab".repeat(20)}`), /Q \+ 40-hex/);
  assert.throws(() => requireQAddress(`Q${"ab".repeat(24)}`), /Q \+ 40-hex/);
});

test("validates RPC URLs without embedded credentials", () => {
  assert.equal(requireRpcUrl("http://127.0.0.1:8545"), "http://127.0.0.1:8545/");
  assert.throws(() => requireRpcUrl("file:///tmp/rpc"), /HTTP or HTTPS/);
  assert.throws(() => requireRpcUrl("https://user:secret@example.test"), /credentials/);
});

test("requires an explicit chain and positive confirmation depth", () => {
  assert.equal(requireExpectedChainId(1337), 1337n);
  assert.equal(requireConfirmationCount(2), 2);
  assert.throws(() => requireExpectedChainId(undefined), /chain_id is required/);
  assert.throws(() => requireExpectedChainId(0), /positive integer/);
  assert.throws(() => requireConfirmationCount(0), /positive integer/);
});

test("fails closed on a chain mismatch", async () => {
  const web3 = { qrl: { getChainId: async () => 1338n } };
  await assert.rejects(() => assertExpectedChain(web3, 1337n), /Wrong network/);
});

test("recognizes deployed bytecode and rejects empty targets", async () => {
  assert.equal(hasDeployedCode("0x60006000"), true);
  assert.equal(hasDeployedCode("0x"), false);
  assert.equal(hasDeployedCode("0x0"), false);

  const address = `Q${"12".repeat(20)}`;
  const web3 = { qrl: { getCode: async () => "0x" } };
  await assert.rejects(
    () => assertContractCode(web3, address, "factory"),
    /factory has no deployed bytecode/
  );
});

test("waits for the configured confirmation depth and rechecks the receipt", async () => {
  const receipt = {
    blockNumber: 100n,
    blockHash: "0xabc",
    transactionHash: "0x123",
    status: 1n,
  };
  const heights = [100n, 101n];
  let heightIndex = 0;
  const web3 = {
    qrl: {
      getBlockNumber: async () => heights[heightIndex++] ?? 101n,
      getTransactionReceipt: async () => ({ ...receipt }),
    },
  };

  const confirmed = await waitForTransactionConfirmations(web3, receipt, 2, {
    pollIntervalMs: 0,
    maxAttempts: 3,
  });

  assert.equal(confirmed.blockHash, receipt.blockHash);
  assert.equal(heightIndex, 2);
});

test("fails closed when the transaction block changes", async () => {
  const receipt = {
    blockNumber: 100n,
    blockHash: "0xabc",
    transactionHash: "0x123",
    status: 1n,
  };
  const web3 = {
    qrl: {
      getBlockNumber: async () => 101n,
      getTransactionReceipt: async () => ({ ...receipt, blockHash: "0xdef" }),
    },
  };

  await assert.rejects(
    () =>
      waitForTransactionConfirmations(web3, receipt, 2, {
        pollIntervalMs: 0,
        maxAttempts: 1,
      }),
    /block changed/
  );
});
