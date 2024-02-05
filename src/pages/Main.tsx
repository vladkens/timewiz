import { FC, useEffect } from "react"
import { Board } from "../components/Board"
import { Tabs } from "../components/Tabs"
import { useFollowDateChange, useMutateTabs } from "../store"
import { decodeShareUrl } from "../utils/share"

export const MainPage: FC = () => {
  const { importTab } = useMutateTabs()

  useFollowDateChange()

  useEffect(() => {
    const tab = decodeShareUrl(window.location.search)
    if (tab) {
      importTab(tab)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  return (
    <main className="flex flex-col rounded-lg border bg-card text-card-content">
      <Tabs />
      <Board />
    </main>
  )
}
