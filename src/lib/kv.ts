// src/lib/kv.ts
// Cliente Redis usando Upstash — con fallback gracioso a JSON local cuando no hay credenciales configuradas.
// En Vercel: usa UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (setear en Vercel → Storage → Upstash).
// En local sin Redis: las funciones retornan null y la capa de datos usa JSON.

import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  // Vercel puede generar nombres con o sin el prefijo KV según la integración usada
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  if (!url || !token) {
    return null; // Sin credenciales → usa JSON local
  }

  _redis = new Redis({ url, token });
  return _redis;
}

/** Retorna true si Redis está disponible */
export function hasRedis(): boolean {
  return !!getRedis();
}

/** Lee un valor JSON de Redis. Retorna null si no existe o si Redis no está configurado. */
export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    return await redis.get<T>(key);
  } catch (err) {
    console.error(`[KV] Error al leer clave "${key}":`, err);
    return null;
  }
}

/** Guarda un valor JSON en Redis. No hace nada si Redis no está configurado. */
export async function kvSet(key: string, value: unknown): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[KV] Error al escribir clave "${key}":`, err);
  }
}
