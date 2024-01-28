import { atom, useAtomValue, useSetAtom } from "jotai"
import { uniq } from "lodash-es"
import { DateTime } from "luxon"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { Place, PlaceId, getPlaceById, getSystemPlace } from "./utils/geonames"

const systemTimeZone = getSystemPlace().uid
const defaults = uniq([systemTimeZone, 5128581, 2643743, 1275339]) as PlaceId[] // NYC, London, Mumbai

export const ClockView = atomWithStorageSync<"12" | "24" | "MX">("tzMode", "MX")
export const TzListState = atomWithStorageSync<PlaceId[]>("tzList", defaults)

const TzHomeState = atomWithStorageSync("tzHome", systemTimeZone)

const HomePlace = atom((get) => {
  const place = getPlaceById(get(TzHomeState))
  return place ?? getSystemPlace()
})

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

export const useSetHomePlace = () => {
  const setHome = useSetAtom(TzHomeState)
  const setDate = useSetAtom(CustomDate)

  return (id: PlaceId) => {
    setHome(id)
    setDate(null)
  }
}

export const useGetHomePlace = () => {
  return useAtomValue(HomePlace)
}

export const useIsHomePlace = (left: Place) => {
  const home = useAtomValue(HomePlace)
  return home.uid === left.uid
}

export const useGetOffsetFromHome = (left: Place) => {
  const home = useAtomValue(HomePlace)
  const d1 = DateTime.now().setZone(home.timeZone)
  const d2 = DateTime.now().setZone(left.timeZone)
  return d2.offset - d1.offset
}

export const useGetHourCycle = (place: Place): "h12" | "h24" => {
  const mode = useAtomValue(ClockView)
  if (mode === "12") return "h12"
  if (mode === "24") return "h24"
  return place.hourCycle // "MX"
}

export const useSetDate = () => {
  const setDate = useSetAtom(CustomDate)
  return (date: string) => setDate(date)
}
