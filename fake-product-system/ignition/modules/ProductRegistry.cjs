const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ProductRegistryModule", (m) => {
  const registry = m.contract("ProductRegistry");
  return { registry };
});