// app/composables/useContentManager.ts

export const useContentManager = (folder: string, isPreview: boolean) => {
  
  const getSectionData = () => {
    return useAsyncData(`${folder}-meta-${isPreview}`, async () => {
      if (isPreview) {
        const res = await $fetch('/api/preview', {
          query: { fileName: `${folder}/_index.md` }
        }).catch(() => null)

        if (res?.content) {
          const parsed = await parseMarkdown(res.content)
          // NORMALIZAÇÃO: Se o parser retornou uma chave .data, extraia ela
          // Se não, use o objeto parsed diretamente
          const normalized = parsed.data ? { ...parsed.data, body: parsed.body } : parsed
          return normalized
        }
        return null
      }
      return queryCollection('content').path(`/${folder}/_index`).first()
    })
  }

  const getContentList = () => {
    return useAsyncData(`${folder}-list-${isPreview}`, async () => {
      if (isPreview) {
        const res: any = await $fetch('/api/list-content', {
          query: { folder: folder }
        }).catch(() => [])

        // Normaliza cada item da lista para garantir o campo meta.image
        return res.map((item: any) => {
          const data = item.data ? item.data : item
          return {
            ...data,
            body: item.body, // Mantém o body fora se o parseMarkdown o separou
            meta: data.meta || { image: data.image || '' }
          }
        })
      }

      return queryCollection('content')
        .where('path', 'LIKE', `/${folder}/%`)
        .where('path', '<>', `/${folder}/_index`)
        .all()
    })
  }

  const getSortedList = (items: Ref<any[] | null>, sectionData: Ref<any | null>) => {
    return computed(() => {
      if (!items.value) return []
      if (!sectionData.value) return items.value

      let order: string[] = []
      // Tenta pegar de sectionData.layout_order ou sectionData.meta.layout_order
      const rawOrder = sectionData.value?.layout_order || sectionData.value?.meta?.layout_order

      if (Array.isArray(rawOrder)) {
        order = rawOrder
      } else if (typeof rawOrder === 'string') {
        order = rawOrder.split(',').map(i => i.trim())
      }

      if (!order || order.length === 0) return items.value

      return [...items.value].sort((a, b) => {
        const slugA = a.stem ? a.stem.split('/').pop() : a.path?.split('/').pop()
        const slugB = b.stem ? b.stem.split('/').pop() : b.path?.split('/').pop()
        const indexA = order.indexOf(slugA || '')
        const indexB = order.indexOf(slugB || '')
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
      })
    })
  }

  return { getSectionData, getContentList, getSortedList }
}