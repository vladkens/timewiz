import clsx from "clsx"
import { useAtom } from "jotai"
import { FC } from "react"
import { ClockMode } from "../store"

export const ChangeTimeView: FC = () => {
  const [value, setValue] = useAtom(ClockMode)

  const buttons: { value: typeof value; text: string; cls: string }[] = [
    { value: "12" as const, text: "am\npm", cls: "text-[10px]" },
    { value: "24" as const, text: "24", cls: "text-[13px]" },
    { value: "MX" as const, text: "MX", cls: "text-[12px]" },
  ]

  return (
    <div className="flex items-center rounded border border-black leading-none dark:border-white">
      {buttons.map((x) => (
        <button
          key={x.value}
          onClick={() => setValue(x.value)}
          disabled={x.value === value}
          className={clsx(
            "flex h-[24px] w-[26px] items-center justify-center font-medium",
            "border-r border-black last:border-r-0 dark:border-white",
            x.cls,
            x.value === value && "bg-black text-white dark:bg-white dark:text-black",
          )}
        >
          {x.text}
        </button>
      ))}
    </div>
  )
}
