import { RISK_COLORS } from "../../constants/riskColors";
import ScoreGauge from "./ScoreGauge";
import FindingRow from "./FindingRow";
import Insights from "./Insights";
import MaskedOutput from "./MaskedOutput";

export default function ResultsPanel({ result, loading, onClear }) {
  const riskC = result ? (RISK_COLORS[result.risk_level] || RISK_COLORS.none) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflow: "hidden" }}>
      <div style={{ fontSize: "11px", color: "#c9d1d9", letterSpacing: "0.15em", flexShrink: 0 }}>// ANALYSIS RESULTS</div>

      {!result && !loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", color: "#21262d", gap: "12px", overflow: "hidden" }}>
          <div style={{ fontSize: "48px", opacity: 0.3 }}>⬡</div>
          <div style={{ fontSize: "12px", letterSpacing: "0.1em" }}>AWAITING INPUT</div>
        </div>
      )}

      {loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px", overflow: "hidden" }}>
          <div style={{ width: "48px", height: "48px", border: "3px solid #21262d", borderTopColor: "#00ff41", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <div style={{ color: "#c9d1d9", fontSize: "12px", letterSpacing: "0.1em", animation: "pulse 1.5s ease infinite" }}>ANALYZING...</div>
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeSlide 0.4s ease", flex: 1,paddingRight: "8px" }}>
          <div style={{ background: "#161b22", border: `1px solid ${riskC.border}`, borderRadius: "8px", padding: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
            <ScoreGauge score={result.risk_score} level={result.risk_level} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "#c9d1d9", letterSpacing: "0.15em", marginBottom: "6px" }}>SUMMARY</div>
              <div style={{ fontSize: "12px", color: "#c9d1d9", lineHeight: "1.5" }}>{result.summary}</div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", color: "#6e7681" }}>type: <span style={{ color: "#c9d1d9" }}>{result.content_type}</span></span>
                <span style={{ fontSize: "10px", color: "#6e7681" }}>action: <span style={{ color: result.action === "masked" ? "#00ff41" : result.action === "flagged" ? "#f6ad55" : "#c9d1d9" }}>{result.action}</span></span>
                <span style={{ fontSize: "10px", color: "#6e7681" }}>findings: <span style={{ color: "#c9d1d9" }}>{result.findings.length}</span></span>
              </div>
            </div>
          </div>

          {/* {result.findings.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", color: "#4a5568", letterSpacing: "0.15em", marginBottom: "8px" }}>FINDINGS ({result.findings.length})</div>
              {result.findings.map((f, i) => <FindingRow key={i} finding={f} index={i} />)}
            </div>
          )} */}

            {result.findings.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                        <div style={{ fontSize: "10px", color: "#c9d1d9", letterSpacing: "0.15em", marginBottom: "8px" }}>
                        FINDINGS ({result.findings.length})
                        </div>

                        <div style={{
                        maxHeight: "300px",   // ✅ controls height
                        overflowY: "auto",    // ✅ scroll ONLY here
                        paddingRight: "4px"
                        }}>
                        {result.findings.map((f, i) => (
                            <FindingRow key={i} finding={f} index={i} />
                        ))}
                        </div>
                    </div>
            )}
          <Insights insights={result.insights} />

          <MaskedOutput maskedContent={result.masked_content} />

          <button
            onClick={onClear}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #21262d",
              background: "transparent",
              color: "#c9d1d9",
              fontSize: "11px",
              fontFamily: "monospace",
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            CLEAR / NEW SCAN
          </button>
        </div>
      )}
    </div>
  );
}
