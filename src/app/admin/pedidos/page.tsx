// src/app/admin/pedidos/page.tsx
// Gestión de Pedidos y Despachos (Admin)

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { ArrowLeft, Landmark, CreditCard, Search, ArrowRight, Loader2 } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
  itemType: 'product' | 'workshop';
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

interface Order {
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
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'pending_transfer' | 'approved' | 'rejected' | 'refunded'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const checkRes = await fetch('/api/admin/check');
        const checkData = await checkRes.json();

        if (!checkData.authenticated) {
          router.push('/admin/login');
          return;
        }
        await fetchOrders();
      } catch {
        toast.error('Error de autenticación');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || 'Error al obtener pedidos');
      }
    } catch (err) {
      toast.error('Error de red al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Pedido marcado como ${status}`);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: status as any, updatedAt: new Date().toISOString() } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
        }
      } else {
        toast.error(data.error || 'Error al actualizar pedido');
      }
    } catch (err) {
      toast.error('Error al actualizar pedido');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  // Filtrar pedidos
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerPhone.includes(search);
      
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas básicas
  const stats = {
    total: orders.length,
    approved: orders.filter(o => o.status === 'approved').length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'pending_transfer').length,
    earnings: orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] p-6 sm:p-8 pt-28">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-1.5 text-xs text-[#8B7355] font-semibold uppercase tracking-wider mb-2 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
            </button>
            <h1 className="text-3xl font-black text-[#1A1A1A]">Pedidos & Ventas</h1>
            <p className="text-[#7A6E60] mt-1 font-medium">Controla los pagos, envíos y accesos de tus clientas.</p>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Total Recaudado</p>
            <h3 className="text-2xl font-black text-green-700 mt-1">
              ${stats.earnings.toLocaleString('es-AR')}
            </h3>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Total Pedidos</p>
            <h3 className="text-2xl font-black text-[#1A1A1A] mt-1">{stats.total}</h3>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Aprobados</p>
            <h3 className="text-2xl font-black text-green-600 mt-1">{stats.approved}</h3>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Pendientes</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</h3>
          </div>
        </div>

        {/* Buscador y Filtro */}
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <Input
              label="Buscar pedido (ID, nombre, email o teléfono)"
              placeholder="Ej: martin o 02323..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-slate-800"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto self-end md:self-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'pending', 'pending_transfer', 'approved', 'rejected', 'refunded'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#8B7355] text-white border-[#8B7355] shadow-sm'
                    : 'bg-[#FAF8F4] text-[#7A6E60] border-[#E8E2D9] hover:bg-white'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'pending' ? 'Pend. MP' : status === 'pending_transfer' ? 'Pend. Transfer' : status === 'approved' ? 'Aprobado' : status === 'rejected' ? 'Rechazado' : 'Reembolsado'}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabla de Pedidos */}
          <div className={`bg-white border border-[#E8E2D9] rounded-[28px] p-6 shadow-sm overflow-hidden lg:col-span-2 ${selectedOrder ? 'hidden lg:block' : ''}`}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6">Lista de Pedidos ({filteredOrders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#7A6E60] border-b border-[#E8E2D9] text-[10px] uppercase font-bold tracking-widest">
                    <th className="pb-4">Pedido / Fecha</th>
                    <th className="pb-4">Comprador</th>
                    <th className="pb-4">Tipo de Pago</th>
                    <th className="pb-4">Monto</th>
                    <th className="pb-4">Estado</th>
                    <th className="pb-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F4] text-sm text-[#1A1A1A]">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-4">
                        <span className="font-mono text-xs text-[#1A1A1A] font-bold">#{order._id.substring(0, 8)}</span>
                        <p className="text-[10px] text-[#7A6E60]">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-xs font-bold text-[#1A1A1A]">{order.buyerName}</p>
                        <p className="text-[10px] text-[#7A6E60]">{order.buyerEmail}</p>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-xs">
                          {order.paymentMethod === 'transfer' ? (
                            <>
                              <Landmark className="w-3.5 h-3.5 text-[#8B7355]" />
                              <span>Transferencia</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              <span>Mercado Pago</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-[#1A1A1A]">${order.total.toLocaleString('es-AR')}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          order.status === 'approved' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending_transfer' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status === 'approved' ? 'APROBADO' :
                           order.status === 'pending_transfer' ? 'PEND. TRAN' :
                           order.status === 'pending' ? 'PEND. MP' :
                           order.status === 'rejected' ? 'RECHAZADO' : 'REEMBOLSADO'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-[#FAF8F4] hover:bg-[#8B7355] text-[#8B7355] hover:text-white border border-[#E8E2D9] hover:border-[#8B7355] rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#7A6E60] text-sm">
                        No se encontraron pedidos con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel de Detalle Derecho */}
          {selectedOrder && (
            <div className="bg-white border border-[#E8E2D9] rounded-[28px] p-6 shadow-sm space-y-6 lg:col-span-1">
              <div className="flex justify-between items-center pb-4 border-b border-[#E8E2D9]">
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Detalle del Pedido</h3>
                  <p className="font-mono text-xs text-[#7A6E60] mt-0.5">#{selectedOrder._id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-[#7A6E60] cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Estado y Acciones Rápidas */}
              <div className="bg-[#FAF8F4] border border-[#E8E2D9] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#7A6E60]">Estado Actual:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedOrder.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'pending_transfer' ? 'bg-purple-100 text-purple-700' :
                    selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status === 'approved' ? 'APROBADO' :
                     selectedOrder.status === 'pending_transfer' ? 'PEND. TRAN' :
                     selectedOrder.status === 'pending' ? 'PEND. MP' :
                     selectedOrder.status === 'rejected' ? 'RECHAZADO' : 'REEMBOLSADO'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'pending_transfer') && (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      loading={updatingId === selectedOrder._id}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'approved')}
                    >
                      Aprobar Pago
                    </Button>
                  )}
                  {selectedOrder.status !== 'refunded' && selectedOrder.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-red-700 border-red-700 hover:bg-red-50"
                      loading={updatingId === selectedOrder._id}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'rejected')}
                    >
                      Rechazar
                    </Button>
                  )}
                  {selectedOrder.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      loading={updatingId === selectedOrder._id}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'refunded')}
                    >
                      Reembolsar
                    </Button>
                  )}
                </div>
              </div>

              {/* Comprador */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A6E60] uppercase tracking-wider">Cliente</h4>
                <div className="p-4 bg-[#FAF8F4] border border-[#E8E2D9] rounded-2xl text-xs space-y-1 text-[#1A1A1A]">
                  <p><span className="font-bold text-[#7A6E60]">Nombre:</span> {selectedOrder.buyerName}</p>
                  <p><span className="font-bold text-[#7A6E60]">Email:</span> {selectedOrder.buyerEmail}</p>
                  <p><span className="font-bold text-[#7A6E60]">Teléfono:</span> {selectedOrder.buyerPhone}</p>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A6E60] uppercase tracking-wider">Datos de Envío</h4>
                <div className="p-4 bg-[#FAF8F4] border border-[#E8E2D9] rounded-2xl space-y-2 text-xs text-[#1A1A1A]">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p><span className="font-bold text-[#7A6E60]">Destinatario:</span> {selectedOrder.shippingAddress.name}</p>
                      <p><span className="font-bold text-[#7A6E60]">Dirección:</span> {selectedOrder.shippingAddress.address}</p>
                      <p><span className="font-bold text-[#7A6E60]">Ciudad:</span> {selectedOrder.shippingAddress.city}</p>
                      <p><span className="font-bold text-[#7A6E60]">Provincia:</span> {selectedOrder.shippingAddress.province}</p>
                      <p><span className="font-bold text-[#7A6E60]">C.P.:</span> {selectedOrder.shippingAddress.zip}</p>
                      <p><span className="font-bold text-[#7A6E60]">Teléfono:</span> {selectedOrder.shippingAddress.phone}</p>
                    </>
                  ) : (
                    <p className="text-[#7A6E60] italic">Sin dirección de envío (posiblemente un taller o compra digital)</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A6E60] uppercase tracking-wider">Productos</h4>
                <div className="divide-y divide-[#FAF8F4] bg-[#FAF8F4] border border-[#E8E2D9] rounded-2xl p-3 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map(item => (
                    <div key={item.productId} className="flex gap-3 py-2.5 items-center">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1A1A1A] truncate">{item.name}</p>
                        <p className="text-[10px] text-[#7A6E60]">{item.quantity} x ${item.unitPrice.toLocaleString('es-AR')}</p>
                      </div>
                      <span className="text-xs font-bold text-[#1A1A1A]">${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-1.5 pt-4 border-t border-[#E8E2D9] text-xs">
                <div className="flex justify-between text-[#7A6E60]">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toLocaleString('es-AR')}</span>
                </div>
                {selectedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento Cupón {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                    <span>-${selectedOrder.couponDiscount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#7A6E60]">
                  <span>Costo de Envío</span>
                  <span>{selectedOrder.shippingCost === 0 ? 'Gratis' : `$${selectedOrder.shippingCost.toLocaleString('es-AR')}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#1A1A1A] pt-1">
                  <span>Total</span>
                  <span>${selectedOrder.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
