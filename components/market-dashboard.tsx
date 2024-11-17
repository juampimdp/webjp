'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Search, Heart, RefreshCw } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type MarketData = {
  symbol: string
  px_bid?: number
  px_ask?: number
  c?: number
  pct_change?: number
  q_bid?: number
  q_ask?: number
  q_op?: number
  v?: number
  type: 'stock' | 'bond' | 'on' | 'mep'
}

type MepData = {
  ticker: string
  bid: number
  ask: number
  close: number
  tmark: number
  v_ars: number
  v_usd: number
  q_ars: number
  q_usd: number
  ars_bid: number
  ars_ask: number
  usd_bid: number
  usd_ask: number
  panel: string
  type: 'mep'
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-AR').format(num);
};

const formatPercentage = (num: number) => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

type SortableFields = keyof Pick<MarketData, 'symbol' | 'px_bid' | 'px_ask' | 'c' | 'pct_change'>;

export function MarketDashboard() {
  const [stocks, setStocks] = useState<MarketData[]>([])
  const [bonds, setBonds] = useState<MarketData[]>([])
  const [ons, setOns] = useState<MarketData[]>([])
  const [mep, setMep] = useState<MepData[]>([])
  const [favorites, setFavorites] = useState<(MarketData | MepData)[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortableFields>('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(true)

  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [stocksRes, bondsRes, onsRes, mepRes] = await Promise.all([
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_stocks').then(res => {
          if (!res.ok) throw new Error('Failed to fetch stocks')
          return res
        }),
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_bonds').then(res => {
          if (!res.ok) throw new Error('Failed to fetch bonds')
          return res
        }),
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/arg_corp').then(res => {
          if (!res.ok) throw new Error('Failed to fetch ons')
          return res
        }),
        fetch('https://data-912-proxy.ferminrp.workers.dev/live/mep').then(res => {
          if (!res.ok) throw new Error('Failed to fetch mep')
          return res
        })
      ])

      const [stocksData, bondsData, onsData, mepData] = await Promise.all([
        stocksRes.json(),
        bondsRes.json(),
        onsRes.json(),
        mepRes.json()
      ])

      setStocks(stocksData.map((item: MarketData) => ({ ...item, type: 'stock' })))
      setBonds(bondsData.map((item: MarketData) => ({ ...item, type: 'bond' })))
      setOns(onsData.map((item: MarketData) => ({ ...item, type: 'on' })))
      setMep(mepData.map((item: MepData) => ({ ...item, type: 'mep' })))
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleManualRefresh = useCallback(() => {
    if (!canRefresh || isRefreshing) return

    fetchData()
    setCanRefresh(false)
    setTimeout(() => setCanRefresh(true), 6000) // Rate limit: allow refresh every 6 seconds
  }, [canRefresh, isRefreshing, fetchData])

  useEffect(() => {
    fetchData() // Initial fetch

    // Set up auto-refresh every 20 seconds
    const intervalId = setInterval(fetchData, 20000)

    return () => clearInterval(intervalId)
  }, [fetchData])

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    return `${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} (${seconds}s)`
  }

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
  }, [])

  const filterAndSortData = useCallback((data: MarketData[], key = 'symbol') => {
    const filtered = data.filter(item =>
      item[key as keyof MarketData]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof MarketData] ?? '';
      const bValue = b[sortBy as keyof MarketData] ?? '';
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchTerm, sortBy, sortOrder])

  const filterAndSortMepData = useCallback((data: MepData[]) => {
    const filtered = data.filter(item =>
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) &&
      item.panel === 'bonds'
    )

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof MepData]
      const bValue = b[sortBy as keyof MepData]
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [searchTerm, sortBy, sortOrder])

  const toggleFavorite = useCallback((item: MarketData | MepData) => {
    setFavorites(prevFavorites => {
      const identifier = 'ticker' in item ? item.ticker : item.symbol
      const isFavorite = prevFavorites.some(fav => 
        'ticker' in fav ? fav.ticker === identifier : fav.symbol === identifier
      )
      
      if (isFavorite) {
        return prevFavorites.filter(fav => 
          'ticker' in fav ? fav.ticker !== identifier : fav.symbol !== identifier
        )
      } else {
        return [...prevFavorites, item]
      }
    })
  }, [])

  const isFavorite = useCallback((item: MarketData | MepData) => {
    const identifier = 'ticker' in item ? item.ticker : item.symbol
    return favorites.some(fav => 
      'ticker' in fav ? fav.ticker === identifier : fav.symbol === identifier
    )
  }, [favorites])

  const MarketCard = ({ item }: { item: MarketData }) => {
    const spreadValue = (item.px_ask || 0) - (item.px_bid || 0);
    const spreadPercentage = (spreadValue / ((item.px_ask || 0) + (item.px_bid || 0)) / 2) * 100;
    
    return (
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`https://icons.com.ar/icons/acciones/${item.symbol?.toUpperCase()}.svg`}
                  alt={item.symbol}
                />
                <AvatarFallback className="bg-primary/10 text-white">
                  {item.symbol?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white">{item.symbol}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(item)}
              className={`hover:bg-gray-800 ${isFavorite(item) ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite(item) ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">Compra:</div>
              <div className="text-sm font-semibold text-white">${formatNumber(item.px_bid || 0)}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">Venta:</div>
              <div className="text-sm font-semibold text-white">${formatNumber(item.px_ask || 0)}</div>
            </div>
            {item.q_bid && item.q_ask && (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">Cantidad Compra:</div>
                  <div className="text-sm font-semibold text-white">{formatNumber(item.q_bid)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">Cantidad Venta:</div>
                  <div className="text-sm font-semibold text-white">{formatNumber(item.q_ask)}</div>
                </div>
              </>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>Spread:</div>
              <div>
                ${formatNumber(spreadValue)} ({formatPercentage(spreadPercentage)})
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">Último:</div>
                <div className="text-sm font-semibold text-white">${formatNumber(item.c || 0)}</div>
              </div>
              {item.v && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">Volumen:</div>
                  <div className="text-sm font-semibold text-white">{formatNumber(item.v)}</div>
                </div>
              )}
              {item.q_op && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">Operaciones:</div>
                  <div className="text-sm font-semibold text-white">{formatNumber(item.q_op)}</div>
                </div>
              )}
              {item.pct_change !== undefined && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">Variación:</div>
                  <div className={`text-sm font-semibold ${item.pct_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(item.pct_change)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const MepCard = ({ item }: { item: MepData }) => {
    return (
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-white">
                  {item.ticker.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-white">{item.ticker}</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(item)}
              className={`hover:bg-gray-800 ${isFavorite(item) ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite(item) ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">ARS</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Compra:</span>
                    <span className="text-sm text-white">${formatNumber(item.ars_bid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Venta:</span>
                    <span className="text-sm text-white">${formatNumber(item.ars_ask)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">USD</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Compra:</span>
                    <span className="text-sm text-white">${formatNumber(item.usd_bid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Venta:</span>
                    <span className="text-sm text-white">${formatNumber(item.usd_ask)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">MEP Implícito:</div>
                <div className="text-sm font-semibold text-white">${formatNumber(item.bid)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">MEP Explícito:</div>
                <div className="text-sm font-semibold text-white">${formatNumber(item.ask)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="stocks" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-gray-900 p-1 border border-gray-700">
              <TabsTrigger 
                value="stocks" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-800"
              >
                Merval
              </TabsTrigger>
              <TabsTrigger 
                value="bonds" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-800"
              >
                Bonos Soberanos
              </TabsTrigger>
              <TabsTrigger 
                value="ons" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-800"
              >
                ONs
              </TabsTrigger>
              <TabsTrigger 
                value="mep" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-800"
              >
                MEP
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-800"
              >
                Favoritos
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por sbolo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 text-white border-gray-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value: "symbol" | "px_bid" | "px_ask" | "c" | "pct_change") => setSortBy(value)}>
                  <SelectTrigger className="w-[180px] bg-gray-900 text-white border-gray-700 hover:bg-gray-800">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="symbol" className="focus:bg-gray-800 focus:text-white">Símbolo</SelectItem>
                    <SelectItem value="px_bid" className="focus:bg-gray-800 focus:text-white">Precio de compra</SelectItem>
                    <SelectItem value="px_ask" className="focus:bg-gray-800 focus:text-white">Precio de venta</SelectItem>
                    <SelectItem value="c" className="focus:bg-gray-800 focus:text-white">Último</SelectItem>
                    <SelectItem value="pct_change" className="focus:bg-gray-800 focus:text-white">Cambio %</SelectItem>
                  </SelectContent>
                </Select>
                <button onClick={toggleSortOrder} className="p-2 border rounded border-gray-700 hover:bg-gray-700">
                  <ArrowUpDown className={`transform ${sortOrder === 'desc' ? 'rotate-180' : ''} text-white`} />
                </button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleManualRefresh}
                  disabled={!canRefresh || isRefreshing}
                  className={`relative ${isRefreshing ? 'animate-pulse' : ''}`}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400 mt-2">
            Última actualización: {formatTimeAgo(lastUpdate)}
          </div>

          <TabsContent value="stocks">
            <h1 className="text-3xl font-bold mb-6 text-white">Cotizaciones del Merval</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortData(stocks).map((stock) => (
                <MarketCard key={stock.symbol} item={stock} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bonds">
            <h1 className="text-3xl font-bold mb-6 text-white">Bonos Soberanos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortData(bonds).map((bond) => (
                <MarketCard key={bond.symbol} item={bond} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ons">
            <h1 className="text-3xl font-bold mb-6 text-white">Obligaciones Negociables</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortData(ons).map((on) => (
                <MarketCard key={on.symbol} item={on} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mep">
            <h1 className="text-3xl font-bold mb-6 text-white">Dólar MEP</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortMepData(mep).map((mepItem) => (
                <MepCard key={mepItem.ticker} item={mepItem} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <h1 className="text-3xl font-bold mb-6 text-white">Favoritos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((item) => (
                'ticker' in item ? (
                  <MepCard key={item.ticker} item={item} />
                ) : (
                  <MarketCard key={item.symbol} item={item} />
                )
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}