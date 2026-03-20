export const getProducts = (t: (br: any, int: any) => any) => [
  { 
    id: 1, 
    name: t("Copo JVV Pro Térmico", "JVV Pro Thermal Cup"), 
    price: 89.90, 
    img: "https://images.tcdn.com.br/img/img_prod/1114972/copo_termico_personalizado_azul_marinho_com_tampa_e_abridor_359_1_092e078be993043d0e2e2ca1ec41e2e2.jpg",
    category: "Premium",
    description: t("Caneca em cerâmica de alta densidade com gravação a laser permanente. Resistente a microondas e lava-louças. Ideal para presentear com sofisticação.", "High-density ceramic mug with permanent laser engraving. Microwave and dishwasher safe. Ideal for gifting with sophistication."),
    features: [t("Material: Cerâmica", "Material: Ceramic"), t("Capacidade: 325ml", "Capacity: 325ml"), t("Gravação: Laser Precision", "Engraving: Laser Precision"), t("Cores: Preto/Branco", "Colors: Black/White")],
    images: ["https://images.tcdn.com.br/img/img_prod/1114972/copo_termico_personalizado_azul_marinho_com_tampa_e_abridor_359_1_092e078be993043d0e2e2ca1ec41e2e2.jpg", "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=640"],
    reviews: [
      { user: "Gabriel M.", stars: 5, text: t("Gravação perfeita, recomendo!", "Perfect engraving, I recommend it!") },
      { user: "Juliana S.", stars: 4, text: t("Muito bonita, chegou rápido.", "Very beautiful, arrived fast.") }
    ]
  },
  { 
    id: 2, 
    name: t("Caneca Galáxia Premium", "Premium Galaxy Mug"), 
    price: 45.00, 
    img: "https://http2.mlstatic.com/D_NQ_NP_960588-MLB49863071676_052022-O.webp",
    category: "Premium",
    description: t("Caneca temática galáctica com acabamento brilhante e cores vibrantes. Um presente estelar para quem você ama.", "Galactic themed mug with glossy finish and vibrant colors. A stellar gift for those you love."),
    features: [t("Material: Cerâmica", "Material: Ceramic"), t("Capacidade: 325ml", "Capacity: 325ml"), t("Acabamento: Brilhante", "Finish: Glossy")],
    images: ["https://http2.mlstatic.com/D_NQ_NP_960588-MLB49863071676_052022-O.webp", "https://images.unsplash.com/photo-1572113173140-5e36532ad557?q=80&w=640"],
    reviews: [
      { user: "Carlos A.", stars: 5, text: t("Cores incríveis!", "Amazing colors!") }
    ]
  },
  { 
    id: 3, 
    name: t("Camiseta Mission 2026", "Mission 2026 T-Shirt"), 
    price: 59.90, 
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    category: "Vestuário",
    type: 'clothing',
    sizes: ['P', 'M', 'G', 'GG'],
    description: t("Camiseta 100% algodão com estampa exclusiva Mission 2026. Conforto e estilo para o seu dia a dia.", "100% cotton t-shirt with exclusive Mission 2026 print. Comfort and style for your daily life."),
    features: [t("Material: 100% Algodão", "Material: 100% Cotton"), t("Estampa: Silk Screen", "Print: Silk Screen"), t("Tamanhos: P ao GG", "Sizes: S to XL")],
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
    reviews: []
  },
  { 
    id: 4, 
    name: t("Abridor Stelar", "Stellar Opener"), 
    price: 15.00, 
    img: "https://images.unsplash.com/photo-1571175302309-847047321331?w=800",
    category: "Acessórios",
    description: t("Abridor de garrafas magnético com design ergonômico. Praticidade e beleza na sua cozinha.", "Magnetic bottle opener with ergonomic design. Practicality and beauty in your kitchen."),
    features: [t("Material: Aço Inox", "Material: Stainless Steel"), t("Magnético: Sim", "Magnetic: Yes")],
    images: ["https://images.unsplash.com/photo-1571175302309-847047321331?w=800"],
    reviews: []
  }
];
