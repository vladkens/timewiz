import { filterNullable } from "array-utils-ts"
import { first } from "lodash-es"
import { DateTime } from "luxon"
import _records from "./geonames.json"

type Brand<T, BrandT> = T & { _type: BrandT }
export type PlaceId = Brand<number, "PlaceId">

const records = _records as unknown as {
  timezones: string[]
  countries: [iso3: string, name: string, locale: string][]
  cities: [id: PlaceId, name: string, tz_idx: number, ct_idx: number][]
  legacy: Record<string, string[]>
}

export type Place = {
  id: PlaceId
  zone: string
  hourCycle: "h12" | "h24"
  countryCode: string
  country: string
  city: string
  locale: string
}

const getHourCycle = (zone: string, locale: string) => {
  const temp = DateTime.fromObject({ hour: 13 }, { zone }) //
    .toLocaleString(DateTime.TIME_SIMPLE, { locale })
    .replaceAll(".", ":")
    .toLowerCase()

  if (temp.includes("13:00")) return "h24"
  if (temp.includes("1:00") || temp.includes("pm")) return "h12"

  // console.log({ zone, locale }, temp) // debug
  return "h24"
}

const prepare = () => {
  const countriesMap = records.countries.reduce(
    (acc, val, idx) => {
      return Object.assign(acc, { [idx]: { code: val[0], name: val[1], locale: val[2] } })
    },
    {} as Record<number, { code: string; name: string; locale: string }>,
  )

  const timezonesMap = records.timezones.reduce(
    (acc, val, idx) => Object.assign(acc, { [idx]: val }),
    {} as Record<number, string>,
  )

  const places = records.cities.map((record) => {
    try {
      const id = record[0] as PlaceId
      const city = record[1]
      const zone = timezonesMap[record[2]]
      const { code: countryCode, name: country, locale } = countriesMap[record[3]]
      const hourCycle = getHourCycle(zone, locale)
      return { id, countryCode, zone, country, city, hourCycle, locale } satisfies Place
    } catch (e) {
      console.log(`Error parsing geoname: ${record}`)
      return null
    }
  })

  const utcPlace: Place = {
    id: -1 as PlaceId,
    zone: "UTC",
    hourCycle: "h24",
    countryCode: "",
    country: "",
    city: "UTC",
    locale: "en",
  }

  places.push(utcPlace)

  return filterNullable(places)
}

const Places = prepare()

const byId = Places.reduce(
  (acc, val) => Object.assign(acc, { [val.id]: val }),
  {} as Record<Place["id"], Place>,
)

export const getPlaces = () => Places

export const getPlaceById = (id: Place["id"]) => (id in byId ? byId[id] : null)

export const getSystemPlace = () => {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions()

  // some OS have outdated zones in Intl API, so map current / legacy names to the latest ones
  const tzs: Record<string, string> = { "Etc/UTC": "UTC" }
  for (const zone of records.timezones) tzs[zone] = zone
  for (const [nowName, oldNames] of Object.entries(records.legacy)) {
    for (const oldName of oldNames) tzs[oldName] = nowName
  }

  const zone = tzs[timeZone] ?? "Europe/London"
  return first(Places.filter((x) => x.zone === zone))!
}
