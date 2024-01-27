import { MoonIcon, SunIcon } from "@heroicons/react/16/solid"
import { filterNullable } from "array-utils-ts"
import clsx from "clsx"
import { Provider, useAtom, useAtomValue } from "jotai"
import { uniq } from "lodash-es"
import { DragEvent, FC, useEffect, useRef, useState } from "react"
import { SelectPlace } from "./components/SelectPlace"
import { Timeline } from "./components/Timeline"
import {
  NextDays,
  SelectedDate,
  TzListState,
  TzModeState,
  useGetHomeGeo,
  useSetDate,
} from "./state"
import { GeoName, getGeoNameById } from "./utils/geonames"

const ChangeTheme: FC = () => {
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true")

  const change = () => {
    const isDark = !document.body.classList.contains("dark")
    document.body.classList.toggle("dark", isDark)
    localStorage.setItem("dark", isDark.toString())
    setDark(isDark)
  }

  const Icon = dark ? SunIcon : MoonIcon

  return (
    <button onClick={change}>
      <Icon className="h-5 w-5 hover:text-blue-500 dark:hover:text-yellow-500" />
    </button>
  )
}

const ChangeTimeView: FC = () => {
  const [value, setValue] = useAtom(TzModeState)

  const buttons: { value: typeof value; text: string; cls: string }[] = [
    { value: "12" as const, text: "am\npm", cls: "text-[10px]" },
    { value: "24" as const, text: "24", cls: "text-[13px]" },
    { value: "MX" as const, text: "MX", cls: "text-[12px]" },
  ]

  return (
    <div className="flex items-center rounded border border-black leading-none dark:border-white">
      {buttons.map((x) => (
        <button
          key={x.value}
          onClick={() => setValue(x.value)}
          disabled={x.value === value}
          className={clsx(
            "flex h-[24px] w-[26px] items-center justify-center font-medium",
            "border-r border-black last:border-r-0 dark:border-white",
            x.cls,
            x.value === value && "bg-black text-white dark:bg-white dark:text-black",
          )}
        >
          {x.text}
        </button>
      ))}
    </div>
  )
}

const Head: FC = () => {
  return (
    <header className="flex h-[48px] items-center justify-between">
      <div>Time24</div>
      <div className="flex flex-row gap-5">
        <ChangeTimeView />
        <ChangeTheme />
      </div>
    </header>
  )
}

const DateNavigation: FC = () => {
  const setDate = useSetDate()
  const dates = useAtomValue(NextDays)

  return (
    <div className="flex grow flex-row items-center gap-1">
      {dates.map((x) => (
        <button
          key={x.date}
          onClick={() => setDate(x.date)}
          disabled={x.isActive}
          className={clsx(
            "rounded-md border px-1 py-0.5 text-[13px]",
            !x.isActive ? "border-card-content/30 bg-card" : "border-card-content",
          )}
        >
          {new Date(x.date).toLocaleDateString("en-US", {
            // weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </button>
      ))}

      <div key="xx" className="flex grow justify-end">
        <button key="xx" onClick={() => setDate("2024-03-31")}>
          DST
        </button>
      </div>
    </div>
  )
}

const Main: FC = () => {
  const [tzs, setTzs] = useAtom(TzListState)
  const [places, setPlaces] = useState<GeoName[]>([])

  useEffect(() => {
    const places = tzs.map((x) => {
      try {
        return getGeoNameById(x)
      } catch (e) {
        return null
      }
    })

    setPlaces(filterNullable(places))

    Array.from(document.querySelectorAll(".animate-tick"))
      .flatMap((x) => x.getAnimations())
      .forEach((x) => {
        x.cancel()
        x.play()
      })
  }, [tzs])

  const [line, setLine] = useState({ height: 0, top: 0, left: 0, opacity: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const home = useGetHomeGeo()
  const date = useAtomValue(SelectedDate)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const cc = document.querySelector("[data-home=true] [data-current=true]")
      if (!ref.current || !cc) {
        setLine((old) => ({ ...old, opacity: 0 }))
        return
      }

      const rt = ref.current.getBoundingClientRect()
      const el = cc.getBoundingClientRect()

      setLine((old) => ({
        ...old,
        opacity: 1,
        height: rt.height - 10,
        left: el.left - rt.left + 16,
        top: rt.height / 2,
      }))
    }, 1)

    return () => clearTimeout(timeoutId)
  }, [home, date])

  const [draggingIdx, setDraggingIdx] = useState(-1)
  const dragNode = useRef<HTMLDivElement>()

  const handleDragStart = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (!e.target) return

    const d = document.createElement("div")
    d.classList.add("drag-fallback")
    d.style.width = `1px`
    d.style.height = `1px`
    d.style.position = "fixed"
    d.style.visibility = "hidden"
    d.style.pointerEvents = "none"
    document.body.appendChild(d)
    setTimeout(() => (document.body.style.cursor = "move"), 1)

    e.dataTransfer.dropEffect = "move"
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setDragImage(d, 0, 0)

    dragNode.current = e.target as HTMLDivElement
    setDraggingIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault()
    if (dragNode.current === e.target) return

    let newPlaces = [...places]
    newPlaces.splice(idx, 0, newPlaces.splice(draggingIdx, 1)[0])
    setDraggingIdx(idx)
    setPlaces(newPlaces)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>, _: number) => {
    e.preventDefault()
    document.body.style.cursor = "default"
    document.querySelectorAll(".drag-fallback").forEach((x) => x.remove())
    setTzs(places.map((x) => x.uid))
  }

  return (
    <main className="flex flex-col rounded-lg border bg-card text-card-content shadow">
      <div className="flex items-center gap-2.5 bg-body/30 px-4 py-2.5">
        <div className="w-full max-w-[228px]">
          <SelectPlace
            values={places}
            onChange={(place) => setTzs((old) => uniq([...old, place.uid]))}
          />
        </div>

        <DateNavigation />
      </div>

      <div ref={ref} className="relative flex flex-col py-2.5">
        <div
          className={clsx(
            "absolute z-[10] w-[32px] select-none rounded-md",
            "border-2 border-red-500/50 dark:border-red-500/80",
            "-translate-x-1/2 -translate-y-1/2",
          )}
          style={line}
        ></div>

        {places.map((x, idx) => (
          <div
            key={x.uid}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={(e) => handleDragEnd(e, idx)}
          >
            <Timeline place={x} />
          </div>
        ))}
      </div>
    </main>
  )
}

export const App: FC = () => {
  return (
    <Provider>
      <div className="mx-auto w-[1040px]">
        <Head />
        <Main />
      </div>
    </Provider>
  )
}
