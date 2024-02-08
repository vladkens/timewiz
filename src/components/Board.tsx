import clsx from "clsx"
import { useAtomValue } from "jotai"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { ActiveTab, ActualDate, useMutateTab } from "../store"
import { Place } from "../utils/geonames"
import { useInteraction } from "../utils/useInteraction"
import { useOnClickOutside } from "../utils/useOnClickOutside"
import { BoardDefaultHead, BoardSelectHead, DateRangeISO } from "./BoardHead"
import { Timeline } from "./Timeline"

export const Board: FC = () => {
  const { reorderPlaces } = useMutateTab()
  const { places: rawPlaces } = useAtomValue(ActiveTab)
  const [ordered, setOrdered] = useState<Place[]>([])

  const date = useAtomValue(ActualDate)

  const [range, setRange] = useState({ height: 0, top: 0, left: 0, opacity: 0 })
  const [holdOn, setHoldOn] = useState<string | null>(null)
  const [duration, setDuration] = useState<DateRangeISO | null>(null)
  const timelinesRef = useRef<HTMLDivElement>(null)

  const calcLine = useCallback(() => {
    const cc = document.querySelector("[data-home=true] [data-current=true]")
    if (!timelinesRef.current || !cc) {
      setRange((old) => ({ ...old, opacity: 0 }))
      return
    }

    const el = cc.getBoundingClientRect()
    setLineView(el.left, el.width)
  }, [])

  const setLineView = (x: number, width: number) => {
    if (!timelinesRef.current) return
    const rt = timelinesRef.current.getBoundingClientRect()

    setRange((old) => ({
      ...old,
      opacity: 1,
      top: rt.height / 2,
      height: rt.height - 16,
      left: x - rt.left,
      width: width,
      // background: "rgba(255, 255, 255, 0.05)",
    }))
  }

  useEffect(() => {
    setOrdered([...rawPlaces])

    Array.from(document.querySelectorAll(".animate-tick"))
      .flatMap((x) => x.getAnimations())
      .forEach((x) => {
        x.cancel()
        x.play()
      })
  }, [rawPlaces])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHoldOn(null)
      setDuration(null)
      calcLine()
    }, 1)
    return () => clearTimeout(timeoutId)
  }, [date, rawPlaces])

  useInteraction(timelinesRef, {
    start(e) {
      setHoldOn(null)

      const dn = (e.target as HTMLElement)?.closest("[data-drag-node]") as HTMLElement
      if (dn) {
        const dr = dn.closest("[data-drag-root]")! as HTMLElement
        dr.setAttribute("data-dragging", "true")
        dr.style.visibility = "hidden"

        const cp = dr!.cloneNode(true) as HTMLElement
        cp.setAttribute("data-dragging-clone", "true")
        cp.style.pointerEvents = "none"
        cp.style.visibility = "visible"
        cp.style.position = "fixed"

        const cr = dr.getBoundingClientRect()
        cp.style.top = `${cr.top}px`
        cp.style.left = `${cr.left}px`
        cp.style.width = `${cr.width}px`
        cp.style.height = `${cr.height}px`
        document.body.appendChild(cp)
        return
      }

      const ce = (e.target as HTMLElement)?.closest("[data-datetime]")
      if (!ce || !timelinesRef.current) return

      const el = ce.getBoundingClientRect()
      setLineView(el.left, el.width)
      setHoldOn(ce.getAttribute("data-datetime"))

      const dd = ce.getAttribute("data-datetime")!.split("~")[0]
      setDuration([dd, dd])
    },

    move(e) {
      // const ex = "clientX" in e ? e.clientX : e.touches[0].clientX
      const ey = "clientY" in e ? e.clientY : e.touches[0].clientY

      // update drag clone – NO RETURN
      const cp = document.querySelector("[data-dragging-clone]") as HTMLElement
      if (cp && timelinesRef.current) {
        const { top, bottom } = timelinesRef.current.getBoundingClientRect()
        const ny = Math.min(bottom - cp.getBoundingClientRect().height, Math.max(top, ey))
        cp.style.top = `${ny}px`
      }

      // reorder places on drag
      const cc = document.querySelector("[data-dragging]") as HTMLElement
      if (cc) {
        e.preventDefault()

        const x = "clientX" in e ? e.clientX : e.touches[0].clientX
        const y = "clientY" in e ? e.clientY : e.touches[0].clientY

        const all = Array.from(timelinesRef.current?.querySelectorAll("[data-drag-root]") ?? [])
        const els = document.elementsFromPoint(x, y).filter((x) => x.hasAttribute("data-drag-root"))
        const wasIdx = all.indexOf(cc)
        const nowIdx = all.indexOf(els[0])
        if (wasIdx === nowIdx || wasIdx === -1 || nowIdx === -1) return

        setOrdered((old) => {
          let now = [...old]
          now.splice(nowIdx, 0, now.splice(wasIdx, 1)[0])
          return now
        })
        return
      }

      // update selection
      if (holdOn) {
        const nowEl = (e.target as HTMLElement)?.closest("[data-datetime]")
        const wasEl = document.querySelector(`[data-datetime="${holdOn}"]`)
        if (!timelinesRef.current || !nowEl || !wasEl) return

        const dd = [nowEl, wasEl]
          .map((x) => x.getAttribute("data-datetime")!.split("~")[0])
          .sort() as DateRangeISO
        setDuration(dd)

        const a = nowEl.getBoundingClientRect()
        const b = wasEl.getBoundingClientRect()

        const l = Math.min(b.left, a.left)
        const w = b.left < a.left ? a.right - b.left : b.right - a.left
        setLineView(l, w)
      }
    },

    end(e) {
      const cc = document.querySelector("[data-dragging]") as HTMLElement
      if (cc) {
        e.preventDefault()
        document.querySelectorAll("[data-dragging-clone]").forEach((x) => x.remove())
        cc.removeAttribute("data-dragging")
        cc.style.visibility = "visible"

        reorderPlaces(ordered.map((x) => x.id))
        return
      }

      setHoldOn(null)
    },
  })

  const rootRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(rootRef, () => {
    setHoldOn(null)
    setDuration(null)
    calcLine()
  })

  return (
    <div className="flex flex-col" ref={rootRef}>
      <div className="h-[48px] w-full">
        {duration ? <BoardSelectHead duration={duration} /> : <BoardDefaultHead />}
      </div>

      <div
        ref={timelinesRef}
        onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY > 0 ? 75 : -75)}
        className={clsx(
          "relative box-border flex flex-col border-t py-2",
          "no-scrollbar overflow-x-scroll",
        )}
      >
        <div
          style={range}
          className={clsx(
            "pointer-events-none absolute z-[12] w-[32px] select-none rounded-md",
            "border-2 border-red-500/50 dark:border-red-500/80",
            "box-border -translate-y-1/2",
          )}
        ></div>

        <div key="timelines">
          {ordered.map((x) => (
            <Timeline key={x.id} place={x} />
          ))}
        </div>
      </div>
    </div>
  )
}
