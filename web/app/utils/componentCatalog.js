export const componentCatalog = [
  {
    name: "Hero Background",
    icon: "pi pi-table",
    desc: "Banner principal com card em destaque e dois laterais",
    template: {
      _id: "uuid-hero-bg-123",
      _name: "Hero Video",
      _type: "HeroBackground",
      _visible: true,
      _wrapperClass: "w-full p-0", 
      title: "A Magia do Café",
      subtitle: "Assista ao processo de extração perfeita.",
      images: [""], 
      buttonText: "Saiba Mais",
      buttonLink: "/sobre"
    }
},
  {
    name: "Hero 3 Box",
    icon: "pi pi-table",
    desc: "Banner principal com card em destaque e dois laterais",
    template: {
      _type: "Hero2",
      _visible: true,
      _wrapperClass: "w-full max-w-[1500px] px-4 md:px-8 pt-2 pb-2",
      items: [
        {
          link: "",
          image: "",
          alt: "",
          badge: "",
          title: "",
          description: "",
          buttonText: ""
        }
      ]
    }
  },
  {
    name: "Hero Carousel",
    icon: "pi pi-images",
    desc: "Banner rotativo com múltiplas imagens e botões",
    template: {
      _type: "HeroCarousel",
      _visible: true,
      _wrapperClass: "w-full max-w-[1500px] px-4 md:px-8 pt-2 pb-2",
      items: [
        {
          link: "",
          image: "",
          alt: "",
          badge: "",
          title: "",
          description: "",
          buttonText: ""
        }
      ]
    }
  },
  {
    name: "Barra de atalhos",
    icon: "pi pi-verified",
    desc: "Barra de atalhos, logotipos ou diferenciais",
    template: {
      _type: "TrustBar",
      _visible: true,
      _wrapperClass: "w-full max-w-[1400px] px-6 md:px-12 py-7",
      source: "content/home/trustbar.json",
      title: "Atalhos",
      description: ""
    }
  },
  {
    name: "Lista em Carrossel",
    icon: "pi pi-sliders-h",
    desc: "Exibe produtos ou posts em um carrossel deslizante",
    template: {
      _type: "ContentListfiles",
      _visible: true,
      view: "carrosel",
      limit: 15,
      _wrapperClass: "w-full max-w-[1400px] px-6 md:px-12 space-y-10 py-7",
      section: "content/produtos/cafes",
      viewparams: {
        columns: 5,
        card_showtitle: false,
        card_img_aspectratio: "4/5",
        gap: "1rem",
        card_border_radius: "16px"
      },
      title: "Origens Brasileiras",
      subtitle: "Uma viagem pelos terroirs e pelas mãos dos pequenos produtores."
    }
  },
  {
    name: "Lista em Grid",
    icon: "pi pi-th-large",
    desc: "Exibe produtos ou posts em uma grade fixa",
    template: {
      _type: "ContentListfiles",
      _visible: true,
      view: "blog",
      limit: 3,
      _wrapperClass: "w-full max-w-[1400px] px-2 md:px-1 space-y-2 py-2",
      section: "content/blog",
      viewparams: {
        columns: 3,
        card_showtitle: false,
        card_img_aspectratio: "4/5",
        gap: "1.5rem",
        card_border_radius: "16px"
      },
      title: "Diário do Barista",
      subtitle: "Explore o universo dos cafés especiais"
    }
  },
  {
    name: "Banner simples",
    icon: "pi pi-image",
    desc: "Uma única imagem de destaque com bordas ajustáveis",
    template: {
      _type: "Banner",
      _visible: true,
      image: "/assets/banner2.png",
      class: "mb-10 rounded-3xl"
    }
  }
];