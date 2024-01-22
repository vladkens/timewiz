import { atom } from "jotai"

type CallbackSet<T> = (oldValue: T) => T

const isCallback = <T>(value: T | CallbackSet<T>): value is CallbackSet<T> => {
  return typeof value === "function"
}

export const atomWithStorageSync = <T>(key: string, initialValue: T) => {
  const storedValue = localStorage.getItem(key)
  const parsedValue = storedValue ? (JSON.parse(storedValue) as T) : initialValue

  const anAtom = atom(parsedValue, (get, set, newValue: T | CallbackSet<T>) => {
    const nextValue = isCallback(newValue) ? newValue(get(anAtom)) : newValue
    set(anAtom, nextValue)
    localStorage.setItem(key, JSON.stringify(nextValue))
  })

  return anAtom
}
