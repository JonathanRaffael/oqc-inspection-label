"use client"

import { useState } from "react"
import { LabelTypeSelector } from "@/components/label-type-selector"
import { LabelForm } from "@/components/label-form"
import { BinPaletForm } from "@/components/bin-palet-form"

interface NewLabelClientProps {
  templates: any[]
}

export function NewLabelClient({ templates }: NewLabelClientProps) {
  const [selectedType, setSelectedType] = useState<"oqc" | "bin" | "palet" | null>(null)

  const handleSelectType = (type: "oqc" | "bin" | "palet") => {
    setSelectedType(type)
  }

  const handleBack = () => {
    setSelectedType(null)
  }

  if (!selectedType) {
    return <LabelTypeSelector onSelectType={handleSelectType} />
  }

  return (
    <div>
      <button onClick={handleBack} className="mb-4 text-blue-600 hover:underline">
        ← Back to label types
      </button>
      {selectedType === "oqc" ? (
        <LabelForm templates={templates} />
      ) : (
        <BinPaletForm type={selectedType} />
      )}
    </div>
  )
}
