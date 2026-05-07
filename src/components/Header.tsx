import clsx from "clsx"
import { useAtom } from "jotai"
import { FC } from "react"
import { ClockMode } from "../store"

const ChangeTimeView: FC = () => {
  const [value, setValue] = useAtom(ClockMode)

  const buttons: { value: typeof value; text: string; cls: string }[] = [
    { value: "12" as const, text: "am\npm", cls: "text-[10px]" },
    { value: "24" as const, text: "24", cls: "text-[13px]" },
    { value: "MX" as const, text: "MX", cls: "text-[12px]" },
  ]

  return (
    <div className="flex items-center rounded-sm border border-black leading-none dark:border-white">
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

export const Header: FC = () => {
  return (
    <header className="flex h-[64px] items-center justify-between">
      <div className="flex items-center gap-5 pl-1.5">
        <a href="/" className="text-primary flex items-center gap-2 text-xl font-bold">
          <img src="logo.svg" alt="logo" className="h-[24px] w-[24px] rounded-sm" />
          TimeWiz.cc
        </a>

        {/* <a href="/features">Features</a> */}
      </div>

      <div className="flex items-center gap-5">
        <a
          href="https://github.com/vladkens/timewiz/issues/new"
          target="_blank"
          className="text-sm hover:underline max-md:hidden"
        >
          Feedback
        </a>

        {/* <a
          href="https://www.buymeacoffee.com/vladkens"
          target="_blank"
          className={clsx(
            "-skew-x-[14deg] rounded-md px-1.5 py-1 text-black",
            "font-mono text-[13px] font-medium leading-none tracking-[-0.075em]",
            "border border-transparent bg-[#ffdd02]",
            "hover:border-white/50 hover:shadow-sm dark:shadow-yellow-400/50",
            // "uppercase",
          )}
        >
          <div className="flex skew-x-[14deg] items-center gap-1">
            <IconCoffee size={15} />
            <span className="max-md:hidden">Buy me a coffee</span>
            <span className="hidden max-md:block">Donate</span>
          </div>
        </a> */}

        <ChangeTimeView />
      </div>
    </header>
  )
}
