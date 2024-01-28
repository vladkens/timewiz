import clsx from "clsx"
import { useAtomValue } from "jotai"
import { FC } from "react"
import { NextDays, useSetDate } from "../state"

export const ChangeBoardDate: FC = () => {
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
