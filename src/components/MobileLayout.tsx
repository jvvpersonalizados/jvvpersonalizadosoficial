import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, ArrowLeft, Plus, Shield, MapPin, LayoutGrid, Store, X, Globe, Phone, Star, BadgeCheck } from 'lucide-react';
import { CheckoutPage } from '../pages/CheckoutPage';
import { UserPanelPage } from '../pages/UserPanelPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductPage } from '../pages/ProductPage';
import { HomePage } from '../pages/HomePage';
import { getProducts } from '../constants/products';
import { Product } from '../types';

interface MobileLayoutProps {
  cart: any[];
  addToCart: (p: any, q?: number, size?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateCartItemQuantity: (cartId: string, newQuantity: number) => void;
  formatPrice: (price: number) => string;
  t: (br: any, int: any) => any;
  user: any;
  setUser: (user: any) => void;
  navigate: (page: string, data?: any) => void;
  currentPage: string;
  selectedTag: string;
  selectedProduct: any;
  checkoutData: any;
  setCheckoutData: (data: any) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  setIsShippingModalOpen: (open: boolean) => void;
  subtotalBase: number;
  shippingValue: number;
  discountValue: number;
  totalGeral: number;
  applyCoupon: () => void;
  finalizeOrder: () => void;
  isProcessing: boolean;
  openReviewModal: () => void;
  addedReviews: any[];
  openGlobalInfo: () => void;
  setSelectedProduct: (p: any) => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
  catalog?: Product[];
  goBack: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  cart, 
  addToCart, 
  removeFromCart,
  updateCartItemQuantity,
  formatPrice, 
  t, 
  user, 
  setUser,
  navigate,
  currentPage,
  selectedTag,
  selectedProduct,
  checkoutData,
  setCheckoutData,
  paymentMethod,
  setPaymentMethod,
  setIsShippingModalOpen,
  subtotalBase,
  shippingValue,
  discountValue,
  totalGeral,
  applyCoupon,
  finalizeOrder,
  isProcessing,
  openReviewModal,
  addedReviews,
  openGlobalInfo,
  setSelectedProduct,
  themeColor,
  setThemeColor,
  catalog: externalProducts,
  goBack
}) => {
  const [isSearchViewOpen, setIsSearchViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [productTab, setProductTab] = useState<'desc' | 'rev'>('desc');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const localProducts = getProducts(t);
  const products = externalProducts && externalProducts.length > 0 ? externalProducts : localProducts;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [currentPage, selectedProduct]);

  const refreshReviews = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const searchSuggestions = [
    t("Caneca", "Mug"), t("Copo", "Cup"), t("Camiseta", "T-Shirt"), 
    t("Abridor", "Opener"), t("Premium", "Premium"), t("Galáxia", "Galaxy")
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleAddToCart = (p: any) => {
    addToCart(p);
    triggerToast(t("Adicionado ao carrinho!", "Added to cart!"));
  };

  const checkout = () => {
    if (cart.length === 0) {
      triggerToast(t("Carrinho vazio!", "Cart empty!"));
      return;
    }
    navigate('checkout');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0118] text-white overflow-hidden font-jakarta">
      
      {/* TOAST */}
      <div className={`notification-toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      {/* SEARCH VIEW (FULL SCREEN) */}
      <div className={`product-view-panel ${isSearchViewOpen ? 'active' : ''}`}>
        <header className="px-5 pt-10 pb-4 flex items-center gap-4 border-b border-white/5 bg-[#0a0118]">
          <button onClick={() => setIsSearchViewOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Buscar na JVV...", "Search JVV...")} 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all" 
            />
            <Search size={14} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="bg-purple-500 p-3 rounded-xl text-white">
            <Search size={16} strokeWidth={3} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {/* SEARCH SUGGESTIONS */}
          <div className="mb-8">
            <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">{t("Sugestões de Busca", "Search Suggestions")}</h4>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => setSearchQuery(s)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH RESULTS */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col cursor-pointer transition-all active:scale-95" onClick={() => { setIsSearchViewOpen(false); navigate('product', p); }}>
                <div className="w-full aspect-square bg-white/5 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                  <img src={p.img} className="w-full h-full object-cover opacity-60" alt="" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-0.5">{p.category}</span>
                  <p className="text-[11px] font-bold text-white mb-1 truncate">{p.name}</p>
                  <p className="text-[12px] font-black text-white">{formatPrice(p.price)}</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Search size={32} strokeWidth={1.5} className="text-white/20 mb-3" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t("Nenhum produto encontrado", "No products found")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-[#0a0118]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 flex flex-col">
        <div className="px-5 pt-10 pb-2 flex items-center justify-between w-full">
          <button className="text-white/70 hover:text-white transition-colors" onClick={() => setIsSearchViewOpen(true)}>
            <Search size={20} strokeWidth={2.5} />
          </button>

          <div className="relative -mb-4">
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-white/5 shadow-xl shadow-purple-500/20">
              <div className="pc-style-arc animate-border-spin"></div>
              <div className="relative w-[calc(100%-4px)] h-[calc(100%-4px)] bg-[#0a0118] rounded-full z-10 flex items-center justify-center overflow-hidden">
                <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCEWGuDUdsnor1dzZWQB9FvqiQ64P2Tm3n3738RlC5FWDjIOlcjej6ivRijzjE5537HhPR-m63OfNWG6g3Loue8hIlTTJ6XGxSrUdD-ABO_y6IJ9TOZRfveOIeHtOcLrJO8JJlZu614rZKLAut8a2obeEM9aghATPYXwGQ3FjaMc3OQbQECNtoh3nGNts/w640-h640/Hamb%C3%BArguer%20Saboroso%20Post%20para%20Instagram%20Moderno%20(2).png" alt="JVV Logo" className="w-full h-full object-contain p-1" />
              </div>
            </div>
          </div>

          <div className="relative cursor-pointer" onClick={checkout}>
            <button className="text-white/70">
              <ShoppingCart size={20} strokeWidth={2} />
            </button>
            {cart.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-purple-500 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div ref={contentRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {currentPage === 'home' && (
          <HomePage navigate={navigate} formatPrice={formatPrice} t={t} addToCart={addToCart} />
        )}

        {currentPage === 'checkout' && (
          <div className="pt-8 pb-24">
            <CheckoutPage 
              cart={cart} 
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
              removeFromCart={removeFromCart}
              updateCartItemQuantity={updateCartItemQuantity}
              isProcessing={isProcessing}
              formatPrice={formatPrice}
              t={t}
            />
          </div>
        )}

        {currentPage === 'user' && (
          <div className="pt-8 pb-24">
            <UserPanelPage 
              user={user} 
              setUser={setUser} 
              checkoutData={checkoutData} 
              setCheckoutData={setCheckoutData} 
              formatPrice={formatPrice} 
              t={t} 
              openReviewModal={openReviewModal} 
            />
          </div>
        )}

        {currentPage === 'reviews' && (
          <div className="pt-8 pb-24">
            <ReviewsPage navigate={navigate} t={t} openReviewModal={openReviewModal} />
          </div>
        )}

        {currentPage === 'catalog' && (
          <div className="pt-8 pb-24">
            <CatalogPage navigate={navigate} selectedTag={selectedTag} formatPrice={formatPrice} t={t} addToCart={addToCart} />
          </div>
        )}

        {currentPage === 'product' && (
          <div className="pt-8 pb-24">
            <ProductPage selectedProduct={selectedProduct} navigate={navigate} goBack={goBack} addToCart={addToCart} formatPrice={formatPrice} t={t} openReviewModal={openReviewModal} addedReviews={addedReviews} />
          </div>
        )}
      </div>

      {/* INFO DRAWER */}
      <div className={`info-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="bg-[#0a0118] border-t border-white/5 py-3 flex flex-col items-center cursor-pointer" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
          <div className="w-10 h-1 bg-white/20 rounded-full mb-3"></div>
          <div className="flex items-center gap-2">
            <Shield size={10} className="text-purple-500" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/50">{t("Certificações & Contacto", "Certifications & Contact")}</span>
          </div>
        </div>
        
        <div className="info-content-panel bg-[#0a0118]">
          <div className="p-6 space-y-6">
            <button 
              onClick={openGlobalInfo}
              className="w-full bg-white/5 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between group active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{t("Envio Global & Segurança", "Global Shipping & Security")}</span>
              </div>
              <Plus size={14} className="text-purple-500" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[6px] font-black text-purple-500 uppercase block mb-1">{t("Empresa Registada", "Registered Company")}</span>
                <p className="text-[10px] font-mono tracking-tighter">30.674.888/0001-09</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[6px] font-black text-purple-500 uppercase block mb-1">{t("Localização", "Location")}</span>
                <p className="text-[10px] font-bold">{t("Barretos - SP, Brasil", "Barretos - SP, Brazil")}</p>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4">
              <Phone size={16} className="text-purple-500" />
              <div>
                <p className="text-[10px] font-bold">+55 (17) 98127-0724</p>
                <p className="text-[8px] text-white/40 uppercase font-black">jvvpersonalizados@gmail.com</p>
              </div>
            </div>

            {/* THEME COLOR PICKER */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">{t("Cor do Tema", "Theme Color")}</span>
                <span className="text-[10px] font-mono text-white/60 uppercase">{themeColor}</span>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-white/20 shadow-2xl cursor-pointer relative overflow-hidden group transition-all duration-500"
                  style={{ 
                    boxShadow: `0 0 20px ${themeColor}44`,
                    borderColor: `${themeColor}66`
                  }}
                  onClick={() => document.getElementById('theme-color-input')?.click()}
                >
                  <img 
                    src="https://cdn.dooca.store/1841/products/cooler-tdagger-rgb-1.jpg?v=1658590411&webp=0" 
                    alt="RGB Controller"
                    className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full blur-md animate-pulse" style={{ background: themeColor }}></div>
                    <Plus size={20} className="text-white relative z-10 drop-shadow-lg" />
                  </div>
                  <input 
                    id="theme-color-input"
                    type="color" 
                    value={themeColor} 
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer scale-[5]"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-white mb-1 uppercase tracking-wider">{t("Customização RGB", "RGB Customization")}</p>
                  <p className="text-[9px] text-white/50 leading-tight font-medium">{t("Toque no cooler para abrir a paleta de cores e mudar toda a atmosfera do site.", "Tap the cooler to open the color palette and change the entire site atmosphere.")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bg-[#0a0118] border-t border-white/5 h-16 px-12 flex items-center justify-between z-50 shrink-0">
        <button className={`${!isSearchViewOpen ? 'text-purple-500' : 'text-white/20'}`} onClick={() => { setIsSearchViewOpen(false); navigate('home'); }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13z"/></svg>
        </button>
        <button className={`${isSearchViewOpen ? 'text-purple-500' : 'text-white/20'}`} onClick={() => setIsSearchViewOpen(true)}>
          <LayoutGrid size={24} strokeWidth={2.5} />
        </button>
        <button className={`${currentPage === 'user' ? 'text-purple-500' : 'text-white/20'}`} onClick={() => navigate('user')}>
          <User size={22} strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  );
};
