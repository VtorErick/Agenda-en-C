import { NotificationItem } from "../../modules/banking/domain/types";
import { formatDateTime } from "../../modules/banking/utils/format";
import { OperationState } from "../../modules/banking/hooks/useBankingDashboard";
import { Modal } from "../Modal";

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onAcknowledge: (notificationId: string) => void;
  operationState: OperationState;
}

const categoryLabel: Record<string, string> = {
  security: "Seguridad",
  payment: "Pagos",
  announcement: "Novedades"
};

export function NotificationsModal({
  notifications,
  onClose,
  onAcknowledge,
  operationState
}: NotificationsModalProps) {
  const isPending =
    operationState.status === "pending" && operationState.operation === "acknowledgeNotification";
  const isError =
    operationState.status === "error" && operationState.operation === "acknowledgeNotification";

  return (
    <Modal
      title="Centro de notificaciones"
      subtitle="Mantente al día con la actividad de tu banco"
      onClose={onClose}
      width="min(520px, 92vw)"
    >
      <div className="notification-list">
        {notifications.map((notification) => (
          <article key={notification.id} data-read={notification.read}>
            <header>
              <span className={`badge category-${notification.category}`}>
                {categoryLabel[notification.category] ?? notification.category}
              </span>
              <time>{formatDateTime(notification.createdAt)}</time>
            </header>
            <h3>{notification.title}</h3>
            <p>{notification.detail}</p>
            <footer>
              {!notification.read ? (
                <button
                  className="button-primary"
                  type="button"
                  disabled={isPending}
                  onClick={() => onAcknowledge(notification.id)}
                >
                  {isPending ? "Actualizando…" : "Marcar como leída"}
                </button>
              ) : (
                <span className="pill">Atendida</span>
              )}
            </footer>
          </article>
        ))}
      </div>
      {isError && (
        <div className="form-error" style={{ marginTop: "1.5rem" }}>
          {operationState.message ?? "No fue posible actualizar la notificación."}
        </div>
      )}
    </Modal>
  );
}
