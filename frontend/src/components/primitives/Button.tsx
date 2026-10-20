import type { ComponentProps } from 'react'
import type { ButtonSize, ButtonVariant } from './classes'
import { buttonClasses } from './classes'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
}
