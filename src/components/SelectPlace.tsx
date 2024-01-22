import { TimeZone, getTimeZones } from "@vvo/tzdb"
import Fuse from "fuse.js"
import { FC, useState } from "react"
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

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Place or timezone"
          value={value}
          onChange={(e) => setValue(e.target?.value ?? "")}
          className="h-[32px] rounded border px-1.5"
        />
        {/* <button className="absolute right-[20px] text-[20px] font-bold">&times;</button> */}
      </div>
      <div className="absolute mt-0.5 rounded-md border bg-white leading-none">
        {options.map((x, idx) => (
          <button
            key={`${idx}-${x.abbreviation}`}
            onClick={() => handleSelect(x)}
            className="flex h-[24px] w-full flex-row items-center justify-between gap-2.5 px-1.5 py-1 hover:bg-gray-100"
          >
            {x.countryName}, {x.mainCities[0]} <span className="text-xs">({x.abbreviation})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
