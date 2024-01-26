import { MoonIcon, SunIcon } from "@heroicons/react/16/solid"
import { filterNullable } from "array-utils-ts"
import clsx from "clsx"
import { Provider, useAtom } from "jotai"
import { FC, useEffect, useState } from "react"
import { SelectPlace } from "./components/SelectPlace"
import { Timeline } from "./components/Timeline"
import { TzListState, TzModeState } from "./state"
import { getGeoNameById } from "./utils/geonames"

const ChangeTheme: FC = () => {
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

const ChangeTimeView: FC = () => {
  const [value, setValue] = useAtom(TzModeState)

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

const Head: FC = () => {
  return (
    <header className="flex h-[48px] items-center justify-between">
      <div>Time24</div>
      <div className="flex flex-row gap-5">
        <ChangeTimeView />
        <ChangeTheme />
      </div>
    </header>
  )
}

const Main: FC = () => {
  const [tzs, setTzs] = useAtom(TzListState)
  const places = filterNullable(
    tzs.map((tz) => {
      try {
        return getGeoNameById(tz)
      } catch (e) {
        return null
      }
    }),
  )

  useEffect(() => {
    Array.from(document.querySelectorAll(".animate-tick"))
      .flatMap((x) => x.getAnimations())
      .forEach((x) => {
        x.cancel()
        x.play()
      })
  }, [tzs])

  return (
    <main className="flex flex-col rounded-lg border bg-card text-card-content shadow">
      <div className="flex items-center gap-2.5 bg-body/30 px-4 py-2.5">
        <div className="w-full max-w-[228px]">
          <SelectPlace values={places} onChange={(place) => setTzs((old) => [...old, place.uid])} />
        </div>
      </div>

      <div className="flex flex-col py-2.5">
        {places.map((x) => (
          <Timeline key={x.uid} place={x} />
        ))}
      </div>
    </main>
  )
}

export const App: FC = () => {
  return (
    <Provider>
      <div className="mx-auto w-[1040px]">
        <Head />
        <Main />
      </div>
    </Provider>
  )
}
