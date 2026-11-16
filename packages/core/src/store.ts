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
