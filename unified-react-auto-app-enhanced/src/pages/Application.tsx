import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useAuth from '../hooks/useAuth';

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  precio: number;
}

function Application() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    ingreso_mensual: '',
    empleo: '',
    tiempo_empleo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchVehicle() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .single();

        if (error) throw error;
        if (data) setVehicle(data);
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('No se pudo cargar la información del vehículo');
      }
    }

    fetchVehicle();
  }, [vehicleId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('applications').insert([
        {
          vehicle_id: vehicleId,
          user_id: user?.id,
          ingreso_mensual: parseFloat(formData.ingreso_mensual),
          empleo: formData.empleo,
          tiempo_empleo: parseInt(formData.tiempo_empleo),
        },
      ]);

      if (error) throw error;

      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Error al enviar la solicitud. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Solicitud de Financiamiento</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Detalles del Vehículo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Marca</p>
              <p className="font-medium">{vehicle.marca}</p>
            </div>
            <div>
              <p className="text-gray-600">Modelo</p>
              <p className="font-medium">{vehicle.modelo}</p>
            </div>
            <div>
              <p className="text-gray-600">Año</p>
              <p className="font-medium">{vehicle.ano}</p>
            </div>
            <div>
              <p className="text-gray-600">Precio</p>
              <p className="font-medium">${vehicle.precio.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="ingreso_mensual" className="block text-sm font-medium text-gray-700">
                Ingreso Mensual
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="ingreso_mensual"
                  id="ingreso_mensual"
                  required
                  value={formData.ingreso_mensual}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="empleo" className="block text-sm font-medium text-gray-700">
                Empleo Actual
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="empleo"
                  id="empleo"
                  required
                  value={formData.empleo}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tiempo_empleo" className="block text-sm font-medium text-gray-700">
                Tiempo en el Empleo (meses)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="tiempo_empleo"
                  id="tiempo_empleo"
                  required
                  value={formData.tiempo_empleo}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Application;