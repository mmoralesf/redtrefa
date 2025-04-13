import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Car, User, Upload, X } from 'lucide-react';

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
}

interface Profile {
  username: string;
  phone_number: string;
  address: string;
  company_name: string;
  bio: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [perfil, setPerfil] = useState<Profile>({
    username: '',
    phone_number: '',
    address: '',
    company_name: '',
    bio: '',
  });
  const [datosFormulario, setDatosFormulario] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    description: '',
    photos: [] as string[],
  });
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [cargandoFotos, setCargandoFotos] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      obtenerVehiculos();
      obtenerPerfil();
    }
  }, [user]);

  const obtenerPerfil = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone_number, address, company_name, bio')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setPerfil(data);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      setError('Error al cargar el perfil');
    }
  };

  const actualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: perfil.phone_number,
          address: perfil.address,
          company_name: perfil.company_name,
          bio: perfil.bio,
        })
        .eq('id', user.id);

      if (error) throw error;
      setMostrarPerfil(false);
      setError('');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar el perfil');
    }
  };

  const obtenerVehiculos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVehiculos(data || []);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      setError('Error al cargar los vehículos');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setArchivosSeleccionados(prevFiles => [...prevFiles, ...files]);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivosSeleccionados(files => files.filter((_, i) => i !== index));
  };

  const subirFotos = async () => {
    if (!user || archivosSeleccionados.length === 0) return [];

    const urls: string[] = [];
    setCargandoFotos(true);

    try {
      for (const file of archivosSeleccionados) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vehicle-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(filePath);

        urls.push(data.publicUrl);
      }
    } catch (error) {
      console.error('Error al subir fotos:', error);
      setError('Error al subir las fotos');
    }

    setCargandoFotos(false);
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const photoUrls = await subirFotos();
      
      const { error } = await supabase
        .from('vehicles')
        .insert([{ 
          ...datosFormulario, 
          user_id: user?.id,
          photos: photoUrls,
        }]);

      if (error) throw error;

      setMostrarFormulario(false);
      setDatosFormulario({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        description: '',
        photos: [],
      });
      setArchivosSeleccionados([]);
      obtenerVehiculos();
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setError('Error al crear el vehículo');
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const traducirEstado = (estado: string) => {
    switch (estado) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Vehículos</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setMostrarPerfil(true)}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            <User className="h-5 w-5" />
            <span>Mi Perfil</span>
          </button>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Vehículo</span>
          </button>
        </div>
      </div>

      {mostrarPerfil && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mi Perfil</h2>
              <button
                onClick={() => setMostrarPerfil(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={actualizarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  value={perfil.phone_number || ''}
                  onChange={(e) => setPerfil({ ...perfil, phone_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  value={perfil.address || ''}
                  onChange={(e) => setPerfil({ ...perfil, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={perfil.company_name || ''}
                  onChange={(e) => setPerfil({ ...perfil, company_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Biografía</label>
                <textarea
                  value={perfil.bio || ''}
                  onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setMostrarPerfil(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Enviar Nuevo Vehículo</h2>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca</label>
                  <input
                    type="text"
                    required
                    value={datosFormulario.make}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, make: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modelo</label>
                  <input
                    type="text"
                    required
                    value={datosFormulario.model}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, model: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Año</label>
                  <input
                    type="number"
                    required
                    value={datosFormulario.year}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, year: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kilometraje</label>
                  <input
                    type="number"
                    required
                    value={datosFormulario.mileage}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, mileage: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  required
                  value={datosFormulario.description}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotos</label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <Upload className="h-5 w-5 mr-2" />
                      <span>Seleccionar Fotos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {archivosSeleccionados.length} archivos seleccionados
                    </span>
                  </div>
                  {archivosSeleccionados.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {archivosSeleccionados.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarArchivo(index)}
                            className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoFotos}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {cargandoFotos ? 'Subiendo...' : 'Enviar'}
                </button>
              </div>
            </form>
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
                  <p className="text-gray-600 mt-1">
                    {vehiculo.mileage.toLocaleString()} kilómetros
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerColorEstado(vehiculo.status)}`}>
                  {traducirEstado(vehiculo.status)}
                </span>
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
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin vehículos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo vehículo para revisión.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;