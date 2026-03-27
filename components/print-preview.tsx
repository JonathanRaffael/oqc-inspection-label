"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { PrintLayout } from "@/components/print-layout"
import { ArrowLeft } from 'lucide-react'

interface PrintPreviewProps {
  label: any
}

export function PrintPreview({ label }: PrintPreviewProps) {
  const router = useRouter()
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    documentTitle: "OQC Inspection Label",
    contentRef: componentRef,
  })

  // Auto-print when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (componentRef.current) {
        handlePrint()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [handlePrint])

  // Convert single label to labelList format for PrintLayout
  const labelData = {
  partDescription: label.partDescription,
  partNo: label.partNo,
  computerNo: label.computerNo,
  lotNo: label.lotNo,
  hardness: label.hardness,
  color: label.color,
  materialName: label.materialName,
  date: label.date,
  quantity: label.quantity,
  netWeight: label.netWeight,
  grossWeight: label.grossWeight,
  inspector: label.inspector,
  showVulcanization: label.showVulcanization,
  // Tambahan ini yang wajib biar sesuai tipe:
  quantityUnit: label.quantityUnit || "pcs",
  netWeightUnit: label.netWeightUnit || "kg",
  grossWeightUnit: label.grossWeightUnit || "kg",
  }

  const labelList = [labelData]

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handlePrint}>Print Label</Button>
      </div>

      <div className="border p-4 rounded-md bg-white">
        <h1 className="text-2xl font-bold mb-4">Print Preview</h1>
        <div className="border border-gray-300 p-4">
          <PrintLayout
            ref={componentRef}
            labelList={labelList}
            orientation="landscape"
          />
        </div>
      </div>
    </div>
  )
}
