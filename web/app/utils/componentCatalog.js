export const componentCatalog = [
  {
    name: "Hero News",
    icon: "pi pi-table",
    desc: "Banner principal com card em destaque e dois laterais",
    template: {
      _id: "uuid-hero-bg-123",
      _name: "Hero News",
      _type: "HeroNews",
      _visible: true,
      _wrapperClass: "w-full p-0",
      title: "",
      subtitle: "",
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
      _type: "Hero3boxes",
      _visible: true,
      _wrapperClass: "w-full max-w-[1500px] px-4 md:px-8 pt-2 pb-2",
      items: [
        {
          title: "",
          description: "",
          link: "",
          image: "",
          video: "",
          alt: "",
          badge: "",
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
          title: "",
          description: "",
          link: "",
          image: "",
          video: "",
          alt: "",
          badge: "",
          buttonText: ""
        }
      ]
    }
  },
  {
    name: "Lista de artigos",
    icon: "pi pi-table",
    desc: "Banner principal com card em destaque e dois laterais",
    template: {
      _id: "uuid-hero-bg-123",
      _name: "ArticleList",
      _type: "ArticleList",
      _visible: true,
      _wrapperClass: "w-full p-0",
      title: "",
      subtitle: "",
      images: [""],
      buttonText: "Saiba Mais",
      buttonLink: "/sobre"
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
      title: "",
      subtitle: "",
      limit: 15,
      _wrapperClass: "w-full max-w-[1400px] px-6 md:px-12 space-y-10 py-7 pt-10",
      section: "content/produtos/cafes",
      viewparams: {
        columns: 5,
        card_showtitle: false,
        card_img_aspectratio: "4/5",
        gap: "1rem",
        card_border_radius: "16px"
      }
    }
  },
  {
    name: "Lista em Grid",
    icon: "pi pi-th-large",
    desc: "Exibe produtos ou posts em uma grade fixa",
    template: {
      _type: "ContentListfiles",
      _visible: true,
      title: "",
      subtitle: "",
      view: "blog",
      limit: 3,
      _wrapperClass: "w-full max-w-[1400px] px-2 md:px-1 space-y-2 py-2 mt-10",
      section: "content/blog",
      viewparams: {
        columns: 3,
        card_showtitle: false,
        card_img_aspectratio: "4/5",
        gap: "1.5rem",
        card_border_radius: "16px"
      }
    }
  },
  {
    name: "Banner simples",
    icon: "pi pi-image",
    desc: "Uma única imagem de destaque com bordas ajustáveis",
    template: {
      _type: "Banner",
      _visible: true,
      image: "",
      contentWidth: "cw-1",
      class: ""
    }
  },
  {
    name: "Regua de itens",
    icon: "pi pi-table", // Or 'pi-th-large' looks great for this layout!
    desc: "Banner principal com card em destaque e dois laterais",
    template: {
      _type: "TrustBar", // You can reuse the TrustBar component for this layout, just with different styling and no icons
      _visible: true,
      _wrapperClass: "w-full max-w-[1500px] px-4 md:px-8 pt-2 pb-2",
      items: [
        // BOX 1: Main Left (Large)
        {
          title: "O Verdadeiro Sabor da Natureza.",
          description: "Mel cru e artesanal, direto do nosso apiário para a sua mesa. Extraído com cuidado para manter todas as propriedades originais.",
          icon: "pi pi-leaf",
          link: "/produtos",
          image: "https://images.unsplash.com/photo-1587049352847-4d4b12630ce4?q=80&w=1600&auto=format&fit=crop",
          video: "", // Leave empty unless they upload an MP4
          alt: "Mel derramando",
          badge: "COLHEITA FRESCA",
          buttonText: "VER NOSSOS PRODUTOS"
        },
        // BOX 2: Top Right
        {
          title: "100% Puro e Cru",
          subtitle: "Sem misturas ou conservantes",
          icon: "pi pi-leaf",
          link: "/qualidade",
          image: "https://images.unsplash.com/photo-1587049352851-8d4e89134a5d?q=80&w=800&auto=format&fit=crop",
          video: "",
          alt: "Favo de mel",
          badge: "", // Badges aren't mapped in the sub-boxes in your Vue code, but good to keep structure
          buttonText: "SABER MAIS"
        },
        // BOX 3: Bottom Right
        {
          title: "Nossa História",
          subtitle: "Conheça quem cuida das abelhas",
          icon: "pi pi-leaf",
          link: "/sobre",
          image: "https://images.unsplash.com/photo-1473655589139-c189b8832128?q=80&w=800&auto=format&fit=crop",
          video: "",
          alt: "Apicultor no campo",
          icon: "pi-heart",
          buttonText: "CONHECER"
        }
      ]
    }
  },
  {
    name: "Texto",
    icon: "pi pi-table", // Or 'pi-th-large' looks great for this layout!
    desc: "Caixa de texto livre",
    template: {
      _type: "MarkdownText",
      _visible: true,
     
      content: {
        file: ""
      },
       _wrapperClass: "",
      contentWidth: "cw-1"
    }
  },
  {
    name: "Lista de itens",
    icon: "pi pi-table", // Or 'pi-th-large' looks great for this layout!
    desc: "Listagem horizontal ou vertical de itens com imagem, texto e botão",
    template: {
      _type: "ItemsList",
      _visible: true,
      _wrapperClass: "",
      title: "",
      description: "",
      contentWidth: "",
      items: [
        {
          icon: "pi pi-shield",
          title: "",
          description: "",
          image: ""
        }
      ]
    }
  }
];