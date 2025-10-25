import {
  CardSummary,
  OperationKind,
  OperationRequest
} from "../modules/banking/domain/types";
import { OperationState } from "../modules/banking/hooks/useBankingDashboard";

interface OperationDefinition {
  key: OperationKind;
  title: string;
  description: string;
  accent: string;
  icon: string;
  requiresCard?: boolean;
  defaultPayload?: OperationRequest;
}

interface CardOperationsProps {
  cards: CardSummary[];
  primaryAccountId?: string;
  operationState: OperationState;
  onOperate: (operation: OperationKind, payload?: OperationRequest) => Promise<void>;
}

const operations: OperationDefinition[] = [
  {
    key: "payCreditCard",
    title: "Aplicar pago",
    description: "Acredita un pago inmediato a tu tarjeta.",
    accent: "linear-gradient(135deg, #22d3ee, #6366f1)",
    icon: "💠",
    requiresCard: true
  },
  {
    key: "lockCard",
    title: "Bloqueo temporal",
    description: "Suspende compras por pérdida o robo.",
    accent: "linear-gradient(135deg, #facc15, #f97316)",
    icon: "🛡️",
    requiresCard: true
  },
  {
    key: "requestIncrease",
    title: "Solicitar aumento",
    description: "Envía una evaluación de línea de crédito.",
    accent: "linear-gradient(135deg, #34d399, #10b981)",
    icon: "📈",
    requiresCard: true
  },
  {
    key: "setTravelNotice",
    title: "Aviso de viaje",
    description: "Activa tus tarjetas en nuevos destinos.",
    accent: "linear-gradient(135deg, #fb7185, #ec4899)",
    icon: "🗺️",
    requiresCard: true
  },
  {
    key: "scheduleTransfer",
    title: "Agendar transferencia",
    description: "Programa una transferencia futura entre cuentas.",
    accent: "linear-gradient(135deg, #38bdf8, #6366f1)",
    icon: "📆",
    defaultPayload: { amount: 520 }
  }
];

export function CardOperations({ cards, primaryAccountId, onOperate, operationState }: CardOperationsProps) {
  const isProcessing = operationState.status === "pending";
  const activeOperation = operationState.status === "pending" ? operationState.operation : null;

  return (
    <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="section-title">
        <h2>Operaciones con tarjetas</h2>
        <select
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            borderRadius: "0.75rem",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            color: "#e2e8f0",
            padding: "0.5rem 0.75rem"
          }}
          defaultValue=""
          disabled={isProcessing}
          onChange={(event) => {
            const { value } = event.target;
            if (value) {
              onOperate("payCreditCard", { cardId: value });
              event.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Selecciona tarjeta para pago rápido
          </option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.label} · •••• {card.lastFour}
            </option>
          ))}
        </select>
      </div>

      <div className="grid two-columns">
        {operations.map((operation) => {
          const targetCardId = operation.requiresCard ? cards[0]?.id : undefined;
          const payload: OperationRequest | undefined = operation.requiresCard
            ? { cardId: targetCardId, accountId: primaryAccountId, ...operation.defaultPayload }
            : { accountId: primaryAccountId, ...operation.defaultPayload };

          const pendingThisOperation = activeOperation === operation.key;

          return (
            <button
              key={operation.key}
              disabled={isProcessing}
              onClick={() => onOperate(operation.key, payload)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
                textAlign: "left",
                padding: "1.5rem",
                borderRadius: "1.25rem",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                color: "inherit",
                cursor: "pointer",
                transition: "transform 0.2s ease, border 0.2s ease",
                opacity: isProcessing && !pendingThisOperation ? 0.65 : 1
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-3px)";
                event.currentTarget.style.border = "1px solid rgba(148, 163, 184, 0.45)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "";
                event.currentTarget.style.border = "1px solid rgba(148, 163, 184, 0.25)";
              }}
              data-active={pendingThisOperation}
            >
              <span
                style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "0.9rem",
                  display: "grid",
                  placeItems: "center",
                  background: operation.accent,
                  fontSize: "1.5rem"
                }}
              >
                {operation.icon}
              </span>
              <strong style={{ fontSize: "1.1rem" }}>{operation.title}</strong>
              <span style={{ color: "rgba(226, 232, 240, 0.7)", fontSize: "0.9rem" }}>
                {operation.description}
              </span>
              {pendingThisOperation && (
                <span style={{ fontSize: "0.85rem", color: "rgba(148, 163, 184, 0.85)" }}>
                  Procesando…
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
