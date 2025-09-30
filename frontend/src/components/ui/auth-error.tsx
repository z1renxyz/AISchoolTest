'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Waves } from './wave-background';

export function AuthError() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background */}
      <Waves 
        backgroundColor="#000000" 
        strokeColor="#ffffff"
        pointerSize={0.3}
        className="fixed inset-0 -z-10"
      />

      {/* Main Content */}
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-black/20 border border-red-500/20 rounded-2xl backdrop-blur-sm p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Ошибка авторизации
            </h1>
            
            <p className="text-white/70 mb-6">
              Приложение должно быть запущено в Telegram. 
              Пожалуйста, откройте его через бота.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-6 py-3 hover:bg-white/20 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Попробовать снова</span>
              </button>
              
              <p className="text-white/50 text-sm">
                Если проблема сохраняется, обратитесь к администратору
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
