// Minimal Green Button ESPI (Atom + XML) usage feed parser.
// Written from the public ESPI/NAESB schema — not copied from PG&E's SDK.
// Normalises IntervalReadings into canonical Wh values by applying the
// ReadingType powerOfTenMultiplier at ingest.

import { XMLParser } from "npm:fast-xml-parser@4";
import type { FetchUsageResult, ParsedInterval } from "./utility-adapter.ts";

const MULTIPLIERS: Record<string, number> = {
  "-3": 0.001,
  "-2": 0.01,
  "-1": 0.1,
  "0": 1,
  "1": 10,
  "2": 100,
  "3": 1000,
  "6": 1_000_000,
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseEspiUsageFeed(xml: string): FetchUsageResult {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const doc = parser.parse(xml);
  const feed = doc?.feed ?? doc;
  const entries = asArray(feed?.entry);

  // Collect ReadingType multipliers keyed by their link href.
  const multipliers = new Map<string, number>();
  for (const entry of entries) {
    const content = entry?.content ?? {};
    const rt = content?.ReadingType;
    if (rt) {
      const href = asArray(entry?.link).find((l: Record<string, string>) => l?.["@_rel"] === "self")?.["@_href"] ?? "";
      const m = MULTIPLIERS[String(rt?.powerOfTenMultiplier ?? "0")] ?? 1;
      if (href) multipliers.set(href, m);
    }
  }

  const intervals: ParsedInterval[] = [];
  for (const entry of entries) {
    const content = entry?.content ?? {};
    const block = content?.IntervalBlock;
    if (!block) continue;

    // Find this entry's ReadingType link to resolve scaling.
    const links = asArray(entry?.link);
    const rtLink = links.find((l: Record<string, string>) => String(l?.["@_href"] ?? "").includes("ReadingType"));
    const multiplier = rtLink ? multipliers.get(String(rtLink["@_href"])) ?? 1 : 1;

    // UsagePoint reference, when present on the entry links.
    const upLink = links.find((l: Record<string, string>) => String(l?.["@_href"] ?? "").includes("UsagePoint"));
    const usagePointRef = upLink ? String(upLink["@_href"]) : undefined;

    for (const reading of asArray(block?.IntervalReading)) {
      const period = reading?.timePeriod ?? {};
      const startEpoch = Number(period?.start ?? NaN);
      const duration = Number(period?.duration ?? NaN);
      const value = Number(reading?.value ?? NaN);
      if (!Number.isFinite(startEpoch) || !Number.isFinite(duration) || !Number.isFinite(value)) continue;
      intervals.push({
        usagePointRef,
        intervalStart: new Date(startEpoch * 1000).toISOString(),
        durationSeconds: duration,
        valueWh: value * multiplier,
        quality: reading?.ReadingQuality?.quality ? String(reading.ReadingQuality.quality) : undefined,
      });
    }
  }

  intervals.sort((a, b) => a.intervalStart.localeCompare(b.intervalStart));
  return {
    intervals,
    periodStart: intervals[0]?.intervalStart,
    periodEnd: intervals[intervals.length - 1]?.intervalStart,
  };
}
