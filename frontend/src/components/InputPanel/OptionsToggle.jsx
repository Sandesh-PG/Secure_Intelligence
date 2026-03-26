export default function OptionsToggle({ mask, setMask, blockHigh, setBlockHigh }) {
  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#8b949e" }}>
        <label className="toggle"><input type="checkbox" checked={mask} onChange={(e) => setMask(e.target.checked)} /><span className="slider" /></label>
        Mask sensitive values
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#8b949e" }}>
        <label className="toggle"><input type="checkbox" checked={blockHigh} onChange={(e) => setBlockHigh(e.target.checked)} /><span className="slider" /></label>
        Block high risk
      </label>
    </div>
  );
}
