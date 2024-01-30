import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { FC, useEffect, useState } from "react"
import { ActiveTab, ComputedDays, SelectedDate } from "../store"
import { encodeShareUrl } from "../utils/share"

const ShareButton: FC = () => {
  const activeTab = useAtomValue(ActiveTab)
  const [copied, setCopied] = useState(false)

  const click = () => {
    const url = encodeShareUrl(activeTab)
    navigator.clipboard.writeText(url)
    setCopied(true)
  }

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => {
      setCopied(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [copied])

  const Icon = copied ? CheckIcon : DocumentDuplicateIcon
  const text = copied ? "Copied" : "Share"

  return (
    <button
      onClick={() => click()}
      className={clsx(
        "flex items-center gap-0.5 rounded-md border border-card-content/30 bg-card px-1 py-0.5 text-[13px]",
        copied && "text-green-600",
      )}
    >
      <Icon className="h-4 w-4" />
      {text}
    </button>
  )
}

export const ChangeBoardDate: FC = () => {
  const setDate = useSetAtom(SelectedDate)
  const dates = useAtomValue(ComputedDays)

  return (
    <div className="flex grow justify-between gap-1">
      <div className="flex grow items-center gap-1">
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
      </div>

      <div className="flex items-center gap-2.5">
        <button onClick={() => setDate("2024-03-31")}>DST</button>
        <ShareButton />
      </div>
    </div>
  )
}
