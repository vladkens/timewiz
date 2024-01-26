import _records from "./geonames.json"

type Brand<T, BrandT> = T & { _type: BrandT }
export type GeoId = Brand<number, "GeoId">

const records = _records as {
  timezones: string[]
  countries: [string, string][]
  cities: [GeoId, string, number, number][]
}

export type GeoName = {
  uid: GeoId
  timeZoneOffset: number
  timeZoneDayPeriod: "h12" | "h24"
  timeZone: string
  countryCode: string
  country: string
  city: string
}

const prepare = () => {
  const countriesMap = records.countries.reduce(
    (acc, val, idx) => Object.assign(acc, { [idx]: { code: val[0], name: val[1] } }),
    {} as Record<number, { code: string; name: string }>,
  )

  const timezonesMap = records.timezones.reduce(
    (acc, val, idx) => Object.assign(acc, { [idx]: val }),
    {} as Record<number, string>,
  )

  const places = records.cities.map((record) => {
    const timeZone = timezonesMap[record[2]]
    const { code: countryCode, name: country } = countriesMap[record[3]]

    const today = new Date().setHours(0, 0, 0, 0)

    const tzMode =
      Intl.DateTimeFormat(`en-${countryCode}`, { timeZone, timeStyle: "long" })
        .formatToParts(today)
        .find((x) => x.type === "dayPeriod")
        ?.value.toLowerCase() ?? ""

    const timeZoneDayPeriod = tzMode === "" ? "h24" : "h12"

    const tzName =
      Intl.DateTimeFormat(`en-us`, { timeZone, timeZoneName: "longOffset" })
        .formatToParts(today)
        .find((x) => x.type === "timeZoneName")?.value ?? ""

    const tzOffs = tzName.substring(3).split(":")
    const timeZoneOffset =
      tzOffs.length !== 2 ? 0 : parseInt(tzOffs[0], 10) * 60 + parseInt(tzOffs[1], 10)

    return {
      uid: record[0] as GeoId,
      countryCode,
      timeZone,
      country,
      city: record[1],
      timeZoneOffset,
      timeZoneDayPeriod,
    } satisfies GeoName
  })

  return places
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
