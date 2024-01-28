import { filterNullable } from "array-utils-ts"
import { Provider, useAtom } from "jotai"
import { uniq } from "lodash-es"
import { FC } from "react"
import { Board } from "./components/Board"
import { ChangeBoardDate } from "./components/ChangeBoardDate"
import { ChangeTheme } from "./components/ChangeTheme"
import { ChangeTimeView } from "./components/ChangeTimeView"
import { SelectPlace } from "./components/SelectPlace"
import { TzListState } from "./state"
import { getPlaceById } from "./utils/geonames"

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
  const [zones, setZones] = useAtom(TzListState)
  const places = filterNullable(zones.map((id) => getPlaceById(id)))

  return (
    <main className="flex flex-col rounded-lg border bg-card text-card-content shadow">
      <div className="flex items-center gap-2.5 bg-body/30 px-4 py-2.5">
        <div className="w-full max-w-[228px]">
          <SelectPlace values={places} onChange={(x) => setZones((old) => uniq([...old, x.uid]))} />
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
