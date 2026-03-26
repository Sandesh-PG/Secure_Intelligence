import { ICONS } from "../common/Icons";

export default function FileUpload({ dragOver, setDragOver, fileName, fileRef, handleFile, handleDrop }) {
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => fileRef.current.click()}
      style={{
        border: `2px dashed ${dragOver ? "#00ff41" : "#21262d"}`,
        borderRadius: "8px",
        padding: "40px 20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        background: dragOver ? "#00ff4108" : "transparent",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".log,.txt,.sql,.pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div style={{ color: dragOver ? "#00ff41" : "#6e7681", marginBottom: "10px" }}>{ICONS.file}</div>
      {fileName ? (
        <div style={{ color: "#00ff41", fontSize: "12px" }}>{fileName}</div>
      ) : (
        <>
          <div style={{ color: "#6e7681", fontSize: "12px" }}>Drop file here or click to upload</div>
          <div style={{ color: "#c9d1d9", fontSize: "10px", marginTop: "6px" }}>.log · .txt · .sql · .pdf · .doc · .docx</div>
        </>
      )}
    </div>
  );
}
