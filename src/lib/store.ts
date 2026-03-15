import { v4 as uuidv4 } from "uuid";

// ── Types ──────────────────────────────────────────────

export type TransportStatus = "aguardando" | "em-transito" | "entregue";
export type OrderStatus = "pendente" | "em-separacao" | "saiu-para-entrega" | "concluido";

export interface UserProfile {
  name: string;
  locationId: string;
  locationName: string;
}

export interface Transport {
  id: string;
  photo: string; // base64 data URL
  originId: string;
  originName: string;
  destinationId: string;
  destinationName: string;
  status: TransportStatus;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  item: string;
  quantity: number;
  notes?: string;
  originId: string;
  originName: string;
  status: OrderStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Storage Keys ───────────────────────────────────────

const KEYS = {
  USER: "mallard-user",
  TRANSPORTS: "mallard-transports",
  ORDERS: "mallard-orders",
} as const;

// ── User ───────────────────────────────────────────────

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  window.dispatchEvent(new Event("mallard-storage"));
}

export function clearUser(): void {
  localStorage.removeItem(KEYS.USER);
  window.dispatchEvent(new Event("mallard-storage"));
}

// ── Transports ─────────────────────────────────────────

export function getTransports(): Transport[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.TRANSPORTS);
  return raw ? JSON.parse(raw) : [];
}

function saveTransports(transports: Transport[]): void {
  localStorage.setItem(KEYS.TRANSPORTS, JSON.stringify(transports));
  window.dispatchEvent(new Event("mallard-storage"));
}

export function createTransport(
  data: Omit<Transport, "id" | "status" | "createdAt" | "updatedAt">
): Transport {
  const now = new Date().toISOString();
  const transport: Transport = {
    ...data,
    id: uuidv4(),
    status: "aguardando",
    createdAt: now,
    updatedAt: now,
  };
  const all = getTransports();
  all.unshift(transport);
  saveTransports(all);
  return transport;
}

export function updateTransportStatus(
  id: string,
  status: TransportStatus,
  assignedTo?: string
): void {
  const all = getTransports();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  if (assignedTo) all[idx].assignedTo = assignedTo;
  saveTransports(all);
}

// ── Orders ─────────────────────────────────────────────

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.ORDERS);
  return raw ? JSON.parse(raw) : [];
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  window.dispatchEvent(new Event("mallard-storage"));
}

export function createOrder(
  data: Omit<Order, "id" | "status" | "createdAt" | "updatedAt">
): Order {
  const now = new Date().toISOString();
  const order: Order = {
    ...data,
    id: uuidv4(),
    status: "pendente",
    createdAt: now,
    updatedAt: now,
  };
  const all = getOrders();
  all.unshift(order);
  saveOrders(all);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const all = getOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  saveOrders(all);
}
