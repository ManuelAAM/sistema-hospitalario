import React, { useState } from 'react';
import { UserPlus, User, Lock, Mail, ArrowLeft, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { register as authRegister } from '../services/auth'; // Asegúrate de tener esta función o simúlala

export default function RegisterForm({ onRegisterSuccess, onBackToHome }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'nurse'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulación de carga para efecto visual
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Aquí iría tu lógica real de registro:
      // await authRegister(formData);
      
      // Por ahora, simulamos éxito para el demo
      alert("Cuenta creada correctamente. Por favor inicie sesión.");
      onRegisterSuccess();
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn ml-auto mr-auto bg-hospital-50">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full grid md:grid-cols-5 overflow-hidden animate-scaleIn border border-hospital-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* COLUMNA IZQUIERDA - FORMULARIO */}
        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1 relative">
          <button 
            onClick={onBackToHome} 
            className="absolute top-8 left-8 text-hospital-400 hover:text-hospital-800 transition flex items-center gap-2 font-bold text-sm"
          >
            <ArrowLeft size={18} /> Volver al Login
          </button>

          <div className="mt-8 mb-6">
            <h3 className="text-3xl font-black text-hospital-800 mb-2">Crear Cuenta</h3>
            <p className="text-hospital-500 text-lg">Únete al equipo médico de San Rafael.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-hospital-600 ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-hospital-50 border-2 border-hospital-100 rounded-xl focus:border-clinical-primary focus:bg-white outline-none transition-all font-medium text-hospital-800"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-hospital-600 ml-1">Usuario</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-3 top-3.5 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-hospital-50 border-2 border-hospital-100 rounded-xl focus:border-clinical-primary focus:bg-white outline-none transition-all font-medium text-hospital-800"
                    placeholder="Usuario único"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-hospital-600 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-hospital-50 border-2 border-hospital-100 rounded-xl focus:border-clinical-primary focus:bg-white outline-none transition-all font-medium text-hospital-800"
                  placeholder="ejemplo@hospital.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-hospital-600 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-hospital-50 border-2 border-hospital-100 rounded-xl focus:border-clinical-primary focus:bg-white outline-none transition-all font-medium text-hospital-800"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 bg-hospital-800 text-white rounded-xl hover:bg-hospital-900 transition-all font-bold text-lg shadow-xl shadow-gray-200 disabled:opacity-50 flex justify-center items-center gap-2 group"
            >
              {isLoading ? 'Procesando...' : <>Registrar Cuenta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA - DECORATIVA (Alineada con el Login) */}
        <div className="hidden md:flex md:col-span-2 bg-gradient-to-bl from-clinical-primary to-clinical-dark p-10 flex-col justify-center items-center text-white relative overflow-hidden order-1 md:order-2">
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-10">
            <Activity size={300} />
          </div>
          
          <div className="text-center relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl inline-block mb-6 backdrop-blur-sm shadow-lg">
               <UserPlus size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-black mb-4">¿Ya tienes cuenta?</h2>
            <p className="text-clinical-light mb-8 max-w-xs mx-auto">
              Accede al portal de enfermería para gestionar pacientes y tratamientos.
            </p>
            <button 
              onClick={onBackToHome}
              className="px-8 py-3 bg-white text-clinical-primary rounded-xl font-bold hover:bg-clinical-light transition shadow-lg"
            >
              Iniciar Sesión
