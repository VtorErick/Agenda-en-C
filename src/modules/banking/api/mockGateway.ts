import {
  AccountSummary,
  ActivityItem,
  BankSnapshot,
  CardSummary,
  ContactSummary,
  NotificationItem,
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
    category: "Pago",
    accountId: "acc-001"
  },
  {
    id: "act-002",
    title: "Transferencia recibida",
    description: "Jorge Maldonado",
    amount: 1800,
    currency: "USD",
    timestamp: "2024-05-24T16:45:00Z",
    category: "Ingreso",
    accountId: "acc-002"
  },
  {
    id: "act-003",
    title: "Compra en Lumen Travel",
    description: "Vuelo Ciudad de México",
    amount: -420.75,
    currency: "USD",
    timestamp: "2024-05-22T19:22:00Z",
    category: "Tarjeta",
    accountId: "acc-001"
  },
  {
    id: "act-004",
    title: "Inversión automática",
    description: "Aurora Index Growth",
    amount: -600,
    currency: "USD",
    timestamp: "2024-05-20T08:00:00Z",
    category: "Transferencia",
    accountId: "acc-002"
  }
];

const contacts: ContactSummary[] = [
  {
    id: "contact-jorge",
    name: "Jorge Maldonado",
    bank: "Banco del Sol",
    accountNumber: "00123456789",
    avatarColor: "#0f6fbb",
    nickname: "Jorge M.",
    lastTransferAmount: 280,
    lastTransferAt: "2024-05-20T13:45:00Z"
  },
  {
    id: "contact-adriana",
    name: "Adriana Campos",
    bank: "Financiera Horizonte",
    accountNumber: "00987654321",
    avatarColor: "#0b8b6d",
    nickname: "Ahorro Vivienda",
    lastTransferAmount: 1200,
    lastTransferAt: "2024-05-18T09:12:00Z"
  },
  {
    id: "contact-empresa",
    name: "Aurora Consulting",
    bank: "Banco Aurora",
    accountNumber: "001001002003",
    avatarColor: "#a17214",
    nickname: "Oficina",
    lastTransferAmount: 3000,
    lastTransferAt: "2024-05-10T08:00:00Z"
  }
];

const notifications: NotificationItem[] = [
  {
    id: "ntf-security",
    title: "Nuevo dispositivo autorizado",
    detail: "Has iniciado sesión desde un equipo Windows en Ciudad de México.",
    createdAt: "2024-05-26T08:15:00Z",
    category: "security",
    read: false
  },
  {
    id: "ntf-payment",
    title: "Pago programado confirmado",
    detail: "Tu pago automático de tarjeta Aurora Signature fue aplicado.",
    createdAt: "2024-05-24T06:00:00Z",
    category: "payment",
    read: true
  },
  {
    id: "ntf-invest",
    title: "Rendimiento semanal",
    detail: "Tu portafolio Aurora Index Growth tuvo un rendimiento del 2.3% esta semana.",
    createdAt: "2024-05-23T09:30:00Z",
    category: "announcement",
    read: false
  }
];

const baseSnapshot: BankSnapshot = {
  user,
  accounts,
  cards,
  recentActivity: activity,
  contacts,
  notifications
};

let currentSnapshot: BankSnapshot = clone(baseSnapshot);

const syncNotificationCount = () => {
  currentSnapshot.user = {
    ...currentSnapshot.user,
    notifications: currentSnapshot.notifications.filter((item) => !item.read).length
  };
};

