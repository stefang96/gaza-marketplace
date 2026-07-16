import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gaža — svirke bez brige, novac osiguran";

// Social share card (WhatsApp / Slack / LinkedIn link previews).
export default function OgImage() {
  const bars = [
    { h: 34, o: 0.85 },
    { h: 58, o: 1 },
    { h: 44, o: 0.92 },
    { h: 24, o: 0.8 },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #4737C4 0%, #6455EA 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "rgba(255,255,255,0.16)",
            }}
          >
            {bars.map((b, i) => (
              <div
                key={i}
                style={{ width: 9, height: b.h, borderRadius: 5, background: "#fff", opacity: b.o }}
              />
            ))}
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>Gaža</div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Svirke bez brige.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#D9F5E7",
            }}
          >
            Novac osiguran.
          </div>
          <div style={{ fontSize: 32, opacity: 0.9, marginTop: 14 }}>
            Marketplace za svirke — Balkan i dijaspora
          </div>
        </div>

        {/* Trust row */}
        <div style={{ display: "flex", gap: 14, fontSize: 27 }}>
          {["Zaštita plaćanja", "Logistika za dijasporu", "Verifikovani izvođači"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
