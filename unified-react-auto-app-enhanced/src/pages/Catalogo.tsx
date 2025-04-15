import React from 'react';
import { useState, useEffect } from 'react';
import { Auto } from '../types';
import { Link } from 'react-router-dom';


const dummyAutos: Auto[] = [
  {
    id: '1',
    ordencompra: 'OC-001',
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2022,
    precio: 285000,
    imagenUrl: 'https://via.placeholder.com/300x200?text=Toyota+Corolla',
    status: 'Disponible',
  },
  {
    id: '2',
    ordencompra: 'OC-002',
    marca: 'Honda',
    modelo: 'Civic',
    año: 2021,
    precio: 310000,
    imagenUrl: 'https://via.placeholder.com/300x200?text=Honda+Civic',
    status: 'Disponible',
  },
  {
    id: '3',
    ordencompra: 'OC-003',
    marca: 'Mazda',
    modelo: '3',
    año: 2023,
    precio: 335000,
    imagenUrl: 'https://via.placeholder.com/300x200?text=Mazda+3',
    status: 'Disponible',
  }
];

const Catalogo = () => {
  const [autos, setAutos] = useState<Auto[]>([]);

  useEffect(() => {
    // Simulating data fetch
    setAutos(dummyAutos);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Catálogo de Autos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {autos.map((auto) => (
          <div key={auto.id} className="border rounded-lg shadow p-4">
            <img src={auto.imagenUrl} alt={auto.modelo} className="w-full h-40 object-cover rounded" />
            <h3 className="text-xl font-semibold mt-2">{auto.marca} {auto.modelo}</h3>
            <p className="text-gray-600">Año: {auto.año}</p>
            <p className="text-green-600 font-bold">${auto.precio.toLocaleString()}</p>
            <Link to={`/autos/${auto.ordencompra}`} className="block mt-3 text-blue-500 hover:underline">
              Solicitar financiamiento
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalogo;
