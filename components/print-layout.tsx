"use client"

import { forwardRef, useEffect, useState } from "react"

interface LabelData {
  partDescription: string
  partNo: string
  computerNo: string
  lotNo: string
  hardness: string
  color: string
  materialName: string
  date: string
  quantity: string
  quantityUnit: string
  netWeight: string
  netWeightUnit: string
  grossWeight: string
  grossWeightUnit: string
  inspector: string
  showVulcanization: boolean
}

interface PrintLayoutProps {
  labelList: LabelData[]
  orientation?: "portrait" | "landscape"
  isPreview?: boolean
}

// Function to format date to DD-MM-YYYY
const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  ({ labelList, orientation = "landscape", isPreview = false }, ref) => {
    const [imagesLoaded, setImagesLoaded] = useState(false)

    useEffect(() => {
      const imageUrls = ["/images/vulcanization.png", "/images/rohs-ok.png", "/images/oqc-passed.png"]

      let loadedCount = 0
      const totalImages = imageUrls.length

      const checkAllLoaded = () => {
        loadedCount++
        if (loadedCount === totalImages) {
          setImagesLoaded(true)
        }
      }

      if (totalImages === 0) {
        setImagesLoaded(true)
        return
      }

      imageUrls.forEach((url) => {
        const img = document.createElement("img")
        img.crossOrigin = "anonymous"
        img.onload = checkAllLoaded
        img.onerror = checkAllLoaded
        img.src = url
      })
    }, [])

    // Only use actual filled labels, no padding
    const filledLabels = [...labelList]
    const actualLabelCount = filledLabels.length

    const containerStyle = isPreview
      ? {
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px",
          boxSizing: "border-box" as const,
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "8px",
          transform: "scale(0.8)",
          transformOrigin: "top center",
        }
      : {
          width: "297mm",
          height: "210mm",
          padding: "8mm",
          pageBreakAfter: "always" as const,
          boxSizing: "border-box" as const,
        }

    // Create a 5x4 grid but only fill the positions we need
    const gridPositions = Array(20).fill(null)
    filledLabels.forEach((label, index) => {
      if (index < 20) {
        gridPositions[index] = label
      }
    })

    return (
      <div ref={ref} className={isPreview ? "bg-white" : "bg-white print:block hidden"} style={containerStyle}>
        {!isPreview && (
          <style jsx global>{`
            @media print {
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}</style>
        )}

        {isPreview && (
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Preview Labels ({actualLabelCount} labels)</h3>
            <p className="text-sm text-gray-600">
              {actualLabelCount > 0 ? "Labels yang akan dicetak:" : "Belum ada label yang ditambahkan"}
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            gap: isPreview ? "6px" : "1.2mm",
            width: "100%",
            height: isPreview ? "600px" : "194mm",
          }}
        >
          {gridPositions.map((label, index) => {
            if (!label) return null

            const isEmpty = !Object.values(label).some((value) => value !== "" && value !== false)

            return (
              <div
                key={index}
                style={{
                  border: "1px solid black",
                  background: "white",
                  padding: isPreview ? "6px" : "1.8mm",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  minHeight: "0",
                  opacity: isEmpty && isPreview ? 0.3 : 1,
                  backgroundColor: isEmpty && isPreview ? "#f9f9f9" : "white",
                }}
              >
                {isEmpty && isPreview && (
                  <div className="text-center text-gray-400 text-xs py-2">Label Kosong #{index + 1}</div>
                )}

                {/* Header */}
                <div
                  style={{
                    textAlign: "center",
                    paddingBottom: isPreview ? "3px" : "0",
                    marginBottom: isPreview ? "3px" : "0",
                  }}
                >
                  <div
                    style={{
                      fontSize: isPreview ? "10px" : "10px",
                      fontWeight: "bold",
                      lineHeight: "1.2",
                    }}
                  >
                    PT Hang Tong Manufactory
                  </div>
                  <div
                    style={{
                      fontSize: isPreview ? "8px" : "8px",
                      fontWeight: "bold",
                      lineHeight: "1.2",
                    }}
                  >
                    OQC Inspection Label
                  </div>
                </div>

                {/* Body */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: isPreview ? "3px" : "0.8mm",
                    minHeight: "0",
                  }}
                >
                  {/* Part Desc */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: isPreview ? "7px" : "6.5px",
                        fontWeight: "bold",
                        width: isPreview ? "40px" : "12mm",
                        flexShrink: 0,
                      }}
                    >
                      Part Desc.
                    </span>
                    <span
                      style={{
                        borderBottom: "1px solid black",
                        flex: 1,
                        height: isPreview ? "12px" : "11px",
                        fontSize: isPreview ? "6px" : "6.5px",
                        paddingLeft: "2px",
                        paddingTop: "2px",
                        display: "flex",
                        alignItems: "flex-start",
                        lineHeight: "1.2",
                      }}
                    >
                      {label.partDescription}
                    </span>
                  </div>

                  {/* Grid Fields: Left = Part/Color | Right = Date to Gross */}
                  <div style={{ display: "flex", gap: isPreview ? "3px" : "1mm" }}>
                    {/* Kiri panjang */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: isPreview ? "3px" : "0.8mm",
                      }}
                    >
                      {[
                        { label: "Part No", value: label.partNo },
                        { label: "Computer No", value: label.computerNo },
                        { label: "Lot No", value: label.lotNo },
                        { label: "Hardness", value: label.hardness },
                        { label: "Color", value: label.color },
                      ].map(({ label: fieldLabel, value }) => (
                        <div key={fieldLabel} style={{ display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: isPreview ? "7px" : "6.5px",
                              fontWeight: "bold",
                              width: isPreview ? "40px" : "12mm",
                              flexShrink: 0,
                            }}
                          >
                            {fieldLabel}
                          </span>
                          <span
                            style={{
                              borderBottom: "1px solid black",
                              flex: 1,
                              height: isPreview ? "12px" : "11px",
                              fontSize: isPreview ? "6px" : "6.5px",
                              paddingLeft: "2px",
                              paddingTop: "2px",
                              display: "flex",
                              alignItems: "flex-start",
                              lineHeight: "1.2",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Kanan vertikal */}
                    <div
                      style={{
                        width: "50%",
                        display: "flex",
                        flexDirection: "column",
                        gap: isPreview ? "3px" : "0.8mm",
                      }}
                    >
                      {[
                        {
                          label: "Date",
                          value: formatDate(label.date),
                        },
                        {
                          label: "Quantity",
                          value: label.quantity + (label.quantityUnit ? ` ${label.quantityUnit}` : ""),
                        },
                        {
                          label: "Net Weight",
                          value: label.netWeight + (label.netWeightUnit ? ` ${label.netWeightUnit}` : ""),
                        },
                        {
                          label: "Gross Weight",
                          value: label.grossWeight + (label.grossWeightUnit ? ` ${label.grossWeightUnit}` : ""),
                        },
                      ].map(({ label: fieldLabel, value }) => (
                        <div key={fieldLabel} style={{ display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: isPreview ? "7px" : "6.5px",
                              fontWeight: "bold",
                              width: isPreview ? "40px" : "12mm",
                              flexShrink: 0,
                            }}
                          >
                            {fieldLabel}
                          </span>
                          <span
                            style={{
                              borderBottom: "1px solid black",
                              flex: 1,
                              height: isPreview ? "12px" : "11px",
                              fontSize: isPreview ? "6px" : "6.5px",
                              paddingLeft: "2px",
                              paddingTop: "2px",
                              display: "flex",
                              alignItems: "flex-start",
                              lineHeight: "1.2",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Material Name + Inspector */}
                  <div style={{ display: "flex", gap: isPreview ? "3px" : "1mm" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: isPreview ? "7px" : "6.5px",
                          fontWeight: "bold",
                          width: isPreview ? "40px" : "12mm",
                          flexShrink: 0,
                        }}
                      >
                        Material Name
                      </span>
                      <span
                        style={{
                          borderBottom: "1px solid black",
                          flex: 1,
                          height: isPreview ? "12px" : "11px",
                          fontSize: isPreview ? "6px" : "6.5px",
                          paddingLeft: "2px",
                          paddingTop: "2px",
                          display: "flex",
                          alignItems: "flex-start",
                          lineHeight: "1.2",
                        }}
                      >
                        {label.materialName}
                      </span>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: isPreview ? "7px" : "6.5px",
                          fontWeight: "bold",
                          width: isPreview ? "40px" : "12mm",
                          flexShrink: 0,
                        }}
                      >
                        Inspector
                      </span>
                      <span
                        style={{
                          borderBottom: "1px solid black",
                          flex: 1,
                          height: isPreview ? "12px" : "11px",
                          fontSize: isPreview ? "6px" : "6.5px",
                          paddingLeft: "2px",
                          paddingTop: "2px",
                          display: "flex",
                          alignItems: "flex-start",
                          lineHeight: "1.2",
                        }}
                      >
                        {label.inspector}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logo bawah */}
                <div
                  style={{
                    borderTop: "1px solid black",
                    display: "flex",
                    height: isPreview ? "20px" : "9mm",
                    marginTop: isPreview ? "3px" : "0.8mm",
                    overflow: "visible",
                  }}
                >
                  {["vulcanization.png", "rohs-ok.png", "oqc-passed.png"].map((img, i) => (
                    <div
                      key={i}
                      style={{
                        borderRight: i < 2 ? "1px solid black" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1px",
                        overflow: "visible",
                        flex: "0 0 33.33%",
                        position: "relative",
                      }}
                    >
                      {(img === "vulcanization.png" && label.showVulcanization) || img !== "vulcanization.png" ? (
                        <img
                          src={`/images/${img}`}
                          alt={img}
                          style={{
                            maxWidth: img === "oqc-passed.png" ? "105%" : "98%",
                            maxHeight: img === "oqc-passed.png" ? "105%" : "98%",
                            objectFit: "contain",
                          }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

PrintLayout.displayName = "PrintLayout"