const pushNotification = (entry: NotificationItem) => {
  currentSnapshot = {
    ...currentSnapshot,
    notifications: [entry, ...currentSnapshot.notifications].slice(0, 12)
  };
  syncNotificationCount();
};

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
        category: "Pago",
        accountId: payload?.accountId ?? currentSnapshot.accounts[0]?.id
      });
      if (delta > 0) {
        // Incentivar actualización ligera de cuentas
        const account = findAccount(payload?.accountId ?? currentSnapshot.accounts[0]?.id);
        if (account) {
          account.balance = Number((account.balance - amount).toFixed(2));
        }
      }
      pushNotification({
        id: crypto.randomUUID(),
        title: "Pago registrado",
        detail: `Se aplicó un pago de ${amount.toLocaleString("es-MX", {
          style: "currency",
          currency: "USD"
        })} a ${card.label}.`,
        createdAt: new Date().toISOString(),
        category: "payment",
        read: false
      });
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
        category: "Tarjeta",
        accountId: payload?.accountId
      });
      pushNotification({
        id: crypto.randomUUID(),
        title: "Tarjeta bloqueada",
        detail: `${card.label} se bloqueó temporalmente. Puedes desbloquearla cuando lo requieras.`,
        createdAt: new Date().toISOString(),
        category: "security",
        read: false
      });
    }
  },
  scheduleTransfer: {
    message: "Transferencia enviada con éxito.",
    mutate: (payload) => {
      const account = findAccount(payload?.accountId ?? currentSnapshot.accounts[0]?.id);
      const contact = payload?.contactId
        ? currentSnapshot.contacts.find((item) => item.id === payload.contactId)
        : currentSnapshot.contacts[0];
      if (!account || !contact) {
        const error: OperationGatewayError = Object.assign(
          new Error("No fue posible validar la cuenta o el contacto seleccionado."),
          {
            code: "mock/transfer-invalid",
            details: payload ?? null
          }
        );
        throw error;
      }
      const amount = payload?.amount ?? 520;
      account.balance = Number((account.balance - amount).toFixed(2));
      contact.lastTransferAmount = amount;
      contact.lastTransferAt = new Date().toISOString();
      pushActivity({
        id: crypto.randomUUID(),
        title: `Transferencia a ${contact.nickname ?? contact.name}`,
        description: payload?.notes ?? `${contact.bank} · ${contact.accountNumber}`,
        amount: -Math.abs(amount),
        currency: account.currency,
        timestamp: new Date().toISOString(),
        category: "Transferencia",
        accountId: account.id
      });
      pushNotification({
        id: crypto.randomUUID(),
        title: "Transferencia emitida",
        detail: `Enviaste ${amount.toLocaleString("es-MX", {
          style: "currency",
          currency: account.currency
        })} a ${contact.name}.`,
        createdAt: new Date().toISOString(),
        category: "payment",
        read: false
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
        category: "Tarjeta",
        accountId: payload?.accountId
      });
      pushNotification({
        id: crypto.randomUUID(),
        title: "Solicitud recibida",
        detail: "Estamos evaluando tu solicitud de aumento de línea. Te notificaremos la respuesta.",
        createdAt: new Date().toISOString(),
        category: "announcement",
        read: false
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
        category: "Tarjeta",
        accountId: payload?.accountId
      });
      pushNotification({
        id: crypto.randomUUID(),
        title: "Aviso de viaje activo",
        detail:
          "Tus tarjetas estarán listas para operar en los destinos seleccionados por los próximos 30 días.",
        createdAt: new Date().toISOString(),
        category: "announcement",
        read: false
      });
    }
  },
  acknowledgeNotification: {
    message: "Notificación archivada.",
    mutate: (payload) => {
      const notification = payload?.notificationId
        ? currentSnapshot.notifications.find((item) => item.id === payload.notificationId)
        : undefined;
      if (!notification) {
        const error: OperationGatewayError = Object.assign(
          new Error("La notificación ya no se encuentra disponible."),
          {
            code: "mock/notification-missing",
            details: payload ?? null
          }
        );
        throw error;
      }
      notification.read = true;
      syncNotificationCount();
      pushActivity({
        id: crypto.randomUUID(),
        title: "Notificación revisada",
        description: notification.title,
        amount: 0,
        currency: "USD",
        timestamp: new Date().toISOString(),
        category: "Ingreso"
      });
    }
  }
};

export const fetchSnapshot = async (): Promise<BankSnapshot> => {
  await wait(MOCK_LATENCY);
  syncNotificationCount();
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
  syncNotificationCount();

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
  syncNotificationCount();
};

export const listOperations = (): OperationKind[] => Object.keys(operationDefinitions) as OperationKind[];
