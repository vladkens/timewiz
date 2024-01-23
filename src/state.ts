import { atom, useAtomValue } from "jotai"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { getPlaceByTzName } from "./utils/places"

type TzView = "12" | "24" | "MX"

export const TzListState = atomWithStorageSync<string[]>("tzList", [])
export const TzHomeState = atomWithStorageSync("tzHome", "Europe/London")
export const TzModeState = atomWithStorageSync<TzView>("tzMode", "24")

const HomePlace = atom((get) => getPlaceByTzName(get(TzHomeState)))
export const useGetHomePlace = () => useAtomValue(HomePlace)
