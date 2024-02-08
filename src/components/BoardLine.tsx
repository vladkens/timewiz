import clsx from "clsx"
import { useAtom, useAtomValue } from "jotai"
import { FC, useCallback, useEffect, useRef } from "react"
import { ActiveTab, ActualDate, TlSelected } from "../store"
import { useOnClickOutside } from "../utils/useOnClickOutside"

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
  const cRef = useRef<HTMLDivElement>(null) // center line
  const lRef = useRef<HTMLDivElement>(null) // left glass
  const rRef = useRef<HTMLDivElement>(null) // right glass

  const selectedRef = useRef(selected)
  selectedRef.current = selected

  // root ref here to work click on event buttons
  useOnClickOutside(rtRef, () => setSelected(null))

  const resetLine = useCallback(() => {
    if (!cRef.current || !lRef.current || !rRef.current) return

    cRef.current.style.opacity = "0"
    lRef.current.style.opacity = "0"
    rRef.current.style.opacity = "0"
  }, [])

  const setLine = useCallback((x: number, width: number, glass = false) => {
    if (!tlRef.current || !cRef.current || !lRef.current || !rRef.current) return

    const hh = tlRef.current.getBoundingClientRect().height
    const pl = tlRef.current.getBoundingClientRect().left - tlRef.current.scrollLeft
    const cx = x - pl

    cRef.current.style.top = `${hh / 2}px`
    cRef.current.style.height = `${hh - 16}px`
    cRef.current.style.opacity = "1"
    cRef.current.style.left = `${cx}px`
    cRef.current.style.width = `${width}px`

    const [head, tail] = [getIdx("0"), getIdx("23")]
    if (!head || !tail) return

    const lx = head.getBoundingClientRect().left - pl
    const rx = tail.getBoundingClientRect().right - pl

    lRef.current.style.top = `${hh / 2}px`
    lRef.current.style.height = `${hh - 16}px`
    lRef.current.style.opacity = glass ? "1" : "0"
    lRef.current.style.left = `${lx}px`
    lRef.current.style.width = `${cx - lx}px`

    rRef.current.style.top = `${hh / 2}px`
    rRef.current.style.height = `${hh - 16}px`
    rRef.current.style.opacity = glass ? "1" : "0"
    rRef.current.style.left = `${cx + width}px`
    rRef.current.style.width = `${rx - cx - width}px`
  }, [])

  const calc = useCallback(() => {
    if (!tlRef.current) return

    const selected = selectedRef.current
    if (!selected) {
      const el = getNow()
      if (!el && cRef.current) resetLine()
      else {
        const rc = el.getBoundingClientRect()
        setLine(rc.left, rc.width)
      }
    } else {
      const ae = getIdx(selected[0])
      const be = getIdx(selected[1])

      const a = ae.getBoundingClientRect()
      const b = be.getBoundingClientRect()
      const l = Math.min(b.left, a.left)
      const w = b.left < a.left ? a.right - b.left : b.right - a.left
      setLine(l, w, true)
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

  const cls = "absolute z-[10] box-border -translate-y-1/2 pointer-events-none select-none"
  const sideCls = clsx(cls, "z-[14] bg-blue-100/50")

  return (
    <>
      <div ref={lRef} className={sideCls} />
      <div
        ref={cRef}
        className={clsx(
          cls,
          "z-[15] w-[32px] rounded-md border-2 border-red-500/50 dark:border-red-500/80",
        )}
      />
      <div ref={rRef} className={sideCls} />
    </>
  )
}
