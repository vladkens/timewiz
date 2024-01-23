import { atom, useAtomValue } from "jotai"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { getPlaceByTzName, getSystemPlace } from "./utils/places"

type TzView = "12" | "24" | "MX"

const systemTz = getSystemPlace().tzName

export const TzListState = atomWithStorageSync<string[]>("tzList", [systemTz])
export const TzHomeState = atomWithStorageSync("tzHome", systemTz)
export const TzModeState = atomWithStorageSync<TzView>("tzMode", "24")

const HomePlace = atom((get) => getPlaceByTzName(get(TzHomeState)))
export const useGetHomePlace = () => useAtomValue(HomePlace)
