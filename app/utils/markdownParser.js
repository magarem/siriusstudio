const parseMarkdown = (content) => {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/)
  const data = {}
  
  if (match) {
    let currentKey = ""
    
    match[1].split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#')) return // Ignora vazios e comentários

      // 1. Detecta se é um item de lista (- "item")
      if (trimmedLine.startsWith('-')) {
        const value = trimmedLine.replace(/^-/, '').trim().replace(/^["'](.+)["']$/, '$1')
        if (currentKey && data[currentKey]) {
          if (!Array.isArray(data[currentKey])) data[currentKey] = []
          data[currentKey].push(value)
        }
      } 
      // 2. Detecta se é uma chave (chave: valor)
      else if (trimmedLine.includes(':')) {
        const [key, ...valParts] = trimmedLine.split(':')
        currentKey = key.trim()
        const val = valParts.join(':').trim().replace(/^["'](.+)["']$/, '$1')
        
        // Se tiver valor na mesma linha, salva. Se não (como no caso do layout_order:), prepara o array
        data[currentKey] = val || []
      }
    })
  }

  return { 
    ...data, 
    meta: { image: data.image || '' }, 
    body: content.replace(/^---[\s\S]+?---/, '').trim() 
  }
}