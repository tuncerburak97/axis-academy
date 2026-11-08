// src/app/opengraph-image.tsx — paylaşım kartı (1200×630 PNG); twitter-image.tsx bunu yeniden dışa aktarır.
// Marka işareti components/brand/logo-mark.tsx ile aynı geometri. Fontlar (Geist, Instrument Serif) Google Fonts'tan
// yalnızca karttaki karakterlerle alt kümelenip TTF olarak çekilir; ağ yoksa varsayılan fonta düşer, build kırılmaz.
import { ImageResponse } from "next/og";

export const alt = "Axis Akademi — Excel’den teze, işini bitiren akademik destek: analiz, eğitim ve tez düzenleme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0e1a2b";
const INDIGO = "#4f46e5";
const GLOW = "#a5b4fc";
const AMBER = "#f59e0b";
const MUTED = "#94a3b8";

const HEADLINE = "Excel’den teze, işini bitiren";
const HEADLINE_ACCENT = "akademik destek";
const TAGLINE = ["Analiz", "Eğitim", "Tez düzenleme"];
const DOMAIN = "axisakademi.com";

// Kartta geçen tüm karakterler — Google Fonts `text=` ile yalnızca bu glifler (ç, ğ, ı, İ, ö, ş, ü dahil) indirilir
const GLYPHS = Array.from(
  new Set(`Axis Akademi ${HEADLINE} ${HEADLINE_ACCENT} ${TAGLINE.join(" · ")} ${DOMAIN} çğıİöşüÇĞÖŞÜ’'`),
).join("");

type FontSpec = { family: string; axes: string; name: string; weight: 400 | 600; style: "normal" | "italic" };
type LoadedFont = Omit<FontSpec, "family" | "axes"> & { data: ArrayBuffer };

const FONT_SPECS: FontSpec[] = [
  { family: "Geist", axes: "wght@600", name: "Geist", weight: 600, style: "normal" },
  { family: "Geist", axes: "wght@400", name: "Geist", weight: 400, style: "normal" },
  { family: "Instrument+Serif", axes: "ital@1", name: "Instrument Serif", weight: 400, style: "italic" },
];

// Satori kelime genişliğini kerning'siz ölçüp kerning'li çiziyor; "Tez", "Excel’den" gibi kelimelerden sonra
// boşluk açılıyor. GPOS/kern tablolarının etiketini bozarak kerning'i kapatıyoruz → ölçüm ve çizim tutarlı.
function withoutKerning(font: ArrayBuffer): ArrayBuffer {
  const view = new DataView(font);
  const numTables = view.getUint16(4);
  for (let i = 0; i < numTables; i++) {
    const offset = 12 + i * 16;
    const tag = String.fromCharCode(...[0, 1, 2, 3].map((b) => view.getUint8(offset + b)));
    if (tag === "GPOS" || tag === "kern") view.setUint8(offset, 0x78); // "xPOS" / "xern" → yok sayılır
  }
  return font;
}

// next/og WOFF2 desteklemez; User-Agent gönderilmeyince Google Fonts TTF ("truetype") döner
async function loadGoogleFont(family: string, axes: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:${axes}&text=${encodeURIComponent(GLYPHS)}`;
  const css = await (await fetch(url, { signal: AbortSignal.timeout(5000) })).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`Beklenmeyen font CSS yanıtı: ${family}`);
  const res = await fetch(src, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Font indirilemedi: ${family} (${res.status})`);
  return withoutKerning(await res.arrayBuffer());
}

async function loadFonts(): Promise<LoadedFont[]> {
  const results = await Promise.allSettled(FONT_SPECS.map((s) => loadGoogleFont(s.family, s.axes)));
  return results.flatMap((result, i) => {
    const { name, weight, style } = FONT_SPECS[i];
    if (result.status === "fulfilled") return [{ name, weight, style, data: result.value }];
    console.warn(`[opengraph-image] ${name} ${weight} yüklenemedi, varsayılan fonta düşülüyor:`, result.reason);
    return [];
  });
}

export default async function OpengraphImage() {
  const fonts = await loadFonts();
  const serif = fonts.some((f) => f.name === "Instrument Serif") ? "Instrument Serif" : "Geist";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
          fontFamily: "Geist",
          color: "#ffffff",
        }}
      >
        {/* Arka plan: sağ üstte yumuşak indigo ışıma + oradan sola-aşağı sönen ince ızgara */}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <radialGradient id="glow" cx="1080" cy="-60" r="760" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={INDIGO} stopOpacity="0.6" />
              <stop offset="0.4" stopColor={INDIGO} stopOpacity="0.22" />
              <stop offset="1" stopColor={INDIGO} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="fade" cx="1080" cy="-60" r="980" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M56 0H0V56" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" />
            </pattern>
            <mask id="gridMask">
              <rect width="1200" height="630" fill="url(#fade)" />
            </mask>
          </defs>
          <rect width="1200" height="630" fill="url(#glow)" />
          <rect width="1200" height="630" fill="url(#grid)" mask="url(#gridMask)" />
        </svg>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 80px 60px",
          }}
        >
          {/* Marka */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", borderRadius: 20, boxShadow: "0 0 0 1px rgba(255,255,255,0.14)" }}>
              <svg width="72" height="72" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="9" fill={INK} />
                <path d="M9 7.5V23h15.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.5 18.5l4-4 3 2 4.5-6.5" fill="none" stroke={GLOW} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="10" r="2.6" fill={AMBER} />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.03em" }}>Axis</span>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 42, color: GLOW }}>Akademi</span>
            </div>
          </div>

          {/* Başlık + alt satır */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.06 }}>
              <span style={{ fontSize: 76, fontWeight: 600, letterSpacing: "-0.035em" }}>{HEADLINE}</span>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 88, letterSpacing: "-0.01em" }}>
                {HEADLINE_ACCENT}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 30, fontSize: 30, color: MUTED }}>
              {TAGLINE.map((item, i) => (
                <div key={item} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <span style={{ margin: "0 16px", color: "#475569" }}>·</span>}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alt şerit */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: MUTED }}>
            <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: AMBER }} />
            <span>{DOMAIN}</span>
          </div>
        </div>
      </div>
    ),
    // Boş dizi verilirse satori "No fonts are loaded" fırlatır; hiç font yoksa next/og'nin varsayılanına bırak
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
