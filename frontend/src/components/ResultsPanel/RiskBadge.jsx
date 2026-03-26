import { RISK_COLORS } from "../../constants/riskColors";

export default function RiskBadge({ risk }) {
  const c = RISK_COLORS[risk] || RISK_COLORS.none;

  return (
    <span
      style={{
        background: c.badge,
        color: "#fff",
        fontSize: "10px",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "4px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: "monospace",
      }}
    >
      {risk}
    </span>
  );
}
