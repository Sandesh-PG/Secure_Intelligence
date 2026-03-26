export default function ChatInput({ content, setContent }) {
  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={"// Enter your chat message here...\n// e.g. My token is sk-abc123, is it safe?"}
        style={{
          width: "100%",
          minHeight: "200px",
          background: "#161b22",
          border: "1px solid #00ff4133",
          borderRadius: "8px",
          padding: "14px",
          color: "#c9d1d9",
          fontFamily: "monospace",
          fontSize: "12px",
          lineHeight: "1.6",
          outline: "none",
        }}
      />
      <button
        onClick={() => setContent("")}
        style={{
          marginTop: "8px",
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #00ff41",
          background: "#00ff4122",
          color: "#00ff41",
          fontSize: "10px",
          fontFamily: "monospace",
          cursor: "pointer",
          letterSpacing: "0.08em",
          transition: "0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#00ff41";
          e.target.style.color = "#0d1117";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#00ff4122";
          e.target.style.color = "#00ff41";
        }}
      >
        CLEAR
      </button>
    </div>
  );
}
