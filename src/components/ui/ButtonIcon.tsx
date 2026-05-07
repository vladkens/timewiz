import clsx from "clsx"
import { FC, ReactNode } from "react"
import { Button, ButtonProps } from "./Button"

export type ButtonIconProps = Pick<ButtonProps, "className" | "disabled" | "size" | "onClick"> & {
  icon: ReactNode
}

export const ButtonIcon: FC<ButtonIconProps> = ({ icon, className, ...props }) => {
  return (
    <Button
      className={clsx(className, "hover:border-primary hover:text-primary h-[25px] w-[25px]")}
      {...props}
    >
      {icon}
    </Button>
  )
}
