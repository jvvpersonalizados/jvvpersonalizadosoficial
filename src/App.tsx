import React, { useState, useEffect } from 'react';
import { GalaxyBackground } from './components/GalaxyBackground';
import { Header } from './components/Header';
import { TrustAndFooter } from './components/TrustAndFooter';
import { ReviewModal } from './components/ReviewModal';
import { GlobalInfoModal } from './components/GlobalInfoModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { UserPanelPage } from './pages/UserPanelPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { OrbitalLogo } from './components/OrbitalLogo';
import { MobileLayout } from './components/MobileLayout';
import { apiService } from './services/apiService';

const WHATSAPP_NUMBER = "5517981270724";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['home']);
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('jvv-user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('jvv-user', JSON.stringify(user));
      
      // Update checkoutData with user profile info if available
      setCheckoutData(prev => ({
        ...prev,
        nome: user.name || prev.nome,
        email: user.email || prev.email,
        telefone: user.telefone || prev.telefone,
        cpf: user.cpf || prev.cpf,
        nascimento: user.nascimento || prev.nascimento,
        cep: user.cep || prev.cep,
        endereco: user.endereco || prev.endereco
      }));

      // When user logs in, fetch their saved cart from the server if current cart is empty
      if (cart.length === 0) {
        apiService.getSavedCart(user.email).then(res => {
          if (res.success && res.data && res.data.length > 0) {
            setCart(res.data);
          }
        });
      }
    } else {
      localStorage.removeItem('jvv-user');
    }
  }, [user]);

  // Sync cart with server when it changes (if logged in)
  useEffect(() => {
    if (user && cart.length > 0) {
      const timer = setTimeout(() => {
        apiService.syncCart(user.email, cart);
      }, 2000); // Debounce sync by 2 seconds
      return () => clearTimeout(timer);
    }
  }, [cart, user]);

  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [checkoutData, setCheckoutData] = useState({
    nome: "", telefone: "", email: "", cpf: "", nascimento: "", cep: "", 
    endereco: "", numero: "", detalhes: "", cupom: "", pais: "Brasil"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isGlobalInfoModalOpen, setIsGlobalInfoModalOpen] = useState(false);
  const [shippingValue, setShippingValue] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  
  const [isNationalityModalOpen, setIsNationalityModalOpen] = useState(true);
  const [nationality, setNationality] = useState('BR');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [addedReviews, setAddedReviews] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [isAdminPortal, setIsAdminPortal] = useState(false);

  useEffect(() => {
    // 1. Check environment variable (Vercel)
    // Tentamos ler o nome que você criou e também o padrão com VITE_
    const mode = (import.meta as any).env.MODO_RAPIDO_DO_APLICATIVO || (import.meta as any).env.VITE_MODO_RAPIDO_DO_APLICATIVO || (import.meta as any).env.VITE_APP_MODE;
    
    // 2. Check URL parameter (Fallback/Dev)
    const params = new URLSearchParams(window.location.search);
    
    if (mode === 'admin' || params.get('admin') === 'true') {
      setIsAdminPortal(true);
    }
  }, []);

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('jvv-theme-color') || '#9333ea';
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await apiService.getCatalog();
        // apiService.getCatalog() returns the array directly or an empty array
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map((p: any, i: number) => ({
            id: 2000 + i,
            name: p.name,
            price: parseFloat(p.price) || 0,
            img: p.image || "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=800&q=80",
            category: 'Todos',
            description: p.description || ""
          }));
          setCatalog(mapped);
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await apiService.getBanners();
        if (res.success && Array.isArray(res.data)) {
          setBanners(res.data.filter((b: any) => b.active === 'TRUE'));
        }
      } catch (err) {
        console.error("Erro ao carregar banners:", err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-primary', themeColor);
    localStorage.setItem('jvv-theme-color', themeColor);
  }, [themeColor]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (user?.email) {
        try {
          const res = await apiService.getUserOrders(user.email);
          if (res.success && Array.isArray(res.data)) {
            setUserOrders(res.data);
          }
        } catch (err) {
          console.error("Erro ao buscar pedidos do usuário:", err);
        }
      } else {
        setUserOrders([]);
      }
    };
    fetchUserOrders();
  }, [user]);

  const canUserReviewProduct = (productName: string) => {
    if (!user) return { can: false, reason: 'login' };
    // Check if any order contains the product name
    const hasPurchased = userOrders.some((o: any) => 
      o.items && o.items.toLowerCase().includes(productName.toLowerCase())
    );
    return { can: hasPurchased, reason: hasPurchased ? 'ok' : 'not_purchased' };
  };

  const t = (brText: any, intText: any) => nationality === 'INT' ? intText : brText;
  const formatPrice = (price: number) => nationality === 'INT' ? `$ ${(price * 0.2).toFixed(2)}` : `R$ ${price.toFixed(2).replace('.', ',')}`;

  if (isAdminPortal) {
    return <AdminPortalPage t={t} formatPrice={formatPrice} />;
  }

  const navigate = (p: string, d: any = null, tag: string = "") => { 
    window.scrollTo(0, 0); 
    
    // Salva no histórico se for uma página diferente
    if (p !== currentPage) {
      setNavigationHistory(prev => [...prev, currentPage]);
    }
    
    setCurrentPage(p); 
    if(tag) setSelectedTag(tag); 
    if(d) setSelectedProduct(d); 
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const history = [...navigationHistory];
      const prevPage = history.pop();
      setNavigationHistory(history);
      if (prevPage) {
        window.scrollTo(0, 0);
        setCurrentPage(prevPage);
      }
    } else {
      navigate('home');
    }
  };
  
  const addToCart = (p: any, q: number = 1, size?: string) => { 
    const cartId = `${p.id}-${size || 'default'}-${Date.now()}`;
    const newItem = { ...p, cartId, quantity: q, selectedSize: size };
    setCart([...cart, newItem]); 
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateCartItemQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: newQuantity } : item));
  };
  
  const subtotalBase = cart.length > 0 ? cart.reduce((acc, i) => acc + (i.price * i.quantity), 0) : 0;
  const totalGeral = (subtotalBase + shippingValue) - discountValue;
  
  const applyCoupon = () => {
    if (checkoutData.cupom.toUpperCase() === "JVV10") {
      setDiscountValue(subtotalBase * 0.10);
    } else {
      setDiscountValue(0);
    }
  };

  const handleCalculateShipping = async () => {
    if (!checkoutData.cep) return;
    setIsCalculatingShipping(true);
    try {
      const res = await apiService.calculateShipping(checkoutData.cep);
      if (res.success && Array.isArray(res.data)) {
        setShippingOptions(res.data);
      } else {
        // Fallback options if API fails or returns different format
        setShippingOptions([
          { nome: t("Econômico", "Standard"), valor: 15.00 },
          { nome: t("Express Premium", "Express"), valor: 42.00 }
        ]);
      }
    } catch (err) {
      setShippingOptions([
        { nome: t("Econômico", "Standard"), valor: 15.00 },
        { nome: t("Express Premium", "Express"), valor: 42.00 }
      ]);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const finalizeOrder = async () => {
    setIsProcessing(true);
    try {
      // Save order to spreadsheet
      const orderData = {
        user: user?.email || checkoutData.email,
        items: cart.map(i => i.name).join(', '),
        total: totalGeral,
        payment: paymentMethod,
        address: `${checkoutData.endereco}, ${checkoutData.numero} - ${checkoutData.cep}`
      };
      await apiService.saveOrder(orderData);
      
      const msg = `Olá, confirmo meu pedido na JVV STORE! \n\nCliente: ${checkoutData.nome}\nPedido: ${orderData.items}\nTotal: ${formatPrice(totalGeral)}\nPagamento: ${paymentMethod.toUpperCase()}`;
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      alert(t("Erro ao salvar pedido. Redirecionando para o WhatsApp...", "Error saving order. Redirecting to WhatsApp..."));
      const msg = `Olá, confirmo meu pedido na JVV STORE! Valor Total: ${formatPrice(totalGeral)}`;
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewSubmit = (reviewData: any) => {
    const newReview = {
      id: Date.now(),
      name: user ? user.name : t("Explorador", "Explorer"),
      date: t("Agora mesmo", "Just now"),
      rating: reviewData.rating,
      text: reviewData.text,
      photo: reviewData.photo
    };
    setAddedReviews([newReview, ...addedReviews]);
  };

  return (
    <div className="min-h-screen text-white selection:bg-theme-primary selection:text-white overflow-x-hidden bg-[#020105] font-jakarta">
      
      {isNationalityModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[9999] flex items-center justify-center p-4 font-jakarta text-white">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.07] p-8 md:p-20 rounded-[40px] md:rounded-[70px] max-w-[90%] md:max-w-sm w-full text-center animate-fade shadow-2xl">
            <div className="mb-8 md:mb-10 flex justify-center"><OrbitalLogo size="large" /></div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-widest mb-4 md:mb-6">JVV STORE</h2>
            <p className="text-[9px] md:text-[11px] text-slate-500 uppercase tracking-[0.4em] mb-8 md:mb-12 font-bold">Localização / Location</p>
            <div className="grid gap-4 md:gap-6">
              <button onClick={() => {setNationality('BR'); setIsNationalityModalOpen(false);}} className="bg-gradient-to-r from-white to-slate-300 text-black py-4 md:py-6 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Brasil 🇧🇷</button>
              <button onClick={() => {setNationality('INT'); setIsNationalityModalOpen(false);}} className="border border-white/10 hover:border-white/30 hover:bg-white/5 py-4 md:py-6 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-bold uppercase transition-all text-slate-300 tracking-[0.3em]">Exterior 🌎</button>
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <MobileLayout 
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateCartItemQuantity={updateCartItemQuantity}
          formatPrice={formatPrice}
          t={t}
          user={user}
          setUser={setUser}
          navigate={navigate}
          currentPage={currentPage}
          selectedTag={selectedTag}
          selectedProduct={selectedProduct}
          checkoutData={checkoutData}
          setCheckoutData={setCheckoutData}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          setIsShippingModalOpen={setIsShippingModalOpen}
          subtotalBase={subtotalBase}
          shippingValue={shippingValue}
          discountValue={discountValue}
          totalGeral={totalGeral}
          applyCoupon={applyCoupon}
          finalizeOrder={finalizeOrder}
          isProcessing={isProcessing}
          openReviewModal={() => setIsReviewModalOpen(true)}
          addedReviews={addedReviews}
          openGlobalInfo={() => setIsGlobalInfoModalOpen(true)}
          setSelectedProduct={setSelectedProduct}
          themeColor={themeColor}
          setThemeColor={setThemeColor}
          catalog={catalog}
          banners={banners}
          goBack={goBack}
        />
      ) : (
        <>
          <GalaxyBackground />

          <ReviewModal 
            isOpen={isReviewModalOpen} 
            onClose={() => setIsReviewModalOpen(false)} 
            t={t} 
            onSubmit={handleReviewSubmit} 
          />

          <GlobalInfoModal 
            isOpen={isGlobalInfoModalOpen} 
            onClose={() => setIsGlobalInfoModalOpen(false)} 
            t={t} 
          />

          {isShippingModalOpen && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 md:p-6 text-white font-jakarta">
              <div className="bg-white/[0.02] border border-white/10 p-8 md:p-16 rounded-[40px] md:rounded-[60px] max-w-[95%] md:max-w-sm w-full text-center animate-fade shadow-2xl">
                <h3 className="text-[10px] md:text-[11px] font-black uppercase mb-8 md:mb-12 tracking-[0.6em] text-purple-400">{t('Escolha o Envio', 'Select Shipping')}</h3>
                
                <button 
                  onClick={handleCalculateShipping}
                  className="w-full mb-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {isCalculatingShipping ? t('CALCULANDO...', 'CALCULATING...') : t('CALCULAR FRETE PARA ', 'CALCULATE SHIPPING FOR ') + checkoutData.cep}
                </button>

                <div className="space-y-4 md:space-y-6 text-white">
                  {(shippingOptions.length > 0 ? shippingOptions : [
                    { nome: t("Econômico", "Standard"), valor: 15.00 },
                    { nome: t("Express Premium", "Express"), valor: 42.00 }
                  ]).map(o => (
                    <div key={o.nome} onClick={() => { setShippingValue(o.valor); setIsShippingModalOpen(false); }} className="p-4 md:p-6 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl cursor-pointer hover:border-purple-500 transition flex justify-between items-center group shadow-xl">
                      <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white font-bold">{o.nome}</span>
                      <span className="text-white font-black italic text-xs md:text-sm">{formatPrice(o.valor)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setIsShippingModalOpen(false)} className="mt-10 md:mt-14 text-[9px] md:text-[11px] text-slate-500 uppercase font-black hover:text-white transition tracking-widest underline">{t('Cancelar', 'Cancel')}</button>
              </div>
            </div>
          )}
          
          <Header currentPage={currentPage} selectedTag={selectedTag} navigate={navigate} cartCount={cart.length} user={user} t={t} />
          
          <main className="relative z-10 pt-10 md:pt-20">
            {currentPage === 'home' && <HomePage navigate={navigate} formatPrice={formatPrice} t={t} addToCart={addToCart} products={catalog} banners={banners} />}
            {currentPage === 'catalog' && <CatalogPage navigate={navigate} selectedTag={selectedTag} formatPrice={formatPrice} t={t} addToCart={addToCart} products={catalog} />}
            {currentPage === 'user' && <UserPanelPage user={user} setUser={setUser} checkoutData={checkoutData} setCheckoutData={setCheckoutData} formatPrice={formatPrice} t={t} openReviewModal={() => setIsReviewModalOpen(true)} cart={cart} setCart={setCart} catalog={catalog} addToCart={addToCart} navigate={navigate} />}
            {currentPage === 'product' && <ProductPage selectedProduct={selectedProduct} navigate={navigate} goBack={goBack} addToCart={addToCart} formatPrice={formatPrice} t={t} openReviewModal={() => setIsReviewModalOpen(true)} addedReviews={addedReviews} canReview={canUserReviewProduct} user={user} />}
            {currentPage === 'reviews' && <ReviewsPage navigate={navigate} t={t} openReviewModal={() => setIsReviewModalOpen(true)} user={user} />}
            {currentPage === 'checkout' && 
              <CheckoutPage 
                cart={cart} 
                removeFromCart={removeFromCart}
                updateCartItemQuantity={updateCartItemQuantity}
                checkoutData={checkoutData} 
                setCheckoutData={setCheckoutData} 
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                setIsShippingModalOpen={setIsShippingModalOpen}
                subtotalBase={subtotalBase}
                shippingValue={shippingValue}
                discountValue={discountValue}
                totalGeral={totalGeral} 
                applyCoupon={applyCoupon}
                finalizeOrder={finalizeOrder} 
                isProcessing={isProcessing}
                formatPrice={formatPrice}
                t={t}
              />}
          </main>
          
          <TrustAndFooter navigate={navigate} t={t} openGlobalInfo={() => setIsGlobalInfoModalOpen(true)} />
        </>
      )}
    </div>
  );
}
