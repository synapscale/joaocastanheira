"use client"

import { forwardRef } from "react"
import { Input } from "../ui/input"

export const InputField = forwardRef(function InputField(props, ref) {
  const { id, name, label, error, required, helperText, ...inputProps } = props

  const inputId = id || name

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Input ref={ref} id={inputId} name={name} aria-invalid={!!error} {...inputProps} />

      {error && (
        <p className="text-sm text-red-500" id={`${inputId}-error`}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  )
})

InputField.displayName = "InputField"
