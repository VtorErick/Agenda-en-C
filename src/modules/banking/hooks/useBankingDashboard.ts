import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BankSnapshot,
  OperationGatewayError,
  OperationKind,
  OperationRequest,
  OperationResult
} from "../domain/types";
import { fetchSnapshot, performOperation } from "../api/mockGateway";

export type OperationState =
  | { status: "idle" }
  | { status: "pending"; operation: OperationKind }
  | { status: "success"; operation: OperationKind; message: string }
  | { status: "error"; operation: OperationKind; message: string };

interface UseBankingDashboardOptions {
  autoRefresh?: boolean;
}

export const useBankingDashboard = ({ autoRefresh = true }: UseBankingDashboardOptions = {}) => {
  const [snapshot, setSnapshot] = useState<BankSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationState, setOperationState] = useState<OperationState>({ status: "idle" });

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSnapshot();
      setSnapshot(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No fue posible obtener los datos";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const executeOperation = useCallback(
    async (operation: OperationKind, payload?: OperationRequest) => {
      setOperationState({ status: "pending", operation });
      try {
        const result: OperationResult = await performOperation(operation, payload);
        setSnapshot(result.snapshot);
        setOperationState({ status: "success", operation, message: result.response.message });
      } catch (err) {
        const gatewayError = err as OperationGatewayError;
        const message =
          gatewayError?.message ?? "Ocurrió un problema inesperado al ejecutar la operación.";
        setOperationState({ status: "error", operation, message });
      }
    },
    []
  );

  const resetOperationState = useCallback(() => setOperationState({ status: "idle" }), []);

  useEffect(() => {
    if (autoRefresh) {
      loadSnapshot();
    }
  }, [autoRefresh, loadSnapshot]);

  const helpers = useMemo(
    () => ({
      refresh: loadSnapshot,
      executeOperation,
      resetOperationState
    }),
    [loadSnapshot, executeOperation, resetOperationState]
  );

  return {
    snapshot,
    loading,
    error,
    operationState,
    ...helpers
  };
};
