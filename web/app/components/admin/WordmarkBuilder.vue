<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    header="✨ Wordmark Builder"
    :style="{ width: '50vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
    class="p-fluid"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
      
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Company Name</label>
        <InputText v-model="companyName" placeholder="Magaweb" />
      </div>
      
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Slogan (Optional)</label>
        <InputText v-model="slogan" placeholder="System" />
      </div>
      
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Primary Color</label>
        <div class="flex gap-2 items-center">
          <input type="color" v-model="primaryColor" class="w-10 h-10 rounded cursor-pointer border-0 p-0 shrink-0 shadow-sm" />
          <InputText v-model="primaryColor" placeholder="#0f172a" class="uppercase font-mono text-sm" />
        </div>
      </div>
      
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Accent Color</label>
        <div class="flex gap-2 items-center">
          <input type="color" v-model="accentColor" class="w-10 h-10 rounded cursor-pointer border-0 p-0 shrink-0 shadow-sm" />
          <InputText v-model="accentColor" placeholder="#c19a6b" class="uppercase font-mono text-sm" />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Name Size (px)</label>
        <div class="flex items-center gap-2">
          <input type="number" v-model="nameSize" class="p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full" min="10" max="100" />
          <span class="text-xs text-slate-500 font-mono">px</span>
        </div>
      </div>
      
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Slogan Size (px)</label>
        <div class="flex items-center gap-2">
          <input type="number" v-model="sloganSize" class="p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full" min="8" max="50" />
          <span class="text-xs text-slate-500 font-mono">px</span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Name Font</label>
        <select 
          v-model="nameFont" 
          class="p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <optgroup label="✨ Google Fonts">
            <option value="'Montserrat', sans-serif">Montserrat (Modern Tech)</option>
            <option value="'Outfit', sans-serif">Outfit (Clean Geometric)</option>
            <option value="'Playfair Display', serif">Playfair Display (Luxury Serif)</option>
            <option value="'Cinzel', serif">Cinzel (Cinematic Classic)</option>
            <option value="'Oswald', sans-serif">Oswald (Bold Condensed)</option>
            <option value="'Pacifico', cursive">Pacifico (Brush Script)</option>
          </optgroup>
          <optgroup label="System Fonts (No Download)">
            <option value="ui-sans-serif, system-ui, sans-serif">System Default (Clean)</option>
            <option value="Arial, Helvetica, sans-serif">Arial / Helvetica</option>
            <option value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">Trebuchet MS</option>
            <option value="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif">System Serif (Elegant)</option>
            <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace">System Mono (Code)</option>
          </optgroup>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm text-slate-700">Slogan Font</label>
        <select 
          v-model="sloganFont" 
          class="p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <optgroup label="✨ Google Fonts">
            <option value="'Montserrat', sans-serif">Montserrat (Modern Tech)</option>
            <option value="'Outfit', sans-serif">Outfit (Clean Geometric)</option>
            <option value="'Playfair Display', serif">Playfair Display (Luxury Serif)</option>
            <option value="'Cinzel', serif">Cinzel (Cinematic Classic)</option>
            <option value="'Oswald', sans-serif">Oswald (Bold Condensed)</option>
            <option value="'Pacifico', cursive">Pacifico (Brush Script)</option>
          </optgroup>
          <optgroup label="System Fonts (No Download)">
            <option value="ui-sans-serif, system-ui, sans-serif">System Default (Clean)</option>
            <option value="Arial, Helvetica, sans-serif">Arial / Helvetica</option>
            <option value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">Trebuchet MS</option>
            <option value="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif">System Serif (Elegant)</option>
            <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace">System Mono (Code)</option>
          </optgroup>
        </select>
      </div>

    </div>

    <div class="flex flex-col gap-4">
      <div
        v-for="(preset, index) in generatedLogos"
        :key="index"
        class="flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-[#c19a6b] transition-colors shadow-sm"
      >
        <div class="overflow-hidden flex items-center justify-center min-h-[60px]" v-html="preset.html"></div>

        <Button
          label="Use this Logo"
          icon="pi pi-check"
          class="shrink-0 mt-4 md:mt-0 md:ml-4"
          size="small"
          severity="secondary"
          @click="selectLogo(preset.html)"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialName: { type: String, default: 'Sirius' },
  initialSlogan: { type: String, default: 'Studio' }
});

