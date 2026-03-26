import { ICONS } from "../common/Icons";

export default function Insights({ insights }) {
  if (!insights?.length) return null;

  return (
    <div style={{ background: "#0d1f0d", border: "1px solid #1a4d1a", borderRadius: "8px", padding: "14px" }}>
      <div style={{ fontSize: "10px", color: "#4a9e4a", letterSpacing: "0.15em", marginBottom: "10px" }}>⚡ AI INSIGHTS</div>
      {insights.map((ins, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start", animation: `fadeSlide 0.3s ease ${i * 0.08}s both` }}>
          <span style={{ color: "#00ff41", marginTop: "1px", flexShrink: 0 }}>{ICONS.check}</span>
          <span style={{ fontSize: "12px", color: "#68d391", lineHeight: "1.5" }}>{ins}</span>
        </div>
      ))}
    </div>
  );
}
