import React, { useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  GILBREATH ⋈ MOD-m  —  二階MOD規律觀測台
//  整數精確：三角全為整數，殘差全為整數，轉移計數全為整數。
//  小數點只在你按下「正規化」時出現。
// ─────────────────────────────────────────────────────────────────────────────

const INK = "#0a0b0f";
const PANEL = "#11131a";
const LINE = "#22262f";
const PAPER = "#e9e3d3";
const MUTE = "#8a8d97";
const ONE = "#ffb454"; // 殘差 1 = Gilbreath 邊緣
const COOL = "#3aa6b9";

function sieve(n) {
  const s = new Uint8Array(n + 1);
  const ps = [];
  for (let i = 2; i <= n; i++) {
    if (!s[i]) {
      ps.push(i);
      for (let j = i * i; j <= n; j += i) s[j] = 1;
    }
  }
  return ps;
}

function buildTriangle(primes) {
  const tri = [Int32Array.from(primes)];
  let cur = tri[0];
  while (cur.length > 1) {
    const nxt = new Int32Array(cur.length - 1);
    for (let i = 1; i < cur.length; i++) nxt[i - 1] = Math.abs(cur[i] - cur[i - 1]);
    tri.push(nxt);
    cur = nxt;
  }
  return tri;
}

function resColor(r, m) {
  if (r === 1) return ONE;
  if (r === 0) return "#191f2b";
  const t = (r - 1) / Math.max(1, m - 1);
  const hue = 195 - 30 * t;
  const light = 28 + 34 * t;
  return `hsl(${hue} 42% ${light}%)`;
}

export default function App() {
  const [bound, setBound] = useState(2000);
  const [m, setM] = useState(3);
  const [row, setRow] = useState(1);
  const [norm, setNorm] = useState(false);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef(null);

  const primes = useMemo(() => sieve(bound), [bound]);
  const tri = useMemo(() => buildTriangle(primes), [primes]);
  const maxRow = tri.length - 1;

  useEffect(() => { if (row > maxRow) setRow(Math.max(1, maxRow)); }, [maxRow, row]);

  // ── auto-descend ──
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setRow((r) => {
        if (r >= maxRow) { setPlaying(false); return r; }
        return r + 1;
      });
    }, 90);
    return () => clearInterval(id);
  }, [playing, maxRow]);

  // ── draw residue triangle ──
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const N = tri[0].length;
    const cs = Math.max(1, Math.floor(560 / N));
    const W = N * cs, H = tri.length * cs;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < tri.length; r++) {
      const arr = tri[r];
      for (let c = 0; c < arr.length; c++) {
        ctx.fillStyle = resColor(arr[c] % m, m);
        ctx.fillRect(c * cs, r * cs, cs, cs);
      }
    }
    // mark current row
    ctx.strokeStyle = "rgba(255,180,84,0.9)";
    ctx.lineWidth = Math.max(1, cs);
    ctx.beginPath();
    ctx.moveTo(0, row * cs + cs / 2);
    ctx.lineTo(tri[row].length * cs, row * cs + cs / 2);
    ctx.stroke();
  }, [tri, m, row]);

  // ── transition matrix + histogram of selected row, mod m ──
  const { T, total, hist, ones, edge } = useMemo(() => {
    const arr = tri[row] || new Int32Array();
    const T = Array.from({ length: m }, () => new Array(m).fill(0));
    const hist = new Array(m).fill(0);
    for (let i = 0; i < arr.length; i++) hist[arr[i] % m]++;
    let tot = 0;
    for (let i = 1; i < arr.length; i++) { T[arr[i - 1] % m][arr[i] % m]++; tot++; }
    return { T, total: tot, hist, ones: hist[1] || 0, edge: arr.length ? arr[0] : "-" };
  }, [tri, row, m]);

  const maxHist = Math.max(1, ...hist);

  const fmt = (x) => {
    if (!norm) return x;
    if (total === 0) return "0";
    return ((100 * x) / total).toFixed(1) + "%";
  };
  const cellMax = Math.max(1, ...T.flat());

  return (
    <div style={{ background: INK, color: PAPER, minHeight: "100%", padding: "22px 20px 40px",
      fontFamily: "'Spectral', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Spectral:wght@300;400;600&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .disp { font-family: 'Fraunces', serif; }
        input[type=range]{ -webkit-appearance:none; appearance:none; height:3px; background:${LINE}; border-radius:2px; outline:none; }
        input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:${ONE}; cursor:pointer; box-shadow:0 0 0 4px rgba(255,180,84,0.15); }
        input[type=range]::-moz-range-thumb{ width:15px;height:15px;border:none;border-radius:50%;background:${ONE};cursor:pointer; }
        .chip{ cursor:pointer; user-select:none; transition:all .12s; }
        .chip:hover{ border-color:${ONE}!important; color:${PAPER}!important; }
        @keyframes glow { 0%,100%{opacity:.55} 50%{opacity:1} }
      `}</style>

      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
          <h1 className="disp" style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Gilbreath <span style={{ color: COOL }}>⋈</span> mod-<span style={{ color: ONE }}>{m}</span>
          </h1>
          <span className="mono" style={{ fontSize: 12, color: MUTE }}>二階MOD規律觀測台</span>
        </div>
        <p style={{ margin: "0 0 20px", color: MUTE, fontSize: 14, maxWidth: 760, lineHeight: 1.5 }}>
          每個格子是質數絕對差三角的一項，依 <span style={{ color: PAPER }}>殘差 mod {m}</span> 著色。
          <span style={{ color: ONE }}> 琥珀色 = 殘差 1</span>（Gilbreath 邊緣）。往下拉行游標，看 1 如何退成左邊一條孤線、主體塌進 {"{0,2}"} 的冷色塊。全程整數。
        </p>

        {/* controls */}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginBottom: 18,
          padding: "12px 14px", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10 }}>
          <Ctl label="模數 m">
            <div style={{ display: "flex", gap: 5 }}>
              {[2, 3, 4, 5, 6, 7, 9].map((v) => (
                <span key={v} className="chip mono" onClick={() => setM(v)}
                  style={{ padding: "3px 9px", fontSize: 13, borderRadius: 6,
                    border: `1px solid ${m === v ? ONE : LINE}`,
                    color: m === v ? INK : MUTE, background: m === v ? ONE : "transparent", fontWeight: 600 }}>
                  {v}
                </span>
              ))}
            </div>
          </Ctl>
          <Ctl label="質數上界">
            <div style={{ display: "flex", gap: 5 }}>
              {[1000, 2000, 5000, 10000].map((v) => (
                <span key={v} className="chip mono" onClick={() => setBound(v)}
                  style={{ padding: "3px 9px", fontSize: 13, borderRadius: 6,
                    border: `1px solid ${bound === v ? COOL : LINE}`,
                    color: bound === v ? INK : MUTE, background: bound === v ? COOL : "transparent", fontWeight: 600 }}>
                  {v >= 1000 ? v / 1000 + "k" : v}
                </span>
              ))}
            </div>
          </Ctl>
          <div className="mono" style={{ fontSize: 12, color: MUTE }}>
            {primes.length} 個質數 · {tri.length} 列
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 20, alignItems: "start" }}>
          {/* triangle */}
          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 12, color: MUTE }}>殘差三角 (mod {m})</span>
              <span className="mono" style={{ fontSize: 12, color: ONE }}>← 邊緣恆 1</span>
            </div>
            <div style={{ overflow: "hidden", borderRadius: 4, lineHeight: 0 }}>
              <canvas ref={canvasRef} style={{ width: "100%", height: "auto", imageRendering: "pixelated", display: "block" }} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 12, color: MUTE }}>行游標</span>
                <span className="mono" style={{ fontSize: 12, color: PAPER }}>row {row} / {maxRow}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="chip mono" onClick={() => setPlaying((p) => !p)}
                  style={{ padding: "4px 11px", fontSize: 12, borderRadius: 6, border: `1px solid ${LINE}`,
                    color: playing ? INK : PAPER, background: playing ? ONE : "transparent", fontWeight: 600 }}>
                  {playing ? "■ 停" : "▶ 下降"}
                </span>
                <input type="range" min={1} max={Math.max(1, maxRow)} value={row}
                  onChange={(e) => { setPlaying(false); setRow(+e.target.value); }} style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          {/* analytics */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* stat strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              <Stat k="此列長度" v={tri[row] ? tri[row].length : 0} />
              <Stat k="左邊緣值" v={edge} hot={edge === 1} />
              <Stat k="殘差1出現" v={ones} hot={ones <= 2} />
            </div>

            {/* transition matrix */}
            <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 12, color: MUTE }}>轉移{norm ? "頻率" : "計數"}矩陣 T[from→to]</span>
                <span className="chip mono" onClick={() => setNorm((n) => !n)}
                  style={{ padding: "2px 8px", fontSize: 11, borderRadius: 5, border: `1px solid ${norm ? ONE : LINE}`,
                    color: norm ? ONE : MUTE }}>
                  {norm ? "小數 ⏿" : "整數 ⏾"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `28px repeat(${m}, 1fr)`, gap: 3 }}>
                <div />
                {Array.from({ length: m }).map((_, j) => (
                  <div key={j} className="mono" style={{ textAlign: "center", fontSize: 11,
                    color: j === 1 ? ONE : MUTE }}>{j}</div>
                ))}
                {T.map((rw, i) => (
                  <React.Fragment key={i}>
                    <div className="mono" style={{ fontSize: 11, color: i === 1 ? ONE : MUTE,
                      display: "flex", alignItems: "center" }}>{i}</div>
                    {rw.map((x, j) => {
                      const isOne = i === 1 || j === 1;
                      const a = x === 0 ? 0 : 0.12 + 0.6 * (x / cellMax);
                      return (
                        <div key={j} className="mono" style={{ textAlign: "center", padding: "7px 2px",
                          fontSize: 12, borderRadius: 5,
                          background: x === 0 ? "#0d0f15" : `rgba(58,166,185,${a})`,
                          color: x === 0 ? "#363b46" : PAPER,
                          border: isOne ? `1px solid rgba(255,180,84,${x === 0 ? 0.25 : 0.7})` : "1px solid transparent",
                          fontWeight: x === cellMax ? 600 : 400 }}>
                          {fmt(x)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 12, color: MUTE, lineHeight: 1.45 }}>
                琥珀框 = 牽涉殘差 1 的轉移。下降時這圈會空成零，只剩邊緣那一個 1 撐著。
              </p>
            </div>

            {/* residue histogram */}
            <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 14 }}>
              <span className="mono" style={{ fontSize: 12, color: MUTE }}>此列殘差分布</span>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 84, marginTop: 10 }}>
                {hist.map((h, r) => (
                  <div key={r} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span className="mono" style={{ fontSize: 10, color: MUTE }}>{h}</span>
                    <div style={{ width: "100%", height: `${(h / maxHist) * 60}px`,
                      background: resColor(r, m), borderRadius: "3px 3px 0 0",
                      animation: r === 1 ? "glow 2.2s ease-in-out infinite" : "none" }} />
                    <span className="mono" style={{ fontSize: 11, color: r === 1 ? ONE : MUTE }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 22, fontSize: 12.5, color: MUTE, lineHeight: 1.55, maxWidth: 900 }}>
          <span style={{ color: PAPER }}>讀法。</span> 第 1 列是質數間隙——二階MOD的指紋在這裡最濃（Lemke-Oliver 的反重複）。越往下，列被 Odlyzko 的 {"{0,2}"} 閉包吞沒，
          轉移矩陣收斂成一個只支撐在 {"{0,2}"} 上的固定塊，殘差 1 退化為左邊緣那條孤線。
          那是「二階MOD × Gilbreath」的核心現象：<span style={{ color: ONE }}>質數的個性只活在最上面幾列，深層是與質數無關的小字母動力學。</span>
        </p>
      </div>
    </div>
  );
}

function Ctl({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="mono" style={{ fontSize: 11, color: "#6f727b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      {children}
    </div>
  );
}

function Stat({ k, v, hot }) {
  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 9, padding: "10px 12px" }}>
      <div className="mono" style={{ fontSize: 10.5, color: "#6f727b", marginBottom: 4 }}>{k}</div>
      <div className="mono" style={{ fontSize: 19, fontWeight: 600, color: hot ? ONE : PAPER }}>{v}</div>
    </div>
  );
}
