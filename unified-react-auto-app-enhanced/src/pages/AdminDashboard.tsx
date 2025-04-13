import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, XCircle, User } from 'lucide-react';

interface Vehiculo {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  description: string;
  status: string;
  created_at: string;
  photos: string[];
  profiles: {
    username: string;
    phone_number: string;
    company_name: string;
  };
}

const AdminDashboard = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [filtro, setFiltro] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Vehiculo['profiles'] | null>(null);

  useEffect(() => {
    obtenerVehiculos();
  }, [filtro]);

  const obtenerVehiculos = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles (
          username,
          phone_number,
          company_name
        )
      `)
      .eq('status', filtro)
      .order('created_at', { ascending: false });
    
    setVehiculos(data || []);
  };

  const actualizarEstado = async (id: string, estado: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('vehicles')
      .update({ status: estado })
      .eq('id', id);

    if (!error) {
      obtenerVehiculos();
    }
  };

  const traducirFiltro = (estado: string) => {
    switch (estado) {
      case 'pending':
        return 'Pendientes';
      case 'approved':
        return 'Aprobados';
      case 'rejected':
        return 'Rechazados';
      default:
        return estado;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Revisión de Vehículos</h1>
        <div className="flex space-x-2">
          {(['pending', 'approved', 'rejected'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-md ${
                filtro === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {traducirFiltro(estado)}
            </button>
          ))}
        </div>
      </div>

      {perfilSeleccionado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Información del Vendedor</h2>
              <button
                onClick={() => setPerfilSeleccionado(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                <p className="mt-1 text-gray-900">{perfilSeleccionado.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="mt-1 text-gray-900">{perfilSeleccionado.phone_number || 'No especificado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <p className="mt-1 text-gray-900">{perfilSeleccionado.company_name || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {vehiculos.map((vehiculo) => (
          <div key={vehiculo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {vehiculo.year} {vehiculo.make} {vehiculo.model}
                  </h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <p className="text-gray-600">
                      {vehiculo.mileage.toLocaleString()} kilómetros
                    </p>
                    <button
                      onClick={() => setPerfilSeleccionado(vehiculo.profiles)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <User className="h-4 w-4 mr-1" />
                      <span>{vehiculo.profiles.username}</span>
                    </button>
                  </div>
                </div>
                {filtro === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => actualizarEstado(vehiculo.id, 'approved')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Aprobar</span>
                    </button>
                
                    <button
                      onClick={() => actualizarEstado(vehiculo.id, 'rejected')}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                )}
              </div>
              {vehiculo.photos && vehiculo.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vehiculo.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${vehiculo.make} ${vehiculo.model} - Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
              <p className="text-gray-700 mt-4">
                {vehiculo.description}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Enviado hace {formatDistanceToNow(new Date(vehiculo.created_at), { locale: es })}
              </p>
            </div>
          </div>
        ))}

        {vehiculos.length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay vehículos para revisar</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay vehículos con el estado "{traducirFiltro(filtro)}" en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;