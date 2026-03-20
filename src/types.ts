export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  category?: string;
  description?: string;
  features?: string[];
  images?: string[];
  reviews?: any[];
  sizes?: string[];
  type?: 'clothing' | 'accessory' | 'other';
}

export interface CartItem extends Product {
  cartId: string;
  selectedSize?: string;
  quantity: number;
}

export interface Review {
  id: number;
  author?: string;
  name?: string;
  rating: number;
  comment?: string;
  text?: string;
  date: string;
  avatar?: string;
  photo?: string;
  verified?: boolean;
}

export interface CheckoutData {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  nascimento: string;
  cep: string;
  endereco: string;
  numero: string;
  detalhes: string;
  cupom: string;
  pais: string;
}
