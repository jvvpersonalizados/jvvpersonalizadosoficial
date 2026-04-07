import React, { useState, useEffect } from 'react';
import { 
  Layout, Package, Settings, UserCircle, Camera, Save, Truck, 
  Mail, Lock, UserPlus, ArrowRight, ShieldIcon, Rocket, 
  RefreshCw, ChevronRight, Clock, CheckCircle, AlertCircle,
  Image as ImageIcon, Trash2, Users, BarChart3, Database,
  Plus, ExternalLink, Globe, MessageSquare
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface AdminPortalProps {
  t: (br: any, int: any) => any;
  formatPrice: (price: number) => string;
}

export const AdminPortalPage: React.FC<AdminPortalProps> = ({ t, formatPrice }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!apiService.getAdminPassword());
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  
  // Forms
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', image: '', description: '', stock: '10', category: 'Geral', tags: '' 
  });
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', image: '', link: '', active: 'TRUE', order: '0' });
  const [promptIA, setPromptIA] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  const fetchAdminData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, statsRes, catalogRes, bannersRes, logsRes, settingsRes] = await Promise.all([
        apiService.getOrders(),
        apiService.getUsers(),
        apiService.getDashboardData(),
        apiService.getCatalog(),
        apiService.getBanners(),
        apiService.getLogs(),
        apiService.getSettings()
      ]);
      
      // Check for 401 Unauthorized
      if (ordersRes.status === 401 || usersRes.status === 401 || statsRes.status === 401) {
        setIsAuthenticated(false);
        apiService.setAdminPassword('');
        return;
      }

      if (ordersRes.success) setAdminOrders(ordersRes.data);
      if (usersRes.success) setAdminUsers(usersRes.data);
      if (statsRes.success) setAdminStats(statsRes.data);
      
      // getCatalog returns the array directly
      if (Array.isArray(catalogRes)) setAdminProducts(catalogRes);
      
      if (bannersRes.success) setAdminBanners(bannersRes.data);
      if (logsRes.success) setAdminLogs(logsRes.data);
      if (settingsRes.success) setAdminSettings(settingsRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    // Temporarily set the password to test it
    apiService.setAdminPassword(passwordInput);
    
    try {
      // Try to fetch settings as a test
      const res = await apiService.getSettings();
      if (res.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(res.message || "Senha incorreta ou erro de conexão.");
        apiService.setAdminPassword('');
      }
    } catch (err) {
      setLoginError("Erro ao conectar com o servidor.");
      apiService.setAdminPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.setAdminPassword('');
    setIsAuthenticated(false);
    window.location.reload();
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const res = await apiService.updateOrderStatus(orderId, status);
    if (res.success) fetchAdminData();
  };

  const handleSyncCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.syncCatalog();
      if (res.success) {
        alert(t(`Sincronização concluída! ${res.count} produtos processados.`, `Sync complete! ${res.count} products processed.`));
        fetchAdminData();
      }
    } catch (err) {
      alert("Erro na sincronização.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!newProduct.name || !newProduct.price) {
      alert(t("Nome e preço são obrigatórios!", "Name and price are required!"));
      return;
    }

    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock);

    if (isNaN(price)) {
      alert(t("O preço deve ser um número válido!", "Price must be a valid number!"));
      return;
    }

    setIsAddingProduct(true);
    try {
      const res = await apiService.addProduct({
        ...newProduct,
        price,
        stock: isNaN(stock) ? 0 : stock
      });
      if (res.success) {
        setNewProduct({ name: '', price: '', image: '', description: '', stock: '10', category: 'Geral', tags: '' });
        fetchAdminData();
        alert(t("Produto adicionado com sucesso!", "Product added successfully!"));
      } else {
        alert(t("Erro ao adicionar produto: ", "Error adding product: ") + (res.message || "Erro desconhecido"));
      }
    } catch (err: any) {
      alert(t("Erro de conexão: ", "Connection error: ") + err.message);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsLoading(true);
    try {
      const res = await apiService.updateProduct(editingProduct.id, {
        ...editingProduct,
        image: editingProduct.img, // Map img to image for GAS
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock)
      });
      if (res.success) {
        setEditingProduct(null);
        fetchAdminData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Excluir produto?")) return;
    const res = await apiService.deleteProduct(productId);
    if (res.success) fetchAdminData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Excluir usuário?")) return;
    const res = await apiService.deleteUser(userId);
    if (res.success) fetchAdminData();
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingBanner(true);
    try {
      const res = await apiService.addBanner(newBanner);
      if (res.success) {
        setNewBanner({ title: '', subtitle: '', image: '', link: '', active: 'TRUE', order: '0' });
        fetchAdminData();
        alert(t("Banner adicionado com sucesso!", "Banner added successfully!"));
      } else {
        alert(t("Erro ao adicionar banner: ", "Error adding banner: ") + (res.message || "Erro desconhecido"));
      }
    } catch (err: any) {
      alert(t("Erro de conexão: ", "Connection error: ") + err.message);
    } finally {
      setIsAddingBanner(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Excluir banner?")) return;
    const res = await apiService.deleteBanner(bannerId);
    if (res.success) fetchAdminData();
  };

  const handleToggleBanner = async (banner: any) => {
    const newStatus = banner.active === 'TRUE' ? 'FALSE' : 'TRUE';
    const res = await apiService.updateBanner(banner.id, { active: newStatus });
    if (res.success) fetchAdminData();
  };

  const handleClearLogs = async () => {
    if (!confirm("Limpar todos os logs?")) return;
    const res = await apiService.clearLogs();
    if (res.success) fetchAdminData();
  };

  const handleGeneratePost = async () => {
    if (!promptIA) return;
    setIsGenerating(true);
    try {
      // Use the store's API to generate and sync
      const response = await fetch(apiService.getApiUrl("/api/generate-post"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Password": apiService.getAdminPassword()
        },
        body: JSON.stringify({ prompt: promptIA })
      });
      const res = await response.json();
      if (res.success) {
        alert(t("Produto gerado e publicado com sucesso!", "Product generated and published successfully!"));
        setPromptIA('');
        fetchAdminData();
      }
    } catch (err) {
      alert("Erro ao gerar conteúdo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiService.updateSettings(adminSettings);
      if (res.success) {
        alert("Configurações atualizadas com sucesso!");
        fetchAdminData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerDeploy = async () => {
    if (!confirm("Deseja disparar um novo deploy no Vercel? Isso atualizará o site público com as mudanças mais recentes.")) return;
    setIsLoading(true);
    try {
      const hookUrl = "https://api.vercel.com/v1/integrations/deploy/prj_vSYnGTyKyrkiPz4BL2ZAwerE0EFp/g6QEkDiEje";
      const res = await fetch(hookUrl, { method: 'POST' });
      if (res.ok) {
        alert("Deploy disparado com sucesso! O site será atualizado em alguns minutos.");
      } else {
        alert("Erro ao disparar deploy. Verifique as configurações do Vercel.");
      }
    } catch (err) {
      alert("Erro de conexão ao disparar deploy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupSystem = async () => {
    if (!confirm("Deseja executar a configuração inicial do sistema? Isso criará todas as abas necessárias na planilha caso não existam.")) return;
    setIsLoading(true);
    try {
      const res = await apiService.post('setupSpreadsheet', {});
      if (res.success) {
        alert("Sistema configurado com sucesso! Verifique sua planilha.");
        fetchAdminData();
      } else {
        alert("Erro ao configurar sistema: " + res.message);
      }
    } catch (err) {
      alert("Erro de conexão ao configurar sistema.");
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', n: 'Dashboard', i: BarChart3 },
    { id: 'banners', n: 'Banners', i: ImageIcon },
    { id: 'products', n: 'Produtos', i: Package },
    { id: 'orders', n: 'Pedidos', i: Truck },
    { id: 'users', n: 'Usuários', i: Users },
    { id: 'settings', n: 'Configurações', i: Settings },
    { id: 'logs', n: 'Logs', i: Database },
    { id: 'ia', n: 'Inteligência IA', i: Rocket },
    { id: 'status', n: 'Status do Sistema', i: Database },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-jakarta flex items-center justify-center p-6">
        <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[40px] max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-600/20">
            <Lock size={30} className="text-white" />
          </div>
          <h2 className="text-2xl font-black italic uppercase mb-2">Acesso Restrito</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-8">JVV Studio Master Control</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Senha Mestra</label>
              <input 
                type="password"
                required 
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="DIGITE A SENHA"
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500"
              />
            </div>
            
            {loginError && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{loginError}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white font-black uppercase italic rounded-2xl hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {isLoading ? <RefreshCw className="animate-spin" /> : <ArrowRight size={20} />}
              {isLoading ? 'VERIFICANDO...' : 'ENTRAR NO PORTAL'}
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">API Endpoint</span>
              <code className="text-[9px] font-mono text-zinc-500 break-all bg-black/30 px-3 py-2 rounded-lg border border-white/5 w-full">
                {apiService.getApiUrl('') || 'Local (Same Origin)'}
              </code>
            </div>
            <p className="text-[8px] text-zinc-600 font-bold uppercase leading-relaxed max-w-[200px] mx-auto">
              Certifique-se de que a URL acima aponta para o seu app no AI Studio.
            </p>
          </div>
          
          <p className="mt-10 text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
            Ambiente Seguro & Criptografado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-jakarta flex flex-col lg:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-zinc-900/50 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <ShieldIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter">JVV STUDIO</h1>
            <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Master Control</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map(item => {
            const Icon = item.i;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={16} />
                {item.n}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all"
          >
            <Lock size={16} />
            Sair do Portal
          </button>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-bold text-zinc-500 uppercase mb-2">Status do Sistema</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase">Online & Seguro</span>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-[7px] font-bold text-zinc-600 uppercase mb-1">API Endpoint</p>
              <p className="text-[8px] font-mono text-zinc-500 break-all leading-tight">
                {apiService.getApiUrl('') || 'Local (Same Origin)'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              {menuItems.find(i => i.id === activeTab)?.n}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Ambiente de Gestão Privado</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => fetchAdminData()}
              disabled={isLoading}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Recarregar Dados
            </button>
            <button 
              onClick={handleSyncCatalog}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
            >
              <Rocket size={14} />
              Sincronizar Site
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: 'Faturamento Total', v: formatPrice(adminStats?.totalRevenue || 0), i: BarChart3, c: 'text-green-400' },
                { l: 'Pedidos Pendentes', v: adminStats?.pendingOrders || 0, i: Clock, c: 'text-yellow-400' },
                { l: 'Novos Clientes', v: adminStats?.newUsers || 0, i: Users, c: 'text-blue-400' },
                { l: 'Ticket Médio', v: formatPrice(adminStats?.avgTicket || 0), i: Rocket, c: 'text-purple-400' },
              ].map((s, idx) => (
                <div key={idx} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[30px] shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/5 rounded-2xl"><s.i size={20} className={s.c} /></div>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Live</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.l}</p>
                  <h4 className={`text-2xl font-black italic ${s.c}`}>{s.v}</h4>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black italic uppercase">Histórico de Vendas</h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Últimos 30 dias</span>
                </div>
                <div className="h-48 flex items-end gap-2">
                  {adminStats?.salesHistory && Object.entries(adminStats.salesHistory).slice(-15).map(([date, value]: any, idx) => {
                    const max = Math.max(...Object.values(adminStats.salesHistory) as number[]);
                    const height = max > 0 ? (value / max) * 100 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          className="w-full bg-blue-600/20 group-hover:bg-blue-600/40 rounded-t-lg transition-all relative"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatPrice(value)}
                          </div>
                        </div>
                        <span className="text-[7px] text-zinc-600 font-bold uppercase rotate-45 mt-2">{date.split('-').slice(1).join('/')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
                <h3 className="text-lg font-black italic uppercase mb-6">Ações Rápidas</h3>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setActiveTab('banners')} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all text-left flex items-center gap-4 group">
                    <ImageIcon size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Novo Banner</p>
                  </button>
                  <button onClick={() => setActiveTab('products')} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all text-left flex items-center gap-4 group">
                    <Plus size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Novo Produto</p>
                  </button>
                  <button onClick={handleSyncCatalog} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/50 transition-all text-left flex items-center gap-4 group">
                    <RefreshCw size={20} className="text-green-500 group-hover:rotate-180 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sincronizar</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-8 animate-fade">
            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
              <h3 className="text-lg font-black italic uppercase mb-6">Adicionar Novo Banner</h3>
              <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} placeholder="TÍTULO DO BANNER" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
                <input value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} placeholder="SUBTÍTULO" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
                <input required value={newBanner.image} onChange={e => setNewBanner({...newBanner, image: e.target.value})} placeholder="URL DA IMAGEM" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
                <input value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} placeholder="LINK DE DESTINO" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
                <button type="submit" disabled={isAddingBanner} className="md:col-span-2 py-4 bg-blue-600 text-white font-black uppercase italic rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                  {isAddingBanner ? 'PROCESSANDO...' : 'PUBLICAR BANNER'}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <th className="p-6">Preview</th>
                    <th className="p-6">Título</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {adminBanners.map(banner => (
                    <tr key={banner.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6"><img src={banner.image} className="w-24 h-12 object-cover rounded-xl border border-white/10" alt="" /></td>
                      <td className="p-6">{banner.title}</td>
                      <td className="p-6">
                        <button onClick={() => handleToggleBanner(banner)} className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest ${banner.active === 'TRUE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {banner.active === 'TRUE' ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="p-6">
                        <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade">
            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
              <h3 className="text-lg font-black italic uppercase mb-6">Novo Produto Manual</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="NOME DO PRODUTO" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
                <input required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="PREÇO (Ex: 89.90)" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
                <input required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="ESTOQUE INICIAL" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
                <input required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="CATEGORIA" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
                <input required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="URL DA IMAGEM" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
                <input value={newProduct.tags} onChange={e => setNewProduct({...newProduct, tags: e.target.value})} placeholder="ETIQUETAS (Separadas por vírgula)" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
                <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="DESCRIÇÃO" className="md:col-span-2 bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500 h-24 resize-none" />
                <button type="submit" disabled={isAddingProduct} className="md:col-span-2 py-4 bg-purple-600 text-white font-black uppercase italic rounded-2xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20">
                  {isAddingProduct ? 'ADICIONANDO...' : 'ADICIONAR AO CATÁLOGO'}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <th className="p-6">Nome</th>
                    <th className="p-6">Preço</th>
                    <th className="p-6">Estoque</th>
                    <th className="p-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {adminProducts.map(product => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">{product.name}</td>
                      <td className="p-6 text-green-400">{formatPrice(product.price)}</td>
                      <td className="p-6">{product.stock || 0} un</td>
                      <td className="p-6 flex gap-3">
                        <button onClick={() => setEditingProduct(product)} className="text-blue-500 hover:text-blue-400 transition-colors"><Settings size={18} /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden animate-fade">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <th className="p-6">ID</th>
                  <th className="p-6">Cliente</th>
                  <th className="p-6">Total</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Ações</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {adminOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-zinc-500">#{order.id}</td>
                    <td className="p-6">
                      <button onClick={() => setViewingOrder(order)} className="hover:text-blue-400 transition-colors text-left">
                        {order.user || order.email}
                      </button>
                    </td>
                    <td className="p-6 text-green-400">{formatPrice(order.total || 0)}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest ${order.status === 'Entregue' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <select 
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        value={order.status}
                        className="bg-black/50 border border-white/10 rounded-lg text-[9px] uppercase font-black px-3 py-2 outline-none focus:ring-1 ring-blue-500"
                      >
                        <option value="Pagamento em Aprovação">Pagamento em Aprovação</option>
                        <option value="Criação de Arte">Criação de Arte</option>
                        <option value="Produção de Arte">Produção de Arte</option>
                        <option value="Produção">Produção</option>
                        <option value="Envio">Envio</option>
                        <option value="Entregue">Entregue</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden animate-fade">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <th className="p-6">Nome</th>
                  <th className="p-6">Email</th>
                  <th className="p-6">Função</th>
                  <th className="p-6">Ações</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {adminUsers.map(u => (
                  <tr key={u.email} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <button onClick={() => setViewingUser(u)} className="hover:text-blue-400 transition-colors text-left">
                        {u.name}
                      </button>
                    </td>
                    <td className="p-6 text-zinc-400">{u.email}</td>
                    <td className="p-6"><span className="px-2 py-1 bg-white/5 rounded text-[8px] uppercase">{u.role}</span></td>
                    <td className="p-6 flex gap-3">
                      <button onClick={() => setViewingUser(u)} className="text-blue-500 hover:text-blue-400 transition-colors"><UserCircle size={18} /></button>
                      <button onClick={() => handleDeleteUser(u.id || u.email)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && adminSettings && (
          <div className="space-y-8 animate-fade max-w-2xl mx-auto">
            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
              <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                <Settings className="text-blue-500" />
                Configurações da Loja
              </h3>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Nome da Loja</label>
                    <input 
                      value={adminSettings.NOME_LOJA || ''} 
                      onChange={e => setAdminSettings({...adminSettings, NOME_LOJA: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Cor Primária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={adminSettings.COR_PRIMARIA || '#9333ea'} 
                        onChange={e => setAdminSettings({...adminSettings, COR_PRIMARIA: e.target.value})} 
                        className="w-12 h-12 bg-transparent border-none cursor-pointer" 
                      />
                      <input 
                        value={adminSettings.COR_PRIMARIA || '#9333ea'} 
                        onChange={e => setAdminSettings({...adminSettings, COR_PRIMARIA: e.target.value})} 
                        className="flex-1 bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">WhatsApp (DDI+DDD+Número)</label>
                    <input 
                      value={adminSettings.WHATSAPP || ''} 
                      onChange={e => setAdminSettings({...adminSettings, WHATSAPP: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Frete Fixo (R$)</label>
                    <input 
                      value={adminSettings.FRETE_FIXO || ''} 
                      onChange={e => setAdminSettings({...adminSettings, FRETE_FIXO: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 text-white font-black uppercase italic rounded-2xl hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3">
                  <Save size={20} />
                  {isLoading ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
              <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                <Rocket className="text-purple-500" />
                Publicação (Vercel)
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">
                Use este botão para forçar a atualização do site público caso as mudanças automáticas não tenham refletido.
              </p>
              <button 
                onClick={handleTriggerDeploy}
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase italic rounded-2xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <RefreshCw className={isLoading ? "animate-spin" : ""} size={20} />
                {isLoading ? 'PROCESSANDO...' : 'DISPARAR ATUALIZAÇÃO DO SITE'}
              </button>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
              <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                <Database className="text-green-500" />
                Manutenção do Banco (Sheets)
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">
                Use este botão para inicializar ou reparar as abas e cabeçalhos da sua planilha do Google.
              </p>
              <button 
                onClick={handleSetupSystem}
                disabled={isLoading}
                className="w-full py-5 bg-zinc-800 text-white font-black uppercase italic rounded-2xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 border border-white/5"
              >
                <Database size={20} />
                {isLoading ? 'CONFIGURANDO...' : 'REPARAR / CONFIGURAR PLANILHA'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fade">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black italic uppercase">Logs do Sistema</h3>
              <button 
                onClick={handleClearLogs}
                className="px-4 py-2 bg-red-600/10 text-red-400 border border-red-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all"
              >
                Limpar Logs
              </button>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <th className="p-6">Data/Hora</th>
                    <th className="p-6">Ação</th>
                    <th className="p-6">Usuário</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-bold">
                  {adminLogs.map((log, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 text-zinc-500">{new Date(log.date).toLocaleString()}</td>
                      <td className="p-6 uppercase tracking-tighter">{log.action}</td>
                      <td className="p-6 text-blue-400">{log.user}</td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded ${log.status === 'Success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-6 text-zinc-400 max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ia' && (
          <div className="max-w-3xl mx-auto py-12 text-center animate-fade">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/20">
              <Rocket size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-black italic uppercase mb-4">Gerador de Conteúdo IA</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-12">Crie postagens e produtos usando o poder do Gemini 2.0</p>
            
            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] text-left">
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-4 block ml-2">O que deseja criar hoje?</label>
              <textarea 
                value={promptIA}
                onChange={e => setPromptIA(e.target.value)}
                placeholder="Ex: Crie uma caneca temática de Cyberpunk com cores neon..."
                className="w-full h-40 bg-black/50 border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-blue-500 mb-6 resize-none"
              />
              <button 
                onClick={handleGeneratePost}
                disabled={isGenerating}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase italic rounded-2xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {isGenerating ? <RefreshCw className="animate-spin" /> : <MessageSquare size={20} />}
                {isGenerating ? 'PROCESSANDO...' : 'GERAR E PUBLICAR'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-8 animate-fade max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-600/30">
                <Database size={24} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase">Status do Sistema</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Diagnóstico de Conectividade</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
                <h4 className="text-xs font-black uppercase italic text-blue-400 border-b border-white/5 pb-4">Configuração de API</h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-1 ml-1">Endpoint Atual</p>
                    <div className="bg-black/50 p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-zinc-400 break-all">
                      {apiService.getApiUrl('') || 'Local (Same Origin)'}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                    <p className="text-[9px] font-bold text-blue-400 leading-relaxed">
                      Este endpoint deve apontar para a URL do seu app no AI Studio para que o Vercel consiga salvar dados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
                <h4 className="text-xs font-black uppercase italic text-purple-400 border-b border-white/5 pb-4">Sincronização GAS</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-black/30 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Planilha Conectada</span>
                    <span className="text-[10px] font-black text-green-400 uppercase">Sim</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-black/30 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Token de Segurança</span>
                    <span className="text-[10px] font-black text-blue-400 uppercase">Configurado</span>
                  </div>

                  <button 
                    onClick={handleSetupSystem}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase italic rounded-2xl transition-all border border-white/5"
                  >
                    Testar Conexão Google
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
              <h4 className="text-xs font-black uppercase italic text-zinc-400 border-b border-white/5 pb-4 mb-6">Dicas de Resolução de Problemas</h4>
              <ul className="space-y-4">
                {[
                  { t: 'O produto não aparece após cadastrar?', d: 'Verifique se a URL do Google Apps Script está correta nas configurações do AI Studio.' },
                  { t: 'Erro 401 ao salvar?', d: 'Sua senha administrativa pode estar incorreta ou expirada no navegador. Tente sair e entrar novamente.' },
                  { t: 'Site no Vercel não atualiza?', d: 'Certifique-se de que a variável VITE_API_URL no Vercel aponta para este app do AI Studio.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">{i+1}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white mb-1">{item.t}</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black italic uppercase mb-6 text-blue-400">Editar Produto</h3>
            <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Nome</label>
                <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Preço</label>
                <input required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Estoque</label>
                <input required value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Categoria</label>
                <input required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">URL da Imagem</label>
                <input required value={editingProduct.img} onChange={e => setEditingProduct({...editingProduct, img: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Descrição</label>
                <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-blue-500 h-24 resize-none" />
              </div>
              <div className="flex gap-4 md:col-span-2">
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black uppercase italic rounded-2xl hover:bg-blue-500 transition-all">Salvar Alterações</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-4 bg-zinc-800 text-white font-black uppercase italic rounded-2xl hover:bg-zinc-700 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-md w-full">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center border border-blue-600/30 overflow-hidden">
                {viewingUser.photo ? <img src={viewingUser.photo} className="w-full h-full object-cover" alt="" /> : <UserCircle size={40} className="text-blue-500" />}
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase text-white">{viewingUser.name}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{viewingUser.role}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {[
                { l: 'Email', v: viewingUser.email },
                { l: 'Telefone', v: viewingUser.telefone || 'Não informado' },
                { l: 'CPF', v: viewingUser.cpf || 'Não informado' },
                { l: 'Nascimento', v: viewingUser.nascimento || 'Não informado' },
                { l: 'CEP', v: viewingUser.cep || 'Não informado' },
                { l: 'Endereço', v: viewingUser.endereco || 'Não informado' },
                { l: 'Termômetro', v: viewingUser.thermometer || 'Morno' },
                { l: 'Score', v: viewingUser.score || 'Bronze' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{item.l}</span>
                  <span className="text-[10px] font-bold text-white">{item.v}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setViewingUser(null)} className="w-full py-4 bg-zinc-800 text-white font-black uppercase italic rounded-2xl hover:bg-zinc-700 transition-all">Fechar Detalhes</button>
          </div>
        </div>
      )}

      {viewingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black italic uppercase text-blue-400">Pedido #{viewingOrder.id}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{new Date(viewingOrder.date).toLocaleString()}</p>
              </div>
              <span className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-full text-[10px] font-black uppercase tracking-widest">{viewingOrder.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Cliente</h4>
                <p className="text-xs font-bold">{viewingOrder.user || 'Visitante'}</p>
                <p className="text-xs text-zinc-400">{viewingOrder.email}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Resumo</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Total:</span>
                  <span className="text-lg font-black text-green-400">{formatPrice(viewingOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Itens do Pedido</h4>
              <div className="space-y-3">
                {(() => {
                  try {
                    const items = typeof viewingOrder.items === 'string' ? JSON.parse(viewingOrder.items) : viewingOrder.items;
                    return Array.isArray(items) ? items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black">{item.quantity}x</div>
                          <div>
                            <p className="text-xs font-bold">{item.name}</p>
                            <p className="text-[9px] text-zinc-500 uppercase font-black">{item.selectedSize || 'Tamanho Único'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    )) : <p className="text-xs text-zinc-500 italic">Nenhum item encontrado.</p>;
                  } catch (e) {
                    return <p className="text-xs text-zinc-500 italic">Erro ao processar itens.</p>;
                  }
                })()}
              </div>
            </div>

            <button onClick={() => setViewingOrder(null)} className="w-full py-4 bg-zinc-800 text-white font-black uppercase italic rounded-2xl hover:bg-zinc-700 transition-all">Fechar Pedido</button>
          </div>
        </div>
      )}
    </div>
  );
};
