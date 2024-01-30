import clsx from "clsx"
import { useAtomValue } from "jotai"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { useInteraction } from "../hooks/useInteraction"
import { useOnClickOutside } from "../hooks/useOnClickOutside"
import { ActiveTab, ComputedDate, useMutateTab } from "../store"
import { Place } from "../utils/geonames"
import { Timeline } from "./Timeline"

export const Board: FC = () => {
  const { reorderPlaces } = useMutateTab()
  const { places: rawPlaces } = useAtomValue(ActiveTab)
  const [ordered, setOrdered] = useState<Place[]>([])

  const date = useAtomValue(ComputedDate)

  const [line, setLine] = useState({ height: 0, top: 0, left: 0, opacity: 0 })
  const [holdOn, setHoldOn] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const getDragIndex = (e: MouseEvent | TouchEvent) => {
    const x = "clientX" in e ? e.clientX : e.touches[0].clientX
    const y = "clientY" in e ? e.clientY : e.touches[0].clientY

    const els = document.elementsFromPoint(x, y).filter((x) => x.hasAttribute("data-drag-root"))
    if (!els.length) return -1

    const all = Array.from(ref.current?.querySelectorAll("[data-drag-root]") ?? [])
    const idx = all.indexOf(els[0])
    return idx >= 0 ? idx : -1
  }

  const calcLine = useCallback(() => {
    const cc = document.querySelector("[data-home=true] [data-current=true]")
    if (!ref.current || !cc) {
      setLine((old) => ({ ...old, opacity: 0 }))
      return
    }

    const el = cc.getBoundingClientRect()
    setLineView(el.left, el.width)
  }, [])

  const setLineView = (x: number, width: number) => {
    if (!ref.current) return
    const rt = ref.current.getBoundingClientRect()

    setLine((old) => ({
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
    const timeoutId = setTimeout(() => calcLine(), 1)
    return () => clearTimeout(timeoutId)
  }, [date, rawPlaces])

  useInteraction(ref, {
    start(e) {
      const dn = (e.target as HTMLElement)?.closest("[data-drag-node]") as HTMLElement
      if (dn) {
        e.preventDefault()

        const dr = dn.closest("[data-drag-root]")! as HTMLElement
        setDragIdx(getDragIndex(e)) // should be before invisibility
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
      if (!ce || !ref.current) return

      const el = ce.getBoundingClientRect()
      setLineView(el.left, el.width)
      setHoldOn(ce.getAttribute("data-datetime"))
    },

    end(e) {
      const cc = document.querySelector("[data-dragging]") as HTMLElement
      if (cc) {
        e.preventDefault()
        document.querySelectorAll("[data-dragging-clone]").forEach((x) => x.remove())
        cc.removeAttribute("data-dragging")
        cc.style.visibility = "visible"

        reorderPlaces(ordered.map((x) => x.uid))
        return
      }

      setHoldOn(null)
    },

    move(e) {
      // const ex = "clientX" in e ? e.clientX : e.touches[0].clientX
      const ey = "clientY" in e ? e.clientY : e.touches[0].clientY

      // update drag clone – NO RETURN
      const cp = document.querySelector("[data-dragging-clone]") as HTMLElement
      if (cp && ref.current) {
        const { top, bottom } = ref.current.getBoundingClientRect()
        const ny = Math.min(bottom - cp.getBoundingClientRect().height, Math.max(top, ey))
        cp.style.top = `${ny}px`
      }

      // reorder places on drag
      const cc = document.querySelector("[data-dragging]") as HTMLElement
      if (cc) {
        e.preventDefault()

        const idx = getDragIndex(e)
        if (idx === -1) return

        setDragIdx(idx)
        setOrdered((old) => {
          let now = [...old]
          now.splice(idx, 0, now.splice(dragIdx, 1)[0])
          return now
        })
        return
      }

      // update selection
      if (holdOn) {
        const nowEl = (e.target as HTMLElement)?.closest("[data-datetime]")
        const wasEl = document.querySelector(`[data-datetime="${holdOn}"]`)
        if (!ref.current || !nowEl || !wasEl) return

        const a = nowEl.getBoundingClientRect()
        const b = wasEl.getBoundingClientRect()

        const l = Math.min(b.left, a.left)
        const w = b.left < a.left ? a.right - b.left : b.right - a.left
        setLineView(l, w)
      }
    },
  })

  useOnClickOutside(ref, () => {
    setHoldOn(null)
    calcLine()
  })

  return (
    <div ref={ref} className="relative box-border flex flex-col border-t py-2">
      <div
        style={line}
        className={clsx(
          "pointer-events-none absolute z-[10] w-[32px] select-none rounded-md",
          "border-2 border-red-500/50 dark:border-red-500/80",
          "box-border -translate-y-1/2",
        )}
      ></div>

      {ordered.map((x) => (
        <Timeline key={x.uid} place={x} />
      ))}
    </div>
  )
}
