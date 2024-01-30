import { MoonIcon, SunIcon } from "@heroicons/react/16/solid"
import { useAtom } from "jotai"
import { FC, useEffect } from "react"
import { ThemeStore } from "../store"

export const ChangeTheme: FC = () => {
  const [theme, setTheme] = useAtom(ThemeStore)
  const isDark = theme === "dark"

  useEffect(() => {
    document.body.classList.toggle("dark", isDark)
  }, [theme])

  const Icon = isDark ? SunIcon : MoonIcon

  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")}>
      <Icon className="h-5 w-5 hover:text-blue-500 dark:hover:text-yellow-500" />
    </button>
  )
}
