import { PlusIcon, XMarkIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"
import { FC, useEffect, useRef, useState } from "react"
import { useOnClickOutside } from "../hooks/useOnClickOutside"
import { useGetTabsList, useMutateTabs } from "../store"

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
        "flex h-[32px] select-none items-center justify-between gap-1.5",
        canDelete ? "pl-2 pr-1" : "px-2",
        !tab.isActive && "cursor-pointer",
        tab.isActive && "bg-body/50",
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
          className={clsx("flex items-center rounded-full hover:text-red-500")}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export const Tabs: FC = () => {
  const tabs = useGetTabsList()
  const { addTab } = useMutateTabs()

  return (
    <div className="flex items-center text-sm leading-none">
      <div className="flex flex-wrap">
        {tabs.map((x) => (
          <Tab key={x.id} tab={x} canDelete={tabs.length > 0} />
        ))}
      </div>

      <button
        key="add"
        onClick={addTab}
        className="mx-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-200"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
