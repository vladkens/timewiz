import { IconBrandGithub, IconCoffee } from "@tabler/icons-react"
import clsx from "clsx"
import { useAtom } from "jotai"
import { FC } from "react"
import { ClockMode } from "../store"

const headerIconButtonCls = clsx(
  "text-card-content/75 hover:text-card-content flex h-8 w-8 items-center justify-center rounded-md border",
  "border-border bg-card/80 hover:border-card-content/25 hover:bg-card transition-colors",
)

const ChangeTimeView: FC = () => {
  const [value, setValue] = useAtom(ClockMode)

  const buttons: { value: typeof value; text: string; cls: string; label: string }[] = [
    {
      value: "12" as const,
      text: "am\npm",
      cls: "text-[10px]",
      label: "Show time in 12-hour format with AM/PM",
    },
    { value: "24" as const, text: "24", cls: "text-[13px]", label: "Show time in 24-hour format" },
    {
      value: "MX" as const,
      text: "MX",
      cls: "text-[12px]",
      label: "Show both 12-hour and 24-hour time together",
    },
  ]

  return (
    <div
      className={clsx(
        "flex h-8 items-center overflow-hidden rounded-md border leading-none",
        "border-border bg-card/80",
      )}
    >
      {buttons.map((x) => (
        <button
          key={x.value}
          onClick={() => setValue(x.value)}
          disabled={x.value === value}
          title={x.label}
          aria-label={x.label}
          className={clsx(
            "text-card-content/75 flex h-full w-8 items-center justify-center font-medium",
            "border-border border-r transition-colors last:border-r-0",
            x.value !== value && "hover:bg-card hover:text-card-content",
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

export const Header: FC = () => {
  const coffeeLabel = "Support the project with a coffee"
  const githubLabel = "Open the TimeWiz GitHub repository"

  return (
    <header className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-5 pl-1.5">
        <a href="/" className="text-primary flex items-center gap-2 text-xl font-bold">
          <img src="logo.svg" alt="logo" className="h-6 w-6 rounded-sm" />
          TimeWiz.cc
        </a>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <a
            href="https://www.buymeacoffee.com/vladkens"
            target="_blank"
            aria-label={coffeeLabel}
            title={coffeeLabel}
            className={headerIconButtonCls}
          >
            <IconCoffee className="h-5 w-5" />
          </a>

          <a
            href="https://github.com/vladkens/timewiz"
            target="_blank"
            aria-label={githubLabel}
            title={githubLabel}
            className={headerIconButtonCls}
          >
            <IconBrandGithub className="h-5 w-5" />
          </a>
        </div>

        <ChangeTimeView />
      </div>
    </header>
  )
}
