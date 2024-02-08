import { IconCoffee } from "@tabler/icons-react"
import clsx from "clsx"
import { FC } from "react"
import { ChangeTheme } from "./ChangeTheme"
import { ChangeTimeView } from "./ChangeTimeView"

export const Header: FC = () => {
  return (
    <header className="flex h-[64px] items-center justify-between">
      <div className="flex items-center gap-5 pl-1.5">
        <a href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <img src="logo.svg" className="h-[24px] w-[24px] rounded" />
          TimeWiz.cc
        </a>

        {/* <a href="/features">Features</a> */}
      </div>

      <div className="flex items-center gap-5">
        <a
          href="https://www.buymeacoffee.com/vladkens"
          target="_blank"
          className={clsx(
            "-skew-x-[14deg] rounded-md px-1.5 py-1 text-black",
            "font-mono text-[13px] font-medium leading-none tracking-[-0.075em]",
            "border border-transparent bg-[#ffdd02]",
            "hover:border-white/50 hover:shadow dark:shadow-yellow-400/50",
            // "uppercase",
          )}
        >
          <div className="flex skew-x-[14deg] items-center gap-1">
            <IconCoffee size={15} />
            <span className="md:hidden">Buy me a coffee</span>
            <span className="hidden md:block">Donate</span>
          </div>
        </a>

        <ChangeTimeView />
        <ChangeTheme />
      </div>
    </header>
  )
}
