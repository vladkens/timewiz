import { MoonIcon, SunIcon } from "@heroicons/react/16/solid"
import { FC, useState } from "react"

export const ChangeTheme: FC = () => {
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true")

  const change = () => {
    const isDark = !document.body.classList.contains("dark")
    document.body.classList.toggle("dark", isDark)
    localStorage.setItem("dark", isDark.toString())
    setDark(isDark)
  }

  const Icon = dark ? SunIcon : MoonIcon

  return (
    <button onClick={change}>
      <Icon className="h-5 w-5 hover:text-blue-500 dark:hover:text-yellow-500" />
    </button>
  )
}
