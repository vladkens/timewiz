import { TimeZone, getTimeZones } from "@vvo/tzdb"

export const TimeZones: Record<string, TimeZone> = {}

for (const tz of getTimeZones()) {
  const names = [tz.name, ...tz.group]
  for (const name of names) {
    if (TimeZones[name]) {
      const lOff = TimeZones[name].rawOffsetInMinutes
      const rOff = tz.rawOffsetInMinutes
      if (lOff === rOff) continue

      console.warn("Duplicate timezone", { name, lOff, rOff, tz })
      continue
    }
    TimeZones[name] = { ...tz, name }
  }
}

export const getPlaceByTzName = (tzName: string): Place => {
  const tz = TimeZones[tzName]
  if (!tz) throw new Error(`No timezone found for ${tzName}`)
  return tzToPlace(tz)
}

export const getSystemPlace = () => {
  try {
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone
    return getPlaceByTzName(tzName)
  } catch (e) {
    return getPlaceByTzName("Europe/London")
  }
}

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
