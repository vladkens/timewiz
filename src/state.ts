import { atom, useAtomValue, useSetAtom } from "jotai"
import { uniq } from "lodash-es"
import { DateTime } from "luxon"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { GeoId, GeoName, getGeoNameById, getSystemGeoName } from "./utils/geonames"

const systemTimeZone = getSystemGeoName().uid
const defaults = uniq([systemTimeZone, 5128581, 2643743, 1275339]) as GeoId[] // NYC, London, Mumbai

export const TzListState = atomWithStorageSync<GeoId[]>("tzList", defaults)
export const TzHomeState = atomWithStorageSync("tzHome", systemTimeZone)
export const TzModeState = atomWithStorageSync<"12" | "24" | "MX">("tzMode", "MX")

const HomePlace = atom((get) => getGeoNameById(get(TzHomeState)))

// Date control

const todayDate = (zone: string) => {
  return DateTime.now().setZone(zone).set({ hour: 0 })
}

const CustomDate = atom<string | null>(null)

export const SelectedDate = atom((get) => {
  const date = get(CustomDate)
  const home = get(HomePlace)
  return date ? date : todayDate(home.timeZone).toISODate()!
})

export const NextDays = atom((get) => {
  const home = get(HomePlace)
  const today = todayDate(home.timeZone)
  const selected = get(SelectedDate)

  const items = []
  for (let i = -1; i <= 5; ++i) {
    const date = today.plus({ days: i }).toISODate()!
    items.push({ date, isActive: date === selected })
  }

  return items
})

// hooks

export const useSetHomeGeo = () => {
  const setHome = useSetAtom(TzHomeState)
  const setDate = useSetAtom(CustomDate)

  return (id: GeoId) => {
    const tt = DateTime.now().setZone(getGeoNameById(id).timeZone)
    setHome(id)
    // setDate(tt.toISODate()!)
    setDate(null)
  }
}

export const useGetHomeGeo = () => {
  return useAtomValue(HomePlace)
}

export const useIsHomeGeo = (left: GeoName) => {
  const home = useAtomValue(HomePlace)
  return home.uid === left.uid
}

export const useGetOffsetFromHome = (left: GeoName) => {
  const home = useAtomValue(HomePlace)
  const d1 = DateTime.now().setZone(home.timeZone)
  const d2 = DateTime.now().setZone(left.timeZone)
  return d2.offset - d1.offset
}

export const useGetHourCycle = (place: GeoName): "h12" | "h24" => {
  const mode = useAtomValue(TzModeState)
  if (mode === "12") return "h12"
  if (mode === "24") return "h24"
  return place.hourCycle // "MX"
}

export const useSetDate = () => {
  const setDate = useSetAtom(CustomDate)
  return (date: string) => setDate(date)
}
