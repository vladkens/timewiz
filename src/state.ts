import { atom, useAtomValue } from "jotai"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { GeoId, GeoName, getGeoNameById, getSystemGeoName } from "./utils/geonames"

const systemTimeZone = getSystemGeoName().uid
export const TzListState = atomWithStorageSync<GeoId[]>("tzList", [systemTimeZone])
export const TzHomeState = atomWithStorageSync("tzHome", systemTimeZone)

const HomePlace = atom((get) => getGeoNameById(get(TzHomeState)))
export const useGetHomePlace = () => useAtomValue(HomePlace)

export const TzModeState = atomWithStorageSync<"12" | "24" | "MX">("tzMode", "MX")
export const useTimeMode = (place: GeoName): "h12" | "h24" => {
  const mode = useAtomValue(TzModeState)
  if (mode === "12") return "h12"
  if (mode === "24") return "h24"
  return place.timeZoneDayPeriod
}
