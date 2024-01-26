import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { DateTime } from "luxon"
import { FC, useCallback, useEffect, useState } from "react"
import { DateState, TzHomeState, TzListState, useGetHomePlace, useTimeMode } from "../state"
import { GeoName } from "../utils/geonames"

const getDayLabel: FC<{ date: DateTime; mode: "h12" | "h24" }> = ({ date, mode }) => {
  const cls = "flex flex-col gap-0.5 uppercase leading-none"

  if (date.hour === 0) {
    return (
      <div className={cls}>
        <div className="text-[8px]">{date.monthShort}</div>
        <div className="text-[12px]">{date.day}</div>
      </div>
    )
  }

  const hh = date.hour.toString().padStart(2, "0")
  const mm = date.minute.toString().padStart(2, "0")

  if (mode === "h12") {
    return (
      <div className={cls}>
        <div className="text-[12px]">
          {date.minute === 0 ? (
            date.hour
          ) : (
            <div className="flex flex-row items-end">
              <div className="">{hh}</div>
              <div className="text-[8px]">{mm}</div>
            </div>
          )}
        </div>
        <div className="text-[8px] lowercase">{date.hour < 12 ? "am" : "pm"}</div>
      </div>
    )
  }

  if (mode === "h24") {
    if (date.minute !== 0) {
      return (
        <div className={cls}>
          <div className="text-[12px]">{hh}</div>
          <div className="text-[8px]">{mm}</div>
        </div>
      )
    }

    return date.hour.toString()
  }

  return null
}

const useGetTimeline = (place: GeoName) => {
  const home = useGetHomePlace(place).place
  const mode = useTimeMode(place)
  const date = useAtomValue(DateState)

  const ss = DateTime.fromISO(date, { zone: home.timeZone }).setZone(place.timeZone)

  const items = []
  for (let i = 0; i < 24; ++i) {
    const tt = ss.plus({ hours: i })
    const hh = tt.hour

    const isR = tt.isWeekend
    const isG = !isR && hh >= 9 && hh <= 18
    const isY = !isR && [7, 8, 19, 20, 21].includes(hh)
    const isV = !isR && !isG && !isY

    items.push({
      label: getDayLabel({ date: tt, mode }),
      isDayStart: hh === 0,
      isDayEnd: hh === 23,
      className: clsx(
        isR && "bg-red-50 border-red-500 dark:bg-red-600/40 dark:border-red-600",
        isG && "bg-green-100 border-green-500 dark:bg-green-600/40 dark:border-green-600",
        isY && "bg-yellow-50 border-yellow-500 dark:bg-yellow-600/40 dark:border-yellow-600",
        isV && "bg-violet-50 border-violet-500 dark:bg-violet-600/40 dark:border-violet-600",
      ),
    })
  }

  return items
}

const PlaceOffset: FC<{ place: GeoName }> = ({ place }) => {
  const home = useGetHomePlace(place)
  const dt = place.timeZoneOffset - home.place.timeZoneOffset
  const hh = Math.floor(dt / 60)
  const mm = Math.abs(dt % 60)
  if (hh === 0 && mm === 0) return <div className="invisible">12</div>

  // prettier-ignore
  const items = [{ v: Math.abs(hh), u: "h" },{ v: Math.abs(mm), u: "m" }]
  const label = `${dt < 0 ? "-" : "+"}${items
    .filter((x) => x.v !== 0)
    .map((x) => `${x.v}${x.u}`)
    .join(" ")}`

  return (
    <div
      className={clsx(
        "whitespace-nowrap text-xs tracking-tighter",
        dt < 0 ? "text-red-600" : "text-green-600",
      )}
    >
      {label}
    </div>
  )
}

const Time: FC<{ place: GeoName }> = ({ place }) => {
  const setTzHome = useSetAtom(TzHomeState)
  const home = useGetHomePlace(place)
  const mode = useTimeMode(place)

  const [obj, setObj] = useState<{ hh: string; mm: string }>()

  const fn = useCallback(() => {
    const dt = new Date().getTimezoneOffset() + place.timeZoneOffset
    const ts = new Date().getTime() + dt * 60 * 1000
    const ct = new Date(ts)

    if (mode === "h12") {
      const hh = ct.getHours() % 12 || 12
      const mm = ct.getMinutes().toString().padStart(2, "0")
      setObj({ hh: hh.toString(), mm: `${mm} ${ct.getHours() < 12 ? "AM" : "PM"}` })
    } else {
      const hh = ct.getHours().toString().padStart(2, "0")
      const mm = ct.getMinutes().toString().padStart(2, "0")
      setObj({ hh, mm })
    }
  }, [place, mode])

  useEffect(() => {
    fn()
    const interval = setInterval(() => fn, 1000)
    return () => clearInterval(interval)
  }, [mode])

  if (!obj) return null

  return (
    <button
      onClick={() => setTzHome(place.uid)}
      disabled={home.active}
      className={clsx(
        "grow rounded-md border border-transparent px-1.5 py-1 text-right font-mono",
        "whitespace-nowrap tracking-tighter",
        !home.active && "text-black dark:text-white",
        home.active && "border-yellow-400 bg-yellow-400/30 font-medium text-yellow-600",
        home.active && "dark:border-yellow-400/50 dark:bg-yellow-400/15 dark:text-yellow-400",
      )}
    >
      {obj.hh}
      <span className="animate-tick">:</span>
      {obj.mm}
    </button>
  )
}

const PlaceInfo: FC<{ place: GeoName }> = ({ place }) => {
  return (
    <div className="flex max-w-[228px] grow flex-row items-center gap-2 text-sm leading-none">
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <div className="max-w-[160px] truncate text-ellipsis text-nowrap">{place.city}</div>
          <PlaceOffset place={place} />
        </div>
        <div className="text-xs">{place.country}</div>
      </div>

      <div className="flex grow flex-col items-end font-mono text-[15px]">
        <Time place={place} />
        {/* <PlaceOffset place={place} /> */}
      </div>
    </div>
  )
}

export const Timeline: FC<{ place: GeoName }> = ({ place }) => {
  const setTzList = useSetAtom(TzListState)
  const hours = useGetTimeline(place)
  const home = useGetHomePlace(place)

  return (
    <div
      className={clsx(
        "flex grow items-center justify-between gap-2.5 px-4 py-1",
        "group relative even:bg-body/30",
        // isHome && "rounded-md outline outline-1 outline-offset-1 outline-yellow-400",
      )}
    >
      <button
        onClick={() => setTzList((old) => old.filter((x) => x !== place.uid))}
        disabled={home.active}
        className={clsx(
          "absolute ml-[-56px] h-[32px] w-[32px]",
          "rounded-full font-mono leading-none",
          home.active
            ? "invisible text-[20px]"
            : "text-[22px] text-body-content/20 hover:text-red-500",
        )}
      >
        {home.active ? "🏠" : <>&times;</>}
      </button>

      <PlaceInfo place={place} />

      <div className="flex shrink-0 select-none flex-row">
        {hours.map((x, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex h-[32px] w-[32px] items-center justify-center dark:text-white/85",
              "border-b border-t border-gray-300 hover:bg-gray-200",
              x.isDayStart && "w-[31px]! ml-[1px] rounded-l-md border-l",
              x.isDayEnd && "w-[30px]! mr-[2px] rounded-r-md border-r",
              "leadning-none text-center",
              x.className,
            )}
          >
            {x.label}
          </div>
        ))}
      </div>
    </div>
  )
}
