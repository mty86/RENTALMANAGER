import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';

export default function InstallPwaModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#12172b] border border-[#242e50] rounded-3xl max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white relative">
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-neon-pink to-transparent opacity-80" />

        {/* Header */}
        <div className="px-6 py-5 bg-[#0b0e1b] flex items-center justify-between border-b border-[#1e2642]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neon-pink/15 border border-neon-pink/40 flex items-center justify-center text-neon-pink shadow-glow-pink">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Descargar Página Web</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-neon-pink/20 text-neon-pink border border-neon-pink/40">
                  PWA
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Instalar como aplicación en tu dispositivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#182038] text-slate-400 hover:text-white border border-[#242e50] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {isInstalled ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-black text-white">¡Rental Manager ya está instalada!</h4>
              <p className="text-xs text-slate-300">
                La aplicación ya se encuentra descargada en tu dispositivo. Puedes abrirla directamente desde tu pantalla de inicio o escritorio sin necesidad de navegador.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3.5 p-3.5 bg-[#0b0e1b] rounded-2xl border border-[#1e2642]">
                <img src="/logo.png" alt="Rental Pro" className="w-12 h-12 rounded-2xl p-1 bg-white/5 border border-white/10 shrink-0 shadow-glow-pink" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>Rental Manager PRO</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">rentalmanager.com • Acceso Rápido</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Funciona Sin Conexión
                    </span>
                  </div>
                </div>
              </div>

              {/* iOS Instructions */}
              {isIOS ? (
                <div className="space-y-3 bg-[#0b0e1b] p-4 rounded-2xl border border-[#1e2642] text-xs">
                  <span className="font-bold text-neon-cyan block uppercase tracking-wide text-[10px]">
                    Instrucciones para iPhone / iPad (Safari):
                  </span>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#182038] border border-[#242e50] flex items-center justify-center text-neon-pink font-bold shrink-0">
                      1
                    </div>
                    <p className="text-slate-300">
                      Toca el botón <strong className="text-white">Compartir</strong> de Safari (el icono de un cuadro con flecha hacia arriba <Share2 className="w-3.5 h-3.5 inline text-neon-cyan" />).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#182038] border border-[#242e50] flex items-center justify-center text-neon-pink font-bold shrink-0">
                      2
                    </div>
                    <p className="text-slate-300">
                      Desliza y selecciona <strong className="text-white">"Agregar a pantalla de inicio"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-neon-pink" />).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#182038] border border-[#242e50] flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      3
                    </div>
                    <p className="text-slate-300">
                      Toca <strong className="text-white">"Agregar"</strong> y ¡listo! Se abrirá como app independiente a pantalla completa.
                    </p>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-black rounded-2xl text-xs shadow-glow-pink hover:shadow-glow-pink-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Aplicación en Este Dispositivo</span>
                </button>
              ) : (
                <div className="space-y-3 bg-[#0b0e1b] p-4 rounded-2xl border border-[#1e2642] text-xs">
                  <span className="font-bold text-neon-cyan block uppercase tracking-wide text-[10px]">
                    Cómo instalar en tu navegador (Chrome / Edge / Celular):
                  </span>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <Laptop className="w-4 h-4 text-neon-pink shrink-0 mt-0.5" />
                    <span>
                      En tu barra de direcciones arriba, haz clic en el icono de <strong className="text-white">"Instalar aplicación"</strong> o en el menú de 3 puntos selecciona <strong className="text-white">"Instalar Rental Manager"</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <Smartphone className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
                    <span>
                      En celulares Android: abre el menú del navegador (3 puntos) y pulsa <strong className="text-white">"Añadir a la pantalla de inicio"</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>Sin barra de navegador</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-pink" />
                  <span>Carga ultra rápida</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Notificaciones en vivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acceso desde escritorio</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0b0e1b] border-t border-[#1e2642] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#182038] hover:bg-[#242e50] border border-[#242e50] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
          >
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
