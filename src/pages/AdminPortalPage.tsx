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
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  
  // Forms
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', description: '' });
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', image: '', link: '', active: 'TRUE', order: '0' });
  const [promptIA, setPromptIA] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);

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

  useEffect(() => {
    fetchAdminData();
  }, []);

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
    setIsAddingProduct(true);
    try {
      const res = await apiService.addProduct(newProduct);
      if (res.success) {
        setNewProduct({ name: '', price: '', image: '', description: '' });
        fetchAdminData();
      }
    } finally {
      setIsAddingProduct(false);
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
      }
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

  const menuItems = [
    { id: 'dashboard', n: 'Dashboard', i: BarChart3 },
    { id: 'banners', n: 'Banners', i: ImageIcon },
    { id: 'products', n: 'Produtos', i: Package },
    { id: 'orders', n: 'Pedidos', i: Truck },
    { id: 'users', n: 'Usuários', i: Users },
    { id: 'ia', n: 'Inteligência IA', i: Rocket },
  ];

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

        <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] font-bold text-zinc-500 uppercase mb-2">Status do Sistema</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black uppercase">Online & Seguro</span>
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
              onClick={handleSyncCatalog}
              disabled={isLoading}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Sincronizar Site
            </button>
            <div className="bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-full flex items-center gap-2">
              <Database size={12} className="text-blue-500" />
              <span className="text-[9px] font-black text-blue-400">V60.2 STABLE</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: 'Faturamento Total', v: formatPrice(adminStats?.totalRevenue || 0), i: BarChart3, c: 'text-green-400' },
                { l: 'Pedidos Pendentes', v: adminStats?.pendingOrders || 0, i: Clock, c: 'text-yellow-400' },
                { l: 'Novos Clientes', v: adminStats?.newUsers || 0, i: Users, c: 'text-blue-400' },
                { l: 'Produtos em Linha', v: adminProducts.length, i: Package, c: 'text-purple-400' },
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px]">
                <h3 className="text-lg font-black italic uppercase mb-6">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('banners')} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-all text-left group">
                    <ImageIcon size={24} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Novo Banner</p>
                  </button>
                  <button onClick={() => setActiveTab('products')} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all text-left group">
                    <Plus size={24} className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Novo Produto</p>
                  </button>
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] flex flex-col justify-center items-center text-center">
                <Globe size={40} className="text-zinc-700 mb-4" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Site Público</h3>
                <p className="text-[10px] text-zinc-500 mb-6 max-w-xs">O site principal está rodando a versão estável. Todas as alterações feitas aqui refletem instantaneamente lá.</p>
                <a href="/" target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                  Visualizar Loja <ExternalLink size={12} />
                </a>
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
                <input required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="URL DA IMAGEM" className="bg-black/50 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-purple-500" />
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
                      <td className="p-6">
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
                    <td className="p-6">{order.user || order.email}</td>
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
                        <option value="Pendente">Pendente</option>
                        <option value="Em Produção">Em Produção</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue</option>
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
                    <td className="p-6">{u.name}</td>
                    <td className="p-6 text-zinc-400">{u.email}</td>
                    <td className="p-6"><span className="px-2 py-1 bg-white/5 rounded text-[8px] uppercase">{u.role}</span></td>
                    <td className="p-6">
                      <button onClick={() => handleDeleteUser(u.id || u.email)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                disabled={isGenerating}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase italic rounded-2xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {isGenerating ? <RefreshCw className="animate-spin" /> : <MessageSquare size={20} />}
                {isGenerating ? 'PROCESSANDO...' : 'GERAR E PUBLICAR'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
