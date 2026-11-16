import type {
  ApprovalBinding,
  AudienceRule,
  Brief,
  ClaimEvidence,
  Competitor,
  ConnectionInput,
  ContactPolicy,
  ConversionFact,
  CreativeRevision,
  ExperimentSpec,
  IcpHypothesis,
  MarketObservation,
  MarketSource,
  Money,
  Observation,
  Opportunity,
  OpportunityRanking,
  Purpose,
  Channel,
  ServiceEvent,
} from '@agntia/contracts';

/**
 * Almacén en memoria (MKT-C06). Implementa las mismas invariantes que el esquema
 * Postgres/RLS de `db/migrations`: toda lectura pasa por tenantId, las claves son
 * compuestas y ninguna consulta devuelve filas de otro tenant.
 * Postgres real queda NOT_VERIFIED hasta ejecutar las migraciones.
 */

export interface Tenant {
  id: string;
  name: string;
  plan: 'sandbox' | 'pilot' | 'production';
  createdAt: string;
}

export interface Membership {
  tenantId: string;
  actorId: string;
  roles: Array<'owner' | 'operator' | 'reviewer' | 'viewer' | 'worker'>;
  scopes: string[];
  isHuman: boolean;
}

export interface Contact {
  tenantId: string;
  id: string;
  emailRef: string; // referencia opaca, nunca email en claro en eventos
  country: string;
  locale: 'es' | 'en' | 'fr';
  lifecycleStage: 'lead' | 'mql' | 'customer' | 'churned';
  interestTopic: string;
  consent: Partial<Record<Purpose, boolean>>;
  engagedDays: number;
  isBusiness: boolean;
  suppressed: boolean;
  suppressionVersion: number;
  lastContactedAt: Partial<Record<Channel, string>>;
}

export interface TwinRecord {
  id: string;
  tenantId: string;
  canonicalAgentSha: string;
  displayName: string;
  provenance: string;
  status: 'active' | 'revoked';
}

export interface BriefRecord extends Brief {
  id: string;
  tenantId: string;
  version: number;
  status: 'draft' | 'accepted';
  createdAt: string;
}

export interface AudienceSnapshotRecord {
  id: string;
  tenantId: string;
  ruleHash: string;
  rule: AudienceRule;
  memberRefs: string[];
  eligibleCount: number;
  excludedCount: number;
  membersHash: string;
  createdAt: string;
  expiresAt: string;
  policyVersion: string;
  sourceWatermark: number;
}

export interface CreativeRecord {
  id: string;
  tenantId: string;
  revision: number;
  data: CreativeRevision;
  hash: string;
  status: 'draft' | 'approved_ref';
}

export interface ClaimRecord extends ClaimEvidence {
  id: string;
  tenantId: string;
  createdAt: string;
}

export interface ApprovalRecord extends ApprovalBinding {
  tenantId: string;
}

export type CampaignState =
  | 'draft'
  | 'previewed'
  | 'approved'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'unknown'
  | 'paused'
  | 'cancelled'
  | 'reconciled';

export interface CampaignRecord {
  id: string;
  tenantId: string;
  name: string;
  briefId: string;
  channel: Channel;
  revision: number;
  audienceSnapshotId: string;
  creativeId: string;
  approvalRef: string | null;
  costCeiling: Money;
  state: CampaignState;
  version: number;
  history: Array<{ at: string; from: CampaignState; to: CampaignState; reason: string }>;
}

export type IntentState = 'queued' | 'leased' | 'confirmed' | 'failed' | 'unknown' | 'cancelled';

