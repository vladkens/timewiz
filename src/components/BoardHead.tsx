import {
  IconCalendarEvent,
  IconCalendarMonth,
  IconClock,
  IconCloudDownload,
  IconMail,
} from "@tabler/icons-react"
import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { range } from "lodash-es"
import { DateTime } from "luxon"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { ActiveTab, ActualDate, PickedDate, SystemDate, TlSelected } from "../store"
import { encodeShareUrl, useExportEvent } from "../utils/share"
import { useOnClickOutside } from "../utils/useOnClickOutside"
import { SelectPlace } from "./SelectPlace"
import { Button } from "./ui/Button"
import { ButtonCopy } from "./ui/ButtonCopy"
import { ButtonIcon } from "./ui/ButtonIcon"
import { DatePicker } from "./ui/DatePicker"

const getISO = (idx: string) => {
  const el = document.querySelector(`[data-tl-home=true] [data-tl-idx="${idx}"]`) as HTMLElement
  return el.getAttribute("data-tl-iso")!
}

export const BoardHead: FC = () => {
  const tlSelected = useAtomValue(TlSelected)
  if (!tlSelected) return <DefaultHead />
  return <SelectionHead a={getISO(tlSelected[0])} b={getISO(tlSelected[1])} />
}

const DefaultHead: FC = () => {
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
      const date = dt.toISODate()!
      return { date, isWeekend: dt.isWeekend, isToday: date === systemDate }
    })
  }, [quickDate, systemDate])

  useEffect(() => {
    if (systemDate === actualDate) setPickedDate(null)
  }, [systemDate, actualDate])

  // actualDate is cached here to not update quick dates until today button clicked
  useEffect(() => setQuickDate(actualDate), [systemDate])

  return (
    <div className="flex w-full items-center gap-2.5 px-4 py-2">
      <div className="w-[220px] shrink-0">
        <SelectPlace />
      </div>

      <div className="relative" ref={ref}>
        <ButtonIcon
          onClick={() => setCalActive(!calActive)}
          icon={<IconCalendarMonth />}
          size="sm"
        />

        {calActive && (
          <div className="absolute z-[100] mt-1 -translate-x-1/2 rounded border bg-card p-1">
            <DatePicker value={actualDate} onChange={onDateChange} />
          </div>
        )}
      </div>

      <div className="flex grow items-center gap-1 md:hidden">
        {dates.map((x) => (
          <Button
            key={x.date}
            onClick={() => setPickedDate(x.date)}
            size="sm"
            disabled={x.date === actualDate}
            className={clsx(
              "mix-w-[56px]",
              x.isWeekend && "text-red-500",
              x.isToday && "border-yellow-400/40 bg-yellow-400/20",
            )}
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

      <ButtonCopy value={() => encodeShareUrl(activeTab)} size="sm">
        Share
      </ButtonCopy>
    </div>
  )
}

const SelectionHead: FC<{ a: string; b: string }> = ({ a, b }) => {
  const at = DateTime.fromISO(a)
  const bt = DateTime.fromISO(b)
  const dt = Math.abs(at.diff(bt, "minutes").minutes) + 60
  const actions = useExportEvent(at, bt)

  // prettier-ignore
  const ll = [{ label: "hr", value: Math.floor(dt / 60) }, { label: "min", value: dt % 60 }]
    .filter((x) => x.value > 0)
    .map((x) => `${x.value} ${x.label}`)
    .join(" ")

  return (
    <div className="flex h-full w-full items-center gap-2.5 px-4 py-2">
      <div className="flex w-[212px] items-center justify-end gap-1 text-nowrap">
        <IconClock className="h-5 w-5" />
        {ll}
      </div>

      <div className="flex flex-row gap-2">
        <Button
          onClick={actions.toGoogleCalendar}
          size="sm"
          leftSection={<IconCalendarEvent className="h-4 w-4" />}
        >
          Google
        </Button>

        <Button onClick={actions.toEmail} size="sm" leftSection={<IconMail className="h-4 w-4" />}>
          Email
        </Button>

        <ButtonCopy value={actions.toText} size="sm">
          Copy
        </ButtonCopy>

        <Button
          onClick={actions.toIcal}
          size="sm"
          leftSection={<IconCloudDownload className="h-4 w-4" />}
        >
          iCal
        </Button>
      </div>
    </div>
  )
}
