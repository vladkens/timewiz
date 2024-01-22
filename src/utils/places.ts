import { TimeZone, getTimeZones } from "@vvo/tzdb"

export type Place = {
  tzName: string
  tzAbbr: string
  tzOffset: number
  country: string
  city: string
}

export const tzToPlace = (tz: TimeZone): Place => {
  return {
    tzName: tz.name,
    tzAbbr: tz.abbreviation,
    tzOffset: tz.rawOffsetInMinutes,
    country: tz.countryName,
    city: tz.mainCities[0],
  }
}

export const getPlaceByTzName = (tzName: string): Place => {
  const tz = getTimeZones().find((x) => x.name === tzName)
  if (!tz) throw new Error(`No timezone found for ${tzName}`)
  return tzToPlace(tz)
}
