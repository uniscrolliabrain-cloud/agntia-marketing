import {
  AUTHORITY_MAP,
  DOMAINS,
  EFFECT_OWNER,
  MarketingError,
  handoffAuthorityDeclaration,
  type Domain,
  type HandoffAuthorityDeclaration,
} from '@agntia/contracts';

/**
 * M65 · Frontera de autoridad aplicada en código.
 *
 * - `assertNoSelfGrant` impide que Marketing se declare dueño de un efecto de
 *   otro dominio. Un caso así se deniega (CONFLICT), no se registra como éxito.
 * - Una declaración de dueño no canónica pero tampoco autoconcedida (por ejemplo
 *   "clientes publica el post") no se bloquea aquí: el registro de conflictos de
 *   handoff ya la expone para revisión humana. Se devuelve como metadato.
 */
export function authorityMapView() {
  return {
    policy: 'authority-map-2026-11-16.1',
    domains: DOMAINS.map((domain) => ({
      domain,
      owns: AUTHORITY_MAP[domain].owns,
      effects: AUTHORITY_MAP[domain].effects,
    })),
    effectOwners: EFFECT_OWNER,
    boundary: {
      marketingMaySelfGrant: false,
      foreignEffectsRequireHandoff: true,
      canonicalSource: 'packages/contracts/src/authority-map.ts',
    },
  };
}

export function ownerOfResource(resource: string): Domain | null {
  for (const domain of DOMAINS) {
    if (AUTHORITY_MAP[domain].owns.includes(resource)) return domain;
  }
  return null;
}

export function ownsResource(domain: Domain, resource: string): boolean {
  return AUTHORITY_MAP[domain].owns.includes(resource);
}

export function assertNoSelfGrant(declaredOwner: string, effect: string): HandoffAuthorityDeclaration {
  const declaration = handoffAuthorityDeclaration(declaredOwner, effect);
  if (declaredOwner === 'marketing' && declaration.canonicalOwner !== null && declaration.canonicalOwner !== 'marketing') {
    throw new MarketingError('CONFLICT', `effect_not_owned_by_marketing:${effect}:owner=${declaration.canonicalOwner}`);
  }
  return declaration;
}
