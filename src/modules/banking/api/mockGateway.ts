import {
  AccountSummary,
  ActivityItem,
  BankSnapshot,
  CardSummary,
  OperationGatewayError,
  OperationKind,
  OperationRequest,
  OperationResult,
  OperationResponse,
  UserProfile
} from "../domain/types";

const MOCK_LATENCY = 450;
const FAILURE_RATE = 0.12;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const user: UserProfile = {
  id: "user-001",
  name: "Valeria Hernández",
  tier: "Aurora",
  lastLogin: "2024-05-26T18:23:00Z",
  notifications: 4
};

const accounts: AccountSummary[] = [
  {
    id: "acc-001",
    type: "Cuenta Corriente",
    number: "001-456789-00",
    balance: 15840.25,
    currency: "USD"
  },
  {
    id: "acc-002",
    type: "Cuenta de Ahorro",
    number: "001-456789-01",
    balance: 21450.0,
    currency: "USD"
  },
  {
    id: "acc-003",
    type: "Inversión",
    number: "001-456789-INV",
    balance: 52670.9,
    currency: "USD"
  }
];

const cards: CardSummary[] = [
  {
    id: "card-aurora",
    label: "Aurora Signature",
    brand: "Visa",
    lastFour: "4821",
    limit: 18000,
    available: 14250,
    status: "Activa"
  },
  {
    id: "card-lumen",
    label: "Lumen Travel",
    brand: "Mastercard",
    lastFour: "3391",
    limit: 12000,
    available: 9600,
    status: "Activa"
  }
];

const activity: ActivityItem[] = [
  {
    id: "act-001",
    title: "Pago a Aurora Signature",
    description: "Pago puntual de tarjeta",
    amount: -640.5,
    currency: "USD",
    timestamp: "2024-05-25T10:15:00Z",
    category: "Pago"
  },
  {
    id: "act-002",
    title: "Transferencia recibida",
    description: "Jorge Maldonado",
    amount: 1800,
    currency: "USD",
    timestamp: "2024-05-24T16:45:00Z",
    category: "Ingreso"
  },
  {
    id: "act-003",
    title: "Compra en Lumen Travel",
    description: "Vuelo Ciudad de México",
    amount: -420.75,
    currency: "USD",
    timestamp: "2024-05-22T19:22:00Z",
    category: "Tarjeta"
  },
  {
    id: "act-004",
    title: "Inversión automática",
    description: "Aurora Index Growth",
    amount: -600,
    currency: "USD",
    timestamp: "2024-05-20T08:00:00Z",
    category: "Transferencia"
  }
];

const baseSnapshot: BankSnapshot = {
  user,
  accounts,
  cards,
  recentActivity: activity
};

let currentSnapshot: BankSnapshot = clone(baseSnapshot);

const pushActivity = (entry: ActivityItem) => {
  currentSnapshot = {
    ...currentSnapshot,
    recentActivity: [entry, ...currentSnapshot.recentActivity].slice(0, 12)
  };
};

const findCard = (cardId?: string) =>
  cardId ? currentSnapshot.cards.find((card) => card.id === cardId) : undefined;

const findAccount = (accountId?: string) =>
  accountId ? currentSnapshot.accounts.find((account) => account.id === accountId) : undefined;

interface OperationDefinition {
  message: string;
  mutate?: (payload?: OperationRequest) => void;
}

