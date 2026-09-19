/** Assets oficiales. No inventar USDT0 en testnet. */

export const USDC_TESTNET_SAC =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

/** Circle faucet manda este classic. El SAC de arriba es el mismo asset. */
export const USDC_TESTNET_CLASSIC = {
  code: "USDC",
  issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  faucet: "https://faucet.circle.com/",
};

export const USDT0_OFFICIAL = {
  network: "mainnet" as const,
  code: "USDT0",
  issuer: "GATISXX6BZ6NC7IKQBY37CJD4SOZL3CYZJWXEDG6JVIY4WBS6KXJHN6Q",
  sac: "CBSJZEIO5C7KC2SF3MKSNXXJSW5G3VTNBX4ATMKUI3B2MR4JKM4R26YF",
  oft: "CBOWOLFSDM5PZXNFIVDMP5NZ7U2GSIHED6H6R446QOHF266XINKUMMF6",
  oneSig: "CBCZ5CETG3XR5MZVDC7QBDOTIH6P7MOLUH2SSC52J3NVBYIV45D4QKR6",
  layerZeroEid: 30600,
  layerZeroEndpoint: "CCQLLRE5JBAWYCW3KTWOIWLMFDUOKROQVZNSALQMGOSXNW3ERUOWTZGK",
  transferUi: "https://usdt0.to/transfer",
  docs: "https://developers.stellar.org/docs/tokens/usdt0-layerzero",
  clawbackEnabled: true,
  testnetOfficial: false,
  /** I3 2026-09-12 — simulateTransaction mainnet SAC */
  name: "USDT0:GATISXX6BZ6NC7IKQBY37CJD4SOZL3CYZJWXEDG6JVIY4WBS6KXJHN6Q",
  symbol: "USDT0",
  decimals: 7,
};
