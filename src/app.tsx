import { Provider, useAtom } from "jotai"
import { FC } from "react"
import { SelectPlace } from "./components/SelectPlace"
import { Timeline } from "./components/Timeline"
import { TzListState } from "./state"
import { getPlaceByTzName } from "./utils/places"

const Index: FC = () => {
  const [tzs, setTzs] = useAtom(TzListState)
  const places = tzs.map((tz) => getPlaceByTzName(tz))

  return (
    <div className="flex flex-col gap-2.5 py-2.5">
      <SelectPlace values={places} onChange={(place) => setTzs((old) => [...old, place.tzName])} />

      <div className="flex flex-col gap-2">
        {places.map((x, idx) => (
          <Timeline key={`${idx}-${x.tzAbbr}`} place={x} />
        ))}
      </div>
    </div>
  )
}

export const App: FC = () => {
  return (
    <Provider>
      <div className="mx-auto w-[1020px]">
        <Index />
      </div>
    </Provider>
  )
}
