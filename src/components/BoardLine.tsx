import { filterNullable } from "array-utils-ts"
import clsx from "clsx"
import { useAtom, useAtomValue } from "jotai"
import { range } from "lodash-es"
import { FC, useCallback, useEffect, useRef } from "react"
import { ActiveTab, ActualDate, TlSelected } from "../store"
import { useOnClickOutside } from "../utils/useOnClickOutside"

const updateSelection = (els: [HTMLElement, HTMLElement] | null) => {
  document.querySelectorAll("[data-tl-idx]").forEach((x) => x.classList.remove("tl-active"))

  const abc = filterNullable(els?.map((x) => x.getAttribute("data-tl-idx")) ?? [])
    .map((x) => parseInt(x, 10))
    .filter((x) => !isNaN(x))
    .sort((a, b) => a - b)

  if (abc.length !== 2) return

  for (const x of range(24).filter((x) => x < abc[0] || abc[1] < x)) {
    document.querySelectorAll(`[data-tl-idx="${x}"]`).forEach((x) => x.classList.add("tl-active"))
  }
}

// prettier-ignore
const getIdx = (idx: string) => document.querySelector(`[data-tl-home=true] [data-tl-idx="${idx}"]`) as HTMLElement
const getNow = () => document.querySelector("[data-tl-home=true] [data-tl-now=true]") as HTMLElement

type BoardLineProps = {
  rtRef: React.RefObject<HTMLDivElement>
  tlRef: React.RefObject<HTMLDivElement>
}

export const BoardLine: FC<BoardLineProps> = ({ rtRef, tlRef }) => {
  const { places, home } = useAtomValue(ActiveTab)
  const date = useAtomValue(ActualDate)

  const [selected, setSelected] = useAtom(TlSelected)
  const cRef = useRef<HTMLDivElement>(null)
  // const lRef = useRef<HTMLDivElement>(null)
  // const rRef = useRef<HTMLDivElement>(null)

  const selectedRef = useRef(selected)
  selectedRef.current = selected

  // root ref here to work click on event buttons
  useOnClickOutside(rtRef, () => setSelected(null))

  const setLine = useCallback((x: number, width: number) => {
    if (!tlRef.current || !cRef.current) return

    const el = tlRef.current
    const rt = el.getBoundingClientRect()
    const xx = rt.left + el.scrollLeft

    cRef.current.style.opacity = "1"
    cRef.current.style.top = `${rt.height / 2}px`
    cRef.current.style.height = `${rt.height - 16}px`
    cRef.current.style.left = `${x - xx}px`
    cRef.current.style.width = `${width}px`

    // const [head, tail] = [getIdx("0"), getIdx("23")]
    // if (!lRef.current || !rRef.current || !head || !tail) return

    // const x1 = head.getBoundingClientRect().left - xx
    // lRef.current.style.top = `${rt.height / 2}px`
    // lRef.current.style.height = `${rt.height - 16}px`
    // lRef.current.style.opacity = glass ? "1" : "0"
    // lRef.current.style.left = `${x1}px`
    // lRef.current.style.width = `${x - xx - x1}px`

    // const x2 = x - xx + width
    // rRef.current.style.top = `${rt.height / 2}px`
    // rRef.current.style.height = `${rt.height - 16}px`
    // rRef.current.style.opacity = glass ? "1" : "0"
    // rRef.current.style.left = `${x2}px`
    // rRef.current.style.width = `${tail.getBoundingClientRect().right - x2 - 58.5}px`
  }, [])

  const calc = useCallback(() => {
    if (!tlRef.current) return

    const selected = selectedRef.current
    if (!selected) {
      updateSelection(null)

      const el = getNow()
      if (!el && cRef.current) cRef.current.style.opacity = "0"
      else {
        const rc = el.getBoundingClientRect()
        setLine(rc.left, rc.width)
      }
    } else {
      const ae = getIdx(selected[0])
      const be = getIdx(selected[1])
      updateSelection([ae, be])

      const a = ae.getBoundingClientRect()
      const b = be.getBoundingClientRect()
      const l = Math.min(b.left, a.left)
      const w = b.left < a.left ? a.right - b.left : b.right - a.left
      setLine(l, w)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(calc, 1)
    return () => clearTimeout(timeoutId)
    // selected - where selected area changed
    // date - where today date changed (from calendar or quick date pick)
    // places - on add / remove place
  }, [selected, date, places, calc])

  useEffect(() => {
    setSelected(null)
  }, [home])

  const cls = "absolute pointer-events-none select-none box-border -translate-y-1/2"

  return (
    <>
      {/* <div ref={lRef} className={clsx(cls, "z-[14] h-full w-full bg-red-100/50")} /> */}
      <div
        ref={cRef}
        className={clsx(
          cls,
          "z-[15] w-[32px] rounded-md border-2 border-red-500/50 dark:border-red-500/80",
        )}
      />
      {/* <div ref={rRef} className={clsx(cls, "z-[14] h-full w-full bg-green-100/50")} /> */}
    </>
  )
}
