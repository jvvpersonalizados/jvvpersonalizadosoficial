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
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [promptIA, setPromptIA] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', description: '' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.requestPasswordReset(resetEmail);
      if (res.success) {
        setIsResettingPassword(true);
        alert(res.message || t('Código enviado!', 'Code sent!'));
      } else {
        setError(res.message || t('Erro ao solicitar redefinição.', 'Error requesting reset.'));
      }
    } catch (err) {
      setError(t('Erro ao conectar com a galáxia.', 'Error connecting to the galaxy.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.resetPassword(resetEmail, resetCode, newPass);
      if (res.success) {
        alert(res.message || t('Senha alterada!', 'Password changed!'));
        setIsResettingPassword(false);
        setResetEmail('');
        setResetCode('');
        setNewPass('');
        setIsRegistering(false);
      } else {
        setError(res.message || t('Código inválido ou expirado.', 'Invalid or expired code.'));
      }
    } catch (err) {
      setError(t('Erro ao conectar com a galáxia.', 'Error connecting to the galaxy.'));
    } finally {
      setIsLoading(false);
    }
  };

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
        setUser({ 
          name: regName, 
          email: regEmail, 
          role: 'User', 
          thermometer: 'Morno', 
          score: 'Bronze' 
        });
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
    ...(user?.role === 'Admin' ? [{ id: 'admin', n: t('Admin', 'Admin'), i: ShieldIcon }] : []),
    { id: 'logout', n: t('Sair', 'Logout'), i: LogOut }
  ];

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, statsRes, catalogRes, bannersRes] = await Promise.all([
        apiService.getOrders(),
        apiService.getUsers(),
        apiService.getAdminStats(),
        apiService.getCatalog(),
        apiService.getBanners()
      ]);
      if (ordersRes.success) setAdminOrders(ordersRes.data);
      if (usersRes.success) setAdminUsers(usersRes.data);
      if (statsRes.success) setAdminStats(statsRes.data);
      if (catalogRes.success) setAdminProducts(catalogRes.data);
      if (bannersRes.success) setAdminBanners(bannersRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab]);

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

  const handleSyncCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.syncCatalog();
      if (res.success) {
        alert(t(`Sincronização concluída! ${res.count} produtos processados.`, `Sync complete! ${res.count} products processed.`));
        fetchAdminData();
      } else {
        alert(t("Erro na sincronização: " + res.error, "Sync error: " + res.error));
      }
    } catch (err) {
      alert(t("Erro ao conectar com o servidor para sincronização.", "Error connecting to server for sync."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      const res = await apiService.addProduct(newProduct);
      if (res.success) {
        alert(t("Produto adicionado com sucesso!", "Product added successfully!"));
        setNewProduct({ name: '', price: '', image: '', description: '' });
        fetchAdminData();
      } else {
        alert(t("Erro ao adicionar produto: " + (res.message || "Erro desconhecido"), "Error adding product: " + (res.message || "Unknown error")));
      }
    } catch (err) {
      alert(t("Erro ao conectar com o servidor.", "Error connecting to server."));
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t("Tem certeza que deseja excluir este produto?", "Are you sure you want to delete this product?"))) return;
    const res = await apiService.deleteProduct(productId);
    if (res.success) fetchAdminData();
    else alert(res.message);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t("Tem certeza que deseja excluir este usuário?", "Are you sure you want to delete this user?"))) return;
    const res = await apiService.deleteUser(userId);
    if (res.success) fetchAdminData();
    else alert(res.message);
  };

  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', image: '', link: '', active: 'TRUE', order: '0' });
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  const fetchUserData = async () => {
    if (!user?.email) return;
    try {
      const res = await apiService.getUser(user.email);
      if (res.success && res.data) {
        setUser({ ...user, ...res.data });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchUserOrders = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await apiService.getUserOrders(user.email);
      if (res.success && Array.isArray(res.data)) {
        setUserOrders(res.data);
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserOrders();
    }
  }, [user?.email]);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingBanner(true);
    try {
      const res = await apiService.addBanner(newBanner);
      if (res.success) {
        alert(t("Banner adicionado com sucesso!", "Banner added successfully!"));
        setNewBanner({ title: '', subtitle: '', image: '', link: '', active: 'TRUE', order: '0' });
        fetchAdminData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert(t("Erro ao conectar com o servidor.", "Error connecting to server."));
    } finally {
      setIsAddingBanner(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm(t("Tem certeza que deseja excluir este banner?", "Are you sure you want to delete this banner?"))) return;
    const res = await apiService.deleteBanner(bannerId);
    if (res.success) fetchAdminData();
    else alert(res.message);
  };

  const handleToggleBanner = async (banner: any) => {
    const newStatus = banner.active === 'TRUE' ? 'FALSE' : 'TRUE';
    const res = await apiService.updateBanner(banner.id, { active: newStatus });
    if (res.success) fetchAdminData();
  };

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

        {isResettingPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">
              {t('Insira o código enviado para', 'Enter the code sent to')} <br/>
              <span className="text-white">{resetEmail}</span>
            </p>
            <div className="relative">
              <ShieldIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={resetCode}
                onChange={e => setResetCode(e.target.value)}
                type="text" 
                placeholder={t('CÓDIGO DE 6 DÍGITOS', '6-DIGIT CODE')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input 
                required
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                type="password" 
                placeholder={t('NOVA SENHA', 'NEW PASSWORD')} 
                className="w-full bg-white/[0.03] border border-white/10 h-14 md:h-16 pl-14 pr-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" 
              />
            </div>
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full py-5 md:py-6 bg-[var(--theme-primary)] text-white font-black uppercase italic rounded-2xl md:rounded-3xl hover:opacity-90 transition-all shadow-2xl text-xs flex items-center justify-center gap-3"
            >
              {isLoading ? t('ALTERANDO...', 'CHANGING...') : t('Alterar Senha', 'Change Password')}
            </button>
            <button 
              type="button"
              onClick={() => setIsResettingPassword(false)}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {t('Voltar ao Login', 'Back to Login')}
            </button>
          </form>
        ) : isRegistering ? (
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
                onClick={() => {
                  const email = prompt(t("Digite seu e-mail para redefinir a senha:", "Enter your email to reset password:"));
                  if (email) {
                    setResetEmail(email);
                    handleRequestReset({ preventDefault: () => {} } as any);
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
            <p className={`relative z-10 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-6 md:mb-10 ${user.thermometer === 'Quente' ? 'text-[#00ff88]' : user.thermometer === 'Morno' ? 'text-orange-400' : 'text-red-400'}`}>
              {user.score || 'Bronze'} Explorer
            </p>
            
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
          {activeTab === 'dashboard' && (
            <div className="bg-white/[0.02] border border-white/10 p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-3xl animate-fade h-full">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase mb-8 md:mb-12 tracking-tighter text-center md:text-left">{t('Minha', 'My')} <span className="text-[var(--theme-primary)]">{t('Dashboard', 'Dashboard')}</span></h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[30px] text-center">
                  <Package className="mx-auto mb-4 text-[var(--theme-primary)]" size={32} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Total de Pedidos', 'Total Orders')}</p>
                  <h4 className="text-3xl font-black italic uppercase">{userOrders.length}</h4>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[30px] text-center">
                  <Rocket className={`mx-auto mb-4 ${user.thermometer === 'Quente' ? 'text-[#00ff88]' : user.thermometer === 'Morno' ? 'text-orange-400' : 'text-red-400'}`} size={32} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Nível Explorer', 'Explorer Level')}</p>
                  <h4 className="text-3xl font-black italic uppercase">{user.score || 'Bronze'}</h4>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[30px] text-center">
                  <ShieldIcon className="mx-auto mb-4 text-blue-400" size={32} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Status da Conta', 'Account Status')}</p>
                  <h4 className="text-3xl font-black italic uppercase">{t('Ativa', 'Active')}</h4>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-8 rounded-[40px]">
                <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
                  <Clock size={20} className="text-slate-500" />
                  {t('Atividade Recente', 'Recent Activity')}
                </h3>
                {userOrders.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">{t('Nenhuma atividade galáctica registrada ainda.', 'No galactic activity recorded yet.')}</p>
                ) : (
                  <div className="space-y-4">
                    {userOrders.slice(0, 3).map((o, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center">
                            <Package size={18} className="text-[var(--theme-primary)]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase italic">{t('Pedido Realizado', 'Order Placed')}</p>
                            <p className="text-[9px] text-slate-500 font-bold">{o.id}</p>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold">{new Date(o.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white/[0.02] border border-white/10 p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-3xl animate-fade h-full">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase mb-8 md:mb-12 tracking-tighter text-center md:text-left">{t('Meus', 'My')} <span className="text-[var(--theme-primary)]">{t('Pedidos', 'Orders')}</span></h2>
              <div className="space-y-6 md:space-y-10">
                {userOrders.length === 0 ? (
                  <div className="text-center py-20">
                    <Package size={64} className="mx-auto text-white/10 mb-6" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">{t('Você ainda não realizou pedidos.', 'You haven\'t placed any orders yet.')}</p>
                  </div>
                ) : (
                  userOrders.map(o => {
                    let itemsParsed = [];
                    try {
                      itemsParsed = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                    } catch (e) {
                      itemsParsed = [];
                    }
                    
                    const progress = o.status === 'Entregue' ? 100 : o.status === 'Enviado' ? 85 : o.status === 'Em Produção' ? 50 : 15;

                    return (
                      <div key={o.id} className="bg-white/5 border border-white/5 p-6 md:p-10 rounded-[30px] md:rounded-[40px] relative overflow-hidden group hover:bg-white/[0.08] transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4 md:gap-6">
                          <div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Cód:', 'Code:')} {o.id}</p>
                            <h4 className="text-lg md:text-xl font-black uppercase italic text-white">
                              {Array.isArray(itemsParsed) ? itemsParsed.map((item: any) => item.name).join(', ') : t('Pedido Galáctico', 'Galactic Order')}
                            </h4>
                            <p className="text-xs md:text-sm font-black text-[#00ff88] mt-1">{formatPrice(o.total)}</p>
                          </div>
                          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                            <span className={`px-4 py-2 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest ${o.status === 'Entregue' ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                              {o.status}
                            </span>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-2 md:mt-3">{new Date(o.date).toLocaleDateString()}</p>
                            {o.status === 'Entregue' && (
                              <button onClick={openReviewModal} className="mt-3 md:mt-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white hover:bg-[var(--theme-primary)] transition-all flex items-center gap-2">
                                <Truck size={10} className="text-yellow-400" /> {t('Avaliar', 'Review')}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1.5 md:gap-2"><Truck size={12}/> {t('Progresso', 'Progress')}</span>
                            <span className="text-white">{progress}%</span>
                          </div>
                          <div className="w-full h-2 md:h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                            <div className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[#00d2ff] transition-all duration-1000 shadow-xl rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
