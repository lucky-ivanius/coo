export const ASSERTION_STATUS = {
  ASSERTED: 1,
  DISPUTED: 2,
  SETTLED: 3,
  REJECTED: 4,
} as const;

export type AssertionStatus = (typeof ASSERTION_STATUS)[keyof typeof ASSERTION_STATUS];

export interface Assertion {
  /** Hex-encoded SHA-256 assertion ID (buff 32 from contract) */
  id: string;
  /** Raw identifier bytes — buff 32 from contract (UTF-8 encoded identifier) */
  identifier: Uint8Array;
  /** Raw claim bytes — buff 2048 from contract (UTF-8 encoded claim text) */
  claim: Uint8Array;
  /** SHA-256 hash of claim — buff 32 stored as claim-hash in assertion-map */
  claimHash: Uint8Array;
  /** Stacks principal address of the asserter */
  asserter: string;
  /** Optional disputer principal address */
  disputer?: string;
  /** Bond amount in satoshis */
  bondSats: number;
  /** Liveness window duration in Stacks blocks */
  liveness: number;
  /** Assertion status (1=asserted, 2=disputed, 3=settled, 4=rejected) */
  status: AssertionStatus;
  /** Block height when assertion was made */
  assertedAtBlock: number;
  /** Block height when assertion was disputed, if applicable */
  disputedAtBlock?: number;
  /** Block height when assertion was settled, if applicable */
  settledAtBlock?: number;
  /** Block height when assertion was rejected, if applicable */
  rejectedAtBlock?: number;
}
