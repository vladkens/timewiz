import { useAtomValue } from "jotai"
import { FC, useEffect } from "react"
import { Board } from "../components/Board"
import { ChangeBoardDate } from "../components/ChangeBoardDate"
import { SelectPlace } from "../components/SelectPlace"
import { Tabs } from "../components/Tabs"
import { ActiveTab, useMutateTab, useMutateTabs } from "../store"
import { decodeShareUrl } from "../utils/share"

export const MainPage: FC = () => {
  const { exportTab } = useMutateTabs()
  const { addPlace } = useMutateTab()
  const { places } = useAtomValue(ActiveTab)

  useEffect(() => {
    const tab = decodeShareUrl(window.location.search)
    if (tab) {
      exportTab(tab)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  return (
    <main className="flex flex-col rounded-lg border bg-card text-card-content">
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
