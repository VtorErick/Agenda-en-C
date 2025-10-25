import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { AccountCard } from "./components/AccountCard";
import { CardOperations } from "./components/CardOperations";
import { ActivityTable } from "./components/ActivityTable";
import { Toast } from "./components/Toast";
import { useBankingDashboard } from "./modules/banking/hooks/useBankingDashboard";
import { OperationKind, OperationRequest } from "./modules/banking/domain/types";
import { formatCurrency } from "./modules/banking/utils/format";

function Loading() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ padding: "2rem 3rem", textAlign: "center" }}>
        <span className="badge">Cargando</span>
        <p style={{ fontSize: "1.1rem", marginTop: "1rem" }}>
          Preparando tu experiencia en Aurora Bank…
        </p>
      </div>
    </main>
  );
}

type ToastState = { message: string; tone: "success" | "error" } | null;

export default function App() {
  const { snapshot, loading, error, operationState, executeOperation, resetOperationState, refresh } =
    useBankingDashboard();
  const [toastState, setToastState] = useState<ToastState>(null);

  useEffect(() => {
    if (operationState.status === "success") {
      setToastState({ message: operationState.message, tone: "success" });
    } else if (operationState.status === "error") {
      setToastState({ message: operationState.message, tone: "error" });
    }
  }, [operationState]);

  const handleOperation = useCallback(
    async (operation: OperationKind, payload?: OperationRequest) => {
      await executeOperation(operation, payload);
    },
    [executeOperation]
  );

  const handleToastClose = useCallback(() => {
    setToastState(null);
    resetOperationState();
  }, [resetOperationState]);

  const featuredCards = useMemo(() => snapshot?.cards ?? [], [snapshot]);

  if (loading && !snapshot) {
    return <Loading />;
  }

  return (
    <>
      {snapshot && <Header user={snapshot.user} />}
      <main className="grid" style={{ gap: "2rem" }}>
        {error && (
          <div className="card" style={{ background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.4)" }}>
            <div className="section-title" style={{ marginBottom: "0.5rem" }}>
              <h2 style={{ color: "#fecaca" }}>No pudimos cargar toda la información</h2>
              <button className="button-primary" onClick={refresh}>
                Reintentar
              </button>
            </div>
            <p style={{ margin: 0, color: "rgba(248, 250, 252, 0.75)" }}>{error}</p>
          </div>
        )}

        {snapshot && (
          <section className="grid two-columns">
            {snapshot.accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </section>
        )}

        {snapshot && (
          <section className="grid two-columns" style={{ alignItems: "start" }}>
            <CardOperations
              cards={snapshot.cards}
              primaryAccountId={snapshot.accounts[0]?.id}
              onOperate={handleOperation}
              operationState={operationState}
            />
            <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="section-title">
                <h2>Tarjetas destacadas</h2>
                <button className="button-ghost" onClick={refresh}>
                  Actualizar
                </button>
              </div>
              {featuredCards.map((card) => (
                <article
                  key={card.id}
                  style={{
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    background:
                      card.brand === "Visa"
                        ? "linear-gradient(135deg, rgba(14, 165, 233, 0.5), rgba(59, 130, 246, 0.35))"
                        : "linear-gradient(135deg, rgba(244, 114, 182, 0.45), rgba(192, 132, 252, 0.35))",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    display: "grid",
                    gap: "0.6rem"
                  }}
                >
                  <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>{card.label}</span>
                  <strong style={{ fontSize: "1.3rem" }}>•••• {card.lastFour}</strong>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.8 }}>Límite</span>
                    <strong>{formatCurrency(card.limit, "USD")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.8 }}>Disponible</span>
                    <strong>{formatCurrency(card.available, "USD")}</strong>
                  </div>
                  <button
                    className="button-primary"
                    onClick={() => handleOperation("setTravelNotice", { cardId: card.id })}
                    disabled={operationState.status === "pending"}
                  >
                    Aviso de viaje
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {snapshot && <ActivityTable activity={snapshot.recentActivity} />}
      </main>
      {toastState && <Toast message={toastState.message} tone={toastState.tone} onClose={handleToastClose} />}
    </>
  );
}
