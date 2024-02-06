import { Atom, useAtomValue } from "jotai"
import { DateTime } from "luxon"
import { ActiveTab, TabDto } from "../store"
import { PlaceId } from "./geonames"
import { makePlaceName } from "./misc"

type AtomValue<Type> = Type extends Atom<infer X> ? X : never

const Base = 32

export const encodeShareUrl = (tab: AtomValue<typeof ActiveTab>) => {
  const params = new URLSearchParams()
  params.set("n", tab.name)
  params.set("p", tab.places.map((x) => x.id.toString(Base)).join("-"))
  params.set("h", tab.home.id.toString(Base))
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

export const toCalendarISO = (dt: string) => {
  return dt.split(".")[0].replaceAll(":", "").replaceAll("-", "")
}

export const useExportEvent = (duration: [string, string]) => {
  const { places, home } = useAtomValue(ActiveTab)
  const subject = "Let's meet!"

  const toText = () => {
    const lines = places.map((x) => {
      const st = DateTime.fromISO(duration[0]).setZone(x.zone)
      const et = DateTime.fromISO(duration[1]).setZone(x.zone)

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
    url.searchParams.append("dates", duration.map(toCalendarISO).join("/"))
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
      `DTSTAMP:${toCalendarISO(DateTime.now().toISO())}Z`,
      `DTSTART;TZID=${home.zone}:${toCalendarISO(duration[0])}`,
      `DTEND;TZID=${home.zone}:${toCalendarISO(duration[1])}`,
      `SUMMARY;LANGUAGE=en-us:${subject}`,
      `DESCRIPTION:${descr}`,
      `END:VEVENT`,
      `END:VCALENDAR`,
    ].join("\r\n")

    const filename = DateTime.fromISO(duration[0])
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
