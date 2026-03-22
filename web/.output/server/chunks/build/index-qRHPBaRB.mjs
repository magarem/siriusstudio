import { a as useRouter, s as script$5 } from './server.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../../index.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'node:http';
import 'node:https';
import 'vue-router';
import '@primeuix/utils/eventbus';
import '@primeuix/styled';
import '@primeuix/utils';
import '@primeuix/utils/object';
import '@primeuix/styles/base';
import '@primeuix/utils/dom';
import '@primeuix/utils/zindex';
import '@primeuix/styles/toast';
import '@primeuix/utils/uuid';
import '@primeuix/styles/ripple';
import '@primeuix/styles/badge';
import '@primeuix/styles/button';
import '@primeuix/styles/dialog';
import '@primeuix/styles/confirmdialog';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@primevue/core/base/style';
import '@primevue/core/basecomponent/style';
import '@primeuix/styles/autocomplete';
import '@primeuix/styles/cascadeselect';
import '@primeuix/styles/checkbox';
import '@primeuix/styles/checkboxgroup';
import '@primeuix/styles/colorpicker';
import '@primeuix/styles/datepicker';
import '@primeuix/styles/floatlabel';
import '@primeuix/styles/iconfield';
import '@primeuix/styles/iftalabel';
import '@primeuix/styles/inputchips';
import '@primeuix/styles/inputgroup';
import '@primeuix/styles/inputnumber';
import '@primeuix/styles/inputotp';
import '@primeuix/styles/inputtext';
import '@primeuix/styles/knob';
import '@primeuix/styles/listbox';
import '@primeuix/styles/multiselect';
import '@primeuix/styles/password';
import '@primeuix/styles/radiobutton';
import '@primeuix/styles/radiobuttongroup';
import '@primeuix/styles/rating';
import '@primeuix/styles/select';
import '@primeuix/styles/selectbutton';
import '@primeuix/styles/slider';
import '@primeuix/styles/textarea';
import '@primeuix/styles/togglebutton';
import '@primeuix/styles/toggleswitch';
import '@primeuix/styles/treeselect';
import '@primeuix/styles/buttongroup';
import '@primeuix/styles/speeddial';
import '@primeuix/styles/splitbutton';
import '@primeuix/styles/datatable';
import '@primeuix/styles/dataview';
import '@primeuix/styles/orderlist';
import '@primeuix/styles/organizationchart';
import '@primeuix/styles/paginator';
import '@primeuix/styles/picklist';
import '@primeuix/styles/tree';
import '@primeuix/styles/treetable';
import '@primeuix/styles/timeline';
import '@primeuix/styles/virtualscroller';
import '@primeuix/styles/accordion';
import '@primeuix/styles/card';
import '@primeuix/styles/divider';
import '@primeuix/styles/fieldset';
import '@primeuix/styles/panel';
import '@primeuix/styles/scrollpanel';
import '@primeuix/styles/splitter';
import '@primeuix/styles/stepper';
import '@primeuix/styles/tabview';
import '@primeuix/styles/tabs';
import '@primeuix/styles/toolbar';
import '@primeuix/styles/confirmpopup';
import '@primeuix/styles/drawer';
import '@primeuix/styles/popover';
import '@primeuix/styles/fileupload';
import '@primeuix/styles/breadcrumb';
import '@primeuix/styles/contextmenu';
import '@primeuix/styles/dock';
import '@primeuix/styles/menu';
import '@primeuix/styles/menubar';
import '@primeuix/styles/megamenu';
import '@primeuix/styles/panelmenu';
import '@primeuix/styles/steps';
import '@primeuix/styles/tabmenu';
import '@primeuix/styles/tieredmenu';
import '@primeuix/styles/message';
import '@primeuix/styles/inlinemessage';
import '@primeuix/styles/carousel';
import '@primeuix/styles/galleria';
import '@primeuix/styles/image';
import '@primeuix/styles/imagecompare';
import '@primeuix/styles/avatar';
import '@primeuix/styles/blockui';
import '@primeuix/styles/chip';
import '@primeuix/styles/inplace';
import '@primeuix/styles/metergroup';
import '@primeuix/styles/overlaybadge';
import '@primeuix/styles/scrolltop';
import '@primeuix/styles/skeleton';
import '@primeuix/styles/progressbar';
import '@primeuix/styles/progressspinner';
import '@primeuix/styles/tag';
import '@primeuix/styles/terminal';
import '@primevue/forms/form/style';
import '@primevue/forms/formfield/style';
import '@primeuix/styles/tooltip';
import 'node:url';
import 'ipx';

