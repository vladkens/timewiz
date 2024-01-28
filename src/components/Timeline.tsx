import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { DateTime } from "luxon"
import { FC, useEffect, useReducer } from "react"
import {
  SelectedDate,
  TzListState,
  useGetHomePlace,
  useGetHourCycle,
  useGetOffsetFromHome,
  useIsHomePlace,
  useSetHomePlace,
} from "../state"
import { Place } from "../utils/geonames"

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

const useGetTimeline = (place: Place) => {
  const home = useGetHomePlace()
  const mode = useGetHourCycle(place)
  const date = useAtomValue(SelectedDate)

  const ss = DateTime.fromISO(date, { zone: home.timeZone }).setZone(place.timeZone)
  const dd = DateTime.now().setZone(place.timeZone)

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
      isCurrent: hh === dd.hour && tt.day === dd.day,
      datetime: `${tt.toISO()}-${place.uid}`,
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

const PlaceOffset: FC<{ place: Place }> = ({ place }) => {
  const dt = useGetOffsetFromHome(place)
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

const Clock: FC<{ place: Place }> = ({ place }) => {
  const setHome = useSetHomePlace()
  const isHome = useIsHomePlace(place)
  const mode = useGetHourCycle(place)
  const [_, rerender] = useReducer((x) => x + 1, 0)

  const time = DateTime.now().setZone(place.timeZone)
  const pad = (x: number) => x.toString().padStart(2, "0")

  useEffect(() => {
    const interval = setInterval(() => rerender(), 1000)
    return () => clearInterval(interval)
  }, [mode])

  return (
    <button
      onClick={() => setHome(place.uid)}
      disabled={isHome}
      className={clsx(
        "grow rounded-md border border-transparent px-1.5 py-1 text-right font-mono",
        "whitespace-nowrap tracking-tighter",
        !isHome
          ? "text-black dark:text-white"
          : clsx(
              "border-yellow-400 bg-yellow-400/30 font-medium text-yellow-600",
              "dark:border-yellow-400/50 dark:bg-yellow-400/15 dark:text-yellow-400",
            ),
      )}
    >
      {mode === "h12" ? time.hour % 12 || 12 : pad(time.hour)}
      <span className="animate-tick">:</span>
      {pad(time.minute)}
      {mode === "h12" && <>&nbsp;{time.hour < 12 ? "AM" : "PM"}</>}
    </button>
  )
}

const PlaceInfo: FC<{ place: Place }> = ({ place }) => {
  return (
    <div className="flex max-w-[228px] grow flex-row items-center gap-2 text-sm leading-none">
      <div className="flex grow flex-col" data-drag-node>
        <div className="flex flex-row items-center gap-2">
          <div className="max-w-[160px] truncate text-ellipsis text-nowrap">{place.city}</div>
          <PlaceOffset place={place} />
        </div>
        <div className="text-xs">{place.country}</div>
      </div>

      <div className="flex shrink-0 flex-col items-end font-mono text-[15px]">
        <Clock place={place} />
        {/* <PlaceOffset place={place} /> */}
      </div>
    </div>
  )
}

export const Timeline: FC<{ place: Place }> = ({ place }) => {
  const setTzList = useSetAtom(TzListState)
  const isHome = useIsHomePlace(place)
  const hours = useGetTimeline(place)

  return (
    <div
      data-drag-root
      className="group relative flex grow items-center justify-between gap-2.5 px-4 even:bg-body/30"
    >
      <button
        onClick={() => setTzList((old) => old.filter((x) => x !== place.uid))}
        disabled={isHome}
        className={clsx(
          "absolute ml-[-56px] h-[32px] w-[32px]",
          "rounded-full font-mono leading-none",
          isHome ? "invisible text-[20px]" : "text-[22px] text-body-content/20 hover:text-red-500",
        )}
      >
        {isHome ? "🏠" : <>&times;</>}
      </button>

      <PlaceInfo place={place} />

      <div className="flex h-[44px] shrink-0 select-none flex-row items-center" data-home={isHome}>
        {hours.map((x, idx) => (
          <div
            key={idx}
            data-current={x.isCurrent}
            data-datetime={x.datetime}
            className="flex h-full items-center"
          >
            <div
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
          </div>
        ))}
      </div>
    </div>
  )
}
