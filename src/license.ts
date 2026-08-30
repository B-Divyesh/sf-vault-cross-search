import type { LicenseState } from "./types";

export const FREE_VAULT_LIMIT = 2;
export const LICENSE_CACHE_MAX_AGE_MS = 86_400_000;

export type CachedLicenseVerdict = {
  valid: boolean;
  checkedAt: number;
};

export function readCachedLicenseVerdict(storage: Storage, key: string): CachedLicenseVerdict | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as Partial<CachedLicenseVerdict>).valid === "boolean" &&
      typeof (value as Partial<CachedLicenseVerdict>).checkedAt === "number" &&
      Number.isFinite((value as CachedLicenseVerdict).checkedAt)
    ) return value as CachedLicenseVerdict;
  } catch {
    // Browser storage is untrusted. Invalid cache data is removed below.
  }
  storage.removeItem(key);
  return null;
}

export function initialLicenseState(verdict: CachedLicenseVerdict | null): LicenseState {
  return verdict?.valid ? "licensed" : "free";
}

export function mayAddVault(currentVaults: number, licenseState: LicenseState): boolean {
  return licenseState === "licensed" || currentVaults < FREE_VAULT_LIMIT;
}

export function needsLicenseRefresh(verdict: CachedLicenseVerdict | null, now = Date.now()): boolean {
  return !verdict || now - verdict.checkedAt > LICENSE_CACHE_MAX_AGE_MS;
}
