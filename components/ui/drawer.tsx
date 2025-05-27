"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const drawerVariants = cva(
  "fixed z-50 flex flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
)

const overlayVariants = cva("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300", {
  variants: {
    open: {
      true: "opacity-100",
      false: "opacity-0 pointer-events-none",
    },
  },
  defaultVariants: {
    open: false,
  },
})

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof drawerVariants> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  shouldScaleBackground?: boolean
  showCloseButton?: boolean
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      className,
      children,
      side = "right",
      open,
      onOpenChange,
      onClose,
      shouldScaleBackground = false,
      showCloseButton = true,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open)
      }
    }, [open])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false)
          onOpenChange?.(false)
          onClose?.()
        }
      }

      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }, [isOpen, onOpenChange, onClose])

    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden"
        if (shouldScaleBackground) {
          document.body.style.transform = "scale(0.98)"
          document.body.style.transition = "transform 300ms ease"
        }
      } else {
        document.body.style.overflow = ""
        if (shouldScaleBackground) {
          document.body.style.transform = ""
        }
      }
      return () => {
        document.body.style.overflow = ""
        if (shouldScaleBackground) {
          document.body.style.transform = ""
        }
      }
    }, [isOpen, shouldScaleBackground])

    const handleOverlayClick = () => {
      setIsOpen(false)
      onOpenChange?.(false)
      onClose?.()
    }

    const drawerTransform = {
      top: isOpen ? "translate-y-0" : "-translate-y-full",
      bottom: isOpen ? "translate-y-0" : "translate-y-full",
      left: isOpen ? "translate-x-0" : "-translate-x-full",
      right: isOpen ? "translate-x-0" : "translate-x-full",
    }

    return (
      <>
        <div className={overlayVariants({ open: isOpen })} onClick={handleOverlayClick} aria-hidden="true" />
        <div ref={ref} className={cn(drawerVariants({ side }), drawerTransform[side], className)} {...props}>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={handleOverlayClick}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {children}
        </div>
      </>
    )
  },
)
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const Trigger = asChild ? (
    React.cloneElement(props.children as React.ReactElement, {
      ref,
      ...props,
    })
  ) : (
    <button ref={ref} {...props} />
  )

  return Trigger
})
DrawerTrigger.displayName = "DrawerTrigger"

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col overflow-auto p-6", className)} {...props}>
      {children}
    </div>
  ),
)
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
  ),
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  ),
)
DrawerFooter.displayName = "DrawerFooter"

export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter }
