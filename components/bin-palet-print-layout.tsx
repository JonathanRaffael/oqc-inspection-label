"use client"

import { forwardRef, useEffect, useState } from "react"

interface BinFormData {
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

interface PaletFormData {
  partNo: string
  productName: string
  doNo: string
  poNo: string
  qty: string
  qtyUnit: string
  package: string
  date: string
}

interface BinPaletPrintLayoutProps {
  labelList: (BinFormData | PaletFormData)[]
  type: "bin" | "palet"
  isPreview?: boolean
}

// Function to format date to DD-MM-YYYY
const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString // Return original if invalid date

  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export const BinPaletPrintLayout = forwardRef<HTMLDivElement, BinPaletPrintLayoutProps>(
  ({ labelList, type, isPreview = false }, ref) => {
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

    const maxLabels = type === "bin" ? 6 : 4
    const filledLabels = [...labelList]
    const actualLabelCount = filledLabels.length

    const containerStyle = isPreview
      ? {
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          boxSizing: "border-box" as const,
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "8px",
          transform: "scale(0.8)",
          transformOrigin: "top center",
        }
      : type === "palet"
        ? {
            width: "297mm",
            height: "210mm",
            padding: "6mm 5mm",
            boxSizing: "border-box" as const,
            pageBreakAfter: "always" as const,
          }
        : {
            width: "210mm",
            height: "297mm",
            padding: "5mm 6mm",
            boxSizing: "border-box" as const,
            pageBreakAfter: "always" as const,
          }

    const gridStyle = isPreview
      ? {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: `repeat(${Math.ceil(actualLabelCount / 2)}, ${type === "bin" ? "120px" : "100px"})`,
          gap: "10px",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
        }
      : type === "palet"
        ? {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: `repeat(${Math.ceil(actualLabelCount / 2)}, 92mm)`,
            gap: "3mm",
            width: "285mm",
            height: "auto",
          }
        : {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: `repeat(${Math.ceil(actualLabelCount / 2)}, 92mm)`,
            gap: "3mm",
            width: "198mm",
            height: "auto",
          }

    const labelStyle = isPreview
      ? {
          border: "1px solid black",
          background: "white",
          padding: "8px",
          display: "flex",
          flexDirection: "column" as const,
          fontSize: "10px",
          minHeight: type === "bin" ? "120px" : "100px",
        }
      : {
          border: "1px solid black",
          background: "white",
          padding: "3mm",
          display: "flex",
          flexDirection: "column" as const,
          height: "95mm",
        }

    return (
      <div ref={ref} className={isPreview ? "bg-white" : "bg-white print:block hidden"} style={containerStyle}>
        {!isPreview && (
          <style jsx global>{`
            @media print {
              @page {
                size: A4 ${type === "palet" ? "landscape" : "portrait"};
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
            <h3 className="text-lg font-semibold text-gray-800">
              Preview Label {type === "bin" ? "Bin" : "Palet"} ({actualLabelCount} labels)
            </h3>
            <p className="text-sm text-gray-600">
              {actualLabelCount > 0 ? "Labels yang akan dicetak:" : "Belum ada label yang ditambahkan"}
            </p>
          </div>
        )}

        <div style={gridStyle}>
          {filledLabels.slice(0, actualLabelCount).map((label, index) => {
            const isEmpty = !Object.values(label).some((value) => value !== "" && value !== false)

            return (
              <div
                key={index}
                style={{
                  ...labelStyle,
                  opacity: isEmpty && isPreview ? 0.3 : 1,
                  backgroundColor: isEmpty && isPreview ? "#f9f9f9" : "white",
                }}
              >
                {isEmpty && isPreview && (
                  <div className="text-center text-gray-400 text-xs py-2">Label Kosong #{index + 1}</div>
                )}

                {type === "bin" ? (
                  <>
                    {/* Header */}
                    <div
                      style={{
                        textAlign: "center",
                        paddingBottom: isPreview ? "6px" : "3mm",
                        marginBottom: isPreview ? "6px" : "3mm",
                      }}
                    >
                      <div
                        style={{
                          fontSize: isPreview ? "14px" : "25px",
                          fontWeight: "bold",
                          lineHeight: "1.2",
                        }}
                      >
                        PT Hang Tong Manufactory
                      </div>
                      <div
                        style={{
                          fontSize: isPreview ? "10px" : "13px",
                          fontWeight: "bold",
                          lineHeight: "1.2",
                        }}
                      >
                        OQC Inspection Label
                      </div>
                    </div>

                    {/* Content area */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: isPreview ? "4px" : "2mm",
                      }}
                    >
                      {/* Part Desc */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: isPreview ? "8px" : "8px",
                            fontWeight: "bold",
                            width: isPreview ? "60px" : "20mm",
                            flexShrink: 0,
                          }}
                        >
                          Part Desc.
                        </span>
                        <span
                          style={{
                            borderBottom: "1px solid black",
                            flex: 1,
                            height: isPreview ? "14px" : "18px",
                            fontSize: isPreview ? "7px" : "8px",
                            paddingLeft: "2px",
                            paddingTop: "2px",
                            display: "flex",
                            alignItems: "flex-start",
                            lineHeight: "1.2",
                          }}
                        >
                          {(label as BinFormData).partDescription}
                        </span>
                      </div>

                      <div style={{ paddingLeft: "0mm", paddingRight: "0mm" }}>
                        {/* Row 1: Part No | Date */}
                        <div
                          style={{
                            display: "flex",
                            gap: isPreview ? "6px" : "3mm",
                            marginBottom: isPreview ? "4px" : "2mm",
                          }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Part No
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).partNo}
                            </span>
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Date
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {formatDate((label as BinFormData).date)}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Computer No | Quantity */}
                        <div
                          style={{
                            display: "flex",
                            gap: isPreview ? "6px" : "3mm",
                            marginBottom: isPreview ? "4px" : "2mm",
                          }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Computer No
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).computerNo}
                            </span>
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Quantity (PCS/KG)
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).quantity}
                              {(label as BinFormData).quantityUnit ? ` ${(label as BinFormData).quantityUnit}` : ""}
                            </span>
                          </div>
                        </div>

                        {/* Row 3: Lot No | Net Weight */}
                        <div
                          style={{
                            display: "flex",
                            gap: isPreview ? "6px" : "3mm",
                            marginBottom: isPreview ? "4px" : "2mm",
                          }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Lot No
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).lotNo}
                            </span>
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Net Weight (KG)
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).netWeight}
                              {(label as BinFormData).netWeightUnit ? ` ${(label as BinFormData).netWeightUnit}` : ""}
                            </span>
                          </div>
                        </div>

                        {/* Row 4: Hardness | Gross Weight */}
                        <div
                          style={{
                            display: "flex",
                            gap: isPreview ? "6px" : "3mm",
                            marginBottom: isPreview ? "4px" : "2mm",
                          }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Hardness (A)
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).hardness}
                            </span>
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Gross Weight (KG)
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).grossWeight}
                              {(label as BinFormData).grossWeightUnit
                                ? ` ${(label as BinFormData).grossWeightUnit}`
                                : ""}
                            </span>
                          </div>
                        </div>

                        {/* Row 5: Color */}
                        <div
                          style={{
                            display: "flex",
                            gap: isPreview ? "6px" : "3mm",
                            marginBottom: isPreview ? "4px" : "2mm",
                          }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Color
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).color}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}></div>
                        </div>

                        {/* Row 6: Material Name | Inspector */}
                        <div style={{ display: "flex", gap: isPreview ? "6px" : "3mm" }}>
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Material Name
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                minHeight: isPreview ? "14px" : "18px",
                                display: "flex",
                                alignItems: "flex-start",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                lineHeight: "1.2",
                                overflow: "hidden",
                                fontSize: isPreview ? "7px" : "8px",
                              }}
                            >
                              {(label as BinFormData).materialName}
                            </span>
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: isPreview ? "8px" : "8px",
                                fontWeight: "bold",
                                width: isPreview ? "60px" : "20mm",
                                flexShrink: 0,
                              }}
                            >
                              Inspector
                            </span>
                            <span
                              style={{
                                borderBottom: "1px solid black",
                                flex: 1,
                                height: isPreview ? "14px" : "18px",
                                fontSize: isPreview ? "7px" : "8px",
                                paddingLeft: "2px",
                                paddingTop: "2px",
                                display: "flex",
                                alignItems: "flex-start",
                                lineHeight: "1.2",
                              }}
                            >
                              {(label as BinFormData).inspector}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logo section */}
                    <div
                      style={{
                        borderTop: "1px solid black",
                        display: "flex",
                        height: isPreview ? "20px" : "16mm",
                        marginTop: "0mm",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          borderRight: "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0px",
                          overflow: "hidden",
                          flex: "0 0 33.33%",
                        }}
                      >
                        {(label as BinFormData).showVulcanization && (
                          <img
                            src="/images/vulcanization.png"
                            alt="Vulcanization"
                            style={{
                              maxWidth: "98%",
                              maxHeight: "98%",
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          borderRight: "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0px",
                          overflow: "hidden",
                          flex: "0 0 33.33%",
                        }}
                      >
                        <img
                          src="/images/rohs-ok.png"
                          alt="RoHS OK"
                          style={{
                            maxWidth: "98%",
                            maxHeight: "98%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0px",
                          overflow: "hidden",
                          flex: "0 0 33.33%",
                        }}
                      >
                        <img
                          src="/images/oqc-passed.png"
                          alt="OQC Passed"
                          style={{
                            maxWidth: "98%",
                            maxHeight: "98%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Palet layout
                  <>
                    <div
                      style={{
                        textAlign: "center",
                        borderBottom: "1px solid black",
                        paddingBottom: isPreview ? "6px" : "3mm",
                        marginBottom: isPreview ? "10px" : "4mm",
                      }}
                    >
                      <div
                        style={{
                          fontSize: isPreview ? "14px" : "18px",
                          fontWeight: "bold",
                        }}
                      >
                        PT Hang Tong Manufactory
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: isPreview ? "8px" : "4mm",
                      }}
                    >
                      {Object.entries({
                        "Part No": (label as PaletFormData).partNo,
                        "Product Name": (label as PaletFormData).productName,
                        "DO No": (label as PaletFormData).doNo,
                        "PO No": (label as PaletFormData).poNo,
                        QTY:
                          (label as PaletFormData).qty +
                          ((label as PaletFormData).qtyUnit ? ` ${(label as PaletFormData).qtyUnit}` : ""),
                        Package: (label as PaletFormData).package,
                        Date: formatDate((label as PaletFormData).date),
                      }).map(([key, value]) => (
                        <div key={key} style={{ display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: isPreview ? "12px" : "14px",
                              fontWeight: "bold",
                              width: isPreview ? "90px" : "32mm",
                            }}
                          >
                            {key}
                          </span>
                          <span style={{ marginRight: "2mm", fontSize: isPreview ? "12px" : "14px" }}>:</span>
                          <span
                            style={{
                              borderBottom: "1px solid black",
                              flex: 1,
                              height: isPreview ? "20px" : "25px",
                              fontSize: isPreview ? "11px" : "14px",
                              paddingLeft: "2px",
                              paddingBottom: "2px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

BinPaletPrintLayout.displayName = "BinPaletPrintLayout"
