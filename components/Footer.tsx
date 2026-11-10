
export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        left: "auto",
        bottom: "auto",
        width: "100%",
        minHeight: "46px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 16px",
        background: "#ffffff",
        borderTop: "1px solid #e5e9ed",
        boxSizing: "border-box",
        marginTop: "auto",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "12px",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        © 2026 WeGrow (PTY) Ltd. All rights reserved.
      </p>
    </footer>
  );
}
