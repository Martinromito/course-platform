// src/app/mis-pedidos/page.tsx
// Historial de pedidos del usuario

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    image: string;
  }[];
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

const statusConfig = {
  pending: { label: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

export default function MisPedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-[#1A1A1A] font-medium mb-4">Iniciá sesión para ver tus pedidos.</p>
          <Link href="/login" className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#705E45] transition-colors">
            Ingresar
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col pt-28">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-16">
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <Package className="w-8 h-8 text-[#8B7355]" />
            Mis Pedidos
          </h1>
          <p className="text-[#7A6E60] mt-2">Historial de todas tus compras en La Mackenna</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D9] shadow-sm">
            <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-8 h-8 text-[#8B7355]/50" />
            </div>
            <h3 className="text-[#1A1A1A] font-bold text-xl mb-2">Aún no tenés pedidos</h3>
            <p className="text-[#7A6E60] mb-6">Empezá a explorar nuestra tienda de productos artesanales.</p>
            <Link href="/productos" className="inline-flex px-6 py-3 bg-[#8B7355] text-white rounded-xl font-medium hover:bg-[#705E45] transition-colors shadow-sm">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div key={order._id} className="bg-white border border-[#E8E2D9] rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                  {/* Header Pedido */}
                  <div className="bg-[#FAF8F4]/50 p-4 sm:p-5 border-b border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                      <div>
                        <span className="text-xs text-[#7A6E60] uppercase tracking-wider block mb-0.5">Fecha</span>
                        <span className="text-sm font-semibold text-[#1A1A1A]">{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#7A6E60] uppercase tracking-wider block mb-0.5">Total</span>
                        <span className="text-sm font-semibold text-[#1A1A1A]">{formatPrice(order.total)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#7A6E60] uppercase tracking-wider block mb-0.5">N° Pedido</span>
                        <span className="text-sm text-[#4A4A4A] font-mono">{order._id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 sm:p-5 divide-y divide-[#E8E2D9]/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#F5F0E8] overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8B7355]/30"><Package className="w-6 h-6" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#1A1A1A] font-medium text-sm sm:text-base line-clamp-1">{item.name}</h4>
                          <p className="text-[#7A6E60] text-xs sm:text-sm mt-0.5">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[#1A1A1A] font-bold text-sm sm:text-base">{formatPrice(item.unitPrice * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
