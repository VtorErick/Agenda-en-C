import { FormEvent, useMemo, useState } from "react";
import {
  AccountSummary,
  ContactSummary,
  OperationRequest
} from "../../modules/banking/domain/types";
import { OperationState } from "../../modules/banking/hooks/useBankingDashboard";
import { formatCurrency, formatDateTime } from "../../modules/banking/utils/format";
import { Modal } from "../Modal";

interface TransferModalProps {
  accounts: AccountSummary[];
  contacts: ContactSummary[];
  defaultAccountId?: string;
  onSubmit: (payload: OperationRequest) => Promise<void>;
  onClose: () => void;
  operationState: OperationState;
}

export function TransferModal({
  accounts,
  contacts,
  defaultAccountId,
  onSubmit,
  onClose,
  operationState
}: TransferModalProps) {
  const [selectedContact, setSelectedContact] = useState<string>(contacts[0]?.id ?? "");
  const [selectedAccount, setSelectedAccount] = useState<string>(defaultAccountId ?? accounts[0]?.id ?? "");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const account = useMemo(
    () => accounts.find((item) => item.id === selectedAccount) ?? accounts[0],
    [accounts, selectedAccount]
  );
  const contact = useMemo(
    () => contacts.find((item) => item.id === selectedContact) ?? contacts[0],
    [contacts, selectedContact]
  );

  const pendingTransfer =
    operationState.status === "pending" && operationState.operation === "scheduleTransfer";
  const errorTransfer =
    operationState.status === "error" && operationState.operation === "scheduleTransfer";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact || !account) {
      return;
    }
    const numericAmount = Number.parseFloat(amount || "0");
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    await onSubmit({
      accountId: account.id,
      contactId: contact.id,
      amount: Number(numericAmount.toFixed(2)),
      notes: notes.trim() ? notes.trim() : undefined
    });
  };

  const accountBalance = account ? formatCurrency(account.balance, account.currency) : "";

  return (
    <Modal
      title="Transferir a contacto"
      subtitle="Selecciona un destinatario guardado y confirma el envío inmediato"
      onClose={onClose}
    >
      <form className="transfer-form" onSubmit={handleSubmit}>
        <section className="transfer-section">
          <span className="section-label">Destinatarios frecuentes</span>
          <div className="contact-grid">
            {contacts.map((item) => {
              const isActive = item.id === contact?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="contact-card"
                  data-active={isActive}
                  onClick={() => setSelectedContact(item.id)}
                >
                  <span className="contact-avatar" style={{ background: item.avatarColor }}>
                    {item.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <strong>{item.nickname ?? item.name}</strong>
                  <span>{item.bank}</span>
                  {item.lastTransferAt && (
                    <small>
                      Última transferencia: {formatDateTime(item.lastTransferAt)} ·
                      {" "}
                      {item.lastTransferAmount
                        ? formatCurrency(item.lastTransferAmount, account?.currency ?? "USD")
                        : "--"}
                    </small>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="transfer-section">
          <span className="section-label">Cuenta origen</span>
          <div className="transfer-inputs">
            <label className="field">
              <span>Selecciona cuenta</span>
              <select
                value={selectedAccount}
                onChange={(event) => setSelectedAccount(event.target.value)}
                required
              >
                {accounts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.type} · {item.number}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Monto a transferir</span>
              <input
                type="number"
                min={1}
                step={0.01}
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
              <small>Saldo disponible: {accountBalance}</small>
            </label>
          </div>
          <label className="field">
            <span>Mensaje para el destinatario (opcional)</span>
            <textarea
              placeholder="Descripción que verás en tus movimientos"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </section>

        {errorTransfer && (
          <div className="form-error">
            {operationState.message ?? "No fue posible realizar la transferencia."}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="button-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button-primary" disabled={pendingTransfer}>
            {pendingTransfer ? "Enviando…" : "Confirmar transferencia"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
