"use client"

import { useState, useCallback } from "react"

/**
 * Configuration options for the useDialog hook
 */
export interface UseDialogOptions {
  /** Initial state of the dialog (open or closed) */
  initialOpen?: boolean
  /** Callback fired when the dialog is opened */
  onOpen?: () => void
  /** Callback fired when the dialog is closed */
  onClose?: () => void
  /** Validation function called before opening - return false to prevent opening */
  beforeOpen?: () => boolean | Promise<boolean>
  /** Validation function called before closing - return false to prevent closing */
  beforeClose?: () => boolean | Promise<boolean>
}

/**
 * Return type for the useDialog hook
 */
export interface UseDialogReturn {
  /** Current state of the dialog */
  isOpen: boolean
  /** Function to open the dialog */
  open: () => Promise<boolean>
  /** Function to close the dialog */
  close: () => Promise<boolean>
  /** Function to toggle the dialog state */
  toggle: () => Promise<boolean>
}

/**
 * useDialog Hook
 *
 * Manages dialog/modal state with validation callbacks and async support.
 * Provides a clean API for controlling dialog visibility with optional
 * validation hooks for preventing unwanted state changes.
 *
 * @example
 * ```tsx
 * const dialog = useDialog({
 *   onOpen: () => console.log('Dialog opened'),
 *   beforeClose: () => window.confirm('Are you sure?')
 * });
 *
 * return (
 *   <Dialog open={dialog.isOpen} onOpenChange={dialog.toggle}>
 *     <DialogContent>...</DialogContent>
 *   </Dialog>
 * );
 * ```
 *
 * @param options - Configuration options for the dialog
 * @returns Object with state and control functions
 */
export function useDialog({
  initialOpen = false,
  onOpen,
  onClose,
  beforeOpen,
  beforeClose,
}: UseDialogOptions = {}): UseDialogReturn {
  // Dialog state
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen)

  /**
   * Opens the dialog with optional validation
   * @returns Promise resolving to true if opened, false if prevented
   */
  const open = useCallback(async (): Promise<boolean> => {
    // Prevent opening if already open
    if (isOpen) return false

    // Run validation if provided
    if (beforeOpen) {
      try {
        const canOpen = await beforeOpen()
        if (!canOpen) return false
      } catch (error) {
        console.error("Error in beforeOpen validation:", error)
        return false
      }
    }

    // Open dialog and trigger callback
    setIsOpen(true)
    onOpen?.()
    return true
  }, [isOpen, beforeOpen, onOpen])

  /**
   * Closes the dialog with optional validation
   * @returns Promise resolving to true if closed, false if prevented
   */
  const close = useCallback(async (): Promise<boolean> => {
    // Prevent closing if already closed
    if (!isOpen) return false

    // Run validation if provided
    if (beforeClose) {
      try {
        const canClose = await beforeClose()
        if (!canClose) return false
      } catch (error) {
        console.error("Error in beforeClose validation:", error)
        return false
      }
    }

    // Close dialog and trigger callback
    setIsOpen(false)
    onClose?.()
    return true
  }, [isOpen, beforeClose, onClose])

  /**
   * Toggles the dialog state
   * @returns Promise resolving to true if state changed, false if prevented
   */
  const toggle = useCallback(async (): Promise<boolean> => {
    return isOpen ? await close() : await open()
  }, [isOpen, open, close])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
