// composables/useLayout.ts
export const useLayout = () => {
  const layoutPresets = {
    hero: {
      grid: { cols: 12, gap: 8, centered: true, containerPadding: 8 },
      cells: [
        { slot: 'content', span: 12, spanLg: 8, padding: 4 },
        { slot: 'image', span: 12, spanLg: 4, padding: 4 }
      ]
    },
    'two-column': {
      grid: { cols: 12, gap: 6, centered: true },
      cells: [
        { slot: 'left', span: 12, spanMd: 6, padding: 4 },
        { slot: 'right', span: 12, spanMd: 6, padding: 4 }
      ]
    },
    'three-column': {
      grid: { cols: 12, gap: 4, centered: true },
      cells: [
        { slot: 'left', span: 12, spanMd: 4, padding: 4 },
        { slot: 'center', span: 12, spanMd: 4, padding: 4 },
        { slot: 'right', span: 12, spanMd: 4, padding: 4 }
      ]
    },
    sidebar: {
      grid: { cols: 12, gap: 6 },
      cells: [
        { slot: 'sidebar', span: 12, spanMd: 3, padding: 4 },
        { slot: 'content', span: 12, spanMd: 9, padding: 6 }
      ]
    }
  }

  const getLayout = (presetName: keyof typeof layoutPresets) => {
    return layoutPresets[presetName]
  }

  return {
    layoutPresets,
    getLayout
  }
}