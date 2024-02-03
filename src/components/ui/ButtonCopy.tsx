import { IconCheck, IconCopy } from "@tabler/icons-react"
import clsx from "clsx"
import { FC, useEffect, useState } from "react"
import { Button, ButtonProps } from "./Button"

export type ButtonCopyProps = Pick<ButtonProps, "className" | "children" | "disabled" | "size"> & {
  value: string | (() => string)
}

export const ButtonCopy: FC<ButtonCopyProps> = (props) => {
  const { value, children, className, ...rest } = props
  const [copied, setCopied] = useState(false)

  const click = () => {
    const text = typeof value === "function" ? value() : value
    window.navigator.clipboard.writeText(text)
    setCopied(true)
  }

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => {
      setCopied(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [copied])

  const Icon = copied ? IconCheck : IconCopy
  const text = copied ? "Copied" : children

  return (
    <Button
      onClick={click}
      className={clsx(copied && "text-green-600", className)}
      leftSection={<Icon className="h-4 w-4" />}
      {...rest}
    >
      {text}
    </Button>
  )
}
