export default function InputTypeSelector({ inputType, setInputType }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {["log", "text", "sql", "file", "chat"].map((t) => (
        <button
          key={t}
          onClick={() => setInputType(t)}
          style={{
            padding: "5px 14px",
            borderRadius: "4px",
            border: "1px solid",
            borderColor: inputType === t ? "#00ff41" : "#21262d",
            background: inputType === t ? "#00ff4111" : "transparent",
            color: inputType === t ? "#00ff41" : "#6e7681",
            fontSize: "11px",
            fontFamily: "monospace",
            cursor: "pointer",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
