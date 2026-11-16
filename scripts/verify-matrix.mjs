#!/usr/bin/env node
/**
 * Verifica que la matriz M01–M72 es completa y coherente.
 *
 * Comprueba, sin dependencias externas:
 *  - las 72 capacidades aparecen exactamente una vez;
 *  - cada fila declara un estado permitido;
 *  - el recuento del pie coincide con las filas;
 *  - ninguna capacidad IMPLEMENTED carece de evidencia.
 *
 * Uso: node scripts/verify-matrix.mjs  (exit 1 si algo no cuadra)
 */
import { readFileSync } from 'node:fs';

const FILE = 'docs/agntiapro-master-audit/06-certificacion/MATRIZ-M01-M72.md';
const ALLOWED = new Set(['IMPLEMENTED', 'PARTIAL', 'PENDING', 'BLOCKED']);

const text = readFileSync(FILE, 'utf8');
const rows = text
  .split('\n')
  .filter((line) => /^\|\s*M\d{2}\s*\|/.test(line))
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));

const errors = [];
const seen = new Map();

for (const [id, capability, status, evidence] of rows) {
  if (seen.has(id)) errors.push(`duplicado: ${id}`);
  seen.set(id, status);
  if (!ALLOWED.has(status)) errors.push(`estado inválido en ${id}: "${status}"`);
  if (status === 'IMPLEMENTED' && (!evidence || evidence === '—')) {
    errors.push(`${id} está IMPLEMENTED sin evidencia`);
  }
}

for (let i = 1; i <= 72; i += 1) {
  const id = `M${String(i).padStart(2, '0')}`;
  if (!seen.has(id)) errors.push(`falta la capacidad ${id}`);
}

const counts = { IMPLEMENTED: 0, PARTIAL: 0, PENDING: 0, BLOCKED: 0 };
for (const status of seen.values()) counts[status] += 1;

const declared = Object.fromEntries(
  [...text.matchAll(/^\|\s*(IMPLEMENTED|PARTIAL|PENDING|BLOCKED)\s*\|\s*(\d+)\s*\|$/gm)].map((m) => [m[1], Number(m[2])]),
);

for (const [status, value] of Object.entries(counts)) {
  if (declared[status] !== value) {
    errors.push(`recuento de ${status}: declarado ${declared[status] ?? 'nada'}, real ${value}`);
  }
}

if (rows.length !== 72) errors.push(`filas: ${rows.length}, esperadas 72`);

if (errors.length > 0) {
  console.error('MATRIZ INVÁLIDA');
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(
  `MATRIZ OK · 72 capacidades · IMPLEMENTED ${counts.IMPLEMENTED} · PARTIAL ${counts.PARTIAL} · PENDING ${counts.PENDING} · BLOCKED ${counts.BLOCKED}`,
);
