// src/lib/data/index.ts
// Capa de datos unificada: Redis (Upstash) como almacenamiento primario, JSON local como fallback.
// Productos y talleres se leen siempre de JSON (catálogo estático).
// Órdenes, cupones, configuración y códigos de login usan Redis cuando está disponible.

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { kvGet, kvSet, hasRedis } from '@/lib/kv';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  category: string;
  stock: number;
  isActive: boolean;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  youtubeId: string;
  badge: string | null;
  isActive: boolean;
  createdAt: string;
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

export interface Settings {
  shopName: string;
  shopTitle: string;
  shopSubtitle: string;
  shopImage: string;
  shopLogo: string;
  statsProducts: string;
  statsWorkshops: string;
  statsAlumnas: string;
  bankAlias: string;
  bankCbu: string;
  bankName: string;
  bankOwner: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
  itemType: 'product' | 'workshop';
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
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'pending_transfer' | 'approved' | 'rejected' | 'refunded';
  paymentMethod: 'mercadopago' | 'transfer';
  mpPaymentId?: string;
  mpPreferenceId?: string;
  shippingAddress?: ShippingAddress;
  accessTokens?: { workshopId: string; token: string }[];
  createdAt: string;
  updatedAt: string;
}

// ─── File Paths ──────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');

// Productos y talleres son catálogo estático — siempre se leen de JSON
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const WORKSHOPS_FILE = path.join(DATA_DIR, 'workshops.json');

// JSON local para cupones, órdenes, configuración y códigos (fallback cuando Redis no está disponible)
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const LOGIN_CODES_FILE = path.join(DATA_DIR, 'login_codes.json');

// ─── Generic read/write (solo para catálogo estático) ────────────────────────

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

// ─── Redis-first helper para datos mutables ───────────────────────────────────
// Si Redis está disponible lo usa; si no, cae en el archivo JSON local.

async function kvReadArray<T>(key: string, fallbackFile: string): Promise<T[]> {
  if (hasRedis()) {
    const result = await kvGet<T[]>(key);
    if (result !== null && result !== undefined) {
      return result;
    }
    // Si Redis está vacío, intentamos sembrar desde el JSON local
    const fallbackData = await readJSON<T>(fallbackFile);
    if (fallbackData && fallbackData.length > 0) {
      await kvSet(key, fallbackData);
    }
    return fallbackData ?? [];
  }
  return readJSON<T>(fallbackFile);
}

async function kvWriteArray<T>(key: string, fallbackFile: string, data: T[]): Promise<void> {
  if (hasRedis()) {
    await kvSet(key, data);
    return;
  }
  return writeJSON<T>(fallbackFile, data);
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return kvReadArray<Product>('products', PRODUCTS_FILE);
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
  return kvWriteArray('products', PRODUCTS_FILE, products);
}

// ─── Workshops ───────────────────────────────────────────────────────────────

export async function getWorkshops(): Promise<Workshop[]> {
  return kvReadArray<Workshop>('workshops', WORKSHOPS_FILE);
}

export async function getActiveWorkshops(): Promise<Workshop[]> {
  const workshops = await getWorkshops();
  return workshops.filter((w) => w.isActive);
}

export async function getWorkshopById(id: string): Promise<Workshop | undefined> {
  const workshops = await getWorkshops();
  return workshops.find((w) => w.id === id);
}

export async function saveWorkshops(workshops: Workshop[]): Promise<void> {
  return kvWriteArray('workshops', WORKSHOPS_FILE, workshops);
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export async function getCoupons(): Promise<Coupon[]> {
  return kvReadArray<Coupon>('coupons', COUPONS_FILE);
}

export async function saveCoupons(coupons: Coupon[]): Promise<void> {
  return kvWriteArray('coupons', COUPONS_FILE, coupons);
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

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  return kvReadArray<Order>('orders', ORDERS_FILE);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  return kvWriteArray('orders', ORDERS_FILE, orders);
}

// ─── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  shopName: "La Mackenna",
  shopTitle: "Creá piezas únicas para tu hogar y tus proyectos creativos",
  shopSubtitle: "Descubrí productos artesanales, insumos exclusivos y capacitaciones para aprender nuevas técnicas.",
  shopImage: "/images/hero.png",
  shopLogo: "/logo.png",
  statsProducts: "200+",
  statsWorkshops: "10+",
  statsAlumnas: "1.500+",
  bankAlias: "lamackenna.arte",
  bankCbu: "0070000000000000000000",
  bankName: "Galicia",
  bankOwner: "La Mackenna"
};

export async function getSettings(): Promise<Settings> {
  if (hasRedis()) {
    const result = await kvGet<Settings>('settings');
    if (result !== null && result !== undefined) {
      return result;
    }
    // Si Redis está vacío, intentamos sembrar desde el archivo local de settings o DEFAULT_SETTINGS
    let initialSettings = DEFAULT_SETTINGS;
    try {
      const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
      initialSettings = JSON.parse(raw) as Settings;
    } catch {}
    await kvSet('settings', initialSettings);
    return initialSettings;
  }
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw) as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (hasRedis()) {
    await kvSet('settings', settings);
    return;
  }
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// ─── Login Codes ─────────────────────────────────────────────────────────────

export interface LoginCode {
  email: string;
  code: string;
  expiresAt: string;
}

export async function getLoginCodes(): Promise<LoginCode[]> {
  return kvReadArray<LoginCode>('login_codes', LOGIN_CODES_FILE);
}

export async function saveLoginCodes(codes: LoginCode[]): Promise<void> {
  return kvWriteArray('login_codes', LOGIN_CODES_FILE, codes);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

/** Genera un token único seguro para acceso a talleres */
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Genera un ID único para entidades */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Configuración de envío
export const SHIPPING_CONFIG = {
  freeThreshold: 50000, // Envío gratis arriba de este monto
  flatRate: 5000,       // Tarifa plana de envío
};

export function calculateShipping(subtotal: number, hasPhysicalProducts: boolean): number {
  if (!hasPhysicalProducts) return 0; // Talleres digitales → sin envío
  return subtotal >= SHIPPING_CONFIG.freeThreshold ? 0 : SHIPPING_CONFIG.flatRate;
}
