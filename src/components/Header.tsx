import { FC } from "react"
import { ChangeTheme } from "./ChangeTheme"
import { ChangeTimeView } from "./ChangeTimeView"

export const Header: FC = () => {
  return (
    <header className="flex h-[64px] items-center justify-between">
      <div className="flex items-center gap-5 pl-1.5">
        <a href="/" className="text-primary flex items-center gap-2 text-xl font-bold">
          <img src="logo.svg" className="h-[24px] w-[24px] rounded" />
          TimeWiz.cc
        </a>

        {/* <a href="/features">Features</a> */}
      </div>

      <div className="flex items-center gap-5">
        {/* <a
          href="https://www.buymeacoffee.com/vladkens"
          target="_blank"
          className={clsx(
            "flex h-[28px] items-center gap-1 rounded-md px-2",
            "bg-[#FFDD02] text-sm text-black",
          )}
        >
          <span className="text-xl">☕</span>
          Buy me a coffee
        </a> */}

        <ChangeTimeView />
        <ChangeTheme />
      </div>
    </header>
  )
}
