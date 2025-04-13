import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Car, MapPin, Calendar, Gauge, Phone, Building2 } from 'lucide-react';

interface Vehiculo {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  description: string;
  created_at: string;
  photos: string[];
  profiles: {
    username: string;
    phone_number: string;
    company_name: string;
    address: string;
  };
}

const Home = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Vehiculo['profiles'] | null>(null);

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  const obtenerVehiculos = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles (
          username,
          phone_number,
          company_name,
          address
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    setVehiculos(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehículos Disponibles</h1>
        </div>

        {perfilSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Información del Vendedor</h3>
                <button
                  onClick={() => setPerfilSeleccionado(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Empresa</p>
                    <p className="text-gray-900">{perfilSeleccionado.company_name || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{perfilSeleccionado.phone_number || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ubicación</p>
                    <p className="text-gray-900">{perfilSeleccionado.address || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehiculos.map((vehiculo) => (
            <div key={vehiculo.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] duration-300">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9">
                  {vehiculo.photos && vehiculo.photos.length > 0 ? (
                    <img
                      src={vehiculo.photos[0]}
                      alt={`${vehiculo.make} ${vehiculo.model}`}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <img
                      src={`https://source.unsplash.com/800x600/?${vehiculo.make}+${vehiculo.model}`}
                      alt={`${vehiculo.make} ${vehiculo.model}`}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    Disponible
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {vehiculo.year} {vehiculo.make} {vehiculo.model}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Año {vehiculo.year}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Gauge className="h-5 w-5 mr-2" />
                    <span>{vehiculo.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Car className="h-5 w-5 mr-2" />
                    <span>{vehiculo.make} {vehiculo.model}</span>
                  </div>
                </div>

                <p className="mt-4 text-gray-600 line-clamp-2">
                  {vehiculo.description}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setPerfilSeleccionado(vehiculo.profiles)}
                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar
                  </button>
                  <span className="text-sm text-gray-500">
                    Publicado hace {formatDistanceToNow(new Date(vehiculo.created_at), { locale: es })}
                  </span>
                </div>

                {vehiculo.photos && vehiculo.photos.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {vehiculo.photos.slice(1, 5).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${vehiculo.make} ${vehiculo.model} - Foto ${index + 2}`}
                        className="w-full h-14 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {vehiculos.length === 0 && (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay vehículos disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vuelve más tarde para ver nuevos vehículos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;