import React from 'react';
import { User, CreditCard, Zap, MessageSquare, CreditCard as CardIcon, Bitcoin, Trash2, Minus, Plus } from 'lucide-react';
import { CartItem, CheckoutData } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  checkoutData: CheckoutData;
  setCheckoutData: (data: CheckoutData) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  setIsShippingModalOpen: (open: boolean) => void;
  subtotalBase: number;
  shippingValue: number;
  discountValue: number;
  totalGeral: number;
  applyCoupon: () => void;
  finalizeOrder: () => void;
  removeFromCart: (cartId: string) => void;
  updateCartItemQuantity: (cartId: string, quantity: number) => void;
  isProcessing: boolean;
  formatPrice: (price: number) => string;
  t: (br: any, int: any) => any;
  user: any;
  navigate: (page: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ 
  cart, 
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
  removeFromCart,
  updateCartItemQuantity,
  isProcessing, 
  formatPrice, 
  t,
  user,
  navigate
}) => {
  const isProfileComplete = user && 
    user.name && 
    user.email && 
    user.telefone && 
    user.cpf && 
    user.nascimento && 
    user.cep && 
    user.endereco;

  const methods = [
    { id: 'pix', label: 'PIX', icon: Zap, a: '#00ff88' }, 
    { id: 'card', label: t('CARTÃO', 'CARD'), icon: CreditCard, a: '#00d2ff' }, 
    { id: 'paypal', label: 'PAYPAL', icon: CardIcon, a: '#0070ba' }, 
    { id: 'btc', label: 'BITCOIN', icon: Bitcoin, a: '#f7931a' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24 md:pb-48 animate-fade text-white font-jakarta">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20">
        <div className="lg:col-span-7 space-y-10 md:space-y-16">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.07] rounded-[40px] md:rounded-[50px] p-6 md:p-16 shadow-3xl">
            <h2 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] mb-8 md:mb-12 text-slate-500 italic flex items-center gap-3 md:gap-5">
              <User size={16} className="text-[var(--theme-primary)]" /> 01. <span className="truncate">{t('Coordenadas de Envio', 'Shipping Coordinates')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('Nome Completo', 'Full Name')}</label>
                <input value={checkoutData.nome} onChange={(e) => setCheckoutData({...checkoutData, nome: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder={t('Ex: André Luiz', 'Ex: John Doe')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('WhatsApp / Contato', 'WhatsApp / Contact')}</label>
                <input value={checkoutData.telefone} onChange={(e) => setCheckoutData({...checkoutData, telefone: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder="(00) 00000-0000" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('E-mail', 'Email')}</label>
                <input value={checkoutData.email} onChange={(e) => setCheckoutData({...checkoutData, email: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder="email@exemplo.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('CPF / Documento', 'Tax ID')}</label>
                <input value={checkoutData.cpf} onChange={(e) => setCheckoutData({...checkoutData, cpf: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder="000.000.000-00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('Data de Nascimento', 'Birth Date')}</label>
                <input type="date" value={checkoutData.nascimento} onChange={(e) => setCheckoutData({...checkoutData, nascimento: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('CEP', 'Zip Code')}</label>
                <div className="relative">
                  <input value={checkoutData.cep} onChange={(e) => setCheckoutData({...checkoutData, cep: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 pl-5 pr-32 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder="00000-000" />
                  <button onClick={() => setIsShippingModalOpen(true)} className="absolute right-2 top-2 bottom-2 bg-[var(--theme-primary)]/20 hover:bg-[var(--theme-primary)] text-white text-[9px] font-black px-4 rounded-xl uppercase transition-all border border-[var(--theme-primary)]/30">{t('Calcular', 'Calculate')}</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('Rua / Logradouro', 'Street Address')}</label>
                <input value={checkoutData.endereco} onChange={(e) => setCheckoutData({...checkoutData, endereco: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder={t('Rua...', 'Street...')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('Número', 'Number')}</label>
                <input value={checkoutData.numero} onChange={(e) => setCheckoutData({...checkoutData, numero: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 h-14 px-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm transition-all" placeholder="123" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{t('Detalhes / Complemento', 'Additional Details')}</label>
                <textarea value={checkoutData.detalhes} onChange={(e) => setCheckoutData({...checkoutData, detalhes: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-[var(--theme-primary)] text-white text-sm min-h-[100px] transition-all" placeholder={t('Apto, Bloco, Referência...', 'Apt, Block, Reference...')} />
              </div>
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.07] rounded-[40px] md:rounded-[50px] p-6 md:p-16 shadow-3xl">
            <h2 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] mb-8 md:mb-12 text-slate-500 italic flex items-center gap-3 md:gap-5">
              <CreditCard size={16} className="text-[#00d2ff]" /> 02. <span className="truncate">{t('Método de Pagamento', 'Payment Method')}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {methods.map(m => {
                const MIcon = m.icon;
                return (
                <div key={m.id} onClick={() => setPaymentMethod(m.id)} className={`group p-4 md:p-6 rounded-2xl md:rounded-3xl text-center cursor-pointer transition-all border ${paymentMethod === m.id ? '' : 'border-white/5 bg-white/[0.01]'}`} style={paymentMethod === m.id ? { borderColor: m.a, backgroundColor: m.a + '1A', boxShadow: `0 0 30px ${m.a}33` } : {}}>
                  <MIcon className={`text-2xl md:text-3xl mb-3 md:mb-4 mx-auto block transition-all ${paymentMethod === m.id ? 'scale-110' : 'text-slate-700'}`} style={paymentMethod === m.id ? { color: m.a } : {}} />
                  <p className="font-black text-[8px] md:text-[9px] uppercase tracking-normal leading-tight">{m.label}</p>
                </div>
              )})}
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-6 md:p-16 lg:sticky lg:top-10 shadow-3xl">
            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] mb-8 md:mb-12 text-slate-500 italic">{t('Resumo do Pedido', 'Order Summary')}</h3>
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
              {cart.length === 0 && <p className="text-xs md:text-sm text-slate-500 italic text-center py-10">{t('Carrinho Vazio', 'Empty Cart')}</p>}
              {cart.map(item => (
                <div key={item.cartId} className="flex flex-col gap-4 bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5">
                  <div className="flex items-center gap-4 md:gap-6">
                    <img src={item.img} className="w-12 h-12 md:w-16 md:h-16 object-contain" alt="" />
                    <div className="flex-1 overflow-hidden font-bold">
                      <p className="text-[10px] md:text-[12px] font-black uppercase truncate">{item.name}</p>
                      {item.selectedSize && (
                        <p className="text-[8px] md:text-[9px] font-black text-[var(--theme-primary)] uppercase tracking-widest mt-1">
                          {t('Tamanho:', 'Size:')} {item.selectedSize}
                        </p>
                      )}
                      <p className="text-xs md:text-sm font-black text-white italic mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-slate-500 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('Quantidade:', 'Quantity:')}</span>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                      <button 
                        onClick={() => updateCartItemQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus size={12}/>
                      </button>
                      <span className="w-8 text-center text-xs font-black italic">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus size={12}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-8 md:pt-12 space-y-4 md:space-y-6">
              <div className="relative">
                <input value={checkoutData.cupom} onChange={(e) => setCheckoutData({...checkoutData, cupom: e.target.value})} type="text" className="w-full bg-white/5 border border-white/10 p-4 md:p-5 pr-24 md:pr-32 rounded-xl md:rounded-2xl outline-none focus:border-[var(--theme-primary)] text-[10px] md:text-[12px] font-black text-white uppercase tracking-widest" placeholder={t('CUPOM?', 'COUPON?')} />
                <button onClick={applyCoupon} className="absolute right-2 md:right-3 top-2 md:top-3 bottom-2 md:bottom-3 bg-white/10 hover:bg-[var(--theme-primary)] text-white text-[9px] md:text-[10px] font-black px-6 md:px-8 rounded-lg md:rounded-xl uppercase transition border border-white/5">OK</button>
              </div>
              <div className="space-y-3 md:space-y-4 px-2">
                <div className="flex justify-between text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500"><span>Subtotal</span><span className="text-white italic">{formatPrice(subtotalBase)}</span></div>
                {discountValue > 0 && <div className="flex justify-between text-[9px] md:text-[11px] font-black uppercase tracking-widest text-[#00ff88]"><span>Desconto</span><span>- {formatPrice(discountValue)}</span></div>}
                <div className="flex justify-between text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500"><span>{t('Frete', 'Shipping')}</span><span className="text-white italic">{formatPrice(shippingValue)}</span></div>
              </div>
            </div>

            {!user ? (
              <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                <p className="text-[10px] font-black uppercase text-red-400 mb-4 tracking-widest">
                  {t('Você precisa estar logado para finalizar o pedido', 'You must be logged in to finalize the order')}
                </p>
                <button 
                  onClick={() => navigate('user')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {t('FAZER LOGIN / CADASTRO', 'LOGIN / REGISTER')}
                </button>
              </div>
            ) : !isProfileComplete ? (
              <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-center">
                <p className="text-[10px] font-black uppercase text-amber-400 mb-4 tracking-widest">
                  {t('Complete seu perfil para finalizar o pedido', 'Complete your profile to finalize the order')}
                </p>
                <button 
                  onClick={() => navigate('user')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {t('COMPLETAR PERFIL', 'COMPLETE PROFILE')}
                </button>
              </div>
            ) : (
              <button onClick={finalizeOrder} disabled={isProcessing || cart.length === 0} className="w-full bg-gradient-to-br from-[#00ff88] to-[#00a859] text-black py-6 md:py-8 mt-8 md:mt-12 rounded-[24px] md:rounded-[30px] text-[12px] md:text-[14px] font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest italic disabled:opacity-50">
                {isProcessing ? t('PROCESSANDO...', 'PROCESSING...') : t('IR PARA PAGAMENTO', 'GO TO PAYMENT')}
              </button>
            )}

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10 text-center font-bold">
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.4em] block mb-2">{t('Total do Lançamento', 'Total Amount')}</span>
              <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">{formatPrice(totalGeral)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

