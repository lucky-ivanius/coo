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
  /** Stacks principal address of the asserter */
  asserter: string;
  /** Optional disputer principal address */
  disputer?: string;
  /** Optional settler principal address */
  settler?: string;
  /** Optional principal address of the resolver */
  resolver?: string;
  /** Bond amount in satoshis */
  bondSats: number;
  /** Liveness window duration in Stacks blocks */
  liveness: number;
  /** Assertion status (0=open, 1=disputed, 2=settled, 3=rejected, 4=unresolved) */
  status: AssertionStatus;
  /** Block height when assertion was made */
  assertedAtBlock: number;
  /** Transaction ID of the assertion transaction */
  assertedTxId: string;
  /** Block height when assertion was disputed, if applicable */
  disputedAtBlock?: number;
  /** Transaction ID of the dispute transaction, if applicable */
  disputedTxId?: string;
  /** Block height when assertion was settled, if applicable */
  settledAtBlock?: number;
  /** Transaction ID of the settlement transaction, if applicable */
  settledTxId?: string;
  /** Block height when assertion was rejected, if applicable */
  rejectedAtBlock?: number;
  /** Transaction ID of the rejection transaction, if applicable */
  rejectedTxId?: string;
  /** Block height when assertion was unresolved, if applicable */
  unresolvedAtBlock?: number;
  /** Transaction ID of the resolution transaction, if applicable */
  unresolvedTxId?: string;
}
