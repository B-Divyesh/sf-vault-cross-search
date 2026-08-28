import { describe, expect, it } from "vitest";
import { rankResults, safeDisplayUrl } from "./search";
import type { SearchResult } from "./types";

const entries: SearchResult[] = [
  { id: "1", vaultId: "a", vaultName: "Work", title: "GitHub", username: "ana", url: "https://github.com", group: "Dev" },
  { id: "2", vaultId: "b", vaultName: "Home", title: "GitLab", username: "ben", url: "https://gitlab.com", group: "Code" }
];

describe("rankResults", () => {
  it("ranks exact titles before partial titles", () => expect(rankResults(entries, "gitlab")[0].id).toBe("2"));
  it("requires every search term", () => expect(rankResults(entries, "git ana").map((x) => x.id)).toEqual(["1"]));
  it("caps blank results", () => expect(rankResults(Array(70).fill(entries[0]), "")).toHaveLength(50));
});

it("shows only the host for valid URLs", () => expect(safeDisplayUrl("https://accounts.example.com/path?q=secret")).toBe("accounts.example.com"));
