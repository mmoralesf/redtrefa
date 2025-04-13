import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Car } from 'lucide-react';

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  precio: number;
  kilometraje: number;
  descripcion: string | null;
  imagenes: string[];
  disponible: boolean;
}

function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('disponible', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Vehículos Disponibles</h1>
      
      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay vehículos disponibles</h3>
          <p className="mt-2 text-gray-500">Vuelve más tarde para ver nuevos vehículos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={vehicle.imagenes[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {vehicle.marca} {vehicle.modelo}
                </h2>
                <p className="text-gray-600">{vehicle.ano}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${vehicle.precio.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    {vehicle.kilometraje.toLocaleString()} km
                  </span>
                </div>
                <p className="mt-2 text-gray-600 line-clamp-2">{vehicle.descripcion}</p>
                <Link
                  to={`/aplicar/${vehicle.id}`}
                  className="mt-4 block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Aplicar Ahora
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VehicleList;