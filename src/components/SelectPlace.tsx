import { TimeZone, getTimeZones } from "@vvo/tzdb"
import clsx from "clsx"
import Fuse from "fuse.js"
import { FC, useEffect, useState } from "react"
import { Place, tzToPlace } from "../utils/places"

type SelectPlaceProps = {
  values: Place[]
  onChange: (place: Place) => void
}

export const SelectPlace: FC<SelectPlaceProps> = ({ values, onChange }) => {
  const [value, setValue] = useState("")

  const timezones = getTimeZones()
  const fuse = new Fuse(timezones, { threshold: 0.1, keys: ["name", "mainCities", "countryName"] })

  const options = (value.length > 0 ? fuse.search(value).map((x) => x.item) : [])
    .filter((x) => !values.find((y) => y.tzName === x.name))
    .slice(0, 5)

  const handleSelect = (tz: TimeZone) => {
    onChange(tzToPlace(tz))
    setValue("")
  }

  const [cursorIndex, setCursorIndex] = useState<number>(0)

  useEffect(() => {
    setCursorIndex(0)
  }, [value])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault()
        const item = options[cursorIndex]
        if (item) handleSelect(item)
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

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Enter place or timezone"
        value={value}
        onChange={(e) => setValue(e.target?.value ?? "")}
        className={clsx(
          "h-[32px] w-full rounded border bg-card px-1.5 text-card-content",
          "focus:border-blue-500 focus:outline-none focus:ring-1",
          "border-card-content/30 placeholder:text-sm",
        )}
      />
      {options.length > 0 && (
        <div className="absolute z-[100] mt-0.5 w-full rounded-md border bg-card">
          {options.map((x, idx) => (
            <button
              key={`${idx}-${x.abbreviation}`}
              onClick={() => handleSelect(x)}
              onMouseOver={() => setCursorIndex(idx)}
              className={clsx(
                "flex w-full items-center justify-between gap-2.5",
                "h-[32px] px-1.5 py-1",
                "text-sm leading-none",
                idx === cursorIndex && "bg-card-content/30",
              )}
            >
              <div className="line-clamp-1 grow text-left">
                {x.mainCities[0].trim()}, {x.countryName}
              </div>
              <div className="shrink-0">{x.abbreviation}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