const _imports_0 = publicAssetsURL("/hero.png");
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    const goToLogin = () => {
      router.push("/login");
    };
    const features = [
      {
        icon: "pi pi-globe",
        title: "CMS Agnóstico",
        desc: "Funciona externamente e independente do site controlado. Use com Vue, React, PHP ou HTML puro."
      },
      {
        icon: "pi pi-pencil",
        title: "Para Criadores",
        desc: "Interface intuitiva para quem é da comunicação. Edite textos, troque fotos e gerencie conteúdo sem tocar em código."
      },
      {
        icon: "pi pi-code",
        title: "Para Desenvolvedores",
        desc: "Mude o comportamento e organização das páginas com componentes pré-moldados e lógica Vue/Nuxt."
      },
      {
        icon: "pi pi-palette",
        title: "Para Designers",
        desc: "Monte o design system com estrutura simples, limpa e classes utilitárias, sem amarras de temas complexos."
      },
      {
        icon: "pi pi-database",
        title: "Flat File Store",
        desc: "Adeus bancos de dados complexos. Tudo roda com SQLite e arquivos locais. Backup simples (copiar e colar)."
      },
      {
        icon: "pi pi-lock-open",
        title: "Zero Git Dependency",
        desc: "Edite em produção sem medo. O versionamento de conteúdo é interno, sem obrigar o cliente a saber Git."
      },
      {
        icon: "pi pi-clone",
        title: "Preview & Produção",
        desc: "Mantenha versões de rascunho e produção rodando paralelamente. Aprove antes de publicar."
      },
      {
        icon: "pi pi-search",
        title: "SEO Otimizado",
        desc: "Campos dedicados para Meta Tags, Open Graph e Schema. Tudo o que o Google precisa para encontrar seu site."
      },
      {
        icon: "pi pi-bolt",
        title: "Alta Performance",
        desc: "Construído sobre a engine Nitro do Nuxt 3. Respostas instantâneas via API JSON para seu frontend."
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = script$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 relative flex flex-col overflow-x-hidden" }, _attrs))} data-v-f0f172b7><div class="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" data-v-f0f172b7></div><div class="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#6f942e]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" data-v-f0f172b7></div><div class="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-700" data-v-f0f172b7></div><header class="w-full flex justify-between items-center p-6 md:px-12 z-50 fixed top-0 left-0 bg-[#0a0f0d]/80 backdrop-blur-md border-b border-white/5" data-v-f0f172b7><div class="flex items-center gap-3 select-none" data-v-f0f172b7><div class="w-10 h-10 rounded-xl bg-[#6f942e]/10 border border-[#6f942e]/20 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(111,148,46,0.3)]" data-v-f0f172b7><i class="pi pi-star-fill text-[#6f942e] text-lg" data-v-f0f172b7></i></div><div class="flex flex-col" data-v-f0f172b7><h1 class="text-xl font-black text-white leading-none tracking-tighter" data-v-f0f172b7> Sirius Studio </h1><span class="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold mt-1" data-v-f0f172b7>Headless CMS</span></div></div>`);
      _push(ssrRenderComponent(_component_Button, {
        label: "Acessar Painel",
        icon: "pi pi-arrow-right",
        iconPos: "right",
        onClick: goToLogin,
        class: "bg-white text-black border-none font-bold text-xs tracking-widest px-6 py-2.5 hover:bg-slate-200 transition-colors rounded-full"
      }, null, _parent));
      _push(`</header><main class="flex-1 flex flex-col items-center pt-32 pb-20 px-4 relative z-10 w-full max-w-7xl mx-auto" data-v-f0f172b7><section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 w-full" data-v-f0f172b7><div class="flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up" data-v-f0f172b7><div class="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-mono text-[#6f942e] uppercase tracking-widest inline-block shadow-[0_0_20px_-5px_rgba(111,148,46,0.3)]" data-v-f0f172b7> v2.0 Beta </div><h2 class="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9] drop-shadow-2xl" data-v-f0f172b7> Sirius Studio <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#6f942e] via-[#a3d95b] to-white animate-text-shimmer bg-[length:200%_auto]" data-v-f0f172b7>2.0</span></h2><span class="mt-0 text-4xl md:text-5xl lg:text-6xl" data-v-f0f172b7>O controle do seu site em suas mãos, sem complicações. </span><br data-v-f0f172b7><p class="text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed mb-8 font-light" data-v-f0f172b7> A nova geração do CMS Headless que transforma complexidade em simplicidade. Gerencie experiências digitais extraordinárias sem tocar em uma linha de código se não quiser. </p><div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto" data-v-f0f172b7>`);
      _push(ssrRenderComponent(_component_Button, {
        label: "Experimentar a Mágica",
        icon: "pi pi-sparkles",
        class: "bg-[#6f942e] border-none text-[#0a0f0d] font-black text-sm px-8 py-4 rounded-xl hover:bg-[#5a7a25] hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(111,148,46,0.6)] flex-1 sm:flex-initial justify-center",
        onClick: goToLogin
      }, null, _parent));
      _push(`</div></div><div _class="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center animate-fade-in-up delay-200" data-v-f0f172b7><div _class="w-full h-full _bg-[#6f942e]/5 border border-[#6f942e]/20 rounded-3xl relative overflow-hidden group p-4 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(111,148,46,0.2)] backdrop-blur-sm" data-v-f0f172b7><div _class="absolute inset-0 bg-gradient-to-tr from-[#6f942e]/20 via-transparent to-blue-500/10 opacity-60 group-hover:scale-110 transition-transform duration-1000" data-v-f0f172b7></div><div _class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#6f942e]/30 to-transparent opacity-40 animate-pulse-slow" data-v-f0f172b7></div><div class="relative z-10 w-full h-full flex flex-col items-center justify-center" data-v-f0f172b7><img${ssrRenderAttr("src", _imports_0)} alt="Sirius Magic CMS" class="w-full h-full rounded-2xl object-contain filter drop-shadow-[0_0_30px_rgba(111,148,46,0.5)] transform group-hover:scale-105 transition-transform duration-700 animate-float" data-v-f0f172b7><p class="absolute bottom-4 text-[#a3d95b] font-mono uppercase tracking-[0.3em] text-[10px] font-bold text-shadow-neon animate-pulse bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm" data-v-f0f172b7> CMS Magic Engine 2.0 </p></div><div class="absolute top-1/4 left-1/4 w-16 h-16 bg-[#6f942e]/20 rounded-full blur-xl animate-float delay-100" data-v-f0f172b7></div><div class="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-float delay-500" data-v-f0f172b7></div></div></div></section><section class="w-full animate-fade-in-up delay-300 mt-10 border-t border-white/5 pt-5" data-v-f0f172b7><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-v-f0f172b7><!--[-->`);
      ssrRenderList(features, (feat, index2) => {
        _push(`<div class="group p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-[#6f942e]/30 hover:from-white/[0.06] transition-all duration-300 hover:-translate-y-2 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(111,148,46,0.15)]" data-v-f0f172b7><div class="w-14 h-14 rounded-xl bg-[#6f942e]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#6f942e]/20 transition-all duration-300 ring-1 ring-[#6f942e]/20 group-hover:ring-[#6f942e]/40" data-v-f0f172b7><i class="${ssrRenderClass([feat.icon, "text-[#6f942e] text-2xl group-hover:text-[#a3d95b] transition-colors"])}" data-v-f0f172b7></i></div><h4 class="text-xl font-bold text-white mb-3 group-hover:text-[#a3d95b] transition-colors" data-v-f0f172b7>${ssrInterpolate(feat.title)}</h4><p class="text-slate-400 text-sm leading-relaxed" data-v-f0f172b7>${ssrInterpolate(feat.desc)}</p></div>`);
      });
      _push(`<!--]--></div></section></main><footer class="p-8 text-center z-10 border-t border-white/5 bg-[#0a0f0d]/50 backdrop-blur-md" data-v-f0f172b7><div class="flex flex-col items-center gap-4" data-v-f0f172b7><div class="w-8 h-8 rounded bg-[#6f942e]/20 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" data-v-f0f172b7><i class="pi pi-star-fill text-[#6f942e] text-xs" data-v-f0f172b7></i></div><p class="text-[10px] text-slate-600 font-mono uppercase tracking-widest" data-v-f0f172b7> © 2026 Sirius Studio Core Engine • Desenvolvido por Magaweb </p></div></footer></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f0f172b7"]]);

export { index as default };
//# sourceMappingURL=index-qRHPBaRB.mjs.map
