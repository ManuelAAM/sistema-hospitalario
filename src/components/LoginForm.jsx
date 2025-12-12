import React, { useState } from 'react';
import { Activity, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { login as authLogin } from '../services/auth';

// Nota: He añadido la prop `onShowRegister` para futuras implementaciones si lo necesitas.
export default function LoginForm({ onLoginSuccess, onBackToHome, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Pequeño timeout para simular carga y que se vea el spinner
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = await authLogin(username, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
      setIsLoading(false);
    }
  };

  return (
    // El contenedor principal ahora es transparente para superponerse al fondo de App.jsx
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn ml-auto mr-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full grid md:grid-cols-5 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Columna Izquierda - Decorativa */}
        <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-clinical-primary to-clinical-dark p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
            <Activity size={300} />
          </div>
          <div>
            <div className="bg-white/20 p-3 rounded-2xl inline-block mb-6 backdrop-blur-sm">
               <Activity size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black leading-tight mb-4">Hospital San Rafael</h2>
            <p className="text-clinical-light text-lg font-medium">Sistema Integral de Gestión Clínica y Enfermería.</p>
          </div>
          <div className="text-sm text-clinical-light/80 font-medium">
            © 2025. Versión 3.0 (Enterprise UI)
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="md:col-span-3 p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-hospital-800 mb-2">Bienvenido de nuevo</h3>
            <p className="text-hospital-500 text-lg">Ingrese sus credenciales para acceder al panel.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-slideInLeft">
              <div className="bg-red-100 p-2 rounded-full text-red-600 flex-shrink-0">
                 <AlertCircle size={20} />
              </div>
              <p className="text-sm text-red-800 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-hospital-700 mb-2 ml-1">Nombre de Usuario</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={22} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-hospital-50 border-2 border-hospital-100 rounded-2xl focus:border-clinical-primary focus:bg-white outline-none transition-all font-medium text-hospital-800 text-lg placeholder:text-hospital-300"
                  placeholder="ej. enfermero"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-hospital-700 mb-2 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={22} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-hospital-50 border-2 border-hospital-100 rounded-2xl focus:border-clinical-primary focus:bg-white outline-none transition-all font-medium text-hospital-800 text-lg placeholder:text-hospital-300 tracking-wider"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-4 bg-clinical-primary text-white rounded-2xl hover:bg-clinical-dark transition-all font-bold text-lg shadow-xl shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform"/>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-hospital-100 text-center">
            <p className="text-sm text-hospital-500 mb-3 font-medium">Credenciales de Acceso Demo:</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-clinical-dark rounded-full text-sm font-bold border border-blue-100">
              <User size={16}/> enfermero / enfermeros123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
