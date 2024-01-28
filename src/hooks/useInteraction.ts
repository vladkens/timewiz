import { RefObject, useEffect } from "react"

type Event = MouseEvent | TouchEvent
type Cb = (e: Event) => void

export const useInteraction = (
  ref: RefObject<HTMLElement>,
  handlers: { start: Cb; end: Cb; move: Cb },
) => {
  useEffect(() => {
    const { start, end, move } = handlers

    ref.current?.addEventListener("mousedown", start)
    ref.current?.addEventListener("touchstart", start)

    document.addEventListener("mouseup", end)
    document.addEventListener("touchend", end)

    document.addEventListener("mousemove", move)
    document.addEventListener("touchmove", move)

    return () => {
      ref.current?.removeEventListener("mousedown", start)
      ref.current?.removeEventListener("touchstart", start)

      document.removeEventListener("mouseup", end)
      document.removeEventListener("touchend", end)

      document.removeEventListener("mousemove", move)
      document.removeEventListener("touchmove", move)
    }
  }, [handlers])
}