const operationDefinitions: Record<OperationKind, OperationDefinition> = {
  payCreditCard: {
    message: "Pago aplicado a la tarjeta seleccionada.",
    mutate: (payload) => {
      const card = findCard(payload?.cardId ?? currentSnapshot.cards[0]?.id);
      if (!card) {
        return;
      }
      const amount = payload?.amount ?? 320;
      const newAvailable = Math.min(card.limit, card.available + amount);
      const delta = newAvailable - card.available;
      card.available = Number(newAvailable.toFixed(2));
      pushActivity({
        id: crypto.randomUUID(),
        title: `Pago a ${card.label}`,
        description: payload?.notes ?? "Pago realizado desde tu cuenta principal",
        amount: -Math.abs(amount),
        currency: "USD",
        timestamp: new Date().toISOString(),
        category: "Pago"
      });
      if (delta > 0) {
        // Incentivar actualización ligera de cuentas
        const account = findAccount(payload?.accountId ?? currentSnapshot.accounts[0]?.id);
        if (account) {
          account.balance = Number((account.balance - amount).toFixed(2));
        }
      }
    }
  },
  lockCard: {
    message: "Tarjeta bloqueada temporalmente.",
    mutate: (payload) => {
      const card = findCard(payload?.cardId ?? currentSnapshot.cards[0]?.id);
      if (!card) {
        return;
      }
      card.status = "Bloqueada";
      card.available = 0;
      pushActivity({
        id: crypto.randomUUID(),
        title: `Bloqueo de ${card.label}`,
        description: "Reporte temporal solicitado desde la app",
        amount: 0,
        currency: "USD",
        timestamp: new Date().toISOString(),
        category: "Tarjeta"
      });
    }
  },
  scheduleTransfer: {
    message: "Transferencia agendada con éxito.",
    mutate: (payload) => {
      const account = findAccount(payload?.accountId ?? currentSnapshot.accounts[0]?.id);
      if (!account) {
        return;
      }
      const amount = payload?.amount ?? 520;
      account.balance = Number((account.balance - amount).toFixed(2));
      pushActivity({
        id: crypto.randomUUID(),
        title: "Transferencia programada",
        description: payload?.notes ?? `Hacia cuenta destino ${payload?.accountId ?? "externa"}`,
        amount: -Math.abs(amount),
        currency: account.currency,
        timestamp: new Date().toISOString(),
        category: "Transferencia"
      });
    }
  },
  requestIncrease: {
    message: "Solicitud de aumento enviada al equipo de riesgo.",
    mutate: (payload) => {
      const card = findCard(payload?.cardId ?? currentSnapshot.cards[0]?.id);
      if (!card) {
        return;
      }
      const increment = 1000;
      card.limit = Number((card.limit + increment).toFixed(2));
      card.available = Number((card.available + increment * 0.8).toFixed(2));
      pushActivity({
        id: crypto.randomUUID(),
        title: `Solicitud de aumento para ${card.label}`,
        description: "En revisión por el equipo de riesgo",
        amount: 0,
        currency: "USD",
        timestamp: new Date().toISOString(),
        category: "Tarjeta"
      });
    }
  },
  setTravelNotice: {
    message: "Aviso de viaje registrado. ¡Buen viaje!",
    mutate: (payload) => {
      const card = findCard(payload?.cardId ?? currentSnapshot.cards[0]?.id);
      if (!card) {
        return;
      }
      pushActivity({
        id: crypto.randomUUID(),
        title: `Aviso de viaje para ${card.label}`,
        description: payload?.notes ?? "Habilitado para nuevos destinos",
        amount: 0,
        currency: "USD",
        timestamp: new Date().toISOString(),
        category: "Tarjeta"
      });
    }
  }
};

export const fetchSnapshot = async (): Promise<BankSnapshot> => {
  await wait(MOCK_LATENCY);
  return clone(currentSnapshot);
};

export const performOperation = async (
  operation: OperationKind,
  payload?: OperationRequest
): Promise<OperationResult> => {
  const definition = operationDefinitions[operation];
  if (!definition) {
    throw Object.assign(new Error("Operación no soportada"), { code: "mock/not-found" });
  }

  await wait(MOCK_LATENCY);

  if (Math.random() < FAILURE_RATE) {
    const error: OperationGatewayError = Object.assign(
      new Error("No pudimos completar la operación. Intenta nuevamente."),
      {
        code: "mock/unavailable",
        details: payload ?? null
      }
    );
    throw error;
  }

  definition.mutate?.(payload);

  const response: OperationResponse = {
    id: crypto.randomUUID(),
    status: "success",
    message: definition.message,
    processedAt: new Date().toISOString(),
    details: payload ?? null
  };

  return {
    response,
    snapshot: clone(currentSnapshot)
  };
};

export const resetSnapshot = () => {
  currentSnapshot = clone(baseSnapshot);
};

export const listOperations = (): OperationKind[] => Object.keys(operationDefinitions) as OperationKind[];
