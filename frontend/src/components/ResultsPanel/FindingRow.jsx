import { RISK_COLORS } from "../../constants/riskColors";
import RiskBadge from "./RiskBadge";

export default function FindingRow({ finding, index }) {
  const c = RISK_COLORS[finding.risk] || RISK_COLORS.none;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px minmax(0, 1fr) auto auto",
        alignItems: "center",
        gap: "12px",
        padding: "10px 14px",
        background: c.bg,
        borderLeft: `3px solid ${c.border}`,
        borderRadius: "0 6px 6px 0",
        marginBottom: "6px",
        animation: `fadeSlide 0.3s ease ${index * 0.05}s both`,
      }}
    >
      <span style={{ color: c.text, fontSize: "11px", fontFamily: "monospace" }}>
        L{finding.line}
      </span>
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <span style={{ color: c.text, fontFamily: "monospace", fontSize: "13px", fontWeight: 600, display: "block" }}>
          {finding.type}
        </span>
        <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "monospace", marginLeft: "8px", display: "block", wordBreak: "break-all", overflowWrap: "anywhere", maxWidth: "100%" }}>
          {finding.context}
        </span>
      </div>
      <span style={{ color: "#8b949e", fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all", overflowWrap: "anywhere", minWidth: 0 }}>
        {finding.value}
      </span>
      <RiskBadge risk={finding.risk} />
    </div>
  );
}
