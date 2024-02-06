import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import clsx from "clsx"
import { range } from "lodash-es"
import { DateTime } from "luxon"
import { FC, useMemo, useState } from "react"

const currentMonth = () => DateTime.now().set({ day: 1, hour: 0, minute: 0, second: 0 })

type DatePickerProps = {
  value?: string | null
  onChange: (value: string) => void
}

export const DatePicker: FC<DatePickerProps> = ({ value, onChange }) => {
  const [ct, setCt] = useState(currentMonth())
  const [dd, weeks] = useMemo(() => {
    const dd = ct.minus({ days: ct.weekday - 1 })
    const weeks = Math.ceil((dd.daysInMonth + dd.weekday) / 7)
    return [dd, weeks]
  }, [ct])

  const baseCls = clsx(
    "flex h-[28px] w-[28px] items-center justify-center leading-none rounded text-xs",
    "border border-transparent",
  )

  const buttons = [
    { icon: IconChevronLeft, onClick: () => setCt(ct.minus({ month: 1 })) },
    { icon: IconChevronRight, onClick: () => setCt(ct.plus({ month: 1 })) },
  ]

  return (
    <div className="flex select-none flex-col">
      <div className="flex items-center text-sm text-card-content/80">
        <div className="flex grow items-center justify-center">
          <button onClick={() => setCt(currentMonth())}>
            {ct.monthLong} {ct.year}
          </button>
        </div>

        {buttons.map((x, i) => (
          <button
            key={i}
            className={clsx(baseCls, "cursor-pointer hover:bg-rest")}
            onClick={x.onClick}
          >
            <x.icon size={20} />
          </button>
        ))}
      </div>

      <div key="weekdays" className="flex">
        {range(7).map((day) => (
          <div key={day} className={clsx(baseCls, "text-card-content/80")}>
            {dd.plus({ day }).weekdayShort.substring(0, 2)}
          </div>
        ))}
      </div>

      {range(weeks).map((week) => (
        <div key={week} className="flex">
          {range(7).map((x) => {
            const ss = dd.plus({ week: week, day: x })

            const isActive = ss.toISODate() === value
            const isToday = !isActive && ss.toISODate() === DateTime.now().toISODate()
            const isOtherMonth = !isActive && ss.month !== ct.month
            const isWeekend = !isActive && !isOtherMonth && ss.isWeekend

            return (
              <div
                key={ss.toISO()}
                role="button"
                onClick={() => onChange(ss.toISODate())}
                className={clsx(
                  baseCls,
                  "cursor-pointer hover:bg-rest",
                  isActive && "bg-primary font-medium text-body-content hover:bg-primary",
                  isToday && "border-yellow-400/40 bg-yellow-400/20",
                  isOtherMonth && "text-rest-content",
                  isWeekend && "text-red-500",
                )}
              >
                {ss.day}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
