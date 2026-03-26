import { ICONS } from "../common/Icons";

export default function ScanButton({ analyze, loading, inputType, fileName, content }) {
  return (
    <button
      className="scan-btn"
      onClick={analyze}
      disabled={loading || (inputType === "file" ? !fileName : !content.trim())}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "14px",
        borderRadius: "8px",
        border: "1px solid #00ff41",
        background: loading ? "#00ff4111" : "#00ff4122",
        color: "#00ff41",
        fontSize: "13px",
        fontFamily: "monospace",
        fontWeight: 600,
        cursor: loading || !content.trim() ? "not-allowed" : "pointer",
        letterSpacing: "0.1em",
        transition: "all 0.2s",
        opacity: (inputType === "file" ? !fileName : !content.trim()) ? 0.4 : 1,
      }}
    >
      {loading ? (
        <>
          <div style={{ width: "14px", height: "14px", border: "2px solid #00ff41", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          SCANNING...
        </>
      ) : (
        <>
          {ICONS.scan} RUN ANALYSIS
        </>
      )}
    </button>
  );
}
