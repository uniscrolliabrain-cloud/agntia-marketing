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

/**
 * Ejecuta como un rol concreto (`marketing_admin`, `authenticated`, ...) dentro
 * de una transacción, fijando los GUC que la sesión declara. Por defecto la
 * transacción se revierte; `commit: true` la confirma para poder comprobar el
 * efecto desde otra conexión.
 */
export async function asRole<T>(
  url: string,
  role: string,
  tenant: string | null,
  settings: Record<string, string>,
  fn: (client: Client) => Promise<T>,
  options: { commit?: boolean } = {},
): Promise<T> {
  if (!/^[a-z_][a-z0-9_]*$/.test(role)) throw new Error(`invalid_role:${role}`);
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${role}`);
    if (tenant) await client.query("select set_config('app.tenant_id', $1, true)", [tenant]);
    for (const [key, value] of Object.entries(settings)) {
      if (!/^app\.[a-z_]+$/.test(key)) throw new Error(`invalid_setting:${key}`);
      await client.query('select set_config($1, $2, true)', [key, value]);
    }
    const result = await fn(client);
    await client.query(options.commit ? 'commit' : 'rollback');
    return result;
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

/** Devuelve el SQLSTATE del rechazo, o `undefined` si la operación se aceptó. */
export async function rejectionCode(run: () => Promise<unknown>): Promise<string | undefined> {
  try {
    await run();
    return undefined;
  } catch (error) {
    return pgErrorCode(error);
  }
}

export function pgErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
}
