import type { Assertion } from "@/types/assertion";
import { ASSERTION_STATUS } from "@/types/assertion";

/**
 * Mock current Stacks block height.
 * TODO: Replace with real-time block height from Stacks API or wallet provider.
 */
export const MOCK_CURRENT_BLOCK = 100_000;

/**
 * Mock assertions mirroring the assertion-map data structure from core.clar.
 *
 * Fields mapping:
 *   id              ← sha256(identifier ++mock-claimk)
 *   identifier   mock-claimd)
 *   claim           ← buff 2048 (UTF-8 encoded); only claim-hash is stored on-chain,
 *                     the raw claim is emitted in the print event on assert()
 *   claimHash       ← buff 32 = sha256(claim), stored as claim-hash in assertion-map
 *   asserter        ← principal from assertion-map
 *   bondSats        ← bond-sats from assertion-map
 *   liveness        ← liveness from assertion-map (blocks)
 *   status          ← status from assertion-map (1=asserted, 2=disputed, 3=settled, 4=rejected)
 *   assertedAtBlock ← asserted-at-block from assertion-map
 */
export const MOCK_ASSERTIONS: Assertion[] = [
  {
    id: "0xa3f1e2b4c5d6e7f8901234567890abcdef1234567890abcdef1234567890ab12",
    identifier: "mock-claim",
    claim: "The BTC/USD spot price exceeded $100,000 USD at Stacks block height 99,800, as reported by three independent price oracles.",
    claimHash: "3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    asserter: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
    bondSats: 50_000,
    liveness: 1440,
    status: ASSERTION_STATUS.OPEN,
    assertedAtBlock: 99_800,
  },
  {
    id: "0xb7d2f3a4e5c6b7a8901234567890abcdef1234567890abcdef1234567890cd34",
    identifier: "mock-claim",
    claim:
      "The average daily temperature in New York City exceeded 35°C for 5 consecutive days ending on March 10, 2026, as recorded by the National Weather Service.",
    claimHash: "4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    asserter: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    bondSats: 25_000,
    liveness: 720,
    status: ASSERTION_STATUS.OPEN,
    assertedAtBlock: 99_900,
  },
  {
    id: "0xc8e3a1b2d4f5c6d7e8901234567890abcdef1234567890abcdef1234567890ef56",
    identifier: "mock-claim",
    claim: "The Kansas City Chiefs scored more than 28 points in Super Bowl LX, played on February 8, 2026, as reported by official NFL game records.",
    claimHash: "5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    asserter: "SP1JTMB7FMPR7RJHEVTDGX4SGYEKW3N2JTJBR85J",
    disputer: "SP4PBHTFXHZBA5JDZC1NFAQ3C5MTTQ4VHJA7VBP1",
    bondSats: 100_000,
    liveness: 1440,
    status: ASSERTION_STATUS.DISPUTED,
    assertedAtBlock: 99_500,
    disputedAtBlock: 99_550,
  },
  {
    id: "0xd9f4b2c3e5a6d7e8f9012345678901234567890abcdef1234567890abcdef7890",
    identifier: "mock-claim",
    claim: "Ethereum's average gas fee remained below 5 gwei for 144 consecutive Stacks blocks ending at block 98,200, as measured by on-chain data.",
    claimHash: "6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    asserter: "SP2R2T17XG4TMXCVNKKRZ3EWAZ0H9V0KQFRGP3JB",
    bondSats: 75_000,
    liveness: 1440,
    status: ASSERTION_STATUS.SETTLED,
    assertedAtBlock: 98_000,
    settledAtBlock: 99_500,
  },
  {
    id: "0xe0a5c3d4f6b7e8f9a012345678901234567890abcdef1234567890abcdef9012",
    identifier: "mock-claim",
    claim: "Global human population surpassed 8.2 billion people as of January 1, 2026, according to the United Nations World Population Prospects report.",
    claimHash: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    asserter: "SP1N9FQQ0M3QR4RPCPBVWJ1CKNYP7EPSC8A9K8N5",
    disputer: "SP3CBVQ3MQQXZM72C1GBSAVYWF1C52BZ0XWKNDZ8",
    bondSats: 10_000,
    liveness: 288,
    status: ASSERTION_STATUS.REJECTED,
    assertedAtBlock: 97_000,
    disputedAtBlock: 97_050,
    rejectedAtBlock: 97_200,
  },
  {
    id: "0xe0a5c3d4f6b7e8f9a012345678901234567890abcdef1234567890abcdef9022",
    identifier: "mock-claim",
    claim: "Test",
    claimHash: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    asserter: "SP1N9FQQ0M3QR4RPCPBVWJ1CKNYP7EPSC8A9K8N5",
    disputer: "SP3CBVQ3MQQXZM72C1GBSAVYWF1C52BZ0XWKNDZ8",
    bondSats: 10_000,
    liveness: 120,
    status: ASSERTION_STATUS.UNRESOLVED,
    assertedAtBlock: 97_000,
    disputedAtBlock: 97_050,
  },
  {
    id: "0xf1b6d4e5a7c8f9a0b1234567890123456789abcdef1234567890abcdef0123ab",
    identifier: "mock-claim",
    claim:
      "Brent crude oil closed above $90 per barrel for 10 consecutive trading days ending March 5, 2026, according to ICE Futures Europe settlement prices.",
    claimHash: "8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
    asserter: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW",
    bondSats: 200_000,
    liveness: 144,
    status: ASSERTION_STATUS.OPEN,
    assertedAtBlock: 99_920,
  },
  {
    // Awaiting settlement: OPEN status but liveness window has already closed
    // expiryBlock = 98,000 + 100 = 98,100 < MOCK_CURRENT_BLOCK (100,000)
    id: "0xa2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    identifier: "mock-claim",
    claim:
      "The on-time departure rate at Los Angeles International Airport exceeded 80% for the week of February 24–March 2, 2026, as published by the Bureau of Transportation Statistics.",
    claimHash: "9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    asserter: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE",
    bondSats: 15_000,
    liveness: 100,
    status: ASSERTION_STATUS.OPEN,
    assertedAtBlock: 98_000,
  },
];
