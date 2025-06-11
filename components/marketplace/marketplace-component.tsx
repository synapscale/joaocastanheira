/**
 * Componente de Marketplace
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de marketplace para componentes
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, Download, Heart, ShoppingCart, Eye, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'

interface Component {
  id: number
  name: string
  description: string
  category: string
  component_type: string
  tags: string[]
  price: number
  is_free: boolean
  author: {
    id: number
    name: string
    avatar?: string
  }
  version: string
  downloads_count: number
  rating_average: number
  rating_count: number
  is_featured: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

interface MarketplaceFilters {
  category: string
  component_type: string
  price_range: [number, number]
  is_free: boolean | null
  rating_min: number
  sort_by: string
  sort_order: 'asc' | 'desc'
}

export function MarketplaceComponent() {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: '',
    component_type: '',
    price_range: [0, 1000],
    is_free: null,
    rating_min: 0,
    sort_by: 'downloads_count',
    sort_order: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [cart, setCart] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const categories = [
    'AI & Machine Learning',
    'Data Processing',
    'Web Scraping',
    'API Integration',
    'File Processing',
    'Automation',
    'Analytics',
    'Communication',
    'Utilities',
    'Templates'
  ]

  const componentTypes = [
    'Node',
    'Template',
    'Workflow',
    'Function',
    'Integration',
    'Widget'
  ]

  useEffect(() => {
    fetchComponents()
    fetchUserFavorites()
  }, [filters, searchQuery])

  const fetchComponents = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        search: searchQuery,
        category: filters.category,
        component_type: filters.component_type,
        price_min: filters.price_range[0].toString(),
        price_max: filters.price_range[1].toString(),
        rating_min: filters.rating_min.toString(),
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        ...(filters.is_free !== null && { is_free: filters.is_free.toString() })
      })

      const response = await fetch(`/api/marketplace/components?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
      }
    } catch (error) {
      console.error('Erro ao buscar componentes:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar componentes do marketplace",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch('/api/marketplace/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(new Set(data.favorites.map((f: any) => f.component_id)))
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error)
    }
  }

  const toggleFavorite = async (componentId: number) => {
    try {
      const isFavorited = favorites.has(componentId)
      const method = isFavorited ? 'DELETE' : 'POST'
      
      const response = await fetch(`/api/marketplace/components/${componentId}/favorite`, {
        method
      })

      if (response.ok) {
        const newFavorites = new Set(favorites)
        if (isFavorited) {
          newFavorites.delete(componentId)
        } else {
          newFavorites.add(componentId)
        }
        setFavorites(newFavorites)
        
        toast({
          title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
          description: isFavorited ? "Componente removido da sua lista de favoritos" : "Componente adicionado à sua lista de favoritos"
        })
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      toast({
        title: "Erro",
        description: "Falha ao alterar favorito",
        variant: "destructive"
      })
    }
  }

  const addToCart = (componentId: number) => {
    const newCart = new Set(cart)
    if (cart.has(componentId)) {
      newCart.delete(componentId)
      toast({
        title: "Removido do carrinho",
        description: "Componente removido do carrinho"
      })
    } else {
      newCart.add(componentId)
      toast({
        title: "Adicionado ao carrinho",
        description: "Componente adicionado ao carrinho"
      })
    }
    setCart(newCart)
  }

  const downloadComponent = async (componentId: number) => {
    try {
      const response = await fetch(`/api/marketplace/components/${componentId}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `component-${componentId}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download iniciado",
          description: "O componente está sendo baixado"
        })

        // Atualizar contador de downloads
        fetchComponents()
      }
    } catch (error) {
      console.error('Erro ao baixar componente:', error)
      toast({
        title: "Erro",
        description: "Falha ao baixar componente",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const filteredComponents = components.filter(component => {
    if (searchQuery && !component.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !component.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categoria */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Componente */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={filters.component_type} onValueChange={(value) => setFilters({...filters, component_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {componentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preço */}
              <div>
                <label className="text-sm font-medium mb-2 block">Faixa de Preço</label>
                <div className="space-y-3">
                  <Slider
                    value={filters.price_range}
                    onValueChange={(value) => setFilters({...filters, price_range: value as [number, number]})}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(filters.price_range[0])}</span>
                    <span>{formatPrice(filters.price_range[1])}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="free-only"
                      checked={filters.is_free === true}
                      onCheckedChange={(checked) => setFilters({...filters, is_free: checked ? true : null})}
                    />
                    <label htmlFor="free-only" className="text-sm">Apenas gratuitos</label>
                  </div>
                </div>
              </div>

              {/* Avaliação Mínima */}
              <div>
                <label className="text-sm font-medium mb-2 block">Avaliação Mínima</label>
                <Select value={filters.rating_min.toString()} onValueChange={(value) => setFilters({...filters, rating_min: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Qualquer avaliação</SelectItem>
                    <SelectItem value="1">1+ estrelas</SelectItem>
                    <SelectItem value="2">2+ estrelas</SelectItem>
                    <SelectItem value="3">3+ estrelas</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <Select value={filters.sort_by} onValueChange={(value) => setFilters({...filters, sort_by: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="downloads_count">Mais baixados</SelectItem>
                    <SelectItem value="rating_average">Melhor avaliados</SelectItem>
                    <SelectItem value="created_at">Mais recentes</SelectItem>
                    <SelectItem value="price">Preço</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar componentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="featured">Em Destaque</TabsTrigger>
              <TabsTrigger value="trending">Tendências</TabsTrigger>
              <TabsTrigger value="new">Novos</TabsTrigger>
              <TabsTrigger value="free">Gratuitos</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {/* Grid de Componentes */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredComponents.map((component) => (
                    <Card key={component.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{component.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                              por {component.author.name}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {component.is_featured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Destaque
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(component.id)}
                              className={favorites.has(component.id) ? 'text-red-500' : 'text-gray-400'}
                            >
                              <Heart className={`w-4 h-4 ${favorites.has(component.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {component.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {component.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {component.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{component.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            {renderStars(component.rating_average)}
                            <span className="text-sm text-gray-600 ml-1">
                              ({component.rating_count})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Download className="w-4 h-4" />
                            {component.downloads_count.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">
                            {component.is_free ? (
                              <span className="text-green-600">Gratuito</span>
                            ) : (
                              <span>{formatPrice(component.price)}</span>
                            )}
                          </div>
                          <Badge variant="outline">{component.component_type}</Badge>
                        </div>
                      </CardContent>

                      <CardFooter className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadComponent(component.id)}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {component.is_free ? 'Baixar' : 'Visualizar'}
                        </Button>
                        
                        {!component.is_free && (
                          <Button
                            size="sm"
                            onClick={() => addToCart(component.id)}
                            variant={cart.has(component.id) ? "secondary" : "default"}
                            className="flex-1"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {cart.has(component.id) ? 'No Carrinho' : 'Comprar'}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && filteredComponents.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum componente encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar os filtros ou termos de busca
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

