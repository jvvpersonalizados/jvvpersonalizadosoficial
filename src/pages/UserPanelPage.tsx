import React, { useState, useRef } from 'react';
import { Layout, Package, Settings, LogOut, UserCircle, Camera, Save, Truck, Mail, Lock, UserPlus, ArrowRight, ShieldIcon, Rocket, RefreshCw, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { OrbitalLogo } from '../components/OrbitalLogo';
import { apiService } from '../services/apiService';

interface UserPanelPageProps {
  user: any;
  setUser: (user: any) => void;
  checkoutData: any;
  setCheckoutData: (data: any) => void;
  t: (br: any, int: any) => any;
  formatPrice: (price: number) => string;
  openReviewModal: () => void;
}

export const UserPanelPage: React.FC<UserPanelPageProps> = ({ user, setUser, checkoutData, setCheckoutData, t, formatPrice, openReviewModal }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showSaveMsg, setShowSaveMsg] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin states
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [promptIA, setPromptIA] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.login(loginEmail, loginPass);
      if (res.success) {
        setUser(res.data || { name: loginEmail.split('@')[0], email: loginEmail });
      } else {
        setError(res.message || t('Credenciais inválidas.', 'Invalid credentials.'));
      }
    } catch (err) {
      setError(t('Erro ao conectar com a galáxia.', 'Error connecting to the galaxy.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.register({ name: regName, email: regEmail, pass: regPass });
      if (res.success) {
        setUser({ name: regName, email: regEmail });
      } else {
        setError(res.message || t('Erro ao criar conta.', 'Error creating account.'));
      }
    } catch (err) {
      setError(t('Erro ao conectar com a galáxia.', 'Error connecting to the galaxy.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setShowSaveMsg(true);
    setTimeout(() => setShowSaveMsg(false), 3000);
  };

  const formatBDay = (dateStr: string) => {
    if (!dateStr) return t('Não definida', 'Not set');
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const menuItems = [
    { id: 'dashboard', n: t('Dashboard', 'Dashboard'), i: Layout },
    { id: 'orders', n: t('Pedidos', 'Orders'), i: Package },
    { id: 'settings', n: t('Perfil', 'Profile'), i: Settings },
    ...(user?.email === 'vitor.trindadeit@gmail.com' ? [{ id: 'admin', n: t('ADMIN', 'ADMIN'), i: ShieldIcon }] : []),
    { id: 'logout', n: t('Sair', 'Logout'), i: LogOut }
  ];

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, statsRes, catalogRes] = await Promise.all([
        apiService.getOrders(),
        apiService.getUsers(),
        apiService.getAdminStats(),
        apiService.getCatalog()
      ]);
      if (ordersRes.success) setAdminOrders(ordersRes.data);
      if (usersRes.success) setAdminUsers(usersRes.data);
      if (statsRes.success) setAdminStats(statsRes.data);
      if (catalogRes.success) setAdminProducts(catalogRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const res = await apiService.updateOrderStatus(orderId, status);
    if (res.success) fetchAdminData();
  };

  const handleGeneratePost = async () => {
    if (!promptIA) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptIA })
      });
      const data = await response.json();
      if (data.success) {
        alert(t("Postagem gerada e publicada com sucesso!", "Post generated and published successfully!"));
        setPromptIA('');
        fetchAdminData();
      }
    } catch (err) {
      alert(t("Erro ao gerar postagem.", "Error generating post."));
    } finally {
      setIsGenerating(false);
    }
  };

  const ordersList = [
    { id: 'JVV-TEST-2026', date: '12/03/2026', total: 149.90, status: t('Em Produção', 'In Production'), progress: 65, items: 'Copo JVV Pro Térmico' },
    { id: 'JVV-9942', date: '05/02/2026', total: 89.90, status: t('Entregue', 'Delivered'), progress: 100, items: 'Camiseta Black Hole' },
    { id: 'JVV-7721', date: '15/01/2026', total: 210.00, status: t('Entregue', 'Delivered'), progress: 100, items: 'Personalizado VIP' }
  ];

  if (!user) return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 animate-fade text-center text-white font-jakarta">
      <div className="max-w-md mx-auto bg-white/[0.02] border border-white/10 p-8 md:p-16 rounded-[40px] md:rounded-[65px] backdrop-blur-3xl shadow-3xl">
        <OrbitalLogo size="small" />
        <h2 className="text-3xl md:text-4xl font-black italic uppercase my-8 md:my-12 tracking-tighter">
          {isRegistering ? t('CRIAR CONTA', 'CREATE ACCOUNT') : t('MINHA CONTA', 'MY ACCOUNT')}
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-6">
            {error}
          </div>
        )}

        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-4 md:space-y-6">
            <div className="relative">
              <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                type="text" 
                placeholder={t('NOME COMPLETO', 'FULL NAME')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                type="email" 
                placeholder={t('E-MAIL', 'EMAIL')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
                type="password" 
                placeholder={t('SENHA', 'PASSWORD')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full py-5 md:py-6 bg-[var(--theme-primary)] text-white font-black uppercase italic rounded-2xl md:rounded-3xl hover:opacity-90 transition-all shadow-2xl text-xs flex items-center justify-center gap-3"
            >
              {isLoading ? t('PROCESSANDO...', 'PROCESSING...') : (
                <>
                  {t('Cadastrar na Estação', 'Register at Station')}
                  <UserPlus size={16} />
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={() => setIsRegistering(false)}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {t('Já tem conta? Entrar', 'Already have an account? Login')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                type="email" 
                placeholder={t('E-MAIL', 'EMAIL')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                type="password" 
                placeholder={t('SENHA', 'PASSWORD')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full py-5 md:py-6 bg-white text-black font-black uppercase italic rounded-2xl md:rounded-3xl hover:bg-[var(--theme-primary)] hover:text-white transition-all shadow-2xl text-xs flex items-center justify-center gap-3"
            >
              {isLoading ? t('AUTENTICANDO...', 'AUTHENTICATING...') : (
                <>
                  {t('Entrar na Estação', 'Enter Station')}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                {t('Não tem conta? Criar uma', 'No account? Create one')}
              </button>
              <button 
                type="button"
                onClick={async () => {
                  const email = prompt(t("Digite seu e-mail para redefinir a senha:", "Enter your email to reset password:"));
                  if (email) {
                    const res = await apiService.forgotPassword(email);
                    alert(res.message);
                  }
                }}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                {t('Esqueci minha senha', 'Forgot password')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade text-white font-jakarta">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start">
        
        <aside className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 rounded-[40px] md:rounded-[50px] text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--theme-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
            
            <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--theme-primary)] to-[#00d2ff] rounded-full blur-[15px] opacity-40 animate-pulse"></div>
              <div className="relative w-full h-full bg-black border border-white/10 rounded-full flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-[var(--theme-primary)]/50 transition-all">
                {profilePic ? <img src={profilePic} className="w-full h-full object-cover" alt="" /> : <UserCircle size={50} className="md:w-[60px] md:h-[60px] text-white/20" />}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><Camera size={18} className="text-white" /></div>
              </div>
              <input type="file" hidden ref={fileInputRef} onChange={handlePicUpload} accept="image/*" />
            </div>

            <h3 className="relative z-10 text-base md:text-lg font-black uppercase italic mb-1 truncate">{user.name}</h3>
            <p className="relative z-10 text-[8px] md:text-[9px] text-[#00ff88] font-black uppercase tracking-[0.4em] mb-6 md:mb-10">VIP Explorer</p>
            
            <nav className="relative z-10 flex flex-row overflow-x-auto lg:flex-col gap-3 text-left scrollbar-hide pb-2">
              {menuItems.map(item => {
                const IconC = item.i;
                return (
                  <button key={item.id} onClick={() => item.id === 'logout' ? setUser(null) : setActiveTab(item.id)} className={`w-auto lg:w-full flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 rounded-[16px] md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === item.id ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_25px_rgba(var(--theme-primary),0.3)] scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <IconC size={16} className="md:w-4 md:h-4" /> {item.n}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-3 min-h-[400px] md:min-h-[500px]">
          {activeTab === 'admin' && user?.email === 'vitor.trindadeit@gmail.com' && (
            <div className="space-y-8 animate-fade">
              <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black italic text-green-400 border-l-4 border-green-500 pl-4 uppercase tracking-tighter">PAINEL MASTER ADM</h1>
                <span className="text-[10px] bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 font-bold">V57.0</span>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5 shadow-2xl">
                  <h3 className="text-lg font-black italic uppercase mb-6 text-white">{t('Nova Postagem IA', 'New AI Post')}</h3>
                  <textarea 
                    value={promptIA}
                    onChange={e => setPromptIA(e.target.value)}
                    placeholder={t('Descreva o produto (Ex: Camiseta preta personalizada com logo dourada)...', 'Describe the product (Ex: Black t-shirt customized with gold logo)...')} 
                    className="w-full h-32 p-5 bg-zinc-800 rounded-2xl border-none outline-none focus:ring-2 ring-green-500 mb-6 text-sm font-medium text-white resize-none"
                  ></textarea>
                  <button 
                    onClick={handleGeneratePost}
                    disabled={isGenerating}
                    className="w-full py-5 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition uppercase tracking-widest text-xs shadow-lg disabled:opacity-50"
                  >
                    {isGenerating ? t('GERANDO...', 'GENERATING...') : t('GERAR E PUBLICAR NO SITE', 'GENERATE AND PUBLISH ON SITE')}
                  </button>
                </div>

                <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5 shadow-2xl">
                  <h3 className="text-lg font-black italic uppercase mb-6 text-white">{t('Monitor do Banco de Dados', 'Database Monitor')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                      <span>{t('Clientes Ativos:', 'Active Clients:')}</span> 
                      <span className="text-white">{adminUsers.length || '...'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                      <span>{t('Pedidos Pendentes:', 'Pending Orders:')}</span> 
                      <span className="text-white">{adminOrders.filter(o => o.status !== 'Entregue').length || '...'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                      <span>{t('Produtos em Linha:', 'Products Online:')}</span> 
                      <span className="text-white">{adminProducts.length || '...'}</span>
                    </div>
                    <button 
                      onClick={fetchAdminData}
                      className="w-full mt-6 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition"
                    >
                      {t('ATUALIZAR DADOS', 'REFRESH DATA')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                <h3 className="text-lg font-black italic uppercase mb-8 text-white">{t('Administração de Pedidos', 'Orders Administration')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <th className="pb-4 px-4">ID</th>
                        <th className="pb-4 px-4">{t('Cliente', 'Client')}</th>
                        <th className="pb-4 px-4">{t('Valor', 'Value')}</th>
                        <th className="pb-4 px-4">{t('Status', 'Status')}</th>
                        <th className="pb-4 px-4">{t('Ações', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold">
                      {adminOrders.map(order => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4 text-zinc-400">#{order.id}</td>
                          <td className="py-4 px-4">{order.user || order.email}</td>
                          <td className="py-4 px-4 text-green-400">{formatPrice(order.total || 0)}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest ${order.status === 'Entregue' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <select 
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              value={order.status}
                              className="bg-zinc-800 border-none rounded-lg text-[9px] uppercase font-black px-2 py-1 outline-none focus:ring-1 ring-green-500"
                            >
                              <option value="Pendente">{t('Pendente', 'Pending')}</option>
                              <option value="Em Produção">{t('Em Produção', 'In Production')}</option>
                              <option value="Enviado">{t('Enviado', 'Shipped')}</option>
                              <option value="Entregue">{t('Entregue', 'Delivered')}</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white/[0.02] border border-white/10 p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-3xl animate-fade h-full">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase mb-8 md:mb-12 tracking-tighter text-center md:text-left">{t('Meus', 'My')} <span className="text-[var(--theme-primary)]">{t('Pedidos', 'Orders')}</span></h2>
              <div className="space-y-6 md:space-y-10">
                {ordersList.map(o => (
                  <div key={o.id} className="bg-white/5 border border-white/5 p-6 md:p-10 rounded-[30px] md:rounded-[40px] relative overflow-hidden group hover:bg-white/[0.08] transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4 md:gap-6">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Cód:', 'Code:')} {o.id}</p>
                        <h4 className="text-lg md:text-xl font-black uppercase italic text-white">{o.items}</h4>
                        <p className="text-xs md:text-sm font-black text-[#00ff88] mt-1">{formatPrice(o.total)}</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                        <span className={`px-4 py-2 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest ${o.status === t('Entregue', 'Delivered') ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {o.status}
                        </span>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-2 md:mt-3">{o.date}</p>
                        {o.status === t('Entregue', 'Delivered') && (
                          <button onClick={openReviewModal} className="mt-3 md:mt-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white hover:bg-[var(--theme-primary)] transition-all flex items-center gap-2">
                            <Truck size={10} className="text-yellow-400" /> {t('Avaliar', 'Review')}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span className="flex items-center gap-1.5 md:gap-2"><Truck size={12}/> {t('Progresso', 'Progress')}</span>
                        <span className="text-white">{o.progress}%</span>
                      </div>
                      <div className="w-full h-2 md:h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <div className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[#00d2ff] transition-all duration-1000 shadow-xl rounded-full" style={{ width: `${o.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white/[0.02] border border-white/10 p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-3xl animate-fade h-full">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-10 md:mb-16 gap-6">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-center md:text-left">{t('Editar', 'Edit')} <span className="text-[var(--theme-primary)]">{t('Perfil', 'Profile')}</span></h2>
                <button onClick={handleSave} className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 bg-[#00ff88] text-black px-8 md:px-10 py-3.5 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl font-bold"><Save size={14}/> {t('Salvar', 'Save')}</button>
              </div>
              {showSaveMsg && <div className="bg-[#00ff88]/10 text-[#00ff88] p-4 md:p-5 rounded-2xl md:rounded-3xl mb-8 md:mb-12 font-black uppercase text-center text-[10px] md:text-xs border border-[#00ff88]/20 animate-bounce">{t('Coordenadas guardadas com sucesso!', 'Coordinates saved successfully!')}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 font-bold">
                <div className="space-y-3 md:space-y-4"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-3 md:ml-4">{t('Nome Completo', 'Full Name')}</label><input value={checkoutData.nome} onChange={(e) => setCheckoutData({...checkoutData, nome: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-xs md:text-sm" /></div>
                <div className="space-y-3 md:space-y-4"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-3 md:ml-4">{t('Aniversário 🎂', 'Birthday 🎂')}</label><input type="date" value={checkoutData.nascimento} onChange={(e) => setCheckoutData({...checkoutData, nascimento: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-xs md:text-sm" /></div>
                <div className="space-y-3 md:space-y-4"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-3 md:ml-4">{t('CPF / Documento', 'Tax ID')}</label><input value={checkoutData.cpf} onChange={(e) => setCheckoutData({...checkoutData, cpf: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-xs md:text-sm" /></div>
                <div className="space-y-3 md:space-y-4"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-3 md:ml-4">{t('WhatsApp / Contacto', 'WhatsApp / Contact')}</label><input value={checkoutData.telefone} onChange={(e) => setCheckoutData({...checkoutData, telefone: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-xs md:text-sm" /></div>
                <div className="space-y-3 md:space-y-4"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-3 md:ml-4">{t('CEP / Código Postal', 'Zip Code')}</label><input value={checkoutData.cep} onChange={(e) => setCheckoutData({...checkoutData, cep: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-xs md:text-sm" /></div>
                <div className="space-y-3 md:space-y-4"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-3 md:ml-4">{t('Endereço', 'Address')}</label><input value={checkoutData.endereco} onChange={(e) => setCheckoutData({...checkoutData, endereco: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-xs md:text-sm" /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
