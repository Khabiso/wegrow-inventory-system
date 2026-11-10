
export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: "245px",
        width: "calc(100% - 245px)",
        height: "46px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        borderTop: "1px solid #e5e9ed",
        zIndex: 100,
        boxSizing: "border-box",
      }}
      className="app-footer"
    >
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        © 2026 WeGrow (PTY) Ltd. All rights reserved.
      </p>
    </footer>
  );
}
