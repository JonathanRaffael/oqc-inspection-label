"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PrintLabelButtonProps {
  labelId: string
  labelCount?: number
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function PrintLabelButton({
  labelId,
  labelCount = 1,
  variant = "default",
  size = "default",
  className,
}: PrintLabelButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)

    try {
      const response = await fetch("/api/labels/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labelId,
          labelCount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to print label")
      }

      const result = await response.json()

      toast.success(`Label berhasil dicetak! (${result.printCount} label)`)

      // Trigger browser print dialog
      window.print()
    } catch (error) {
      console.error("Print error:", error)
      toast.error("Gagal mencetak label")
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Button onClick={handlePrint} disabled={isPrinting} variant={variant} size={size} className={className}>
      {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
      {isPrinting ? "Mencetak..." : "Print"}
      {labelCount > 1 && ` (${labelCount}x)`}
    </Button>
  )
}
