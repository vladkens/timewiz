import clsx from "clsx"
import Fuse from "fuse.js"
import { useAtomValue } from "jotai"
import { DateTime } from "luxon"
import { FC, useEffect, useReducer, useRef, useState } from "react"
import { ActiveTab, useGetHourCycle, useMutateTab } from "../store"
import { Place, getPlaces } from "../utils/geonames"
import { makePlaceName } from "../utils/misc"
import { useOnClickOutside } from "../utils/useOnClickOutside"

const Clock: FC<{ place: Place }> = ({ place }) => {
  const mode = useGetHourCycle(place)

  const [_, rerender] = useReducer((x) => x + 1, 0)

  const time = DateTime.now().setZone(place.zone)
  const pad = (x: number) => x.toString().padStart(2, "0")

  useEffect(() => {
    const interval = setInterval(() => rerender(), 1000)
    return () => clearInterval(interval)
  }, [mode])

  return (
    <div className="rounded border bg-body/50 px-1 py-0.5 font-mono text-[11px]">
      {mode === "h12" ? time.hour % 12 || 12 : pad(time.hour)}:{pad(time.minute)}
      {mode === "h12" && (
        <span className="ml-1 text-[12px] tracking-normal">{time.hour < 12 ? "AM" : "PM"}</span>
      )}
    </div>
  )
}

export const SelectPlace: FC = () => {
  const { addPlace } = useMutateTab()
  const { places: values } = useAtomValue(ActiveTab)

  const [value, setValue] = useState("")
  const [options, setOptions] = useState<Place[]>([])
  const [cursorIndex, setCursorIndex] = useState<number>(0)

  const handleSelect = (place: Place) => {
    addPlace(place.id)
    setValue("")
  }

  useEffect(() => {
    setCursorIndex(0)

    const fuse = new Fuse(getPlaces(), { threshold: 0.2, keys: ["city", "country"] })
    const options = (value.length > 0 ? fuse.search(value).map((x) => x.item) : [])
      .filter((x) => !values.find((y) => y.id === x.id))
      .slice(0, 7)

    setOptions(options)
  }, [value])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        e.preventDefault()
        const item = options[cursorIndex]
        if (item) handleSelect(item)
        return
      }

      if (e.code === "Escape") {
        e.preventDefault()
        setValue("")
        return
      }

      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        e.preventDefault()
        const next = cursorIndex + (e.code === "ArrowDown" ? 1 : -1)
        setCursorIndex(next < 0 ? options.length - 1 : next % options.length)
        return
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [options, cursorIndex])

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setValue(""))

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        placeholder="Enter place or timezone"
        value={value}
        onChange={(e) => setValue(e.target?.value ?? "")}
        className={clsx(
          "h-[28px] w-full rounded border bg-card px-1.5 text-card-content",
          "focus:border-blue-500 focus:outline-none focus:ring-1",
          "border-card-content/30 placeholder:text-sm",
        )}
      />
      {options.length > 0 && (
        <div className="absolute z-[100] mt-0.5 w-[320px] rounded-md border bg-card">
          {options.map((x, idx) => (
            <button
              key={x.id}
              onClick={() => handleSelect(x)}
              onMouseOver={() => setCursorIndex(idx)}
              className={clsx(
                "flex w-full items-center justify-between gap-2.5",
                "h-[28px] px-1.5 py-1 text-sm leading-none",
                idx === cursorIndex && "bg-card-content/30",
              )}
            >
              <div className="line-clamp-1 grow text-left">{makePlaceName(x)}</div>
              <Clock place={x} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
