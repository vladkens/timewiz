import { Provider } from "jotai"
import { FC, useEffect } from "react"
import { Board } from "./components/Board"
import { Header } from "./components/Header"
import { Tabs } from "./components/Tabs"
import { useFollowDateChange, useMutateTabs } from "./store"
import { decodeShareUrl } from "./utils/share"

const AppContent: FC = () => {
  const { importTab } = useMutateTabs()

  useFollowDateChange()

  useEffect(() => {
    const tab = decodeShareUrl(window.location.search)
    if (!tab) return

    importTab(tab)
    window.history.replaceState({}, "", window.location.pathname)
  }, [])

  return (
    <>
      <Header />
      <main className="bg-card text-card-content flex flex-col rounded-lg border">
        <Tabs />
        <Board />
      </main>
    </>
  )
}

export const App: FC = () => {
  return (
    <Provider>
      <AppContent />
    </Provider>
  )
}