export interface OutboundIntentRecord {
  id: string;
  tenantId: string;
  operationKey: string;
  campaignId: string;
  journeyStepId: string | null;
  scheduledFor: string;
  subjectRef: string;
  channel: Channel;
  payloadHash: string;
  approvalRef: string;
  audienceSnapshotId: string;
  eligibilityRef: string;
  state: IntentState;
  leaseFence: number;
  attempts: number;
  remoteRefs: Array<{ kind: string; id: string }>;
  lastError: string | null;
  reconciliationRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptRecord {
  id: string;
  tenantId: string;
  intentId: string;
  provider: string;
  remoteId: string;
  state: 'accepted' | 'delivered' | 'bounced' | 'unknown';
  receivedAt: string;
}

export interface ConnectionRecord {
  id: string;
  tenantId: string;
  provider: ConnectionInput['provider'];
  endpointRef: string;
  secretRef: string;
  remoteAccountId: string | null;
  scopes: string[];
  state: 'disabled' | 'ready' | 'degraded';
  capabilityReport: { provider: string; read: string[]; write: string[]; note: string };
  revision: number;
}

export interface ObservationRecord extends Observation {
  id: string;
  tenantId: string;
}

export interface ConversionRecord extends ConversionFact {
  id: string;
  tenantId: string;
  sourceId: string;
  dedupKey: string;
  createdAt: string;
}

export interface ExperimentRecord extends ExperimentSpec {
  id: string;
  tenantId: string;
  status: 'proposed' | 'ready' | 'blocked';
  sampleSizePerArm: number | null;
  blockers: string[];
  createdAt: string;
}

export interface CampaignBudgetRecord {
  id: string;
  tenantId: string;
  campaignId: string;
  ceiling: Money;
  committed: Money;
  currency: string;
}

export interface ReportRecord {
  id: string;
  tenantId: string;
  datasetRefs: string[];
  definitions: Record<string, string>;
  metrics: Array<{ name: string; kind: string; value: number | null; coverage: number; freshnessMinutes: number | null }>;
  hash: string;
  generatedAt: string;
  expiresAt: string;
}

export interface PrivacyRequestRecord {
  id: string;
  tenantId: string;
  kind: 'access' | 'erasure' | 'rectification' | 'objection' | 'portability';
  subjectRef: string;
  verificationRef: string;
  state: 'received' | 'verified' | 'fulfilled' | 'rejected';
  outcome: string | null;
  createdAt: string;
}

export interface HandoffRecord {
  id: string;
  tenantId: string;
  toService: string;
  effect: string;
  resourceRef: string;
  ownerService: string;
  acceptance: string;
  state: 'proposed' | 'accepted' | 'rejected' | 'conflict';
  createdAt: string;
}

export interface ContactPolicyRecord extends ContactPolicy {
  tenantId: string;
}

export interface JourneyRecord {
  id: string;
  tenantId: string;
  name: string;
  steps: Array<{ stepId: string; channel: Channel; delayHours: number; templateRef: string }>;
  audienceRule: AudienceRule;
  reentry: 'never' | 'after_days';
  reentryDays?: number;
  version: number;
  createdAt: string;
}

export interface JourneyEnrollmentRecord {
  id: string;
  tenantId: string;
  journeyId: string;
  approvalRef: string;
  snapshotId: string;
  state: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  subjectRefs: string[];
  intentIds: string[];
}

export interface LandingProposalRecord {
  id: string;
  tenantId: string;
  pageRef: string;
  currentHash: string;
  proposedHtml: string;
  proposedHash: string;
  diffSummary: string;
  state: 'proposed' | 'approved' | 'published';
  approvalRef: string | null;
}

// ── M01–M10 · Market Reality Graph ─────────────────────────────────────────
export interface MarketSourceRecord extends MarketSource {
  id: string;
  tenantId: string;
  createdAt: string;
}

export interface MarketObservationRecord extends MarketObservation {
  id: string;
  tenantId: string;
  createdAt: string;
}

export interface CompetitorRecord extends Competitor {
  id: string;
  tenantId: string;
  createdAt: string;
}

export interface IcpRecord extends IcpHypothesis {
  id: string;
  tenantId: string;
  createdAt: string;
}

export interface OpportunityRecord {
  id: string;
  tenantId: string;
  input: Opportunity;
  status: 'proposed' | 'accepted' | 'rejected';
  ranking: OpportunityRanking;
  createdAt: string;
}

export class MemoryStore {
  tenants = new Map<string, Tenant>();
  memberships: Membership[] = [];
  contacts: Contact[] = [];
  twins: TwinRecord[] = [];
  briefs: BriefRecord[] = [];
  snapshots: AudienceSnapshotRecord[] = [];
  creatives: CreativeRecord[] = [];
  claims: ClaimRecord[] = [];
  approvals: ApprovalRecord[] = [];
  campaigns: CampaignRecord[] = [];
  intents: OutboundIntentRecord[] = [];
  receipts: ReceiptRecord[] = [];
  connections: ConnectionRecord[] = [];
  observations: ObservationRecord[] = [];
  conversions: ConversionRecord[] = [];
  experiments: ExperimentRecord[] = [];
  budgets: CampaignBudgetRecord[] = [];
  reports: ReportRecord[] = [];
  privacyRequests: PrivacyRequestRecord[] = [];
  handoffs: HandoffRecord[] = [];
  contactPolicies: ContactPolicyRecord[] = [];
  journeys: JourneyRecord[] = [];
  journeyEnrollments: JourneyEnrollmentRecord[] = [];
  landings: LandingProposalRecord[] = [];
  marketSources: MarketSourceRecord[] = [];
  marketObservations: MarketObservationRecord[] = [];
  competitors: CompetitorRecord[] = [];
  icps: IcpRecord[] = [];
  opportunities: OpportunityRecord[] = [];
  events: ServiceEvent[] = [];
  /** (tenantId|capability|idempotencyKey) → resultado ya producido. */
  operations = new Map<string, { payloadHash: string; result: unknown }>();
  audit: Array<{ tenantId: string; actorId: string; action: string; detail: string; at: string }> = [];
  private counter = 0;

