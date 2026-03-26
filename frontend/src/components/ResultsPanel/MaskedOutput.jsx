export default function MaskedOutput({ maskedContent }) {
  if (!maskedContent) return null;

  return (
    <div>
      <div style={{ fontSize: "10px", color: "#c9d1d9", letterSpacing: "0.15em", marginBottom: "8px" }}>MASKED OUTPUT</div>
      <pre style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "12px", fontSize: "11px", color: "#8b949e", overflowX: "auto", whiteSpace: "pre-wrap" }}>
        {maskedContent}
      </pre>
    </div>
  );
}
