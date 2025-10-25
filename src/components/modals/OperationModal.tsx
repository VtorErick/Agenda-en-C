import { FormEvent, useMemo, useState } from "react";
import {
  AccountSummary,
  CardSummary,
  OperationKind,
  OperationRequest
} from "../../modules/banking/domain/types";
import { getOperationDescriptor } from "../../modules/banking/domain/operationCatalog";
import { OperationState } from "../../modules/banking/hooks/useBankingDashboard";
import { formatCurrency } from "../../modules/banking/utils/format";
import { Modal } from "../Modal";

interface OperationModalProps {
  operation: OperationKind;
  cards: CardSummary[];
  accounts: AccountSummary[];
  defaults?: OperationRequest;
  onSubmit: (payload: OperationRequest) => Promise<void>;
  onClose: () => void;
  operationState: OperationState;
}

const confirmLabel: Record<OperationKind, string> = {
  payCreditCard: "Aplicar pago",
  lockCard: "Confirmar bloqueo",
  requestIncrease: "Enviar solicitud",
  setTravelNotice: "Registrar aviso",
  scheduleTransfer: "Guardar", // no usado pero requerido por el tipo
  acknowledgeNotification: "Guardar" // no usado
};

export function OperationModal({
  operation,
  cards,
  accounts,
  defaults,
  onSubmit,
  onClose,
  operationState
}: OperationModalProps) {
  const descriptor = getOperationDescriptor(operation);
  const requiresCard = descriptor?.requiresCard ?? false;
  const [cardId, setCardId] = useState<string>(defaults?.cardId ?? cards[0]?.id ?? "");
  const [accountId, setAccountId] = useState<string>(defaults?.accountId ?? accounts[0]?.id ?? "");
  const [amount, setAmount] = useState<string>(defaults?.amount ? String(defaults.amount) : "");
  const [notes, setNotes] = useState<string>(defaults?.notes ?? "");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [desiredLimit, setDesiredLimit] = useState<string>("");

  const selectedCard = useMemo(
    () => cards.find((item) => item.id === cardId) ?? cards[0],
    [cards, cardId]
  );

  const selectedAccount = useMemo(
    () => accounts.find((item) => item.id === accountId) ?? accounts[0],
    [accounts, accountId]
  );

  const isPending = operationState.status === "pending" && operationState.operation === operation;
  const isError = operationState.status === "error" && operationState.operation === operation;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: OperationRequest = {};
    if (requiresCard && selectedCard) {
      payload.cardId = selectedCard.id;
    }
    if (selectedAccount) {
      payload.accountId = selectedAccount.id;
    }

    switch (operation) {
      case "payCreditCard": {
        const numericAmount = Number.parseFloat(amount || "0");
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
          return;
        }
        payload.amount = Number(numericAmount.toFixed(2));
        payload.notes = notes.trim() ? notes.trim() : `Pago desde ${selectedAccount?.type ?? "cuenta"}`;
        break;
      }
      case "lockCard": {
        payload.notes = notes.trim() ? notes.trim() : "Bloqueo temporal solicitado desde la app.";
        break;
      }
      case "requestIncrease": {
        const desired = Number.parseFloat(desiredLimit || "0");
        const formattedDesired = !Number.isNaN(desired) && desired > 0 && selectedCard
          ? formatCurrency(desired, "USD")
          : null;
        payload.notes = notes.trim()
          ? notes.trim()
          : formattedDesired
          ? `Revisión de límite a ${formattedDesired}`
          : "Solicitar incremento de línea";
        if (!Number.isNaN(desired) && desired > 0) {
          payload.amount = Number(desired.toFixed(2));
        }
        break;
      }
      case "setTravelNotice": {
        const range = [startDate, endDate].filter(Boolean).join(" al ");
        const detail = [destination.trim(), range].filter(Boolean).join(" · ");
        payload.notes = detail || "Viaje sin destino especificado";
        break;
      }
      default:
        break;
    }

    await onSubmit(payload);
  };

  return (
    <Modal
      title={descriptor?.title ?? "Operación"}
      subtitle={descriptor?.description}
      onClose={onClose}
    >
      <form className="operation-form" onSubmit={handleSubmit}>
        {requiresCard && (
          <label className="field">
            <span>Selecciona tarjeta</span>
            <select value={cardId} onChange={(event) => setCardId(event.target.value)} required>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.label} · •••• {card.lastFour}
                </option>
              ))}
            </select>
          </label>
        )}

        {operation === "payCreditCard" && (
          <label className="field">
            <span>Cuenta de débito</span>
            <select value={accountId} onChange={(event) => setAccountId(event.target.value)} required>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.type} · {account.number}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <small>Saldo disponible: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}</small>
            )}
          </label>
        )}

        {operation === "payCreditCard" && (
          <label className="field">
            <span>Monto del pago</span>
            <input
              type="number"
              min={1}
              step={0.01}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>
        )}

        {operation === "requestIncrease" && (
          <label className="field">
            <span>Límite deseado</span>
            <input
              type="number"
              min={selectedCard ? selectedCard.limit : 0}
              step={100}
              value={desiredLimit}
              onChange={(event) => setDesiredLimit(event.target.value)}
              placeholder={selectedCard ? String(Math.round(selectedCard.limit * 1.2)) : undefined}
            />
          </label>
        )}

        {operation === "setTravelNotice" && (
          <div className="travel-grid">
            <label className="field">
              <span>Destino principal</span>
              <input
                type="text"
                placeholder="Ej. Madrid, España"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Salida</span>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label className="field">
              <span>Regreso</span>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
          </div>
        )}

        <label className="field">
          <span>{operation === "lockCard" ? "Motivo del bloqueo" : "Notas adicionales"}</span>
          <textarea
            rows={operation === "lockCard" ? 3 : 2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={operation === "lockCard" ? "Ej. Robo del teléfono en viaje" : "Agregar detalles"}
          />
        </label>

        {isError && (
          <div className="form-error">
            {operationState.message ?? "Ocurrió un problema al ejecutar la operación."}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="button-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button-primary" disabled={isPending}>
            {isPending ? "Procesando…" : confirmLabel[operation] ?? "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
