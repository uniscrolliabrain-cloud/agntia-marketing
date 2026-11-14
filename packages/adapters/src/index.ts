export * from './types';
export * from './stubs';

import type { ProviderAdapter, ProviderName } from './types';
import { SandboxEmailAdapter, createStubRegistry } from './stubs';

export type AdapterRegistry = Record<ProviderName, ProviderAdapter>;

/**
 * Registro por defecto: todos los proveedores reales deshabilitados y la entrega
 * de sandbox activa. `overrides` permite inyectar un sandbox con otro modo en
 * tests o un adaptador futuro ya verificado.
 */
export function createRegistry(overrides: Partial<AdapterRegistry> = {}): AdapterRegistry {
  const base = createStubRegistry();
  return { ...base, email_sandbox: new SandboxEmailAdapter('accept'), ...overrides };
}
