import { UserProfile } from "../modules/banking/domain/types";
import { formatDateTime } from "../modules/banking/utils/format";

interface HeaderProps {
  user: UserProfile;
  onOpenNotifications: () => void;
}

export function Header({ user, onOpenNotifications }: HeaderProps) {
  return (
    <header
      style={{
        padding: "2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <span className="badge">Portal Aurora</span>
        <h1 style={{ fontSize: "2rem", margin: "0.75rem 0 0.35rem" }}>
          Hola, {user.name.split(" ")[0]} ✨
        </h1>
        <p style={{ color: "rgba(226, 232, 240, 0.75)", margin: 0 }}>
          Último acceso: {formatDateTime(user.lastLogin)}
        </p>
      </div>
      <div
        className="card fade-in"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem"
        }}
      >
        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, #22d3ee, #6366f1)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "1.25rem"
          }}
        >
          {user.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
          <p style={{ margin: 0, color: "rgba(226, 232, 240, 0.75)", fontSize: "0.9rem" }}>
            Nivel {user.tier}
          </p>
        </div>
        <button className="button-ghost" onClick={onOpenNotifications}>
          Notificaciones ({user.notifications})
        </button>
      </div>
    </header>
  );
}
