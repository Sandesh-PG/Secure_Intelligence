import { useState, useRef, useCallback } from "react";
import Header from "./components/Header";
import InputPanel from "./components/InputPanel/InputPanel";
import ResultsPanel from "./components/ResultsPanel/ResultsPanel";
import { API_URL } from "./constants/api";

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
    if (inputType === "file" && !fileName) return;
    if (inputType !== "file" && !content.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res;
      if (inputType === "file" && fileRef.current?.files[0]) {
        // Send as multipart for real file parsing (PDF, DOCX etc.)
        const formData = new FormData();
        formData.append("file", fileRef.current.files[0]);
        formData.append("options", JSON.stringify({ mask, block_high_risk: blockHigh, log_analysis: true }));
        res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
      } else {
        res = await fetch(`${API_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input_type: inputType,
            content,
            options: { mask, block_high_risk: blockHigh, log_analysis: true },
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
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

      <Header />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flex: 1, overflow: "hidden", width: "100%" }}>
        <InputPanel
          inputType={inputType}
          setInputType={setInputType}
          content={content}
          setContent={setContent}
          mask={mask}
          setMask={setMask}
          blockHigh={blockHigh}
          setBlockHigh={setBlockHigh}
          loading={loading}
          error={error}
          dragOver={dragOver}
          setDragOver={setDragOver}
          fileName={fileName}
          fileRef={fileRef}
          handleFile={handleFile}
          handleDrop={handleDrop}
          analyze={analyze}
        />

        <ResultsPanel
          result={result}
          loading={loading}
          onClear={() => {
            setResult(null);
            setContent("");
            setFileName(null);
          }}
        />
      </div>
    </div>
  );
}