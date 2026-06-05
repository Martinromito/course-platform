// src/app/admin/pedidos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
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
  userId: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminOrdersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'refunded'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (currentUser.role !== 'admin') {
        router.push('/dashboard');
      }
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
        } else {
          toast.error(data.error || 'Error al obtener pedidos');
        }
      } catch (err) {
        toast.error('Error de red al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'admin') {
      fetchOrders();
    }
  }, [currentUser, authLoading, router]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B7355] mx-auto"></div>
          <p className="text-[#8d6e63] mt-4 font-bold">Cargando panel de pedidos...</p>
        </div>
      </div>
    );
  }

  // Filtrar pedidos
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingAddress?.phone && o.shippingAddress.phone.includes(search));
      
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas básicas
  const stats = {
    total: orders.length,
    approved: orders.filter(o => o.status === 'approved').length,
    pending: orders.filter(o => o.status === 'pending').length,
    earnings: orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#3e2723]">Pedidos & Despachos</h1>
            <p className="text-[#8d6e63] mt-1 font-medium">Controla los pagos, envíos y correos de tus clientas.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              Volver a Academia
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Ir al Sitio
            </Button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white border border-[#d7ccc8] rounded-3xl p-5 shadow-sm">
            <p className="text-[#8d6e63] text-xs font-bold uppercase tracking-wider">Total Recaudado</p>
            <h3 className="text-2xl font-black text-green-700 mt-1">
              ${stats.earnings.toLocaleString('es-AR')}
            </h3>
          </div>
          <div className="bg-white border border-[#d7ccc8] rounded-3xl p-5 shadow-sm">
            <p className="text-[#8d6e63] text-xs font-bold uppercase tracking-wider">Total Pedidos</p>
            <h3 className="text-2xl font-black text-[#3e2723] mt-1">{stats.total}</h3>
          </div>
          <div className="bg-white border border-[#d7ccc8] rounded-3xl p-5 shadow-sm">
            <p className="text-[#8d6e63] text-xs font-bold uppercase tracking-wider">Aprobados</p>
            <h3 className="text-2xl font-black text-green-600 mt-1">{stats.approved}</h3>
          </div>
          <div className="bg-white border border-[#d7ccc8] rounded-3xl p-5 shadow-sm">
            <p className="text-[#8d6e63] text-xs font-bold uppercase tracking-wider">Pendientes</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</h3>
          </div>
        </div>

        {/* Buscador y Filtro */}
        <div className="bg-white border border-[#d7ccc8] rounded-3xl p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <Input
              label="Buscar pedido (ID, nombre, email o teléfono)"
              placeholder="Ej: martin o 02323..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto self-end md:self-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'pending', 'approved', 'rejected', 'refunded'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  statusFilter === status
                    ? 'bg-[#8B7355] text-white border-[#8B7355] shadow-sm'
                    : 'bg-[#fdfaf5] text-[#8d6e63] border-[#d7ccc8] hover:bg-white'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendiente' : status === 'approved' ? 'Aprobado' : status === 'rejected' ? 'Rechazado' : 'Reembolsado'}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabla de Pedidos */}
          <div className={`bg-white border border-[#d7ccc8] rounded-[36px] p-6 shadow-sm overflow-hidden lg:col-span-2 ${selectedOrder ? 'hidden lg:block' : ''}`}>
            <h2 className="text-lg font-black text-[#3e2723] mb-6">Lista de Pedidos ({filteredOrders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#8d6e63] border-b border-[#e7ddd7] text-[10px] uppercase font-bold tracking-widest">
                    <th className="pb-4">Pedido / Fecha</th>
                    <th className="pb-4">Cliente</th>
                    <th className="pb-4">Monto</th>
                    <th className="pb-4">Estado</th>
                    <th className="pb-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7f2ee]">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-[#faf6f0] transition-colors">
                      <td className="py-4">
                        <span className="font-mono text-xs text-[#3e2723] font-bold">#{order._id.substring(0, 8)}</span>
                        <p className="text-[10px] text-[#8d6e63]">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-xs font-bold text-[#3e2723]">{order.user.name}</p>
                        <p className="text-[10px] text-[#8d6e63]">{order.user.email}</p>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-bold text-[#3e2723]">${order.total.toLocaleString('es-AR')}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          order.status === 'approved' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status === 'approved' ? 'APROBADO' :
                           order.status === 'pending' ? 'PENDIENTE' :
                           order.status === 'rejected' ? 'RECHAZADO' : 'REEMBOLSADO'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-[#fdfaf5] hover:bg-[#8B7355] text-[#8B7355] hover:text-white border border-[#d7ccc8] hover:border-[#8B7355] rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#8d6e63] text-sm">
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
            <div className="bg-white border border-[#d7ccc8] rounded-[36px] p-6 shadow-sm space-y-6 lg:col-span-1">
              <div className="flex justify-between items-center pb-4 border-b border-[#e7ddd7]">
                <div>
                  <h3 className="font-black text-[#3e2723]">Detalle del Pedido</h3>
                  <p className="font-mono text-xs text-[#8d6e63] mt-0.5">#{selectedOrder._id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-[#8d6e63]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Estado y Acciones Rápidas */}
              <div className="bg-[#fdfaf5] border border-[#d7ccc8] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#8d6e63]">Estado Actual:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedOrder.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status === 'approved' ? 'APROBADO' :
                     selectedOrder.status === 'pending' ? 'PENDIENTE' :
                     selectedOrder.status === 'rejected' ? 'RECHAZADO' : 'REEMBOLSADO'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === 'pending' && (
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
                <h4 className="text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Cliente</h4>
                <div className="p-4 bg-white border border-[#e7ddd7] rounded-2xl">
                  <p className="text-sm font-bold text-[#3e2723]">{selectedOrder.user.name}</p>
                  <p className="text-xs text-[#5d4037] mt-0.5">{selectedOrder.user.email}</p>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Datos de Envío</h4>
                <div className="p-4 bg-white border border-[#e7ddd7] rounded-2xl space-y-2 text-xs">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p className="text-[#3e2723]"><span className="font-bold text-[#8d6e63]">Destinatario:</span> {selectedOrder.shippingAddress.name}</p>
                      <p className="text-[#3e2723]"><span className="font-bold text-[#8d6e63]">Dirección:</span> {selectedOrder.shippingAddress.address}</p>
                      <p className="text-[#3e2723]"><span className="font-bold text-[#8d6e63]">Ciudad:</span> {selectedOrder.shippingAddress.city}</p>
                      <p className="text-[#3e2723]"><span className="font-bold text-[#8d6e63]">Provincia:</span> {selectedOrder.shippingAddress.province}</p>
                      <p className="text-[#3e2723]"><span className="font-bold text-[#8d6e63]">C.P.:</span> {selectedOrder.shippingAddress.zip}</p>
                      <p className="text-[#3e2723]"><span className="font-bold text-[#8d6e63]">Teléfono:</span> {selectedOrder.shippingAddress.phone}</p>
                    </>
                  ) : (
                    <p className="text-[#8d6e63] italic">Sin dirección de envío (posiblemente un curso o compra digital)</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Productos</h4>
                <div className="divide-y divide-[#f7f2ee] bg-white border border-[#e7ddd7] rounded-2xl p-3 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map(item => (
                    <div key={item.productId} className="flex gap-3 py-2.5 items-center">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#3e2723] truncate">{item.name}</p>
                        <p className="text-[10px] text-[#8d6e63]">{item.quantity} x ${item.unitPrice.toLocaleString('es-AR')}</p>
                      </div>
                      <span className="text-xs font-bold text-[#3e2723]">${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-1.5 pt-4 border-t border-[#e7ddd7] text-xs">
                <div className="flex justify-between text-[#8d6e63]">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toLocaleString('es-AR')}</span>
                </div>
                {selectedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento Cupón {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                    <span>-${selectedOrder.couponDiscount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8d6e63]">
                  <span>Costo de Envío</span>
                  <span>{selectedOrder.shippingCost === 0 ? 'Gratis' : `$${selectedOrder.shippingCost.toLocaleString('es-AR')}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#3e2723] pt-1">
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
