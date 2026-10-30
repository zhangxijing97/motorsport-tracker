import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
export type QueryValues = Record<string, unknown>;
export function validateKeys(query: QueryValues, keys: string[]) {
  for (const [key, value] of Object.entries(query))
    if (!keys.includes(key) || typeof value !== 'string')
      throw new BadRequestException(`Invalid query parameter: ${key}`);
}
export function textParam(query: QueryValues, key: string): string | undefined {
  const value = query[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.length)
    throw new BadRequestException(`Invalid ${key}`);
  return value;
}
export function integerParam(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max)
    throw new BadRequestException(`Expected an integer from ${min} to ${max}`);
  return Number(value);
}
export function dateParam(
  value: string | undefined,
  fallback?: string,
): string {
  if (value === undefined && fallback) return fallback;
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw new BadRequestException('Expected a valid YYYY-MM-DD UTC date');
  return value;
}
export function f1(value = 'f1') {
  if (value !== 'f1')
    throw new UnprocessableEntityException('Only f1 is supported by v1');
}
export function paging(query: QueryValues) {
  return {
    limit: integerParam(textParam(query, 'limit'), 50, 1, 100),
    offset: integerParam(textParam(query, 'offset'), 0, 0, 10_000),
  };
}
export function yearParam(value?: string) {
  return integerParam(
    value,
    new Date().getUTCFullYear(),
    1950,
    new Date().getUTCFullYear() + 1,
  );
}
export function seasonYear(value: string | undefined) {
  const match = /^f1-(\d{4})$/.exec(value ?? '');
  if (!match) throw new BadRequestException('Expected seasonId=f1-YYYY');
  return yearParam(match[1]);
}
