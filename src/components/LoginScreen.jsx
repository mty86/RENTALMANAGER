import React, { useState } from 'react';
import {
  ShieldCheck,
  Briefcase,
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('superadmin'); // 'superadmin' | 'empleado' | 'cliente'
  const [email, setEmail] = useState('admin@rentalmanager.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    if (roleKey === 'superadmin') {
      setEmail('admin@rentalmanager.com');
      setPassword('admin123');
    } else if (roleKey === 'empleado') {
      setEmail('empleado@rentalmanager.com');
      setPassword('emp123');
    } else if (roleKey === 'cliente') {
      setEmail('cliente@rentalmanager.com');
      setPassword('cliente123');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let roleToSet = selectedRole;
      let userName = 'Administrador General';

      const emailLower = email.toLowerCase().trim();
      if (emailLower.includes('admin') || selectedRole === 'superadmin') {
        roleToSet = 'superadmin';
        userName = 'Director General (Admin)';
      } else if (emailLower.includes('empleado') || emailLower.includes('chofer') || selectedRole === 'empleado') {
        roleToSet = 'empleado';
        userName = 'Carlos Méndez (Logística & Operaciones)';
      } else {
        roleToSet = 'cliente';
        userName = 'Juan Carlos Pérez (Cliente)';
      }

      const userData = {
        role: roleToSet,
        email: emailLower,
        name: userName,
        loggedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('rental_manager_auth_user', JSON.stringify(userData));
      } catch (err) {}

      setIsLoading(false);
      if (onLogin) {
        onLogin(userData);
      }
    }, 300);
  };

  const handleQuickLogin = (roleKey) => {
    handleRoleSelect(roleKey);
    let name = 'Director General';
    let mail = 'admin@rentalmanager.com';
    if (roleKey === 'empleado') {
      name = 'Carlos Méndez (Logística)';
      mail = 'empleado@rentalmanager.com';
    } else if (roleKey === 'cliente') {
      name = 'Juan Carlos Pérez';
      mail = 'cliente@rentalmanager.com';
    }

    const userData = {
      role: roleKey,
      email: mail,
      name,
      loggedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('rental_manager_auth_user', JSON.stringify(userData));
    } catch (err) {}

    if (onLogin) {
      onLogin(userData);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-neon-pink/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-neon-cyan/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Rental Manager"
              className="h-10 w-10 object-contain rounded-2xl p-1 bg-white/5 border border-white/10 shadow-glow-pink"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-pink border-2 border-[#090d16] shadow-[0_0_8px_#ff2e93]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider uppercase text-white">Rental</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-neon-pink/20 text-neon-pink border border-neon-pink/40 shadow-glow-pink tracking-widest uppercase">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Manager System • v2.4</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-bold">Servidor Activo</span>
        </div>
      </header>

      {/* Main Login */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-[#12172b]/95 backdrop-blur-2xl border border-[#242e50] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative">
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-neon-pink to-transparent opacity-80" />

            <div className="text-center space-y-1.5 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-bold shadow-glow-pink mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal de Acceso Seguro</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-400">
                Selecciona tu perfil o ingresa tus credenciales
              </p>
            </div>

            {/* Profile Selection Tabs */}
            <div className="mb-6">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Selecciona Perfil de Acceso
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0b0e1b] rounded-2xl border border-[#1e2642]">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('superadmin')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'superadmin'
                      ? 'bg-gradient-to-r from-neon-pink to-purple-600 text-white shadow-glow-pink font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-1" />
                  <span className="text-[11px] leading-tight">Superadmin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('empleado')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'empleado'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mb-1" />
                  <span className="text-[11px] leading-tight">Empleado</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('cliente')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'cliente'
                      ? 'bg-gradient-to-r from-neon-cyan to-blue-600 text-slate-950 shadow-glow-cyan font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-4 h-4 mb-1" />
                  <span className="text-[11px] leading-tight">Cliente</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@rentalmanager.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0b0e1b] border border-[#1e2642] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-slate-500">Acceso protegido</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0b0e1b] border border-[#1e2642] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-black rounded-xl text-xs shadow-glow-pink hover:shadow-glow-pink-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{isLoading ? 'Comprobando acceso...' : 'Ingresar al Sistema'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {/* Quick Direct 1-Click Access Buttons */}
            <div className="mt-6 pt-5 border-t border-[#1e2642]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
                Acceso Rápido Directo (1 Clic)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('superadmin')}
                  className="py-1.5 px-2 bg-[#182038] hover:bg-neon-pink/20 hover:border-neon-pink/50 border border-[#242e50] rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all text-center"
                >
                  ⚡ Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('empleado')}
                  className="py-1.5 px-2 bg-[#182038] hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-[#242e50] rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all text-center"
                >
                  ⚡ Empleado
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('cliente')}
                  className="py-1.5 px-2 bg-[#182038] hover:bg-neon-cyan/20 hover:border-neon-cyan/50 border border-[#242e50] rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all text-center"
                >
                  ⚡ Cliente
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#12172b]/80 border border-[#1e2642] rounded-2xl p-2.5">
              <MapPin className="w-4 h-4 text-neon-cyan mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white">Rutas GPS</div>
              <div className="text-[9px] text-slate-400">Mapas Dark</div>
            </div>
            <div className="bg-[#12172b]/80 border border-[#1e2642] rounded-2xl p-2.5">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white">Alertas +24h</div>
              <div className="text-[9px] text-slate-400">Sin recoger</div>
            </div>
            <div className="bg-[#12172b]/80 border border-[#1e2642] rounded-2xl p-2.5">
              <Layers className="w-4 h-4 text-neon-pink mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white">Catálogo Puro</div>
              <div className="text-[9px] text-slate-400">Sin precios</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-500 border-t border-[#1a223c]">
        <span>Rental Manager Pro &copy; 2026 • Plataforma Empresarial de Alquiler de Mobiliario</span>
      </footer>
    </div>
  );
}
