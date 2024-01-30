import { Provider, useAtomValue } from "jotai"
import { FC, useEffect } from "react"
import { Board } from "./components/Board"
import { ChangeBoardDate } from "./components/ChangeBoardDate"
import { ChangeTheme } from "./components/ChangeTheme"
import { ChangeTimeView } from "./components/ChangeTimeView"
import { SelectPlace } from "./components/SelectPlace"
import { Tabs } from "./components/Tabs"
import { ActiveTab, useMutateTab, useMutateTabs } from "./store"
import { decodeShareUrl } from "./utils/share"

const Head: FC = () => {
  return (
    <header className="flex h-[48px] items-center justify-between">
      <div>Time24</div>
      <div className="flex gap-5">
        <ChangeTimeView />
        <ChangeTheme />
      </div>
    </header>
  )
}

const Main: FC = () => {
  const { exportTab } = useMutateTabs()
  const { addPlace } = useMutateTab()
  const { places } = useAtomValue(ActiveTab)

  useEffect(() => {
    const tab = decodeShareUrl(window.location.search)
    if (tab) {
      exportTab(tab)
      window.history.replaceState({}, "", "/")
    }
  }, [])

  return (
    <main className="flex flex-col rounded-lg bg-card text-card-content">
      <Tabs />

      <div className="flex items-center gap-2.5 bg-body/30 px-4 py-2.5">
        <div className="w-full max-w-[228px]">
          <SelectPlace values={places} onChange={(x) => addPlace(x.uid)} />
        </div>

        <ChangeBoardDate />
      </div>

      <Board />
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
