import { useState, useRef, useCallback } from "react";

const API_URL = "http://localhost:8000";

const RISK_COLORS = {
  critical: { bg: "#3d0f0f", border: "#e53e3e", text: "#fc8181", badge: "#e53e3e" },
  high:     { bg: "#3d2a0f", border: "#dd6b20", text: "#f6ad55", badge: "#dd6b20" },
  medium:   { bg: "#3d3a0f", border: "#d69e2e", text: "#f6e05e", badge: "#d69e2e" },
  low:      { bg: "#0f2d1f", border: "#38a169", text: "#68d391", badge: "#38a169" },
  none:     { bg: "#1a1a2e", border: "#4a5568", text: "#a0aec0", badge: "#4a5568" },
};

const ICONS = {
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  scan:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  alert:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><triangle points="10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  file:   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  close:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

function RiskBadge({ risk }) {
  const c = RISK_COLORS[risk] || RISK_COLORS.none;
  return (
    <span style={{
      background: c.badge, color: "#fff", fontSize: "10px", fontWeight: 700,
      padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.08em",
      textTransform: "uppercase", fontFamily: "monospace",
    }}>{risk}</span>
  );
}

function FindingRow({ finding, index }) {
  const c = RISK_COLORS[finding.risk] || RISK_COLORS.none;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "32px 1fr auto auto",
      alignItems: "center", gap: "12px", padding: "10px 14px",
      background: c.bg, borderLeft: `3px solid ${c.border}`,
      borderRadius: "0 6px 6px 0", marginBottom: "6px",
      animation: `fadeSlide 0.3s ease ${index * 0.05}s both`,
    }}>
      <span style={{ color: c.text, fontSize: "11px", fontFamily: "monospace" }}>
        L{finding.line}
      </span>
      <div>
        <span style={{ color: c.text, fontFamily: "monospace", fontSize: "13px", fontWeight: 600 }}>
          {finding.type}
        </span>
        <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "monospace", marginLeft: "8px" }}>
          {finding.context}
        </span>
      </div>
      <span style={{ color: "#8b949e", fontFamily: "monospace", fontSize: "12px" }}>
        {finding.value}
      </span>
      <RiskBadge risk={finding.risk} />
    </div>
  );
}

function ScoreGauge({ score, level }) {
  const c = RISK_COLORS[level] || RISK_COLORS.none;
  const pct = Math.min((score / 30) * 100, 100);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 8px",
        background: `conic-gradient(${c.badge} ${pct * 3.6}deg, #1e2433 0deg)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 20px ${c.badge}44`,
      }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%", background: "#0d1117",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        }}>
          <span style={{ color: c.text, fontSize: "20px", fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>{score}</span>
          <span style={{ color: "#4a5568", fontSize: "9px", letterSpacing: "0.05em" }}>SCORE</span>
        </div>
      </div>
      <RiskBadge risk={level} />
    </div>
  );
}

