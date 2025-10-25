import { ActivityItem } from "../modules/banking/domain/types";
import { formatCurrency, formatDateTime } from "../modules/banking/utils/format";

interface ActivityTableProps {
  activity: ActivityItem[];
}

const categoryColor: Record<ActivityItem["category"], string> = {
  Pago: "rgba(99, 102, 241, 0.35)",
  Ingreso: "rgba(34, 197, 94, 0.35)",
  Tarjeta: "rgba(14, 165, 233, 0.35)",
  Transferencia: "rgba(249, 115, 22, 0.35)"
};

export function ActivityTable({ activity }: ActivityTableProps) {
  return (
    <div className="card fade-in">
      <div className="section-title">
        <h2>Actividad reciente</h2>
        <button className="button-ghost">Descargar estado</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Movimiento</th>
            <th>Detalle</th>
            <th>Fecha</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((item) => (
            <tr key={item.id}>
              <td>
                <span
                  className="badge"
                  style={{
                    background: categoryColor[item.category],
                    color: "#f8fafc"
                  }}
                >
                  {item.category}
                </span>
              </td>
              <td>
                <strong style={{ display: "block" }}>{item.title}</strong>
                <span style={{ color: "rgba(226, 232, 240, 0.7)", fontSize: "0.9rem" }}>
                  {item.description}
                </span>
              </td>
              <td>{formatDateTime(item.timestamp)}</td>
              <td>
                <strong>
                  {formatCurrency(item.amount, item.currency, { signDisplay: "exceptZero" })}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
