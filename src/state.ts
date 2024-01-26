import { atom, useAtomValue } from "jotai"
import { uniq } from "lodash-es"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { GeoId, GeoName, getGeoNameById, getSystemGeoName } from "./utils/geonames"

const systemTimeZone = getSystemGeoName().uid
const defaults = uniq([systemTimeZone, 5128581, 2643743, 1275339]) as GeoId[] // NYC, London, Mumbai

export const TzListState = atomWithStorageSync<GeoId[]>("tzList", defaults)
export const TzHomeState = atomWithStorageSync("tzHome", systemTimeZone)

const HomePlace = atom((get) => getGeoNameById(get(TzHomeState)))

export const useGetHomePlace = (otherPlace: GeoName) => {
  const place = useAtomValue(HomePlace)
  return { place, active: otherPlace.uid === place.uid }
}

export const TzModeState = atomWithStorageSync<"12" | "24" | "MX">("tzMode", "MX")
export const useTimeMode = (place: GeoName): "h12" | "h24" => {
  const mode = useAtomValue(TzModeState)
  if (mode === "12") return "h12"
  if (mode === "24") return "h24"
  return place.timeZoneHourCycle
}
