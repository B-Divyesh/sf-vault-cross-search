import { describe, expect, it } from "vitest";
import { initialLicenseState, mayAddVault, needsLicenseRefresh, readCachedLicenseVerdict } from "./license";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial));
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); }
  };
}

describe("license policy", () => {
  it("@claim:free-vault-limit stops the free edition before a third vault", () => {
    expect(mayAddVault(0, "free")).toBe(true);
    expect(mayAddVault(1, "free")).toBe(true);
    expect(mayAddVault(2, "free")).toBe(false);
  });

  it("@claim:licensed-vault-limit allows more than two vaults only with a valid cached license", () => {
    expect(mayAddVault(25, "licensed")).toBe(true);
    expect(mayAddVault(25, "checking")).toBe(false);
    expect(mayAddVault(25, "invalid")).toBe(false);
    expect(mayAddVault(25, "offline")).toBe(false);
  });

  it("keeps the vault-count decision separate from shared behavior", () => {
    const sharedBehavior = { keyboard: true, sessionLock: true, metadataFilter: true, privacy: true };
    expect({ ...sharedBehavior, mayAddThirdVault: mayAddVault(2, "free") }).toEqual({ ...sharedBehavior, mayAddThirdVault: false });
    expect({ ...sharedBehavior, mayAddThirdVault: mayAddVault(2, "licensed") }).toEqual({ ...sharedBehavior, mayAddThirdVault: true });
  });

  it("discards malformed or structurally invalid cached verdicts", () => {
    for (const raw of ["{broken", "null", '{"valid":"yes","checkedAt":4}', '{"valid":true,"checkedAt":"today"}']) {
      const storage = memoryStorage({ verdict: raw });
      expect(readCachedLicenseVerdict(storage, "verdict")).toBeNull();
      expect(storage.getItem("verdict")).toBeNull();
      expect(initialLicenseState(null)).toBe("free");
    }
  });

  it("refreshes only missing or day-old cached verdicts", () => {
    expect(needsLicenseRefresh(null, 100)).toBe(true);
    expect(needsLicenseRefresh({ valid: true, checkedAt: 100 }, 101)).toBe(false);
    expect(needsLicenseRefresh({ valid: true, checkedAt: 100 }, 86_400_101)).toBe(true);
  });
});
