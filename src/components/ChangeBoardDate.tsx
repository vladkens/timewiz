import { useAtomValue, useSetAtom } from "jotai"
import { FC } from "react"
import { ActiveTab, ComputedDays, SelectedDate } from "../store"
import { encodeShareUrl } from "../utils/share"
import { Button } from "./ui/Button"
import { ButtonCopy } from "./ui/ButtonCopy"

export const ChangeBoardDate: FC = () => {
  const setDate = useSetAtom(SelectedDate)
  const dates = useAtomValue(ComputedDays)
  const activeTab = useAtomValue(ActiveTab)

  return (
    <div className="flex grow justify-between gap-1">
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
