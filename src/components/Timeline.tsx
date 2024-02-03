import clsx from "clsx"
import { useAtomValue } from "jotai"
import { DateTime } from "luxon"
import { FC, useEffect, useReducer } from "react"
import {
  ActiveTab,
  ComputedDate,
  useGetHourCycle,
  useIsHome,
  useMutateTab,
  useOffsetFromHome,
} from "../store"
import { Place } from "../utils/geonames"

const DayLabel: FC<{ date: DateTime; mode: "h12" | "h24" }> = ({ date, mode }) => {
  const cls = "flex flex-col gap-0.5 uppercase leading-none"

  if (date.hour === 0) {
    return (
      <div className={clsx(cls, "font-medium")}>
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
            <div className="flex items-end">
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
  const { home } = useAtomValue(ActiveTab)

  const mode = useGetHourCycle(place)
  const date = useAtomValue(ComputedDate)

  const ss = DateTime.fromISO(date, { zone: home.timeZone }).setZone(place.timeZone)
  const dd = DateTime.now().setZone(place.timeZone)

  const items = []
  for (let i = 0; i < 24; ++i) {
    const tt = ss.plus({ hours: i })
    const hh = tt.hour

    const isR = tt.setLocale(place.locale).isWeekend
    const isG = !isR && hh >= 9 && hh <= 18
    const isY = !isR && [7, 8, 19, 20, 21].includes(hh)
    const isV = !isR && !isG && !isY

    items.push({
      label: DayLabel({ date: tt, mode }),
      isDayStart: hh === 0,
      isDayEnd: hh === 23,
      isCurrent: hh === dd.hour && tt.day === dd.day,
      datetime: `${tt.toISO()}~${place.uid}`,
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
  const dt = useOffsetFromHome(place)
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
  const { setHome } = useMutateTab()
  const isHome = useIsHome(place)
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
      {mode === "h12" && (
        <span className="ml-1 text-[12px] tracking-normal">{time.hour < 12 ? "AM" : "PM"}</span>
      )}
    </button>
  )
}

export const Timeline: FC<{ place: Place }> = ({ place }) => {
  const { delPlace } = useMutateTab()
  const isHome = useIsHome(place)
  const hours = useGetTimeline(place)

  return (
    <div
      data-drag-root
      className="group relative flex grow items-center justify-between gap-2.5 px-4 even:bg-body/50"
    >
      <button
        onClick={() => delPlace(place.uid)}
        disabled={isHome}
        className={clsx(
          "absolute ml-[-56px] h-[32px] w-[32px]",
          "rounded-full font-mono leading-none",
          isHome ? "invisible text-[20px]" : "text-[22px] text-body-content/20 hover:text-red-500",
        )}
      >
        {isHome ? "🏠" : <>&times;</>}
      </button>

      <div className="flex w-[212px] shrink-0 items-center gap-2 text-sm leading-none">
        <div className="flex grow flex-col" data-drag-node>
          <div className="flex items-center gap-2">
            <div className="max-w-[160px] truncate text-ellipsis text-nowrap">{place.city}</div>
            <PlaceOffset place={place} />
          </div>
          <div className="text-xs">{place.country}</div>
        </div>

        <div className="flex shrink-0 flex-col items-end font-mono text-[15px]">
          <Clock place={place} />
        </div>
      </div>

      <div className="flex h-[44px] select-none items-center" data-home={isHome}>
        {hours.map((x, idx) => (
          <div
            key={idx}
            data-current={x.isCurrent}
            data-datetime={x.datetime}
            className="flex h-full w-[32px] items-center"
          >
            <div
              className={clsx(
                "flex h-[32px] w-full items-center justify-center dark:text-white/85",
                "border-b border-t border-gray-300 hover:bg-gray-200",
                "leadning-none text-center",
                x.isDayStart && "rounded-l-md border-l",
                x.isDayEnd && "rounded-r-md border-r",
                x.isDayStart && idx > 0 && "ml-[1px]",
                x.isDayEnd && idx < hours.length - 1 && "mr-[2px]",
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
