export const ASSERTION_STATUS = {
  OPEN: 0,
  DISPUTED: 1,
  SETTLED: 2,
  REJECTED: 3,
  UNRESOLVED: 4,
} as const;

export type AssertionStatus = (typeof ASSERTION_STATUS)[keyof typeof ASSERTION_STATUS];

export interface Assertion {
  /** Hex-encoded SHA-256 assertion ID (buff 32 from contract) */
  id: string;
  /** Raw identifier bytes — buff 32 from contract (UTF-8 encoded identifier) */
  identifier: string;
  /** Raw claim bytes — buff 2048 from contract (UTF-8 encoded claim text) */
  claim: string;
  /** SHA-256 hash of claim — buff 32 stored as claim-hash in assertion-map */
  claimHash: string;
  /** Stacks principal address of the asserter */
  asserter: string;
  /** Optional disputer principal address */
  disputer?: string;
  /** Bond amount in satoshis */
  bondSats: number;
  /** Liveness window duration in Stacks blocks */
  liveness: number;
  /** Assertion status (0=open, 1=disputed, 2=settled, 3=rejected, 4=unresolved) */
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
