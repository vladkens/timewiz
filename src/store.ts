import { filterNullable } from "array-utils-ts"
import { atom, useAtomValue, useSetAtom } from "jotai"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import { orderBy, uniq, uniqBy } from "lodash-es"
import { DateTime } from "luxon"
import { useEffect } from "react"
import { Place, PlaceId, getPlaceById, getSystemPlace } from "./utils/geonames"

const recreateStorage = (msg: string) => {
  // should never happen, but in case
  localStorage.clear()
  window.location.reload()
  return new Error(msg)
}

/**
 * Persisted store
 */

export type TabDto = {
  id: number
  places: { id: PlaceId; name?: string }[]
  home: PlaceId
  name: string
}

const getInitialStore = (): TabDto[] => {
  const sysTzId = getSystemPlace().id
  const places = uniq([-1, sysTzId, 5128581, 2643743, 1275339]) as PlaceId[] // NYC, London, Mumbai
  return [{ id: Date.now(), places: places.map((id) => ({ id })), home: sysTzId, name: "Home" }]
}

const TabsStore = atomWithStorage<TabDto[]>("tabs-store", getInitialStore(), undefined, {
  getOnInit: true,
})

/**
 * Live state
 */

const TabsState = atom((get) => {
  const tabsStore = get(TabsStore)
  return tabsStore.map((tab) => ({
    places: filterNullable(tab.places.map((x) => getPlaceById(x.id))),
    home: getPlaceById(tab.home)!, // todo: handle null
    name: tab.name,
    id: tab.id,
  }))
})

// prettier-ignore
const ActiveTabId_ = atomWithStorage("active-tab", -1, createJSONStorage(() => sessionStorage), { getOnInit: true })

const ActiveTabId = atom((get) => {
  const tabs = get(TabsState)
  const activeId = get(ActiveTabId_)
  const hasActive = tabs.some((x) => x.id === activeId)

  if (hasActive) return activeId
  if (tabs.length === 0) throw recreateStorage("No tabs in localStorage")
  return activeId === -1 ? tabs[0].id : tabs[tabs.length - 1].id
})

export const useGetTabsList = () => {
  const tabs = useAtomValue(TabsState)
  const activeId = useAtomValue(ActiveTabId)
  return tabs.map((tab) => ({ id: tab.id, name: tab.name, isActive: tab.id === activeId }))
}

export const useMutateTabs = () => {
  const set = useSetAtom(TabsStore)
  const setActive = useSetAtom(ActiveTabId_)
  const activeId = useAtomValue(ActiveTabId)

  const addTab = () => {
    const newId = Date.now()

    set((tabs) => {
      const active = tabs.find((x) => x.id === activeId)!
      const newTab: TabDto = {
        id: newId,
        places: [{ id: active.home }],
        home: active.home,
        name: `Tab ${tabs.length + 1}`,
      }
      return [...tabs, newTab]
    })

    setActive(newId)
  }

  const delTab = (id: number) => {
    set((tabs) => {
      if (tabs.length === 1) return tabs // don't delete last tab
      return tabs.filter((x) => x.id !== id)
    })
  }

  const setName = (id: number, name: string) => {
    set((tabs) => tabs.map((tab) => (tab.id === id ? { ...tab, name } : tab)))
  }

  const importTab = (tab: TabDto) => {
    set((tabs) => {
      const ids = tabs.map((x) => x.id)
      if (ids.includes(tab.id)) return tabs

      setTimeout(() => setActive(tab.id), 1)
      return [...tabs, tab]
    })
  }

  return { addTab, delTab, setActive, setName, importTab }
}

// Active Tab

export const ActiveTab = atom((get) => {
  const tabs = get(TabsState)
  const activeId = get(ActiveTabId)
  return tabs.find((x) => x.id === activeId)!
})

const useSetTabProp = <K extends keyof TabDto>(key: K) => {
  const set = useSetAtom(TabsStore)
  const activeId = useAtomValue(ActiveTabId)

  return (fn: (old: TabDto[K]) => TabDto[K]) => {
    set((tabs) =>
      tabs.map((tab) => {
        if (tab.id !== activeId) return tab
        return { ...tab, [key]: fn(tab[key]) }
      }),
    )
  }
}

export const useMutateTab = () => {
  const setPlaces = useSetTabProp("places")
  const _setHome = useSetTabProp("home")
  const setName = useSetTabProp("name")

  const addPlace = (placeId: PlaceId) => setPlaces((old) => uniqBy([...old, { id: placeId }], "id"))
  const delPlace = (placeId: PlaceId) => setPlaces((old) => old.filter((x) => x.id !== placeId))
  const reorderPlaces = (ordered: PlaceId[]) => {
    setPlaces((old) => orderBy(old, (x) => ordered.indexOf(x.id)))
  }

  const setHome = (placeId: PlaceId) => {
    _setHome((_) => placeId)
  }

  return { addPlace, delPlace, reorderPlaces, setHome, setName }
}

export const useIsHome = (left: Place) => {
  const { home } = useAtomValue(ActiveTab)
  return home.id === left.id
}

// General: Current Tab Date

const RecalcSystemDate = atom(0)

export const SystemDate = atom((get) => {
  get(RecalcSystemDate) // trigger recompute on change
  const { home } = get(ActiveTab)
  return DateTime.now().setZone(home.zone).set({ hour: 0 }).toISODate()!
})

export const PickedDate = atom<string | null>(null)

export const ActualDate = atom((get) => {
  const pickedDate = get(PickedDate)
  const systemDate = get(SystemDate)
  return pickedDate ?? systemDate
})

export const useFollowDateChange = () => {
  const set = useSetAtom(RecalcSystemDate)

  useEffect(() => {
    let lt: string = ""

    const intervalId = setInterval(() => {
      const dt = new Date()
      if (dt.getMinutes() % 15 !== 0) return // minimal zone offset

      const st = dt.toISOString().substring(0, 16)
      if (lt === st) return // already set

      lt = st
      set((x) => x + 1)
    }, 2500)

    return () => clearInterval(intervalId)
  }, [])
}

// General: Clock Mode

export const ClockMode = atomWithStorage<"12" | "24" | "MX">("tzMode", "MX")

export const useGetHourCycle = (place: Place): "h12" | "h24" => {
  const mode = useAtomValue(ClockMode)
  if (mode === "12") return "h12"
  if (mode === "24") return "h24"
  return place.hourCycle // default for given place (mode=MX)
}

// General: Theme

type Theme = "light" | "dark"
export const ThemeStore = atomWithStorage<Theme>("theme", "light", undefined, { getOnInit: true })

// UI

export const TlSelected = atom<[string, string] | null>(null)
