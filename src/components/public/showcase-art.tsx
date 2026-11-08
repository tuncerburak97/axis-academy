// src/components/public/showcase-art.tsx — vitrin çizimleri: teslim edilen işin kendisini gösteren, kodla çizilmiş örnek çıktılar
// Stok fotoğraf yerine: bibliyometrik ağ haritası, APA regresyon tablosu, tez sayfası (önce/sonra), Excel panosu, slayt, panel.
// Hepsi temsilîdir; sayılar örnek amaçlıdır ve yanlarında "örnek çıktı" etiketi kullanılır.
import * as React from "react";
import { Check, CheckCheck, FileSpreadsheet, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Pencere çerçevesi: masaüstü uygulama / tarayıcı başlığı
// ------------------------------------------------------------
export function WindowFrame({
  title,
  url,
  tone = "light",
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  url?: string;
  tone?: "light" | "dark";
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl ring-1",
        dark ? "bg-ink-raised ring-white/10" : "bg-paper ring-ink/[0.07] shadow-pop",
        className,
      )}
    >
      <div className={cn("flex h-9 items-center gap-3 border-b px-3.5", dark ? "border-white/10" : "border-line bg-surface/70")}>
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        {url ? (
          <span
            className={cn(
              "mx-auto flex h-6 min-w-0 max-w-[60%] flex-1 items-center justify-center truncate rounded-md px-3 font-mono text-[10.5px]",
              dark ? "bg-white/5 text-white/50" : "bg-paper text-ink-muted ring-1 ring-line",
            )}
          >
            {url}
          </span>
        ) : (
          title && <span className={cn("truncate text-[11px] font-medium", dark ? "text-white/55" : "text-ink-soft")}>{title}</span>
        )}
        {url && <span className="w-[42px]" aria-hidden />}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

// ------------------------------------------------------------
// Bibliyometrik ağ haritası (VOSviewer tarzı ortak kelime ağı)
// ------------------------------------------------------------
type Cluster = "a" | "b" | "c";
const nodes: { id: string; x: number; y: number; r: number; c: Cluster; label?: string }[] = [
  { id: "a1", x: 112, y: 104, r: 15, c: "a", label: "yapay zekâ" },
  { id: "a2", x: 66, y: 66, r: 8, c: "a" },
  { id: "a3", x: 156, y: 62, r: 10, c: "a", label: "makine öğrenmesi" },
  { id: "a4", x: 74, y: 146, r: 7, c: "a" },
  { id: "a5", x: 140, y: 150, r: 10, c: "a", label: "eğitim" },
  { id: "a6", x: 44, y: 108, r: 5, c: "a" },
  { id: "b1", x: 262, y: 88, r: 13, c: "b", label: "sürdürülebilirlik" },
  { id: "b2", x: 314, y: 52, r: 7, c: "b" },
  { id: "b3", x: 318, y: 120, r: 8, c: "b" },
  { id: "b4", x: 222, y: 44, r: 6, c: "b" },
  { id: "b5", x: 282, y: 146, r: 6, c: "b" },
  { id: "c1", x: 212, y: 184, r: 12, c: "c", label: "bibliyometri" },
  { id: "c2", x: 160, y: 210, r: 6, c: "c" },
  { id: "c3", x: 262, y: 210, r: 8, c: "c", label: "atıf analizi" },
  { id: "c4", x: 188, y: 140, r: 5, c: "c" },
  { id: "c5", x: 308, y: 186, r: 5, c: "c" },
];
const links: [string, string][] = [
  ["a1", "a2"], ["a1", "a3"], ["a1", "a4"], ["a1", "a5"], ["a1", "a6"], ["a3", "a5"], ["a2", "a6"], ["a4", "a5"], ["a2", "a3"],
  ["b1", "b2"], ["b1", "b3"], ["b1", "b4"], ["b1", "b5"], ["b2", "b3"], ["b3", "b5"],
  ["c1", "c2"], ["c1", "c3"], ["c1", "c4"], ["c1", "c5"], ["c3", "c5"], ["c2", "c4"],
  ["a1", "c1"], ["a5", "c1"], ["a3", "b4"], ["a3", "b1"], ["b1", "c1"], ["b5", "c3"], ["a5", "c4"], ["a1", "b1"],
];
const clusterColor: Record<"light" | "dark", Record<Cluster, string>> = {
  light: { a: "#4f46e5", b: "#f59e0b", c: "#0284c7" },
  dark: { a: "#a5b4fc", b: "#fbbf24", c: "#7dd3fc" },
};

export function NetworkMap({ tone = "light", animate = false, className }: { tone?: "light" | "dark"; animate?: boolean; className?: string }) {
  const colors = clusterColor[tone];
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const labelFill = tone === "dark" ? "rgba(255,255,255,0.86)" : "#0e1a2b";
  const halo = tone === "dark" ? "#17253b" : "#ffffff";
  return (
    <svg viewBox="0 0 360 240" className={cn("h-auto w-full", className)} role="img" aria-label="Örnek ortak kelime ağı haritası: üç küme">
      <g fill="none" strokeLinecap="round">
        {links.map(([from, to], index) => {
          const a = byId[from];
          const b = byId[to];
          const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.12;
          const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.12;
          return (
            <path
              key={`${from}-${to}`}
              d={`M${a.x} ${a.y}Q${mx} ${my} ${b.x} ${b.y}`}
              stroke={colors[a.c]}
              strokeOpacity={a.c === b.c ? 0.32 : 0.18}
              strokeWidth={a.c === b.c ? 1.4 : 1}
              pathLength={1}
              className={animate ? "art-draw" : undefined}
              style={animate ? ({ "--i": index } as React.CSSProperties) : undefined}
            />
          );
        })}
      </g>
      {nodes.map((node, index) => (
        <g key={node.id} className={animate ? "art-pop" : undefined} style={animate ? ({ "--i": index } as React.CSSProperties) : undefined}>
          <circle cx={node.x} cy={node.y} r={node.r + 3} fill={colors[node.c]} fillOpacity={0.14} />
          <circle cx={node.x} cy={node.y} r={node.r} fill={colors[node.c]} fillOpacity={node.label ? 0.95 : 0.7} />
        </g>
      ))}
      <g fontFamily="var(--font-geist), sans-serif" fontSize="9.5" fontWeight="600" textAnchor="middle">
        {nodes
          .filter((node) => node.label)
          .map((node) => (
            <text
              key={node.id}
              x={node.x}
              y={node.y + node.r + 12}
              fill={labelFill}
              stroke={halo}
              strokeWidth={3}
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              {node.label}
            </text>
          ))}
      </g>
    </svg>
  );
}

// ------------------------------------------------------------
// APA 7 biçiminde regresyon tablosu
// ------------------------------------------------------------
const regressionRows = [
  ["(Sabit)", "2.314", "0.211", "10.97", "<.001"],
  ["Öz-yeterlik", "0.428", "0.052", "8.23", "<.001"],
  ["Motivasyon", "0.217", "0.061", "3.56", "<.001"],
  ["Deneyim (yıl)", "0.094", "0.038", "2.47", ".014"],
  ["Cinsiyet", "−0.051", "0.047", "−1.09", ".278"],
];

export function RegressionTable({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <figure className={cn("text-[11px] leading-snug", dark ? "text-white/85" : "text-ink", className)}>
      <figcaption className="mb-2">
        <span className="font-semibold">Tablo 4.2</span>
        <span className={cn("mt-0.5 block font-serif text-[13px] italic", dark ? "text-white/70" : "text-ink-soft")}>
          Akademik başarıyı yordayan değişkenler: hiyerarşik regresyon
        </span>
      </figcaption>
      <table className="w-full border-collapse">
        <thead>
          <tr className={cn("border-y", dark ? "border-white/40" : "border-ink")}>
            {["Değişken", "β", "SE", "t", "p"].map((head, index) => (
              <th key={head} scope="col" className={cn("py-1.5 font-semibold", index === 0 ? "text-left" : "text-right", index > 0 && "italic")}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular font-mono">
          {regressionRows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index} className={cn("py-1", index === 0 ? "text-left font-sans" : "text-right")}>
                  {cell}
                  {index === 4 && cell === "<.001" ? <span className={dark ? "text-accent-glow" : "text-accent"}>***</span> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={cn("border-t", dark ? "border-white/40" : "border-ink")}>
            <td colSpan={5} className={cn("pt-1.5 font-mono text-[10px]", dark ? "text-white/60" : "text-ink-soft")}>
              R² = .46 · ΔR² = .12 · <span className="whitespace-nowrap">F(4, 395) = 84.6, p &lt; .001</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </figure>
  );
}

// ------------------------------------------------------------
// Tez sayfası: önce (dağınık) / sonra (enstitü şablonuna uygun)
// ------------------------------------------------------------
function Lines({ widths, className, tone = "bg-ink/15" }: { widths: number[]; className?: string; tone?: string }) {
  return (
    <div className={cn("flex flex-col gap-[0.55em]", className)} aria-hidden>
      {widths.map((width, index) => (
        <span key={index} className={cn("block h-[0.32em] rounded-full", tone)} style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}

/** Tez sayfası. Boyutu kapsayıcıya göre ölçeklenir (yazılar sayfa genişliğinin yüzdesi). */
export function ThesisPage({ variant = "after", className }: { variant?: "before" | "after"; className?: string }) {
  const after = variant === "after";
  return (
    <div
      className={cn(
        "relative aspect-[1/1.414] w-full overflow-hidden rounded-[6px] bg-white text-ink shadow-[0_1px_2px_rgb(14_26_43/0.08),0_18px_40px_-18px_rgb(14_26_43/0.35)] ring-1 ring-ink/[0.06] [container-type:inline-size]",
        className,
      )}
      role="img"
      aria-label={after ? "Enstitü şablonuna uygun tez sayfası örneği" : "Biçimi düzensiz tez sayfası örneği"}
    >
      <div className="absolute inset-0 text-[3.1cqi] leading-tight">
        {after && (
          <>
            {/* kenar boşluğu kılavuzları: cilt payı solda 4 cm */}
            <span aria-hidden className="absolute inset-y-0 left-[15%] border-l border-dashed border-accent/35" />
            <span aria-hidden className="absolute inset-y-0 right-[10%] border-l border-dashed border-accent/35" />
            <span aria-hidden className="absolute inset-x-0 top-[7%] border-t border-dashed border-accent/35" />
            <span aria-hidden className="absolute inset-x-0 bottom-[7%] border-t border-dashed border-accent/35" />
            <span aria-hidden className="absolute left-[7.5%] top-1/2 -translate-x-1/2 -rotate-90 whitespace-nowrap font-mono text-[0.8em] text-accent/80">
              4 cm
            </span>
            <span aria-hidden className="absolute right-[5%] top-1/2 translate-x-1/2 rotate-90 whitespace-nowrap font-mono text-[0.8em] text-accent/80">
              2,5 cm
            </span>
          </>
        )}
        <div className={cn("absolute inset-0", after ? "pb-[9%] pl-[15%] pr-[10%] pt-[10%]" : "px-[9%] pb-[8%] pt-[7%]")}>
          {after ? (
            <>
              <p className="text-center text-[1.05em] font-bold tracking-[0.12em]">BÖLÜM 3</p>
              <p className="mt-[0.2em] text-center text-[1.05em] font-bold tracking-[0.12em]">YÖNTEM</p>
              <p className="mt-[1.4em] font-bold">3.1 Araştırma Modeli</p>
              <Lines className="mt-[0.8em]" widths={[100, 100, 100, 100, 58]} />
              <div className="mx-auto mt-[1.3em] flex w-[80%] items-center justify-center gap-[0.6em] rounded-[3px] border border-ink/15 py-[0.9em]" aria-hidden>
                <span className="h-[1.3em] w-[3.2em] rounded-[2px] bg-accent/20" />
                <span className="h-px w-[1.4em] bg-ink/40" />
                <span className="h-[1.3em] w-[3.2em] rounded-[2px] bg-accent/35" />
                <span className="h-px w-[1.4em] bg-ink/40" />
                <span className="h-[1.3em] w-[3.2em] rounded-[2px] bg-accent/55" />
              </div>
              <p className="mt-[0.5em] text-center text-[0.85em] italic text-ink-soft">Şekil 3.1 Araştırma modeli</p>
              <p className="mt-[1.2em] font-bold">3.2 Evren ve Örneklem</p>
              <Lines className="mt-[0.8em]" widths={[100, 100, 100, 76]} />
              <p className="mt-[1.2em] text-[0.85em]">
                <span className="font-bold">Tablo 3.1</span> <span className="italic">Katılımcıların dağılımı</span>
              </p>
              <div className="mt-[0.4em] border-y border-ink/60 text-[0.8em]" aria-hidden>
                {[
                  ["Değişken", "n", "%"],
                  ["Kadın", "214", "53.5"],
                  ["Erkek", "186", "46.5"],
                ].map((row, index) => (
                  <div key={row[0]} className={cn("grid grid-cols-[1fr_3em_3em] py-[0.25em]", index === 0 && "border-b border-ink/60 font-semibold")}>
                    {row.map((cell, cellIndex) => (
                      <span key={cellIndex} className={cn("tabular font-mono", cellIndex === 0 ? "font-sans" : "text-right")}>
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <Lines className="mt-[1.2em]" widths={[100, 100, 64]} />
              <p className="absolute bottom-[3.2%] left-0 right-0 text-center font-mono text-[0.85em] text-ink-soft">42</p>
            </>
          ) : (
            <>
              <p className="text-[1.3em] font-bold">Bölüm 3: yöntem</p>
              <p className="mt-[1em] text-[1.05em] font-semibold underline decoration-danger decoration-wavy decoration-1 underline-offset-2">
                3.1. araştırma modeli
              </p>
              <Lines className="mt-[0.8em] pl-[1.5em]" widths={[96, 100, 88, 100, 40]} />
              <div className="ml-[3em] mt-[1.2em] flex w-[58%] items-center gap-[0.6em] rounded-[3px] border border-danger/50 py-[0.9em] pl-[0.8em]" aria-hidden>
                <span className="h-[1.3em] w-[2.8em] rounded-[2px] bg-ink/15" />
                <span className="h-[1.3em] w-[2.8em] rounded-[2px] bg-ink/15" />
              </div>
              <p className="mt-[0.5em] text-[0.85em] text-danger">Şekil ? — numara yok</p>
              <p className="mt-[1em] text-[1em] font-bold">3.2 EVREN VE ÖRNEKLEM</p>
              <Lines className="mt-[0.8em]" widths={[100, 92, 100, 70]} />
              <div className="mt-[1.2em] w-[85%] text-[0.8em]" aria-hidden>
                {[
                  ["cinsiyet", "sayı", "yüzde"],
                  ["Kadın", "214", "%53,5"],
                  ["erkek", "186", "46.5"],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-3 border border-ink/25 px-[0.4em] py-[0.25em]">
                    {row.map((cell, cellIndex) => (
                      <span key={cellIndex}>{cell}</span>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-[0.5em] text-[0.85em] text-danger">Tablo başlığı ve numarası eksik</p>
              <Lines className="mt-[1em] pl-[1.5em]" widths={[100, 86, 100]} />
              <p className="mt-[0.6em] text-[0.85em] text-danger">(Yılmaz, 2019) → kaynakçada yok</p>
              <p className="absolute bottom-[3.5%] right-[9%] font-mono text-[0.85em] text-ink-soft">s. 38</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tez sayfasının yanında duran onay etiketleri */
export function CheckChip({ children, tone = "light", className }: { children: React.ReactNode; tone?: "light" | "dark"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-raise",
        tone === "dark" ? "bg-white text-ink" : "bg-paper text-ink ring-1 ring-line",
        className,
      )}
    >
      <span className="flex size-3.5 items-center justify-center rounded-full bg-success text-white">
        <Check className="size-2.5" strokeWidth={3.5} aria-hidden />
      </span>
      {children}
    </span>
  );
}

// ------------------------------------------------------------
// Excel panosu: formül çubuğu, KPI kutuları, aylık sütun grafik
// ------------------------------------------------------------
const monthly = [38, 44, 41, 52, 49, 58, 63, 57, 66, 72, 69, 81];
const monthLabels = ["O", "Ş", "M", "N", "M", "H", "T", "A", "E", "E", "K", "A"];

export function ExcelDashboard({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <WindowFrame title="satis_analizi.xlsx" className={className}>
      <div className="flex items-center gap-2 border-b border-line px-3 py-1.5 font-mono text-[10px] text-ink-soft">
        <span className="rounded bg-success-soft px-1.5 py-0.5 font-semibold text-success-ink">fx</span>
        <span className="truncate">=XLOOKUP(B2;Ürünler[Kod];Ürünler[Fiyat])</span>
      </div>
      <div className={cn("grid gap-2.5 p-3", compact ? "grid-cols-3" : "grid-cols-3 sm:p-4")}>
        {[
          { label: "Ciro", value: "₺4,82 M", delta: "▲ 12%" },
          { label: "Sipariş", value: "1.248", delta: "▲ 8%" },
          { label: "Ort. sepet", value: "₺3.862", delta: "▲ 4%" },
        ].map((kpi) => (
          <div key={kpi.label} className="min-w-0 rounded-lg bg-surface px-2.5 py-2 ring-1 ring-inset ring-line">
            <p className="text-[9.5px] font-medium text-ink-soft">{kpi.label}</p>
            <p className="tabular mt-0.5 truncate font-mono text-[13px] font-semibold text-ink">{kpi.value}</p>
            <p className="tabular font-mono text-[9px] font-semibold text-success">{kpi.delta}</p>
          </div>
        ))}
        <div className="col-span-3 rounded-lg px-1 pt-1">
          <div className="flex h-[88px] items-end gap-[5px]" aria-hidden>
            {monthly.map((value, index) => (
              <span key={index} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn("w-full rounded-t-[3px]", index === monthly.length - 1 ? "bg-success" : "bg-success/30")}
                  style={{ height: `${value}px` }}
                />
              </span>
            ))}
          </div>
          <div className="mt-1 flex gap-[5px] font-mono text-[8px] text-ink-muted" aria-hidden>
            {monthLabels.map((label, index) => (
              <span key={index} className="flex-1 text-center">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="grid grid-cols-[28px_repeat(4,minmax(0,1fr))] border-t border-line font-mono text-[9.5px]" aria-hidden>
          {["", "A", "B", "C", "D"].map((head, index) => (
            <span key={index} className="border-b border-r border-line bg-surface px-1.5 py-1 text-center text-ink-muted">
              {head}
            </span>
          ))}
          {[
            ["2", "Bölge", "Ciro", "Hedef", "Durum"],
            ["3", "Marmara", "1,92 M", "1,80 M", "✓"],
            ["4", "Ege", "1,14 M", "1,20 M", "−5%"],
          ].map((row) =>
            row.map((cell, index) => (
              <span
                key={`${row[0]}-${index}`}
                className={cn(
                  "truncate border-b border-r border-line px-1.5 py-1",
                  index === 0 ? "bg-surface text-center text-ink-muted" : "text-ink",
                  row[0] === "2" && index > 0 && "font-semibold",
                  cell === "✓" && "text-success",
                  cell === "−5%" && "text-amber-ink",
                )}
              >
                {cell}
              </span>
            )),
          )}
        </div>
      )}
    </WindowFrame>
  );
}

// ------------------------------------------------------------
// Slayt: başlık, büyük rakam, halka grafik
// ------------------------------------------------------------
export function SlideMock({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg bg-white ring-1 ring-ink/[0.07]", className)} aria-hidden>
      <span className="absolute inset-y-0 left-0 w-1.5 bg-amber" />
      <div className="flex h-full items-center gap-[6%] px-[9%]">
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-amber-ink">2026 · Strateji</p>
          <p className="mt-1 text-[13px] font-semibold leading-tight tracking-tight text-ink">Müşteri memnuniyeti üç yılda ikiye katlandı</p>
          <p className="tabular mt-2 font-mono text-[22px] font-semibold leading-none text-ink">%86</p>
        </div>
        <svg viewBox="0 0 36 36" className="w-[30%] shrink-0 -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#fef3c7" strokeWidth="6" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="75.6 88" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Ürün paneli: üye panelindeki talep sayfası (teklif + mesaj)
// ------------------------------------------------------------
const panelSteps = ["Alındı", "Teklif", "Onay", "Devam", "Teslim"];

export function PanelMock({ className }: { className?: string }) {
  return (
    <WindowFrame url="axisakademi.com/panel/talepler" className={className}>
      <div className="grid grid-cols-[132px_minmax(0,1fr)] max-sm:grid-cols-1">
        <aside className="border-r border-line bg-surface/60 p-3 max-sm:hidden" aria-hidden>
          <div className="flex items-center gap-1.5 px-1.5 pb-3 text-[11px] font-semibold text-ink">
            <span className="size-3.5 rounded-[4px] bg-ink" /> Axis
          </div>
          {["Bugün", "Takvim", "Eğitimlerim", "Taleplerim", "Belgelerim"].map((item) => (
            <div
              key={item}
              className={cn(
                "rounded-md px-2 py-1.5 text-[10.5px] font-medium",
                item === "Taleplerim" ? "bg-paper text-ink shadow-card ring-1 ring-line" : "text-ink-soft",
              )}
            >
              {item}
            </div>
          ))}
        </aside>
        <div className="min-w-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">Tez düzenleme</p>
              <p className="mt-0.5 truncate text-[13px] font-semibold tracking-tight text-ink">Yüksek lisans tezi · 142 sayfa</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-soft px-2 py-0.5 text-[10px] font-semibold text-amber-ink">
              <span className="size-1.5 rounded-full bg-amber" /> Teklif hazır
            </span>
          </div>
          {/* durum hattı */}
          <ol className="mt-4 flex items-center" aria-label="Talep durumu: Teklif adımında">
            {panelSteps.map((step, index) => (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[9px] font-semibold",
                      index === 0 && "bg-accent text-white",
                      index === 1 && "bg-paper text-accent ring-2 ring-accent",
                      index > 1 && "bg-surface text-ink-muted ring-1 ring-line",
                    )}
                  >
                    {index === 0 ? <Check className="size-3" strokeWidth={3} aria-hidden /> : index + 1}
                  </span>
                  <span className={cn("text-[9px] font-medium", index <= 1 ? "text-ink" : "text-ink-muted")}>{step}</span>
                </span>
                {index < panelSteps.length - 1 && <span className={cn("mx-1 mb-4 h-px flex-1", index === 0 ? "bg-accent" : "bg-line")} />}
              </li>
            ))}
          </ol>
          {/* teklif */}
          <div className="mt-4 rounded-xl border border-line bg-paper p-3 shadow-card">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[9.5px] font-medium text-ink-soft">Teklif · 5 iş günü teslim</p>
                <p className="tabular mt-0.5 font-mono text-[17px] font-semibold text-ink">₺9.500</p>
              </div>
              <span className="rounded-lg bg-ink px-2.5 py-1.5 text-[10.5px] font-semibold text-white">Teklifi onayla</span>
            </div>
            <p className="mt-2 border-t border-line pt-2 text-[10px] leading-relaxed text-ink-soft">
              Enstitü şablonu, APA 7 kaynakça, otomatik içindekiler ve tablo/şekil listeleri dahil.
            </p>
          </div>
          {/* mesajlar */}
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-surface px-2.5 py-1.5 text-[10.5px] text-ink">
              Şablon dosyasını ekledim, bölüm 4 tablolarına da bakabilir misiniz?
              <span className="mt-1 flex items-center gap-1 text-[9px] text-ink-soft">
                <Paperclip className="size-2.5" aria-hidden /> enstitu_sablon.docx
              </span>
            </div>
            <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm bg-accent px-2.5 py-1.5 text-[10.5px] text-white">
              Elbette, teklife dahil ettik.
              <span className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-white/70">
                10:42 <CheckCheck className="size-2.5" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

// ------------------------------------------------------------
// Program kartı başlığı: kategoriye özgü mini çizim
// ------------------------------------------------------------
export function ProgramVisual({ category, className }: { category: string; className?: string }) {
  if (category === "word") {
    return (
      <div className={cn("relative flex items-end justify-center overflow-hidden bg-[linear-gradient(160deg,#e0f2fe,#f0f9ff)]", className)} aria-hidden>
        <div className="relative mb-[-12%] w-[58%] rounded-t-md bg-white p-3 text-[8px] shadow-raise ring-1 ring-info/10">
          <p className="text-[7px] font-bold tracking-[0.14em] text-info-ink">İÇİNDEKİLER</p>
          {[
            ["1. Giriş", "1"],
            ["2. Kuramsal çerçeve", "7"],
            ["3. Yöntem", "24"],
            ["4. Bulgular", "41"],
          ].map(([label, page]) => (
            <p key={label} className="mt-1 flex items-baseline gap-1 text-[7.5px] text-ink">
              <span className="shrink-0">{label}</span>
              <span className="min-w-0 flex-1 border-b border-dotted border-ink/30" />
              <span className="tabular font-mono">{page}</span>
            </p>
          ))}
          <Lines className="mt-2.5" widths={[100, 92, 100, 70]} />
        </div>
      </div>
    );
  }
  if (category === "powerpoint") {
    return (
      <div className={cn("relative flex items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#fef3c7,#fffbeb)] px-[12%]", className)} aria-hidden>
        <SlideMock className="shadow-raise" />
      </div>
    );
  }
  // excel (varsayılan)
  return (
    <div className={cn("relative overflow-hidden bg-[linear-gradient(160deg,#dcfce7,#f0fdf4)]", className)} aria-hidden>
      <div className="absolute inset-x-[10%] bottom-[-14%] top-[16%] overflow-hidden rounded-t-md bg-white shadow-raise ring-1 ring-success/15">
        <div className="flex items-center gap-1.5 border-b border-line px-2 py-1 font-mono text-[7.5px] text-ink-soft">
          <FileSpreadsheet className="size-2.5 text-success" />
          =SUMIFS(Satış;Bölge;"Ege")
        </div>
        <div className="grid grid-cols-[16px_repeat(4,minmax(0,1fr))] font-mono text-[7px]">
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => {
              const head = row === 0 || col === 0;
              const selected = row === 2 && col === 3;
              const text = head ? (row === 0 ? ["", "A", "B", "C", "D"][col] : String(row)) : row === 1 ? ["Bölge", "Q1", "Q2", "Σ"][col - 1] : `${(row * 37 + col * 19) % 90 + 10},${(row + col) % 9}`;
              return (
                <span
                  key={`${row}-${col}`}
                  className={cn(
                    "truncate border-b border-r border-line px-1 py-[3px]",
                    head ? "bg-surface text-center text-ink-muted" : "text-ink",
                    row === 1 && !head && "font-semibold",
                    selected && "relative bg-success-soft outline outline-2 -outline-offset-1 outline-success",
                  )}
                >
                  {text}
                </span>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Hizmet kompozisyonları: anasayfa vitrini ve hizmet sayfalarında aynı çizim
// ------------------------------------------------------------
export function AnalysisComposite({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <div className={cn("relative min-w-0 pb-10 sm:pb-0", className)}>
      <WindowFrame tone={tone} title="ortak-kelime-agi.vos" bodyClassName="p-4">
        <NetworkMap tone={tone} animate />
      </WindowFrame>
      <div className="relative -mt-16 ml-auto w-[88%] rounded-xl bg-paper p-4 shadow-pop ring-1 ring-ink/[0.06] sm:absolute sm:-bottom-10 sm:-right-4 sm:mt-0 sm:w-[64%]">
        <RegressionTable />
      </div>
    </div>
  );
}

export function ThesisComposite({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <div className={cn("grid min-w-0 grid-cols-2 gap-4 sm:gap-8", className)}>
      <figure className="min-w-0">
        <figcaption className={cn("mb-3 flex items-center gap-2 text-xs font-semibold", dark ? "text-white/55" : "text-ink-soft")}>
          <span className="size-1.5 rounded-full bg-danger/70" aria-hidden /> Önce
        </figcaption>
        <ThesisPage variant="before" className={dark ? "opacity-90" : "opacity-80 grayscale-[30%]"} />
      </figure>
      <figure className="relative min-w-0">
        <figcaption className={cn("mb-3 flex items-center gap-2 text-xs font-semibold", dark ? "text-white" : "text-ink")}>
          <span className="size-1.5 rounded-full bg-success" aria-hidden /> Sonra
        </figcaption>
        <ThesisPage />
        <CheckChip tone={tone} className="absolute -left-3 top-[30%] sm:-left-6">
          Şablon
        </CheckChip>
        <CheckChip tone={tone} className="absolute -right-2 top-[62%]">
          APA 7
        </CheckChip>
      </figure>
    </div>
  );
}

export function TrainingComposite({ className }: { className?: string }) {
  return (
    <div className={cn("relative min-w-0 pb-16 sm:pb-12", className)}>
      <ExcelDashboard />
      <div className="absolute -bottom-2 right-[-4%] w-[52%] rotate-[3deg] sm:-bottom-4">
        <SlideMock className="shadow-pop" />
      </div>
    </div>
  );
}
