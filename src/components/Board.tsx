import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { FC, useEffect, useRef, useState } from "react"
import { ActiveTab, TlSelected, useMutateTab } from "../store"
import { Place } from "../utils/geonames"
import { BoardHead } from "./BoardHead"
import { BoardLine } from "./BoardLine"
import { Timeline } from "./Timeline"

export const Board: FC = () => {
  const { places: rawPlaces } = useAtomValue(ActiveTab)
  const [ordered, setOrdered] = useState<Place[]>([])
  const { reorderPlaces } = useMutateTab()
  const setTlSelected = useSetAtom(TlSelected)

  const rtRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<HTMLDivElement>(null)
  const tlIdxRef = useRef<string | null>(null)
  const orderedRef = useRef<Place[]>(ordered)
  orderedRef.current = ordered

  useEffect(() => {
    type Event = MouseEvent | TouchEvent

    const onStart = (e: Event) => {
      if (!tlRef.current) return
      tlIdxRef.current = null

      const node = (e.target as HTMLElement)?.closest("[data-drag-node]") as HTMLElement
      if (node) {
        setTlSelected(null)

        const root = node.closest("[data-drag-root]")! as HTMLElement
        root.setAttribute("data-dragging", "true")
        root.style.visibility = "hidden"

        const fake = root!.cloneNode(true) as HTMLElement
        fake.setAttribute("data-dragging-clone", "true")
        fake.style.pointerEvents = "none"
        fake.style.visibility = "visible"
        fake.style.position = "fixed"

        const rect = root.getBoundingClientRect()
        fake.style.top = `${rect.top}px`
        fake.style.left = `${rect.left}px`
        fake.style.width = `${rect.width}px`
        fake.style.height = `${rect.height}px`
        document.body.appendChild(fake)
      } else {
        const node = (e.target as HTMLElement)?.closest("[data-tl-idx]")
        if (!node) return

        tlIdxRef.current = node.getAttribute("data-tl-idx")
        const idx = node.getAttribute("data-tl-idx")!
        setTlSelected([idx, idx])
      }
    }

    const onMove = (e: Event) => {
      if (!tlRef.current) return

      const ey = "clientY" in e ? e.clientY : e.touches[0].clientY

      // update drag clone
      const fake = document.querySelector("[data-dragging-clone]") as HTMLElement
      if (fake) {
        const { top, bottom } = tlRef.current.getBoundingClientRect()
        const yy = Math.min(bottom - fake.getBoundingClientRect().height, Math.max(top, ey))
        fake.style.top = `${yy}px`
        // NO RETURN HERE
      }

      // reorder places on drag
      const drag = document.querySelector("[data-dragging]") as HTMLElement
      if (drag) {
        e.preventDefault()

        const x = "clientX" in e ? e.clientX : e.touches[0].clientX
        const y = "clientY" in e ? e.clientY : e.touches[0].clientY

        const all = Array.from(tlRef.current?.querySelectorAll("[data-drag-root]") ?? [])
        const els = document.elementsFromPoint(x, y).filter((x) => x.hasAttribute("data-drag-root"))
        const wasIdx = all.indexOf(drag)
        const nowIdx = all.indexOf(els[0])
        if (wasIdx === nowIdx || wasIdx === -1 || nowIdx === -1) return

        setOrdered((old) => {
          let now = [...old]
          now.splice(nowIdx, 0, now.splice(wasIdx, 1)[0])
          return now
        })
        return
      }

      // update timeline selection
      if (tlIdxRef.current) {
        const nowEl = (e.target as HTMLElement)?.closest("[data-tl-idx]") as HTMLElement
        const wasEl = document.querySelector(`[data-tl-idx="${tlIdxRef.current}"]`) as HTMLElement
        if (!nowEl || !wasEl) return

        setTlSelected([wasEl.getAttribute("data-tl-idx")!, nowEl.getAttribute("data-tl-idx")!])
      }
    }

    const onEnd = (e: Event) => {
      tlIdxRef.current = null

      const drag = document.querySelector("[data-dragging]") as HTMLElement
      if (drag) {
        e.preventDefault()
        document.querySelectorAll("[data-dragging-clone]").forEach((x) => x.remove())
        drag.removeAttribute("data-dragging")
        drag.style.visibility = "visible"
        reorderPlaces(orderedRef.current.map((x) => x.id))
      }
    }

    tlRef.current?.addEventListener("mousedown", onStart)
    tlRef.current?.addEventListener("touchstart", onStart)
    document.addEventListener("mousemove", onMove)
    document.addEventListener("touchmove", onMove)
    document.addEventListener("mouseup", onEnd)
    document.addEventListener("touchend", onEnd)

    return () => {
      tlRef.current?.removeEventListener("mousedown", onStart)
      tlRef.current?.removeEventListener("touchstart", onStart)
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("touchmove", onMove)
      document.removeEventListener("mouseup", onEnd)
      document.removeEventListener("touchend", onEnd)
    }
  }, [])

  useEffect(() => {
    setOrdered([...rawPlaces])

    Array.from(document.querySelectorAll(".animate-tick"))
      .flatMap((x) => x.getAnimations())
      .forEach((x) => {
        x.cancel()
        x.play()
      })
  }, [rawPlaces])

  return (
    <div ref={rtRef} className="flex flex-col">
      <div className="h-[48px] w-full">
        <BoardHead />
      </div>

      <div
        ref={tlRef}
        onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY > 0 ? 75 : -75)}
        className={clsx(
          "relative box-border flex flex-col border-t py-2",
          "no-scrollbar overflow-x-scroll",
        )}
      >
        <BoardLine rtRef={rtRef} tlRef={tlRef} />

        <div key="timelines">
          {ordered.map((x) => (
            <Timeline key={x.id} place={x} />
          ))}
        </div>
      </div>
    </div>
  )
}
