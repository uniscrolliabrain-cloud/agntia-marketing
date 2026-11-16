/**
 * M65 · AuthorityMap entre dominios AgntiaPro.
 *
 * Marketing puede preparar y ejecutar sus propios efectos, pero **no** puede
 * autoconcederse la autoridad de otro dominio (publicar en Redes, crear una
 * cotización en Ventas, escribir consentimiento de Clientes...). La frontera es
 * de datos y de efectos: se declara aquí una vez y se valida en código.
 */

export const DOMAINS = [
  'marketing',
  'redes',
  'clientes',
  'ventas',
  'branding',
  'comunicacion',
  'finanzas',
  'legal',
  'ciberseguridad',
] as const;
export type Domain = (typeof DOMAINS)[number];

export interface DomainAuthority {
  /** Tipos de recurso cuyo dato canónico vive en este dominio. */
  owns: string[];
  /** Efectos externos que sólo este dominio puede autorizar/ejecutar. */
  effects: string[];
}

export const AUTHORITY_MAP: Record<Domain, DomainAuthority> = {
  marketing: {
    owns: [
      'campaign',
      'journey',
      'audience_snapshot',
      'creative',
      'claim',
      'market_source',
      'market_observation',
      'competitor',
      'icp_hypothesis',
      'opportunity',
      'measurement_report',
    ],
    effects: ['send_campaign', 'publish_landing', 'enroll_journey', 'validate_ads', 'request_privacy_action'],
  },
  redes: {
    owns: ['social_post', 'community_thread', 'channel_calendar'],
    effects: ['publish_post'],
  },
  clientes: {
    owns: ['contact_consent', 'lifecycle_segment', 'customer_profile'],
    effects: ['send_message'],
  },
  ventas: {
    owns: ['lead', 'pipeline_opportunity', 'quote'],
    effects: ['create_quote'],
  },
  branding: {
    owns: ['brand_asset', 'brand_policy', 'visual_identity'],
    effects: ['update_brand_asset'],
  },
  comunicacion: {
    owns: ['press_release', 'crisis_statement'],
    effects: [],
  },
  finanzas: {
    owns: ['budget', 'margin', 'cash_forecast', 'cost_allocation'],
    effects: ['commit_spend'],
  },
  legal: {
    owns: ['contract', 'legal_review', 'regulatory_register'],
    effects: [],
  },
  ciberseguridad: {
    owns: ['security_incident', 'vendor_security_review'],
    effects: [],
  },
};

/** Efectos del contrato `Handoff` y su dueño canónico. */
export const EFFECT_OWNER: Record<string, Domain> = {
  publish_post: 'redes',
  send_message: 'clientes',
  create_quote: 'ventas',
  update_brand_asset: 'branding',
  emit_event: 'marketing',
};

export function canonicalOwnerOfEffect(effect: string): Domain | null {
  return EFFECT_OWNER[effect] ?? null;
}

export interface HandoffAuthorityDeclaration {
  declaredOwner: string;
  canonicalOwner: Domain | null;
  matches: boolean;
}

/**
 * Compara lo declarado por quien propone el handoff con el dueño canónico.
 * No lanza: el llamador decide si es un aviso o una denegación.
 */
export function handoffAuthorityDeclaration(declaredOwner: string, effect: string): HandoffAuthorityDeclaration {
  const canonicalOwner = canonicalOwnerOfEffect(effect);
  return {
    declaredOwner,
    canonicalOwner,
    matches: canonicalOwner === null ? true : canonicalOwner === declaredOwner,
  };
}
