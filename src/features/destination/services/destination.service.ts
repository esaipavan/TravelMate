import type { CountryInfo, WikiInfo, DestinationData } from '../types';

const COUNTRIESNOW = 'https://countriesnow.space/api/v0.1';
const WORLDBANK = 'https://api.worldbank.org/v2';
const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';

// ── CountriesNow ──────────────────────────────────────────────────────────────

interface CNCountry {
  name: string;
  capital: string;
  currency: string;
  flag: string;
  dialCode: string;
  unicodeFlag: string;
}

let cnCache: CNCountry[] | null = null;

async function fetchAllCNCountries(): Promise<CNCountry[]> {
  if (cnCache) return cnCache;
  const res = await fetch(
    `${COUNTRIESNOW}/countries/info?returns=capital,currency,flag,dialCode,unicodeFlag`,
  );
  if (!res.ok) throw new Error('Failed to load countries list');
  const json = (await res.json()) as { data: CNCountry[] };
  cnCache = json.data ?? [];
  return cnCache;
}

async function searchCountry(query: string): Promise<CountryInfo | null> {
  const all = await fetchAllCNCountries();
  const q = query.toLowerCase();
  const found =
    all.find((c) => c.name.toLowerCase() === q) ??
    all.find((c) => c.name.toLowerCase().startsWith(q)) ??
    all.find((c) => c.name.toLowerCase().includes(q));

  if (!found) return null;

  const dialCode = found.dialCode ? `+${found.dialCode.replace(/^\+/, '')}` : '';

  return {
    name: found.name,
    officialName: found.name,
    flagUrl: found.flag,
    capital: found.capital || '—',
    region: '',
    subregion: '',
    population: 0,
    area: 0,
    languages: [],
    currencies: [{ code: found.currency, name: '', symbol: '' }],
    timezones: [],
    callingCode: dialCode,
    borders: [],
  };
}

async function fetchIso2(query: string): Promise<string | null> {
  const res = await fetch(`${COUNTRIESNOW}/countries/capital`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: query }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { error?: boolean; data?: { iso2?: string } };
  if (json.error) return null;
  return json.data?.iso2 ?? null;
}

// ── World Bank ────────────────────────────────────────────────────────────────

interface WBData {
  region: string;
  population: number;
}

async function fetchWorldBankData(iso2: string): Promise<WBData> {
  const code = encodeURIComponent(iso2.toLowerCase());
  const [countryRes, popRes] = await Promise.all([
    fetch(`${WORLDBANK}/country/${code}?format=json`).catch(() => null),
    fetch(`${WORLDBANK}/country/${code}/indicator/SP.POP.TOTL?format=json&mrv=1`).catch(() => null),
  ]);

  let region = '';
  let population = 0;

  if (countryRes?.ok) {
    const data = (await countryRes.json()) as [
      unknown,
      Array<{ region?: { value?: string } }> | undefined,
    ];
    region = data[1]?.[0]?.region?.value ?? '';
  }

  if (popRes?.ok) {
    const data = (await popRes.json()) as [unknown, Array<{ value?: number | null }> | undefined];
    population = data[1]?.[0]?.value ?? 0;
  }

  return { region, population };
}

// ── Wikipedia ─────────────────────────────────────────────────────────────────

async function searchWikiTitle(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '1',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_SEARCH}?${params.toString()}`);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { search?: { title: string }[] };
  };
  return data.query?.search?.[0]?.title ?? null;
}

async function getWikiSummary(title: string): Promise<WikiInfo | null> {
  const res = await fetch(`${WIKI_SUMMARY}/${encodeURIComponent(title)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    title: string;
    extract?: string;
    thumbnail?: { source: string };
    content_urls?: { desktop?: { page?: string } };
  };
  if (!data.extract) return null;
  return {
    title: data.title,
    extract: data.extract,
    thumbnailUrl: data.thumbnail?.source ?? null,
    wikiUrl:
      data.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

// ── Combined ──────────────────────────────────────────────────────────────────

export async function fetchDestinationData(query: string): Promise<DestinationData> {
  const trimmed = query.trim();

  // Phase 1 — all independent calls in parallel; each failure is isolated
  const [countryBasic, iso2, mainTitle, tourismTitle] = await Promise.all([
    searchCountry(trimmed).catch(() => null),
    fetchIso2(trimmed).catch(() => null),
    searchWikiTitle(trimmed).catch(() => null),
    searchWikiTitle(`Tourism in ${trimmed}`).catch(() => null),
  ]);

  // Phase 2 — dependent calls all run in parallel
  const [wbData, wiki, attractions] = await Promise.all([
    iso2 ? fetchWorldBankData(iso2).catch(() => null) : Promise.resolve(null),
    mainTitle ? getWikiSummary(mainTitle).catch(() => null) : Promise.resolve(null),
    tourismTitle ? getWikiSummary(tourismTitle).catch(() => null) : Promise.resolve(null),
  ]);

  // Merge World Bank supplement into base country data
  const country: CountryInfo | null = countryBasic
    ? {
        ...countryBasic,
        region: wbData?.region || countryBasic.region,
        population: wbData?.population ?? countryBasic.population,
      }
    : null;

  if (!country && !wiki) {
    throw new Error(`No information found for "${trimmed}"`);
  }

  return { query: trimmed, country, wiki, attractions };
}
