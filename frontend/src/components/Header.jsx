import { ICONS } from "./common/Icons";

export default function Header() {
  return (
    <div style={{ borderBottom: "1px solid #21262d", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px", background: "#0d1117" }}>
      <div style={{ color: "#00ff41", animation: "glow 3s ease infinite" }}>{ICONS.shield}</div>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, color: "#e6edf3", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#00ff41" }}>//</span> Secure Intelligence
        </div>
        <div style={{ fontSize: "10px", color: "#e6edf3", letterSpacing: "0.15em" }}>AI DATA SCANNER · LOG ANALYZER · RISK ENGINE</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff41", animation: "pulse 2s ease infinite" }} />
        <span style={{ fontSize: "11px", color: "#e6edf3" }}>SYSTEM ONLINE</span>
      </div>
    </div>
  );
}
