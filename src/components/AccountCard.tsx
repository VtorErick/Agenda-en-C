import { AccountSummary } from "../modules/banking/domain/types";
import { formatCurrency } from "../modules/banking/utils/format";

interface AccountCardProps {
  account: AccountSummary;
  onTransfer: (accountId: string) => void;
  onViewMovements: (accountId: string) => void;
}

export function AccountCard({ account, onTransfer, onViewMovements }: AccountCardProps) {
  return (
    <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "rgba(226, 232, 240, 0.75)" }}>{account.type}</span>
        <span className="badge">{account.number}</span>
      </div>
      <strong style={{ fontSize: "1.8rem" }}>{formatCurrency(account.balance, account.currency)}</strong>
      <p style={{ margin: 0, color: "rgba(226, 232, 240, 0.65)" }}>
        Disponible para operar
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button className="button-primary" onClick={() => onTransfer(account.id)}>
          Transferir
        </button>
        <button className="button-ghost" onClick={() => onViewMovements(account.id)}>
          Ver movimientos
        </button>
      </div>
    </div>
  );
}
