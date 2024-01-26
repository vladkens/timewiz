import { filterNullable } from "array-utils-ts"
import { DateTime } from "luxon"
import _records from "./geonames.json"

type Brand<T, BrandT> = T & { _type: BrandT }
export type GeoId = Brand<number, "GeoId">

const records = _records as {
  timezones: string[]
  countries: [string, string, string][]
  cities: [GeoId, string, number, number][]
}

export type GeoName = {
  uid: GeoId
  timeZone: string
  hourCycle: "h12" | "h24"
  countryCode: string
  country: string
  city: string
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
      const uid = record[0] as GeoId
      const city = record[1]
      const timeZone = timezonesMap[record[2]]
      const { code: countryCode, name: country, locale } = countriesMap[record[3]]
      const hourCycle = getHourCycle(timeZone, locale)
      return { uid, countryCode, timeZone, country, city, hourCycle } satisfies GeoName
    } catch (e) {
      console.log(`Error parsing geoname: ${record}`)
      return null
    }
  })

  return filterNullable(places)
}

const geoNames = prepare()
const byId = geoNames.reduce(
  (acc, val) => Object.assign(acc, { [val.uid]: val }),
  {} as Record<GeoName["uid"], GeoName>,
)

export const getGeoNames = () => geoNames
export const getGeoNameById = (id: GeoName["uid"]) => byId[id]

export const getSystemGeoName = () => {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions()

  const zones = geoNames.filter((x) => x.timeZone === timeZone)
  if (zones.length) {
    return zones[0]
  }

  return geoNames.find((x) => x.timeZone === "Europe/London")!
}
