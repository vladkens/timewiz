import { RefObject, useCallback, useEffect } from "react"

type Event = MouseEvent | TouchEvent

export const useOnClickOutside = (ref: RefObject<HTMLElement>, cb: (e: Event) => void) => {
  const handler = useCallback(
    (e: Event) => {
      if (ref.current?.contains(e.target as Node)) return
      cb(e)
    },
    [cb],
  )

  useEffect(() => {
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)

    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  })
}
