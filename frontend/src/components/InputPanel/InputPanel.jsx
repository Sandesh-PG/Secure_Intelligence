import InputTypeSelector from "./InputTypeSelector";
import FileUpload from "./FileUpload";
import TextInput from "./TextInput";
import ChatInput from "./ChatInput";
import OptionsToggle from "./OptionsToggle";
import ScanButton from "./ScanButton";

export default function InputPanel({
  inputType,
  setInputType,
  content,
  setContent,
  mask,
  setMask,
  blockHigh,
  setBlockHigh,
  loading,
  error,
  dragOver,
  setDragOver,
  fileName,
  fileRef,
  handleFile,
  handleDrop,
  analyze,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontSize: "11px", color: "#c9d1d9", letterSpacing: "0.15em" }}>// INPUT</div>

      <InputTypeSelector inputType={inputType} setInputType={setInputType} />

      {inputType === "file" && (
        <FileUpload
          dragOver={dragOver}
          setDragOver={setDragOver}
          fileName={fileName}
          fileRef={fileRef}
          handleFile={handleFile}
          handleDrop={handleDrop}
        />
      )}

      {inputType === "chat" && <ChatInput content={content} setContent={setContent} />}

      {["log", "text", "sql"].includes(inputType) && (
        <TextInput content={content} setContent={setContent} inputType={inputType} />
      )}

      <OptionsToggle mask={mask} setMask={setMask} blockHigh={blockHigh} setBlockHigh={setBlockHigh} />

      <ScanButton
        analyze={analyze}
        loading={loading}
        inputType={inputType}
        fileName={fileName}
        content={content}
      />

      {error && (
        <div style={{ background: "#3d0f0f", border: "1px solid #e53e3e", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#fc8181" }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
