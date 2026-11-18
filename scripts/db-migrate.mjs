#!/usr/bin/env node
// Aplica db/migrations/*.sql en orden. Sin DATABASE_URL no hace nada y falla:
// migrar "a ciegas" contra una base equivocada es peor que no migrar.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL es obligatorio para migrar');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'db', 'migrations');
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
const client = new pg.Client({ connectionString: url });
await client.connect();
let failed = false;
for (const file of files) {
  const sql = await readFile(path.join(dir, file), 'utf8');
  try {
    await client.query(sql);
    console.log(`aplicada ${file}`);
  } catch (error) {
    console.error(`falló ${file}: ${error.message}`);
    failed = true;
    break;
  }
}
await client.end();
process.exit(failed ? 1 : 0);