export default function App() {
  const [inputType, setInputType] = useState("log");
  const [content, setContent] = useState("");
  const [mask, setMask] = useState(false);
  const [blockHigh, setBlockHigh] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setContent(e.target.result);
    reader.readAsText(file);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "log") setInputType("log");
    else if (ext === "sql") setInputType("sql");
    else setInputType("file");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const analyze = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: inputType,
          content,
          options: { mask, block_high_risk: blockHigh, log_analysis: true },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const riskC = result ? (RISK_COLORS[result.risk_level] || RISK_COLORS.none) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 8px #00ff4122; } 50% { box-shadow: 0 0 24px #00ff4166; } }
        textarea { resize: vertical; }
        button:hover { filter: brightness(1.15); }
        .scan-btn:active { transform: scale(0.97); }
        .toggle { position: relative; display: inline-block; width: 36px; height: 20px; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background: #21262d; border-radius: 20px; transition: .3s; }
        .slider:before { content: ""; position: absolute; height: 14px; width: 14px; left: 3px; bottom: 3px; background: #4a5568; border-radius: 50%; transition: .3s; }
        input:checked + .slider { background: #00ff41; }
        input:checked + .slider:before { transform: translateX(16px); background: #0d1117; }
      `}</style>

      {/* Header */}
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

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* LEFT — Input Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "11px", color: "#4a5568", letterSpacing: "0.15em" }}>// INPUT</div>

          {/* Input type selector */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["log", "text", "sql", "file", "chat"].map(t => (
              <button key={t} onClick={() => setInputType(t)} style={{
                padding: "5px 14px", borderRadius: "4px", border: "1px solid",
                borderColor: inputType === t ? "#00ff41" : "#21262d",
                background: inputType === t ? "#00ff4111" : "transparent",
                color: inputType === t ? "#00ff41" : "#6e7681",
                fontSize: "11px", fontFamily: "monospace", cursor: "pointer",
                letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s",
              }}>{t}</button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? "#00ff41" : "#21262d"}`,
              borderRadius: "8px", padding: "20px", textAlign: "center",
              cursor: "pointer", transition: "all 0.2s",
              background: dragOver ? "#00ff4108" : "transparent",
            }}
          >
            <input ref={fileRef} type="file" accept=".log,.txt,.sql" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ color: dragOver ? "#00ff41" : "#4a5568", marginBottom: "6px" }}>{ICONS.file}</div>
            {fileName
              ? <div style={{ color: "#00ff41", fontSize: "12px" }}>{fileName}</div>
              : <>
                  <div style={{ color: "#4a5568", fontSize: "12px" }}>Drop file here or click to upload</div>
                  <div style={{ color: "#4a5568", fontSize: "10px", marginTop: "4px" }}>.log · .txt · .sql</div>
                </>
            }
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`// Paste ${inputType} content here...\n// e.g. 2026-03-10 10:00:01 INFO login\n//      password=admin123\n//      api_key=sk-prod-xyz`}
            style={{
              width: "100%", minHeight: "200px", background: "#161b22",
              border: "1px solid #21262d", borderRadius: "8px", padding: "14px",
              color: "#c9d1d9", fontFamily: "monospace", fontSize: "12px",
              lineHeight: "1.6", outline: "none",
            }}
          />

          {/* Options */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#8b949e" }}>
              <label className="toggle"><input type="checkbox" checked={mask} onChange={e => setMask(e.target.checked)} /><span className="slider" /></label>
              Mask sensitive values
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#8b949e" }}>
              <label className="toggle"><input type="checkbox" checked={blockHigh} onChange={e => setBlockHigh(e.target.checked)} /><span className="slider" /></label>
              Block high risk
            </label>
          </div>

          {/* Scan button */}
          <button className="scan-btn" onClick={analyze} disabled={loading || !content.trim()} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "14px", borderRadius: "8px", border: "1px solid #00ff41",
            background: loading ? "#00ff4111" : "#00ff4122", color: "#00ff41",
            fontSize: "13px", fontFamily: "monospace", fontWeight: 600,
            cursor: loading || !content.trim() ? "not-allowed" : "pointer",
            letterSpacing: "0.1em", transition: "all 0.2s",
            opacity: !content.trim() ? 0.4 : 1,
          }}>
            {loading
              ? <><div style={{ width: "14px", height: "14px", border: "2px solid #00ff41", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> SCANNING...</>
              : <>{ICONS.scan} RUN ANALYSIS</>
            }
          </button>

          {error && (
            <div style={{ background: "#3d0f0f", border: "1px solid #e53e3e", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#fc8181" }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* RIGHT — Results Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "11px", color: "#4a5568", letterSpacing: "0.15em" }}>// ANALYSIS RESULTS</div>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", color: "#21262d", gap: "12px" }}>
              <div style={{ fontSize: "48px", opacity: 0.3 }}>⬡</div>
              <div style={{ fontSize: "12px", letterSpacing: "0.1em" }}>AWAITING INPUT</div>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", border: "3px solid #21262d", borderTopColor: "#00ff41", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ color: "#4a5568", fontSize: "12px", letterSpacing: "0.1em", animation: "pulse 1.5s ease infinite" }}>ANALYZING...</div>
            </div>
          )}

          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeSlide 0.4s ease" }}>

              {/* Risk overview */}
              <div style={{ background: "#161b22", border: `1px solid ${riskC.border}`, borderRadius: "8px", padding: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
                <ScoreGauge score={result.risk_score} level={result.risk_level} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "10px", color: "#4a5568", letterSpacing: "0.15em", marginBottom: "6px" }}>SUMMARY</div>
                  <div style={{ fontSize: "12px", color: "#c9d1d9", lineHeight: "1.5" }}>{result.summary}</div>
                  <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", color: "#6e7681" }}>type: <span style={{ color: "#c9d1d9" }}>{result.content_type}</span></span>
                    <span style={{ fontSize: "10px", color: "#6e7681" }}>action: <span style={{ color: result.action === "masked" ? "#00ff41" : result.action === "flagged" ? "#f6ad55" : "#c9d1d9" }}>{result.action}</span></span>
                    <span style={{ fontSize: "10px", color: "#6e7681" }}>findings: <span style={{ color: "#c9d1d9" }}>{result.findings.length}</span></span>
                  </div>
                </div>
              </div>

              {/* Findings */}
              {result.findings.length > 0 && (
                <div>
                  <div style={{ fontSize: "10px", color: "#4a5568", letterSpacing: "0.15em", marginBottom: "8px" }}>FINDINGS ({result.findings.length})</div>
                  {result.findings.map((f, i) => <FindingRow key={i} finding={f} index={i} />)}
                </div>
              )}

              {/* AI Insights */}
              {result.insights?.length > 0 && (
                <div style={{ background: "#0d1f0d", border: "1px solid #1a4d1a", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ fontSize: "10px", color: "#4a9e4a", letterSpacing: "0.15em", marginBottom: "10px" }}>⚡ AI INSIGHTS</div>
                  {result.insights.map((ins, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start", animation: `fadeSlide 0.3s ease ${i * 0.08}s both` }}>
                      <span style={{ color: "#00ff41", marginTop: "1px", flexShrink: 0 }}>{ICONS.check}</span>
                      <span style={{ fontSize: "12px", color: "#68d391", lineHeight: "1.5" }}>{ins}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Masked content */}
              {result.masked_content && (
                <div>
                  <div style={{ fontSize: "10px", color: "#4a5568", letterSpacing: "0.15em", marginBottom: "8px" }}>MASKED OUTPUT</div>
                  <pre style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "12px", fontSize: "11px", color: "#8b949e", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                    {result.masked_content}
                  </pre>
                </div>
              )}

              {/* Clear */}
              <button onClick={() => { setResult(null); setContent(""); setFileName(null); }} style={{
                padding: "8px", borderRadius: "6px", border: "1px solid #21262d",
                background: "transparent", color: "#4a5568", fontSize: "11px",
                fontFamily: "monospace", cursor: "pointer", letterSpacing: "0.08em",
              }}>
                CLEAR / NEW SCAN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}