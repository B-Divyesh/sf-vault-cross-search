export type VaultSummary = {
  id: string;
  name: string;
  entries: number;
  unlocked: boolean;
};

export type SearchResult = {
  id: string;
  vaultId: string;
  vaultName: string;
  title: string;
  username: string;
  url: string;
  group: string;
};

export type SessionState = {
  vaults: VaultSummary[];
  locked: boolean;
  minutesRemaining: number;
};

export type LicenseState = "free" | "checking" | "licensed" | "invalid" | "offline";
