'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Home as HomeIcon, BookOpen, TrendingUp, User, Mail, Lock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/topics', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        router.push('/');
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        const result = await register(formData.email, formData.password, formData.name);
        
        if (result.needsEmailConfirmation) {
          setShowEmailConfirmation(true);
        } else {
          router.push('/');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background */}
      <Waves 
        backgroundColor="#000000" 
        strokeColor="#ffffff"
        pointerSize={0.3}
        className="fixed inset-0 -z-10"
      />

      {/* Navigation */}
      <NavBar 
        items={navItems} 
        logo={
          <Image 
            src="/logo.svg" 
            alt="Школа ИИ с Владиславом" 
            width={40} 
            height={40}
            className="w-10 h-10 brightness-0 invert"
          />
        }
      />

      {/* Email Confirmation Modal */}
      {showEmailConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Подтвердите ваш email
              </h2>
              <p className="text-white/70 mb-6">
                Мы отправили письмо с подтверждением на <strong>{formData.email}</strong>. 
                Пожалуйста, проверьте вашу почту и перейдите по ссылке для активации аккаунта.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowEmailConfirmation(false);
                    setIsLogin(true);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Понятно
                </button>
                <button
                  onClick={() => setShowEmailConfirmation(false)}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 w-full min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Вход в систему' : 'Регистрация'}
              </h1>
              <p className="text-white/70">
                {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
              </p>
            </div>

            {/* Auth Form */}
            <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Имя
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                        placeholder="Введите ваше имя"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                      placeholder="Введите ваш email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                      placeholder="Введите пароль"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Подтвердите пароль
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                        placeholder="Подтвердите пароль"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <ShinyButton 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black/20 border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                </ShinyButton>
              </form>

              {/* Toggle Auth Mode */}
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-white hover:text-white/80 transition-colors font-medium"
                  >
                    {isLogin ? 'Зарегистрироваться' : 'Войти'}
                  </button>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link href="/">
                <ShinyButton className="bg-white/10 border-white/20 text-white">
                  Вернуться на главную
                </ShinyButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

