export const CATEGORIAS_EMPRESA = [
  { value: 'cliente', label: 'Cliente (Receita)' },
  { value: 'projetos', label: 'Projetos' },
  { value: 'assinaturas', label: 'Assinaturas/Ferramentas' },
  { value: 'time', label: 'Time' },
  { value: 'educacao', label: 'Educação/Cursos' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
  { value: 'outros_empresa', label: 'Outros' },
]

export const CATEGORIAS_PESSOAL = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'combustivel', label: 'Combustível' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saude', label: 'Saúde' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'familia', label: 'Família' },
  { value: 'divida', label: 'Dívidas' },
  { value: 'outros', label: 'Outros' },
]

export const getCategoriasByContexto = (contexto) => {
  if (contexto === 'empresa') return CATEGORIAS_EMPRESA
  if (contexto === 'pessoal') return CATEGORIAS_PESSOAL
  return [...CATEGORIAS_EMPRESA, ...CATEGORIAS_PESSOAL]
}

export const getCategoriaLabel = (value) => {
  const all = [...CATEGORIAS_EMPRESA, ...CATEGORIAS_PESSOAL]
  return all.find(c => c.value === value)?.label ?? value
}
