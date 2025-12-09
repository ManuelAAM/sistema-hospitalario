import React, { useState } from 'react';
import { Activity, Key, ArrowLeft } from 'lucide-react';
import { login as authLogin, recoverPasswordByLicense } from '../services/auth';

export default function LoginForm({ onLoginSuccess, onBackToHome }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  
  // Recovery form states
  const [licenseNumber, setLicenseNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 Login form submitted!');
    console.log('📝 Username:', username);
    console.log('📝 Password length:', password.length);
    setError('');
    setIsLoading(true);

    try {
      console.log('🔄 Calling authLogin function...');
      const user = await authLogin(username, password);
      console.log('✅ Login successful! User:', user);
      console.log('🔄 Calling onLoginSuccess...');
      onLoginSuccess(user);
      setUsername('');
      setPassword('');
    } catch (err) {
      console.error('❌ Login failed:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRecoverySuccess(null);
    setIsLoading(true);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Attempt recovery
      const result = await recoverPasswordByLicense(licenseNumber, newPassword);
      
      setRecoverySuccess({
        message: result.message,
        username: result.username,
        name: result.name
      });
      
      // Clear form
      setLicenseNumber('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto return to login after 4 seconds
      setTimeout(() => {
        setShowRecovery(false);
        setRecoverySuccess(null);
      }, 4000);
      
    } catch (err) {
      console.error('❌ Recovery failed:', err);
      setError(err.message || 'Error al recuperar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowRecovery(false);
    setError('');
    setRecoverySuccess(null);
    setLicenseNumber('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999
      }}
      onClick={showRecovery ? undefined : onBackToHome}
    >
      <div 
        className="glass-effect p-12 md:p-16 rounded-3xl shadow-2xl max-w-2xl w-full animate-scaleIn border-2 border-white/30 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl opacity-60 animate-pulse"></div>
              <div className="relative bg-white p-6 rounded-3xl shadow-2xl">
                <Activity className="text-purple-600" size={72} />
              </div>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {showRecovery ? 'Recuperación' : 'Bienvenido'}
              </span>
            </h2>
            <p className="text-white font-bold text-2xl mb-2">Hospital San Rafael</p>
            <p className="text-blue-200 text-lg">
              {showRecovery ? '🔑 Recuperar Contraseña' : 'Sistema de Gestión Hospitalaria'}
            </p>
            <div className="mt-5 w-32 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
        
          {error && (
            <div className="mb-8 p-6 bg-red-500/90 border-l-8 border-red-700 rounded-2xl animate-slideInLeft shadow-2xl">
              <p className="text-xl text-white font-bold">❌ {error}</p>
            </div>
          )}

          {recoverySuccess && (
            <div className="mb-8 p-6 bg-green-500/90 border-l-8 border-green-700 rounded-2xl shadow-2xl animate-slideInLeft">
              <p className="text-xl text-white font-bold mb-2">✅ {recoverySuccess.message}</p>
              <p className="text-white">Usuario: <strong>{recoverySuccess.username}</strong></p>
              <p className="text-white">Enfermero(a): <strong>{recoverySuccess.name}</strong></p>
              <p className="text-sm text-green-200 mt-2">Redirigiendo al login...</p>
            </div>
          )}

          {/* Recovery Form */}
          {showRecovery ? (
            <form onSubmit={handleRecoverySubmit} className="space-y-8">
              <div>
                <label htmlFor="licenseNumber" className="block text-2xl font-bold text-white mb-3">
                  📋 Cédula Profesional
                </label>
                <input
                  id="licenseNumber"
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-6 py-5 bg-white/90 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all shadow-lg hover:shadow-xl text-xl"
                  placeholder="Ej: 1234567"
                  required
                  disabled={isLoading}
                  autoComplete="off"
                />
                <p className="text-sm text-blue-200 mt-2">
                  Ingrese su número de cédula profesional de enfermería
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-2xl font-bold text-white mb-3">
                  🔒 Nueva Contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-white/90 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all shadow-lg hover:shadow-xl text-xl"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  minLength="6"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-2xl font-bold text-white mb-3">
                  ✅ Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-white/90 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all shadow-lg hover:shadow-xl text-xl"
                  placeholder="Repita la contraseña"
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-2xl shadow-2xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-3 w-7 h-7 border-3"></div>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Key className="mr-3" size={28} />
                    Recuperar Contraseña
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="w-full py-5 text-white hover:text-purple-200 transition font-bold text-xl hover:bg-white/10 rounded-2xl border-2 border-white/30 hover:border-white/50 flex items-center justify-center"
              >
                <ArrowLeft className="mr-2" size={24} />
                Volver al Login
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="username" className="block text-2xl font-bold text-white mb-3">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-5 bg-white/90 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-lg hover:shadow-xl text-xl"
                  placeholder="Ingrese su nombre de usuario"
                  required
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-2xl font-bold text-white mb-3">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-white/90 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-lg hover:shadow-xl text-xl"
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-2xl shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-3 w-7 h-7 border-3"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              {/* Recovery Link */}
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="w-full text-white hover:text-green-300 transition font-semibold text-lg underline decoration-2 underline-offset-4"
              >
                ¿Olvidaste tu contraseña? 🔑 Recupérala aquí
              </button>

              <div className="mt-10 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                <p className="text-lg text-white font-bold mb-4 flex items-center">
                  <span className="w-3 h-3 bg-purple-400 rounded-full mr-3"></span>
                  Usuarios de Prueba
                </p>
                <div className="space-y-3 text-base text-white">
                  <div className="flex items-center bg-white/20 p-4 rounded-xl hover:bg-white/30 transition cursor-pointer">
                    <span className="mr-3 text-2xl">👨‍⚕️</span>
                    <div>
                      <strong className="text-white block text-lg">Enfermero</strong>
                      <span className="text-blue-200">enfermero / enfermero123</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/20 p-4 rounded-xl hover:bg-white/30 transition cursor-pointer">
                    <span className="mr-3 text-2xl">👤</span>
                    <div>
                      <strong className="text-white block text-lg">Paciente</strong>
                      <span className="text-blue-200">paciente / paciente123</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/20 p-4 rounded-xl hover:bg-white/30 transition cursor-pointer">
                    <span className="mr-3 text-2xl">🔐</span>
                    <div>
                      <strong className="text-white block text-lg">Admin</strong>
                      <span className="text-blue-200">admin / admin123</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onBackToHome}
                type="button"
                className="w-full mt-8 py-5 text-white hover:text-purple-200 transition font-bold text-xl hover:bg-white/10 rounded-2xl border-2 border-white/30 hover:border-white/50"
              >
                ← Volver al inicio
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
