"use client"

import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"

export const SelectField = forwardRef(function SelectField(props, ref) {
  const { id, name, label, error, required, helperText, options = [], placeholder, ...selectProps } = props

  const selectId = id || name

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          className="w-full h-9 rounded-md border border-input px-3 py-1 pr-8 text-sm appearance-none"
          aria-invalid={!!error}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      {error && (
        <p className="text-sm text-red-500" id={`${selectId}-error`}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500" id={`${selectId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  )
})

SelectField.displayName = "SelectField"
