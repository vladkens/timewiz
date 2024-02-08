import { RefObject, useEffect } from "react"

type Event = MouseEvent | TouchEvent

export const useOnClickOutside = (ref: RefObject<HTMLElement>, cb: (e: Event) => void) => {
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as Node
      if (!target || !target.isConnected) return
      if (ref.current?.contains(target)) return
      cb(e)
    }

    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)

    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [])
}
