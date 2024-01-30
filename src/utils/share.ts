import { Atom } from "jotai"
import { ActiveTab, TabDto } from "../store"
import { PlaceId } from "./geonames"

type AtomValue<Type> = Type extends Atom<infer X> ? X : never

const Base = 32

export const encodeShareUrl = (tab: AtomValue<typeof ActiveTab>) => {
  const params = new URLSearchParams()
  params.set("n", tab.name)
  params.set("p", tab.places.map((x) => x.uid.toString(Base)).join("-"))
  params.set("h", tab.home.uid.toString(Base))
  params.set("i", tab.id.toString(Base))
  return `${window.location.href}?${params.toString()}`
}

export const decodeShareUrl = (url: string): TabDto | null => {
  const q = new URLSearchParams(url)
  const r: TabDto = {
    id: parseInt(q.get("i") ?? "0", Base),
    name: q.get("n") ?? "Home",
    home: parseInt(q.get("h") ?? "0", Base) as PlaceId,
    places: (q.get("p") ?? "")
      .split("-")
      .filter((x) => x.length > 0)
      .map((x) => ({ id: parseInt(x, Base) as PlaceId })),
  }

  if (r.places.length === 0) return null
  if (!r.places.map((x) => x.id).includes(r.home)) r.home = r.places[0].id

  return r
}
