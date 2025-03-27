import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#002147", // Dark blue from logo
        color: "white",
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hmnp-logo-A3QP2XwMq7IZyRZw-gXLMHbwEv8ThwKyhdSw117oesQllEG.png"
          width={120}
          height={120}
          alt="Houston Mobile Notary Pros Logo"
          style={{ marginRight: 20 }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 50,
            fontWeight: "bold",
          }}
        >
          HMNP
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 40,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Houston Mobile Notary Pros
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        Professional mobile notary services throughout Houston. Available day and evening for your convenience.
      </div>
    </div>,
    size,
  )
}

