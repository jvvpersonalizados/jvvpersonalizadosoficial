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
  },
  { 
    id: 5, 
    name: t("Squeeze Alumínio JVV", "JVV Aluminum Squeeze"), 
    price: 39.90, 
    img: "https://images.unsplash.com/photo-1602143399827-bd95967c7c40?w=800",
    category: "Premium",
    description: t("Garrafa de alumínio resistente com pintura eletrostática. Mantém sua bebida fresca por mais tempo.", "Resistant aluminum bottle with electrostatic painting. Keeps your drink fresh for longer."),
    features: [t("Material: Alumínio", "Material: Aluminum"), t("Capacidade: 600ml", "Capacity: 600ml"), t("Pintura: Eletrostática", "Painting: Electrostatic")],
    images: ["https://images.unsplash.com/photo-1602143399827-bd95967c7c40?w=800"],
    reviews: []
  },
  { 
    id: 6, 
    name: t("Chaveiro Galáctico", "Galactic Keychain"), 
    price: 12.00, 
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    category: "Brindes",
    description: t("Chaveiro em metal com gravação personalizada. Um detalhe estelar para suas chaves.", "Metal keychain with personalized engraving. A stellar detail for your keys."),
    features: [t("Material: Metal", "Material: Metal"), t("Gravação: Laser", "Engraving: Laser")],
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"],
    reviews: []
  },
  { 
    id: 7, 
    name: t("Mousepad JVV Orbit", "JVV Orbit Mousepad"), 
    price: 49.90, 
    img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
    category: "Acessórios",
    description: t("Mousepad extra grande com superfície speed e base antiderrapante. Estampa exclusiva JVV.", "Extra large mousepad with speed surface and non-slip base. Exclusive JVV print."),
    features: [t("Tamanho: 90x40cm", "Size: 90x40cm"), t("Superfície: Speed", "Surface: Speed"), t("Base: Borracha", "Base: Rubber")],
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800"],
    reviews: []
  },
  { 
    id: 8, 
    name: t("Boné JVV Space", "JVV Space Cap"), 
    price: 65.00, 
    img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
    category: "Vestuário",
    description: t("Boné modelo trucker com bordado em alta definição. Estilo galáctico para qualquer ocasião.", "Trucker model cap with high definition embroidery. Galactic style for any occasion."),
    features: [t("Modelo: Trucker", "Model: Trucker"), t("Bordado: 3D", "Embroidery: 3D"), t("Ajuste: Snapback", "Adjustment: Snapback")],
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800"],
    reviews: []
  },
  { 
    id: 9, 
    name: t("Caneca JVV Black Edition", "JVV Black Edition Mug"), 
    price: 49.90, 
    img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
    category: "Premium",
    description: t("Caneca em cerâmica preta fosca com gravação a laser em prata. Elegância e exclusividade.", "Matte black ceramic mug with silver laser engraving. Elegance and exclusivity."),
    features: [t("Material: Cerâmica", "Material: Ceramic"), t("Cor: Preto Fosco", "Color: Matte Black"), t("Gravação: Laser Prata", "Engraving: Silver Laser")],
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800"],
    reviews: []
  },
  { 
    id: 10, 
    name: t("Squeeze Inox JVV", "JVV Stainless Squeeze"), 
    price: 55.00, 
    img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800",
    category: "Premium",
    description: t("Garrafa em aço inox com parede dupla. Mantém a temperatura por até 12 horas.", "Stainless steel bottle with double wall. Keeps temperature for up to 12 hours."),
    features: [t("Material: Aço Inox", "Material: Stainless Steel"), t("Capacidade: 500ml", "Capacity: 500ml"), t("Térmica: Sim", "Thermal: Yes")],
    images: ["https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800"],
    reviews: []
  },
  { 
    id: 11, 
    name: t("Chaveiro Acrílico JVV", "JVV Acrylic Keychain"), 
    price: 15.00, 
    img: "https://images.unsplash.com/photo-1511406361295-0a5ff814c0ad?w=800",
    category: "Brindes",
    description: t("Chaveiro em acrílico transparente com corte especial. Leve a JVV sempre com você.", "Transparent acrylic keychain with special cut. Take JVV always with you."),
    features: [t("Material: Acrílico", "Material: Acrylic"), t("Corte: Laser", "Cut: Laser")],
    images: ["https://images.unsplash.com/photo-1511406361295-0a5ff814c0ad?w=800"],
    reviews: []
  },
  { 
    id: 12, 
    name: t("Camiseta JVV Retro", "JVV Retro T-Shirt"), 
    price: 69.90, 
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    category: "Vestuário",
    type: 'clothing',
    sizes: ['P', 'M', 'G', 'GG'],
    description: t("Camiseta com estampa retro JVV. Estilo clássico com a qualidade de sempre.", "T-shirt with retro JVV print. Classic style with the usual quality."),
    features: [t("Material: 100% Algodão", "Material: 100% Cotton"), t("Estampa: Retro", "Print: Retro")],
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
    reviews: []
  }
];
