// src/lib/data/index.ts
// Helpers para leer/escribir los archivos JSON de productos, cupones, usuarios y pedidos
// Actúa como mini-DB local sin dependencias externas

import { promises as fs } from 'fs';
import path from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  category: string;
  stock: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  isPaid: boolean;
  completedLessons: string[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  mpPaymentId?: string;
  mpPreferenceId?: string;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

// ─── File Paths ──────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// ─── Generic read/write ──────────────────────────────────────────────────────

async function readJSON<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJSON<T>(filePath: string, data: T[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return readJSON<Product>(PRODUCTS_FILE);
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.isActive);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function saveProducts(products: Product[]): Promise<void> {
  return writeJSON(PRODUCTS_FILE, products);
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export async function getCoupons(): Promise<Coupon[]> {
  return readJSON<Coupon>(COUPONS_FILE);
}

export async function saveCoupons(coupons: Coupon[]): Promise<void> {
  return writeJSON(COUPONS_FILE, coupons);
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; error?: string; coupon?: Coupon }> {
  const coupons = await getCoupons();
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
  );

  if (!coupon) {
    return { valid: false, discount: 0, error: 'Cupón no encontrado o inactivo.' };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discount: 0, error: 'Este cupón ha expirado.' };
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, error: 'Este cupón ya alcanzó su límite de usos.' };
  }

  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      discount: 0,
      error: `El monto mínimo para este cupón es $${coupon.minPurchase.toLocaleString('es-AR')}.`,
    };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round(subtotal * (coupon.value / 100));
  } else {
    discount = Math.min(coupon.value, subtotal);
  }

  return { valid: true, discount, coupon };
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  return readJSON<User>(USERS_FILE);
}

export async function saveUsers(users: User[]): Promise<void> {
  return writeJSON(USERS_FILE, users);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u._id === id);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  return readJSON<Order>(ORDERS_FILE);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  return writeJSON(ORDERS_FILE, orders);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

// Configuración de envío
export const SHIPPING_CONFIG = {
  freeThreshold: 50000, // Envío gratis arriba de este monto
  flatRate: 5000,       // Tarifa plana de envío
};

export function calculateShipping(subtotal: number): number {
  return subtotal >= SHIPPING_CONFIG.freeThreshold ? 0 : SHIPPING_CONFIG.flatRate;
}
