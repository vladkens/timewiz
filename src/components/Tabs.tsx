import { PlusIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"
import { FC, useEffect, useRef, useState } from "react"
import { useGetTabsList, useMutateTabs } from "../store"
import { useOnClickOutside } from "../utils/useOnClickOutside"

type TabDto = ReturnType<typeof useGetTabsList>[0]

const Tab: FC<{ tab: TabDto; canDelete: boolean }> = ({ tab, canDelete }) => {
  const { delTab, setActive, setName } = useMutateTabs()

  const [edit, setEdit] = useState(false)
  const [input, setInput] = useState("")

  const click = () => {
    if (!tab.isActive) {
      setActive(tab.id)
    } else {
      setEdit(true)
      setInput("") // todo: select current text
    }
  }

  const apply = () => {
    if (!edit) return

    if (input.trim().length) setName(tab.id, input.trim())
    setEdit(false)
  }

  const ref = useRef<HTMLInputElement>(null)
  useOnClickOutside(ref, apply)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") apply()
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [input])

  return (
    <div
      ref={ref}
      onClick={() => click()}
      className={clsx(
        "flex h-[32px] select-none items-center justify-between gap-1.5 border-t-2 border-transparent",
        canDelete ? "pl-4 pr-1" : "px-4",
        !tab.isActive && "cursor-pointer",
        tab.isActive && "border-blue-500 bg-body/50",
      )}
    >
      <div className="min-w-[48px] grow">
        {edit ? (
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="max-w-[100px] bg-card text-body-content outline-none"
          />
        ) : (
          <div className={clsx(tab.isActive && "cursor-text")}>{tab.name}</div>
        )}
      </div>

      {canDelete && (
        <button
          onClick={() => delTab(tab.id)}
          disabled={!canDelete}
          className={clsx(
            "flex h-[17px] w-[17px] items-center justify-center rounded-full font-mono text-[15px]",
            "text-card-content/50 hover:bg-gray-500/30 hover:text-red-500",
            "transition-colors",
          )}
        >
          &times;
        </button>
      )}
    </div>
  )
}

export const Tabs: FC = () => {
  const tabs = useGetTabsList()
  const { addTab } = useMutateTabs()

  return (
    <div className="flex items-center rounded-lg text-sm leading-none">
      <div className="flex flex-wrap">
        {tabs.map((x) => (
          <Tab key={x.id} tab={x} canDelete={tabs.length > 1} />
        ))}
      </div>

      <button
        key="add"
        onClick={addTab}
        className={clsx(
          "mx-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-200",
          "transition-colors",
        )}
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
