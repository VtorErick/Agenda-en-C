import { OperationKind, OperationRequest } from "./types";

export interface OperationDescriptor {
  key: OperationKind;
  title: string;
  description: string;
  accent: string;
  icon: string;
  requiresCard?: boolean;
  defaultPayload?: OperationRequest;
}

export const operationCatalog: OperationDescriptor[] = [
  {
    key: "payCreditCard",
    title: "Aplicar pago",
    description: "Acredita un pago inmediato a tu tarjeta y libera saldo al instante.",
    accent: "linear-gradient(135deg, #1b84c6, #35c1ff)",
    icon: "💠",
    requiresCard: true
  },
  {
    key: "lockCard",
    title: "Bloqueo temporal",
    description: "Suspende compras por pérdida o robo y protege tus fondos.",
    accent: "linear-gradient(135deg, #f0b429, #f97316)",
    icon: "🛡️",
    requiresCard: true
  },
  {
    key: "requestIncrease",
    title: "Solicitar aumento",
    description: "Envía una evaluación de línea de crédito con un clic.",
    accent: "linear-gradient(135deg, #22b07d, #0ea86f)",
    icon: "📈",
    requiresCard: true
  },
  {
    key: "setTravelNotice",
    title: "Aviso de viaje",
    description: "Activa tus tarjetas para nuevos destinos y horarios.",
    accent: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
    icon: "🗺️",
    requiresCard: true
  },
  {
    key: "scheduleTransfer",
    title: "Transferir a contacto",
    description: "Envía fondos a un beneficiario registrado de manera inmediata.",
    accent: "linear-gradient(135deg, #2563eb, #1e3a8a)",
    icon: "📆"
  }
];

export const getOperationDescriptor = (operation: OperationKind) =>
  operationCatalog.find((descriptor) => descriptor.key === operation);
