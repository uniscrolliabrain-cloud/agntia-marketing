import { createHash, randomUUID } from 'node:crypto';
import type { Money } from '@agntia/contracts';

/** JSON canónico: claves ordenadas, sin undefined. Base de todos los hashes. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

export function sha256(value: unknown): string {
  return createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 20)}`;
}

export function isPast(iso: string, now: Date): boolean {
  return Date.parse(iso) <= now.getTime();
}

export function isFuture(iso: string, now: Date): boolean {
  return Date.parse(iso) > now.getTime();
}

/** Suma de dinero decimal string sin pasar por float. */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error('currency_mismatch');
  const decimals = Math.max(decimalsOf(a.amount), decimalsOf(b.amount));
  const total = BigInt(toMinor(a.amount, decimals)) + BigInt(toMinor(b.amount, decimals));
  return { amount: fromMinor(total, decimals), currency: a.currency };
}

export function compareMoney(a: Money, b: Money): number {
  if (a.currency !== b.currency) throw new Error('currency_mismatch');
  const decimals = Math.max(decimalsOf(a.amount), decimalsOf(b.amount));
  const x = BigInt(toMinor(a.amount, decimals));
  const y = BigInt(toMinor(b.amount, decimals));
  return x === y ? 0 : x < y ? -1 : 1;
}

function decimalsOf(amount: string): number {
  const [, frac = ''] = amount.split('.');
  return frac.length;
}

function toMinor(amount: string, decimals: number): string {
  const [i = '0', f = ''] = amount.split('.');
  const sign = i.startsWith('-') ? '-' : '';
  const whole = i.replace('-', '');
  return `${sign}${whole}${f.padEnd(decimals, '0').slice(0, decimals)}`;
}

function fromMinor(minor: bigint, decimals: number): string {
  const negative = minor < 0n;
  const digits = (negative ? -minor : minor).toString().padStart(decimals + 1, '0');
  const whole = digits.slice(0, digits.length - decimals) || '0';
  const frac = decimals ? `.${digits.slice(digits.length - decimals)}` : '';
  return `${negative ? '-' : ''}${whole}${frac}`;
}
