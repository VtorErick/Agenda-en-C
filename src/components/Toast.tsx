interface ToastProps {
  message: string;
  tone?: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, tone = "success", onClose }: ToastProps) {
  const background = tone === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(248, 113, 113, 0.2)";
  const border = tone === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(248, 113, 113, 0.45)";
  const textColor = tone === "success" ? "#bbf7d0" : "#fecaca";

  return (
    <div className="toast" role="status" style={{ background, border: `1px solid ${border}` }}>
      <span style={{ color: textColor }}>{message}</span>
      <button
        onClick={onClose}
        className="button-ghost"
        style={{ padding: "0.35rem 0.9rem" }}
      >
        Cerrar
      </button>
    </div>
  );
}