  nextSequence(): number {
    this.counter += 1;
    return this.counter;
  }

  /** Lectura siempre scoped: no existe acceso sin tenant. */
  forTenant<T extends { tenantId: string }>(rows: T[], tenantId: string): T[] {
    return rows.filter((r) => r.tenantId === tenantId);
  }

  auditLog(entry: { tenantId: string; actorId: string; action: string; detail: string }, at: string): void {
    this.audit.push({ ...entry, at });
  }

  snapshotState(): { counts: Record<string, number>; auditEntries: number } {
    const collections: Record<string, unknown[]> = {
      tenants: [...this.tenants.values()],
      memberships: this.memberships,
      contacts: this.contacts,
      twins: this.twins,
      briefs: this.briefs,
      snapshots: this.snapshots,
      creatives: this.creatives,
      claims: this.claims,
      approvals: this.approvals,
      campaigns: this.campaigns,
      intents: this.intents,
      receipts: this.receipts,
      connections: this.connections,
      observations: this.observations,
      conversions: this.conversions,
      experiments: this.experiments,
      reports: this.reports,
      privacyRequests: this.privacyRequests,
      handoffs: this.handoffs,
      journeys: this.journeys,
      journeyEnrollments: this.journeyEnrollments,
      landings: this.landings,
      marketSources: this.marketSources,
      marketObservations: this.marketObservations,
      competitors: this.competitors,
      icps: this.icps,
      opportunities: this.opportunities,
    };
    const counts = Object.fromEntries(Object.entries(collections).map(([k, v]) => [k, v.length]));
    return { counts, auditEntries: this.audit.length };
  }
}

export interface Ctx {
  store: MemoryStore;
  now: () => Date;
  policyVersion: string;
}

export function createStore(now: () => Date = () => new Date('2026-11-14T12:00:00Z')): Ctx {
  return { store: new MemoryStore(), now, policyVersion: 'policy-2026-11-14.1' };
}

export function listForTenant<T extends { tenantId: string }>(ctx: Ctx, rows: T[], tenantId: string): T[] {
  return rows.filter((r) => r.tenantId === tenantId && ctx.store.tenants.has(tenantId));
}
