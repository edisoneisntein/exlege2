import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext.tsx';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#13081e]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl shadow-2xl shadow-black/90 p-8 md:p-10 w-full max-w-md">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-cinzel text-[#f5d76e]">Acceso a EXLEGE</h2>
            <button
              onClick={() => {
                // Cerrar modal (en una implementación real, esto sería manejado por el estado padre)
                // Por ahora, solo limpiamos el formulario
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className="text-[#f5d76e]/60 hover:text-[#f5d76e] transition-colors"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-cinzel text-[#f5d76e]">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-transparent border-b border-[#C5A059]/40 pb-1 text-sm text-slate-100 focus:outline-none focus:border-[#f5d76e]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-cinzel text-[#f5d76e]">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-[#C5A059]/40 pb-1 text-sm text-slate-100 focus:outline-none focus:border-[#f5d76e]"
                required
              />
            </div>
            
            {error && (
              <p className="text-sm text-rose-400 font-cinzel">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#59143a] via-[#8a2232] to-[#59143a] hover:from-[#731a4b] hover:to-[#731a4b] text-white rounded-xl text-xs font-cinzel font-black tracking-widest uppercase shadow-[0_0_20px_rgba(138,34,50,0.6)] border border-[#ff8597] flex items-center gap-2 px-6 py-2.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Accediendo...' : 'Iniciar sesión'}
            </button>
          </form>
          
          <div className="text-xs text-[#f5d76e]/60 text-center">
            ¿No tienes acceso? <span className="text-[#f5d76e] hover:text-[#f5d76e]/80 cursor-pointer">Solicítalo aquí</span>
          </div>
        </div>
      </div>
    </div>
  );
};