const emit = defineEmits(['update:visible', 'select']);

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const companyName = ref(props.initialName);
const slogan = ref(props.initialSlogan);
const primaryColor = ref('#0f172a'); 
const accentColor = ref('#c19a6b');  

const nameSize = ref(32);
const sloganSize = ref(12);

const nameFont = ref("'Montserrat', sans-serif"); 
const sloganFont = ref("ui-sans-serif, system-ui, sans-serif");

watch(() => props.visible, (newVal) => {
  if (newVal) {
    companyName.value = props.initialName || 'Sirius';
    slogan.value = props.initialSlogan || 'Studio';
  }
});

// ✨ SMART GOOGLE FONT INJECTOR
const getFontImport = (f1, f2) => {
  const gFonts = ['Montserrat', 'Outfit', 'Playfair Display', 'Cinzel', 'Oswald', 'Pacifico'];
  const fontsToLoad = new Set();

  [f1, f2].forEach(fontStr => {
    const fontName = fontStr.split(',')[0].replace(/['"]/g, '');
    if (gFonts.includes(fontName)) {
      fontsToLoad.add(fontName.replace(/ /g, '+'));
    }
  });

  if (fontsToLoad.size === 0) return '';
  
  const families = Array.from(fontsToLoad).map(f => `family=${f}:wght@300;400;700;900`).join('&');
  return `<style>@import url('https://fonts.googleapis.com/css2?${families}&display=swap');</style>`;
};

// The Preset Engine
const generatedLogos = computed(() => {
  const name = companyName.value || 'Logo';
  const sub = slogan.value || '';
  const c1 = primaryColor.value.startsWith('#') ? primaryColor.value : `#${primaryColor.value}`;
  const c2 = accentColor.value.startsWith('#') ? accentColor.value : `#${accentColor.value}`;
  
  const s1 = nameSize.value || 32;
  const s2 = sloganSize.value || 12;

  const f1 = nameFont.value;
  const f2 = sloganFont.value;

  const fontStyles = getFontImport(f1, f2);

  // ✨ Removed "uppercase" from the slogan spans below!
  return [
    {
      name: 'The Minimalist',
      html: `${fontStyles}<div class="flex items-baseline gap-2 tracking-tight leading-none"><span class="font-black" style="color: ${c1}; font-size: ${s1}px; font-family: ${f1};">${name}</span><span class="font-light" style="color: ${c2}; font-size: ${s2}px; font-family: ${f2};">${sub}</span></div>`
    },
    {
      name: 'The Tech Stack',
      html: `${fontStyles}<div class="flex items-baseline gap-2 leading-none"><span class="font-bold" style="color: ${c2}; font-family: monospace; font-size: ${s1}px;">&lt;/&gt;</span><span class="font-bold tracking-tighter" style="color: ${c1}; font-size: ${s1}px; font-family: ${f1};">${name}</span><span class="font-semibold tracking-widest" style="color: #94a3b8; font-size: ${s2}px; font-family: ${f2};">${sub}</span></div>`
    },
    {
      name: 'The Gradient Flow',
      html: `${fontStyles}<div class="flex flex-col justify-center items-start leading-none"><span class="font-extrabold text-transparent" style="background-image: linear-gradient(to right, ${c1}, ${c2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: ${s1}px; font-family: ${f1};">${name}</span><span class="font-semibold tracking-widest mt-1" style="color: ${c2}; font-size: ${s2}px; font-family: ${f2};">${sub}</span></div>`
    },
    {
      name: 'The Luxury Classic',
      html: `${fontStyles}<div class="flex items-baseline gap-2 italic leading-none"><span style="color: ${c1}; font-size: ${s1}px; font-family: ${f1};">${name}</span><span style="color: ${c2}; font-size: ${s2}px; font-family: ${f2};">${sub}</span></div>`
    },
    {
      name: 'The Abstract Dot',
      html: `${fontStyles}<div class="flex items-baseline font-bold tracking-tighter leading-none"><span style="color: ${c1}; font-size: ${s1}px; font-family: ${f1};">${name}</span><span class="leading-[0]" style="color: ${c2}; font-size: ${s1 * 1.5}px; font-family: ${f1};">.</span><span class="ml-2 font-normal tracking-normal" style="color: #64748b; font-size: ${s2}px; font-family: ${f2};">${sub}</span></div>`
    }
  ];
});

const selectLogo = (htmlCode) => {
  emit('select', htmlCode);
  isVisible.value = false;
};
</script>