import { IconCalendarMonth } from "@tabler/icons-react"
import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { range } from "lodash-es"
import { DateTime } from "luxon"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { ActiveTab, ActualDate, PickedDate, SystemDate } from "../store"
import { encodeShareUrl } from "../utils/share"
import { useOnClickOutside } from "../utils/useOnClickOutside"
import { Button } from "./ui/Button"
import { ButtonCopy } from "./ui/ButtonCopy"
import { ButtonIcon } from "./ui/ButtonIcon"
import { DatePicker } from "./ui/DatePicker"

export const ChangeBoardDate: FC = () => {
  const setPickedDate = useSetAtom(PickedDate)
  const systemDate = useAtomValue(SystemDate)
  const actualDate = useAtomValue(ActualDate)
  const activeTab = useAtomValue(ActiveTab)

  const [calActive, setCalActive] = useState(false)
  const [quickDate, setQuickDate] = useState(actualDate)

  const onDateChange = (value: string) => {
    setPickedDate(value)
    setQuickDate(value)
    setCalActive(false)
  }

  const resetToday = () => {
    setPickedDate(null)
    setQuickDate(systemDate)
  }

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setCalActive(false))

  const dates = useMemo(() => {
    const dd = DateTime.fromISO(quickDate).set({ hour: 0 })!
    const it = quickDate !== systemDate ? range(-3, 4) : range(-1, 6)
    return it.map((x) => {
      const dt = dd.plus({ days: x })
      return { date: dt.toISODate()!, isWeekend: dt.isWeekend }
    })
  }, [quickDate, systemDate])

  useEffect(() => {
    setQuickDate(actualDate)
  }, [systemDate])

  return (
    <div className="flex grow justify-between gap-1">
      <div className="relative" ref={ref}>
        <ButtonIcon
          onClick={() => setCalActive(!calActive)}
          icon={<IconCalendarMonth />}
          size="sm"
        />

        {calActive && (
          <div className="absolute z-[100] rounded border bg-card p-1">
            <DatePicker value={actualDate} onChange={onDateChange} />
          </div>
        )}
      </div>

      <div className="flex grow items-center gap-1">
        {dates.map((x) => (
          <Button
            key={x.date}
            onClick={() => setPickedDate(x.date)}
            size="sm"
            disabled={x.date === actualDate}
            className={clsx(x.isWeekend && "text-red-500")}
          >
            {new Date(x.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Button>
        ))}

        {quickDate !== systemDate && (
          <Button key="today" size="sm" onClick={resetToday}>
            Today
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <ButtonCopy value={() => encodeShareUrl(activeTab)} size="sm">
          Share
        </ButtonCopy>
      </div>
    </div>
  )
}
