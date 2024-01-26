import clsx from "clsx"
import Fuse from "fuse.js"
import { FC, useEffect, useState } from "react"
import { GeoName, getGeoNames } from "../utils/geonames"

type SelectPlaceProps = {
  values: GeoName[]
  onChange: (place: GeoName) => void
}

export const SelectPlace: FC<SelectPlaceProps> = ({ values, onChange }) => {
  const [value, setValue] = useState("")
  const [options, setOptions] = useState<GeoName[]>([])
  const [cursorIndex, setCursorIndex] = useState<number>(0)

  const handleSelect = (tz: GeoName) => {
    onChange(tz)
    setValue("")
  }

  useEffect(() => {
    setCursorIndex(0)

    const fuse = new Fuse(getGeoNames(), { threshold: 0.2, keys: ["country", "city"] })
    const options = (value.length > 0 ? fuse.search(value).map((x) => x.item) : [])
      .filter((x) => !values.find((y) => y.uid === x.uid))
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
        <div className="absolute z-[100] mt-0.5 w-[320px] rounded-md border bg-card">
          {options.map((x, idx) => (
            <button
              key={x.uid}
              onClick={() => handleSelect(x)}
              onMouseOver={() => setCursorIndex(idx)}
              className={clsx(
                "flex w-full items-center justify-between gap-2.5",
                "h-[32px] px-1.5 py-1 text-sm leading-none",
                idx === cursorIndex && "bg-card-content/30",
              )}
            >
              <div className="line-clamp-1 grow text-left">
                {x.city}, {x.country}
              </div>
              {/* <div className="shrink-0">{x.abbreviation}</div> */}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
