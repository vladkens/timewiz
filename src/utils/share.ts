import { Atom, useAtomValue } from "jotai"
import { DateTime } from "luxon"
import { ActiveTab, TabDto } from "../store"
import { PlaceId } from "./geonames"
import { makePlaceName } from "./misc"

type AtomValue<Type> = Type extends Atom<infer X> ? X : never

const Base = 32

export const encodeShareUrl = (tab: AtomValue<typeof ActiveTab>) => {
  const parts = [
    tab.places.map((x) => x.id.toString(Base)).join("-"),
    tab.home.id.toString(Base),
    tab.id.toString(Base),
    tab.name,
  ]

  const q = btoa(parts.map((x) => encodeURIComponent(x)).join("&"))
  return `${window.location.href}?t=${q}`
}

export const decodeShareUrl = (url: string): TabDto | null => {
  try {
    const q = atob(new URLSearchParams(url).get("t") ?? "")
    const [places, home, id, name] = q.split("&").map((x) => decodeURIComponent(x))
    const r: TabDto = {
      id: parseInt(id, Base),
      name,
      home: parseInt(home, Base) as PlaceId,
      places: places
        .split("-")
        .filter((x) => x.length > 0)
        .map((x) => ({ id: parseInt(x, Base) as PlaceId })),
    }

    if (r.places.length === 0) return null
    if (!r.places.map((x) => x.id).includes(r.home)) r.home = r.places[0].id

    return r
  } catch {
    return null
  }
}

export const toCalendarISO = (dt: DateTime) => {
  return dt.toISO()!.split(".")[0].replaceAll(":", "").replaceAll("-", "")
}

export const useExportEvent = (a: DateTime, b: DateTime) => {
  const { places, home } = useAtomValue(ActiveTab)
  const subject = "Let's meet!"

  const toText = () => {
    const lines = places.map((x) => {
      const st = a.setZone(x.zone)
      const et = b.setZone(x.zone)

      const pp = st
        .toLocaleParts({ timeZoneName: "shortOffset" })
        .find((x) => x.type === "timeZoneName")!

      const tl = `${makePlaceName(x)} (${pp.value})`
      const sl = `${st.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}`
      const el = `${et.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}`
      return [tl, sl, el].join("\n")
    })

    lines.push(`Scheduled with ${location.origin}`)
    return lines.join("\n\n")
  }

  const toClipboard = () => {
    const text = toText()
    navigator.clipboard.writeText(text)
  }

  const toEmail = () => {
    const body = toText()
    const mailto = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`
    window.open(mailto, "_blank")
  }

  const toGoogleCalendar = () => {
    // https://kloudless.com/blog/monday-mentorship-how-to-create-a-link-to-add-an-event-in-the-google-calendar-api/
    const url = new URL("https://calendar.google.com/calendar/r/eventedit")
    url.searchParams.append("text", subject)
    url.searchParams.append("dates", [a, b].map(toCalendarISO).join("/"))
    url.searchParams.append("ctz", home.zone)
    window.open(url.toString(), "_blank")
  }

  const toIcal = () => {
    const descr = `\n\n${toText()}`.replaceAll("\n", "\\n")

    const payload = [
      `BEGIN:VCALENDAR`,
      `VERSION:2.0`,
      `PRODID:-//timewiz.cc//TimeWiz.cc//EN`,
      `METHOD:REQUEST`,
      `BEGIN:VEVENT`,
      `UID:ical-${Date.now()}@timewiz.cc`,
      `DTSTAMP:${toCalendarISO(DateTime.now())}Z`,
      `DTSTART;TZID=${home.zone}:${toCalendarISO(a)}`,
      `DTEND;TZID=${home.zone}:${toCalendarISO(b)}`,
      `SUMMARY;LANGUAGE=en-us:${subject}`,
      `DESCRIPTION:${descr}`,
      `END:VEVENT`,
      `END:VCALENDAR`,
    ].join("\r\n")

    const filename = a
      .toLocaleString(DateTime.DATETIME_MED)
      .replaceAll(" ", "_")
      .replaceAll(":", "_")
      .replaceAll(",", "")

    const link = document.createElement("a")
    link.setAttribute("download", `timewiz.cc_${filename}.ics`)
    link.href = `data:text/calendar;charset=utf-8,${payload}`
    link.click()
  }

  return { toText, toClipboard, toGoogleCalendar, toEmail, toIcal }
}
