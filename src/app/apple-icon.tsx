// src/app/apple-icon.tsx — iOS ana ekran ikonu (180×180 PNG); geometri components/brand/logo-mark.tsx ile aynı.
// iOS köşeleri kendisi yuvarladığı için arka plan tam kare (rx yok).
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0e1a2b" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <rect width="32" height="32" fill="#0e1a2b" />
          <path d="M9 7.5V23h15.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 18.5l4-4 3 2 4.5-6.5" fill="none" stroke="#a5b4fc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="10" r="2.6" fill="#f59e0b" />
        </svg>
      </div>
    ),
    size,
  );
}
