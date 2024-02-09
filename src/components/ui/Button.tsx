import clsx from "clsx"
import { FC } from "react"

export type ButtonProps = {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
}

export const Button: FC<ButtonProps> = (props) => {
  const { size = "md" } = props
  const { className, onClick, disabled = false } = props

  const sizes: Record<Exclude<ButtonProps["size"], undefined>, string> = {
    sm: "px-1.5 py-0.5 text-[13px]",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3.5 py-1.5 text-base",
  }

  return (
    <button
      aria-label="select date"
      className={clsx(
        "flex items-center gap-1 text-nowrap rounded border",
        sizes[size],
        disabled ? "border-card-content/30 bg-card" : "border-card-content",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {props.leftSection}
      {props.children}
      {props.rightSection}
    </button>
  )
}
