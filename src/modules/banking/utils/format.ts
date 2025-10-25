export const formatCurrency = (
  value: number,
  currency: string,
  options: Intl.NumberFormatOptions = {}
) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    ...options
  }).format(value);

export const formatDateTime = (isoDate: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
