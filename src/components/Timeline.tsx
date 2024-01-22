import { useSetAtom } from "jotai"
import { FC, useEffect, useReducer } from "react"
import { twJoin } from "tailwind-merge"
import { TzHomeState, TzListState, useGetHomePlace } from "../state"
import { Place } from "../utils/places"

const withSign = (x: number) => {
  return x > 0 ? `+${x}` : `${x}`
}

const getTimeline = (refPlace: Place, place: Place) => {
  const dt = (new Date().getTimezoneOffset() - refPlace.tzOffset + place.tzOffset) * 60 * 1000
  const ts = new Date().setUTCHours(0, 0, 0, 0) + dt

  const items = []
  for (let i = 0; i < 24; ++i) {
    const ct = new Date(ts + i * 60 * 60 * 1000)
    const hh = ct.getHours()
    items.push({ hour: hh.toString(), isDayStart: hh === 0, isDayEnd: hh === 23 })
  }

  return items
}

const useGetTime = (tz: string) => {
  const [_, tick] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 500)

    return () => clearInterval(interval)
  }, [tz])

  const time = new Date()

  return { time: time.toISOString().split("T")[1].split(".")[0] }
}

const TzInfo: FC<{ place: Place }> = ({ place }) => {
  const obj = useGetTime(place.tzName)

  return (
    <div className="flex grow flex-col">
      <div className="flex items-center justify-between text-[15px] font-medium">
        <div>{place.city}</div>
        <div className="font-mono text-sm">{obj.time}</div>
      </div>
      <div className="flex items-center justify-between text-[12px] text-gray-600">
        <div>{place.country}</div>
        <div>{""}</div>
      </div>
    </div>
  )
}

export const Timeline: FC<{ place: Place }> = ({ place }) => {
  const setTzList = useSetAtom(TzListState)
  const setTzHome = useSetAtom(TzHomeState)
  const refPlace = useGetHomePlace()
  const hours = getTimeline(refPlace, place)

  const isHome = place.tzName === refPlace.tzName

  return (
    <div className="flex grow items-center justify-between leading-none">
      <div className="group flex grow flex-row items-center gap-1.5 px-1.5">
        <button
          onClick={() => setTzList((old) => old.filter((x) => x !== place.tzName))}
          className={twJoin(
            "h-[24px] w-[24px] font-mono text-lg leading-none text-gray-400 hover:text-red-500",
            "invisible group-hover:visible",
            isHome && "!invisible",
          )}
        >
          &times;
        </button>

        <button
          className={twJoin(
            "flex h-[32px] w-[32px] select-none items-center justify-center rounded-full border text-xs",
            isHome && "border-orange-500",
          )}
          onClick={() => setTzHome(place.tzName)}
        >
          {isHome ? "><" : withSign((place.tzOffset - refPlace.tzOffset) / 60)}
        </button>

        <TzInfo place={place} />
      </div>

      <div className="flex shrink-0 select-none flex-row">
        {hours.map((x, idx) => (
          <div
            key={idx}
            className={twJoin(
              "flex h-[32px] w-[32px] items-center justify-center",
              "border-b border-t border-gray-300 hover:bg-gray-200",
              x.isDayStart && "rounded-l border-l",
              x.isDayEnd && "rounded-r border-r",
            )}
          >
            {x.hour}
          </div>
        ))}
      </div>
    </div>
  )
}
