import { useAtomValue } from "jotai"
import { atomWithStorageSync } from "./utils/atomWithStorageSync"
import { getPlaceByTzName } from "./utils/places"

export const TzListState = atomWithStorageSync<string[]>("tzList", [])
export const TzHomeState = atomWithStorageSync("tzHome", "Europe/London")

export const useGetHomePlace = () => {
  const ref = useAtomValue(TzHomeState)
  return getPlaceByTzName(ref)
}
