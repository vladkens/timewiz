import { IconCalendarMonth } from "@tabler/icons-react"
import { useAtom, useAtomValue } from "jotai"
import { FC, useRef, useState } from "react"
import { ActiveTab, ComputedDays, SelectedDate } from "../store"
import { encodeShareUrl } from "../utils/share"
import { useOnClickOutside } from "../utils/useOnClickOutside"
import { Button } from "./ui/Button"
import { ButtonCopy } from "./ui/ButtonCopy"
import { ButtonIcon } from "./ui/ButtonIcon"
import { DatePicker } from "./ui/DatePicker"

export const ChangeBoardDate: FC = () => {
  const [date, setDate] = useAtom(SelectedDate)
  const dates = useAtomValue(ComputedDays)
  const activeTab = useAtomValue(ActiveTab)

  const [dpActive, setDpActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const onDateChange = (value: string) => {
    setDate(value)
    setDpActive(false)
  }

  useOnClickOutside(ref, () => setDpActive(false))

  return (
    <div className="flex grow justify-between gap-1">
      <div className="relative" ref={ref}>
        <ButtonIcon
          onClick={() => setDpActive((old) => !old)}
          icon={<IconCalendarMonth />}
          size="sm"
        />

        {dpActive && (
          <div className="absolute z-[100] rounded border bg-card p-1">
            <DatePicker value={date} onChange={onDateChange} />
          </div>
        )}
      </div>

      <div className="flex grow items-center gap-1">
        {dates.map((x) => (
          <Button key={x.date} onClick={() => setDate(x.date)} size="sm" disabled={x.isActive}>
            {new Date(x.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <ButtonCopy value={() => encodeShareUrl(activeTab)} size="sm">
          Share
        </ButtonCopy>
      </div>
    </div>
  )
}
