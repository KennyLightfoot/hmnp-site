import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "#A52A2A",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "4px",
      }}
    >
      H
    </div>,
    size,
  )
}

