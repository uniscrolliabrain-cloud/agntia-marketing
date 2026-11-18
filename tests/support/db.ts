import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

/**
 * Utilidades de la suite de Postgres real.
 *
 * Ninguna prueba de este directorio se ejecuta sin `DATABASE_URL`: en un
 * entorno sin base de datos el resultado honesto es "no verificado", no un
 * verde falso.
 */
export const DATABASE_URL = process.env.DATABASE_URL;

export async function applyMigrations(url: string): Promise<string[]> {
  const dir = path.join(process.cwd(), 'db', 'migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const client = new Client({ connectionString: url });
  await client.connect();
  const applied: string[] = [];
  try {
    for (const file of files) {
      const sql = await readFile(path.join(dir, file), 'utf8');
      await client.query(sql);
      applied.push(file);
    }
  } finally {
    await client.end();
  }
  return applied;
}

export async function withSuperuser<T>(url: string, fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/**
 * Ejecuta como rol `authenticated` (sin BYPASSRLS) dentro de una transacción
 * que se revierte. `tenant` null deja `app.tenant_id` sin fijar a propósito.
 */
export async function asAuthenticated<T>(
  url: string,
  tenant: string | null,
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query('begin');
    await client.query('set local role authenticated');
    if (tenant) await client.query("select set_config('app.tenant_id', $1, true)", [tenant]);
    return await fn(client);
  } finally {
    await client.query('rollback').catch(() => undefined);
    await client.end();
  }
}

export function pgErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
}
