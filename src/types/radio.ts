export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  clickcount: number;
  geo_lat: number | null;
  geo_long: number | null;
}

export interface Country {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

export interface CountryCoordinates {
  name: string;
  code: string;
  lat: number;
  lng: number;
  stationCount?: number;
}

export type SearchType = 'name' | 'country' | 'tag';
