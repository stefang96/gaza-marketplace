import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon: the logo mark on the indigo badge.
export default function AppleIcon() {
  const bars = [
    { h: 70, o: 0.85 },
    { h: 118, o: 1 },
    { h: 88, o: 0.92 },
    { h: 46, o: 0.8 },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: "linear-gradient(135deg, #6455EA 0%, #4737C4 100%)",
        }}
      >
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: b.h,
              borderRadius: 9,
              background: "#fff",
              opacity: b.o,
            }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
