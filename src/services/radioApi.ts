import type { RadioStation, Country } from '@/types/radio';

const BASE_URL = 'https://de1.api.radio-browser.info/json';

async function fetchWithFallback(endpoint: string): Promise<Response> {
  const servers = [
    'https://de1.api.radio-browser.info/json',
    'https://nl1.api.radio-browser.info/json',
    'https://at1.api.radio-browser.info/json',
  ];

  for (const server of servers) {
    try {
      const response = await fetch(`${server}${endpoint}`, {
        headers: {
          'User-Agent': 'GlobalRadioExplorer/1.0',
        },
      });
      if (response.ok) return response;
    } catch {
      continue;
    }
  }
  throw new Error('All radio API servers are unavailable');
}

export async function getStationsByCountry(countryCode: string, limit = 50): Promise<RadioStation[]> {
  const response = await fetchWithFallback(
    `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
  );
  return response.json();
}

export async function searchStations(query: string, searchType: 'name' | 'country' | 'tag' = 'name', limit = 50): Promise<RadioStation[]> {
  let endpoint = '';
  
  switch (searchType) {
    case 'name':
      endpoint = `/stations/byname/${encodeURIComponent(query)}`;
      break;
    case 'country':
      endpoint = `/stations/bycountry/${encodeURIComponent(query)}`;
      break;
    case 'tag':
      endpoint = `/stations/bytag/${encodeURIComponent(query)}`;
      break;
  }
  
  const response = await fetchWithFallback(
    `${endpoint}?limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
  );
  return response.json();
}

export async function getTopStations(limit = 100): Promise<RadioStation[]> {
  const response = await fetchWithFallback(
    `/stations/topclick/${limit}?hidebroken=true`
  );
  return response.json();
}

export async function getCountries(): Promise<Country[]> {
  const response = await fetchWithFallback('/countries');
  return response.json();
}

export async function getPopularTags(limit = 20): Promise<{ name: string; stationcount: number }[]> {
  const response = await fetchWithFallback(`/tags?order=stationcount&reverse=true&limit=${limit}`);
  return response.json();
}

export async function clickStation(stationuuid: string): Promise<void> {
  try {
    await fetchWithFallback(`/url/${stationuuid}`);
  } catch {
    // Ignore click tracking errors
  }
}
