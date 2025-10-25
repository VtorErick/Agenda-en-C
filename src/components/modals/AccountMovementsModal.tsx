import { AccountSummary, ActivityItem } from "../../modules/banking/domain/types";
import { formatCurrency, formatDateTime } from "../../modules/banking/utils/format";
import { Modal } from "../Modal";

interface AccountMovementsModalProps {
  account: AccountSummary;
  activity: ActivityItem[];
  onClose: () => void;
}

export function AccountMovementsModal({ account, activity, onClose }: AccountMovementsModalProps) {
  return (
    <Modal
      title={`Movimientos de ${account.type.toLowerCase()}`}
      subtitle={`${account.number} · Saldo actual ${formatCurrency(account.balance, account.currency)}`}
      onClose={onClose}
      width="min(720px, 94vw)"
    >
      <div className="movements-table">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item) => (
              <tr key={item.id}>
                <td>{formatDateTime(item.timestamp)}</td>
                <td>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </td>
                <td>
                  <span className="badge badge-tonal">{item.category}</span>
                </td>
                <td className={item.amount < 0 ? "negative" : "positive"}>
                  {formatCurrency(item.amount, item.currency, { signDisplay: "exceptZero" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
