import { UpstreamError } from './upstream-http';
export type RecordValue = Record<string, unknown>;
export function object(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new UpstreamError('INVALID_PAYLOAD');
  return value as RecordValue;
}
export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new UpstreamError('INVALID_PAYLOAD');
  return value;
}
export function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
export function required(value: unknown): string {
  const result = str(value);
  if (result === null) throw new UpstreamError('INVALID_PAYLOAD');
  return result;
}
export function num(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    typeof value === 'boolean'
  )
    return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}
export function integer(value: unknown): number | null {
  const n = num(value);
  return n !== null && Number.isInteger(n) && n >= 0 ? n : null;
}
export function decimal(value: unknown): string | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const s = String(value);
  return /^\d+(\.\d+)?$/.test(s) ? s : null;
}
export function milliseconds(value: unknown): number | null {
  const n = num(value);
  return n === null || n < 0 ? null : Math.round(n * 1000);
}
export function lapMs(value: unknown): number | null {
  const text = str(value);
  if (!text) return null;
  const match = /^(?:(\d+):)?(\d{1,2}(?:\.\d+)?)$/.exec(text);
  return match
    ? Math.round((Number(match[1] ?? 0) * 60 + Number(match[2])) * 1000)
    : null;
}
export function instant(value: unknown): string | null {
  const s = str(value);
  if (!s || !/(Z|[+-]\d\d:\d\d)$/.test(s) || !Number.isFinite(Date.parse(s)))
    return null;
  return new Date(s).toISOString();
}
