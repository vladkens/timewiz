import csv
import io
import json
import typing
import zipfile
from collections import defaultdict
from dataclasses import dataclass, fields

import httpx


@dataclass
class TypedTrait:
    def __unbound(self, t, v):
        try:
            return t(v)
        except ValueError:
            return t()  # default value for type

    def __post_init__(self):
        for f in fields(self.__class__):
            v = getattr(self, f.name)
            if typing.get_origin(f.type) is list:
                g = typing.get_args(f.type)[0]
                setattr(self, f.name, [self.__unbound(g, x) for x in v.split(",")])
            else:
                setattr(self, f.name, self.__unbound(f.type, v))

    def __getitem__(self, key):
        return getattr(self, key)


@dataclass
class City(TypedTrait):
    # https://download.geonames.org/export/dump/readme.txt
    geonameid: int
    name: str
    asciiname: str
    alternatenames: list[str]
    latitude: float
    longitude: float
    feature_class: str
    feature_code: str
    country_code: str
    cc2: str
    admin1_code: str
    admin2_code: str
    admin3_code: str
    admin4_code: str
    population: int
    elevation: int
    dem: int
    timezone: str
    modification_date: str


@dataclass
class Country(TypedTrait):
    # https://download.geonames.org/export/dump/countryInfo.txt
    iso: str
    iso3: str
    iso_numeric: int
    fips: str
    country: str
    capital: str
    area: int
    population: int
    continent: str
    tld: str
    currency_code: str
    currency_name: str
    phone: str
    postal_code_format: str
    postal_code_regex: str
    languages: list[str]
    geonameid: int
    neighbours: list[str]
    equivalent_fips_code: str


def get_cities():
    rep = httpx.get("https://download.geonames.org/export/dump/cities15000.zip")
    rep.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(rep.content)) as zip:
        assert len(zip.namelist()) == 1
        data = zip.read(zip.namelist()[0]).decode("utf-8").splitlines()
        rows = csv.reader(data, delimiter="\t")
        return [City(*row) for row in rows]


def get_countries():
    rep = httpx.get("https://download.geonames.org/export/dump/countryInfo.txt")
    rep.raise_for_status()

    data = rep.text.split("EquivalentFipsCode")[1].splitlines()
    data = [x for x in data if len(x)]
    rows = csv.reader(data, delimiter="\t")
    return [Country(*row) for row in rows]


def get_legacy_tzs():
    rep = httpx.get("https://data.iana.org/time-zones/data/backward")
    rep.raise_for_status()

    data = rep.text.splitlines()
    data = [x for x in data if x.startswith("Link")]

    mapping = defaultdict(set)  # now -> old
    for x in data:
        parts = [x for x in x.split("\t") if len(x)]
        now, was = parts[1], parts[2]

        if now.startswith("Etc/") or was.startswith("Etc/"):
            continue

        if now.count("/") != 1 or was.count("/") != 1:
            continue

        mapping[now].add(was)

    res = {k: sorted(list(v)) for k, v in mapping.items()}
    res = sorted(res.items(), key=lambda x: x[0])
    return dict(res)


def get_locale(langs: list[str]):
    langs = [x.strip() for x in langs]
    langs = [x for x in langs if len(x)]
    return langs[0] if len(langs) else "en"


def print_features(cities: list[City]):
    print("-" * 60)

    features_count = defaultdict(int)
    for x in cities:
        features_count[x.feature_code] += 1

    features_count = sorted(features_count.items(), key=lambda x: x[1], reverse=True)
    for k, v in features_count:
        sample = [x for x in cities if x.feature_code == k][:3]
        sample = [f"{x.country_code}, {x.name}" for x in sample]
        sample = " ~ ".join(sample)
        print(f"{k:5} {v:7,d}: {sample}")


def main():
    MIN_POPULATION = 80_000

    cities = get_cities()
    cities = sorted(cities, key=lambda x: x.population, reverse=True)

    timezones = set([x.timezone for x in cities])
    timezones = sorted(timezones)
    timezones_idx = {x: i for i, x in enumerate(timezones)}

    countries = [[x.iso, x.country, get_locale(x.languages)] for x in get_countries()]
    countries = sorted(countries, key=lambda x: x[0].lower())
    countries_idx = {x[0]: i for i, x in enumerate(countries)}

    # https://www.geonames.org/export/codes.html
    features_keep = set(["PPL", "PPLA", "PPLA2", "PPLC", "PPLG"])
    cities = [x for x in cities if x.feature_code in features_keep]

    cities_by_country: dict[str, list[City]] = defaultdict(list)
    for x in cities:
        cities_by_country[x.country_code].append(x)

    places, selected_cities = [], []
    for x in countries:
        items = cities_by_country.get(x[0], [])
        # always first 3 cities + other big cities
        items = items[:3] + [x for x in items[3:] if x.population >= MIN_POPULATION]
        if not len(items):
            # print(f"Missing cities for {x[0]}")
            continue

        selected_cities.extend(items)
        for x in items:
            tz_idx, ct_idx = timezones_idx[x.timezone], countries_idx[x.country_code]
            r = [x.geonameid, x.name, tz_idx, ct_idx]
            places.append(r)

    # print_features(cities)
    print_features(selected_cities)

    print("-" * 60)
    print(f"{len(places)} of {len(cities)}")

    legacy = get_legacy_tzs()

    with open("src/utils/geonames.json", "w") as fp:
        data = dict(
            timezones=timezones,
            countries=countries,
            cities=places,
            legacy=legacy,
        )
        # json.dump(data, fp, indent=2, ensure_ascii=False)
        json.dump(data, fp)


if __name__ == "__main__":
    main()
