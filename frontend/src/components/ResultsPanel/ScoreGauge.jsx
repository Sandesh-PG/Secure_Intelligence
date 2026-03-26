import { RISK_COLORS } from "../../constants/riskColors";
import RiskBadge from "./RiskBadge";

export default function ScoreGauge({ score, level }) {
  const c = RISK_COLORS[level] || RISK_COLORS.none;
  const pct = Math.min((score / 30) * 100, 100);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          margin: "0 auto 8px",
          background: `conic-gradient(${c.badge} ${pct * 3.6}deg, #1e2433 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 20px ${c.badge}44`,
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#0d1117",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span style={{ color: c.text, fontSize: "20px", fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>{score}</span>
          <span style={{ color: "#c9d1d9", fontSize: "9px", letterSpacing: "0.05em" }}>SCORE</span>
        </div>
      </div>
      <RiskBadge risk={level} />
    </div>
  );
}
