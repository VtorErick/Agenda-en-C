export interface UserProfile {
  id: string;
  name: string;
  tier: "Aurora" | "Lumen" | "Nebula";
  lastLogin: string;
  notifications: number;
}

export interface AccountSummary {
  id: string;
  type: "Cuenta Corriente" | "Cuenta de Ahorro" | "Inversión";
  number: string;
  balance: number;
  currency: "USD" | "EUR" | "MXN";
}

export interface CardSummary {
  id: string;
  label: string;
  brand: "Visa" | "Mastercard" | "Amex";
  lastFour: string;
  limit: number;
  available: number;
  status: "Activa" | "Bloqueada";
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: "USD" | "EUR" | "MXN";
  timestamp: string;
  category: "Pago" | "Ingreso" | "Tarjeta" | "Transferencia";
}

export interface OperationRequest {
  cardId?: string;
  accountId?: string;
  amount?: number;
  notes?: string;
}

export interface OperationResponse {
  id: string;
  status: "success" | "warning" | "error";
  message: string;
  processedAt: string;
  details?: OperationRequest | null;
}

export interface BankSnapshot {
  user: UserProfile;
  accounts: AccountSummary[];
  cards: CardSummary[];
  recentActivity: ActivityItem[];
}

export type OperationKind =
  | "payCreditCard"
  | "lockCard"
  | "scheduleTransfer"
  | "requestIncrease"
  | "setTravelNotice";

export type OperationEndpoint = (payload?: OperationRequest) => Promise<OperationResponse>;

export interface OperationResult {
  response: OperationResponse;
  snapshot: BankSnapshot;
}

export interface OperationGatewayError extends Error {
  code?: string;
  details?: OperationRequest | null;
}
