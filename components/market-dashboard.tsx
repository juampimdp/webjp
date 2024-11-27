'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Search, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { PortfolioCard } from "@/components/portfolio-card";

type PricePoint = {
  timestamp: number;
  price: number;
}

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
  priceHistory?: PricePoint[]
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

type MepCalculatorData = {
  amount: string;
  nominals: number;
  usdAmount: number;
  mepEstimado: number;
  mepBonos: number;
}

type FavoriteItem = {
  id: string;
  type: 'stock' | 'bond' | 'on' | 'mep';
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-AR').format(num);
};

const formatPercentage = (num: number) => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const formatCurrency = (value: number, currency: 'ARS' | 'USD') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatInputCurrency = (value: string): string => {
  const cleanNumber = value.replace(/\D/g, '');
  const numberValue = Number(cleanNumber);
  if (isNaN(numberValue)) return '';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberValue);
};

const cleanCurrencyFormat = (value: string): string => {
  return value.replace(/\D/g, '');
};

type SortableFields = keyof Pick<MarketData, 'symbol' | 'px_bid' | 'px_ask' | 'c' | 'pct_change'>;

export function MarketDashboard() {
  const [priceHistories, setPriceHistories] = useState<Record<string, PricePoint[]>>({})
  const [stocks, setStocks] = useState<MarketData[]>([])
  const [bonds, setBonds] = useState<MarketData[]>([])
  const [ons, setOns] = useState<MarketData[]>([])
  const [mep, setMep] = useState<MepData[]>([])
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortableFields>('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [countdown, setCountdown] = useState(20);
  const [mepCalculator, setMepCalculator] = useState<MepCalculatorData>({
    amount: '',
    nominals: 0,
    usdAmount: 0,
    mepEstimado: 0,
    mepBonos: 0
  })

  useEffect(() => {
    const savedFavorites = localStorage.getItem('marketFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const updatePriceHistory = useCallback((symbol: string, price: number) => {
    // Solo actualizar el historial si el mercado está abierto
    if (!isMarketOpen()) {
      setPriceHistories(prev => {
        // Si no hay historial previo, crear uno con el precio actual
        if (!prev[symbol]) {
          const now = Date.now();
          const points = Array.from({ length: 30 }, (_, i) => ({
            timestamp: now - (29 - i) * 60000, // Un punto por minuto
            price: price
          }));
          return { ...prev, [symbol]: points };
        }
        return prev;
      });
      return;
    }

    setPriceHistories(prev => {
      const history = prev[symbol] || [];
      const now = Date.now();
      
      // Si es el primer punto o el precio cambió, agregar al historial
      if (history.length === 0 || history[history.length - 1].price !== price) {
        const newHistory = [
          ...history,
          { timestamp: now, price }
        ].slice(-30); // Mantener solo los últimos 30 puntos
        return {
          ...prev,
          [symbol]: newHistory
        };
      }
      return prev;
    });
  }, []);

  const fetchData = useCallback(async () => {
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

      stocksData.forEach((item: MarketData) => {
        if (item.c) updatePriceHistory(item.symbol, item.c)
      })

      bondsData.forEach((item: MarketData) => {
        if (item.c) updatePriceHistory(item.symbol, item.c)
      })

      onsData.forEach((item: MarketData) => {
        if (item.c) updatePriceHistory(item.symbol, item.c)
      })

      setStocks(stocksData.map((item: MarketData) => ({ ...item, type: 'stock' })))
      setBonds(bondsData.map((item: MarketData) => ({ ...item, type: 'bond' })))
      setOns(onsData.map((item: MarketData) => ({ ...item, type: 'on' })))
      setMep(mepData.map((item: MepData) => ({ ...item, type: 'mep' })))
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [updatePriceHistory])

  useEffect(() => {
    fetchData() // Initial fetch
    
    const interval = setInterval(() => {
      const marketOpen = isMarketOpen();
      
      if (marketOpen) {
        fetchData();
        setCountdown(20); // Reset countdown only if market is open
      } else {
        setCountdown(0); // Set countdown to 0 when market is closed
      }
    }, 20000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (!isMarketOpen()) return 0;
        return prev > 0 ? prev - 1 : 20;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    }
  }, [fetchData]);

  const formatTimeString = () => {
    return lastUpdate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = useCallback((id: string, type: 'stock' | 'bond' | 'on' | 'mep') => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === id && f.type === type)
      let newFavorites: FavoriteItem[]
      
      if (exists) {
        newFavorites = prev.filter(f => !(f.id === id && f.type === type))
      } else {
        newFavorites = [...prev, { id, type }]
      }
      
      localStorage.setItem('marketFavorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const isFavorite = useCallback((id: string, type: 'stock' | 'bond' | 'on' | 'mep') => {
    return favorites.some(f => f.id === id && f.type === type)
  }, [favorites])

  const handleSortOrderChange = useCallback(() => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
  }, [])

  const filterAndSortData = useCallback((data: MarketData[]) => {
    return [...data]
      .filter(item => item.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        const comparison = aValue > bValue ? 1 : -1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [searchTerm, sortBy, sortOrder]);

  const filterAndSortMep = useCallback((data: MepData[]) => {
    return [...data]
      .filter(item => item.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const comparison = a.ticker > b.ticker ? 1 : -1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [searchTerm, sortOrder]);

  const calculateMep = useCallback(() => {
    if (!mepCalculator.amount) return;
    
    const al30 = bonds.find(item => item.symbol === 'AL30')?.px_ask || 0;
    const al30d = bonds.find(item => item.symbol === 'AL30D')?.px_ask || 0;
    
    const numericValue = parseFloat(mepCalculator.amount.replace(/[$.]/g, '').replace(',', '.')) || 0;
    const nominals = al30 > 0 ? Math.floor(numericValue / (al30/100)) : 0;
    const usdAmount = (nominals * (al30d/100));
    
    // Cálculo del MEP estimado (monto ingresado / USD a recibir)
    const mepEstimado = usdAmount > 0 ? numericValue / usdAmount : 0;
    
    // Cálculo del MEP bonos (AL30/AL30D)
    const mepBonos = al30d > 0 ? (al30/al30d) : 0;

    setMepCalculator(prev => ({
      ...prev,
      nominals,
      usdAmount,
      mepEstimado,
      mepBonos
    }));
  }, [bonds, mepCalculator.amount]);

  useEffect(() => {
    calculateMep();
  }, [bonds, calculateMep]);

  const handleAmountChange = (value: string) => {
    const cleanValue = cleanCurrencyFormat(value);
    const formattedValue = formatInputCurrency(cleanValue);
    setMepCalculator(prev => ({
      ...prev,
      amount: formattedValue
    }));
  }

  const isMarketOpen = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 100 + minutes

    // Mercado abierto de 11:00 a 17:00
    return currentTime >= 1100 && currentTime <= 1700
  }

  const MarketCard = ({ item }: { item: MarketData }) => {
    const spreadValue = (item.px_ask || 0) - (item.px_bid || 0);
    const spreadPercentage = (spreadValue / ((item.px_ask || 0) + (item.px_bid || 0)) / 2) * 100;
    const priceHistory = priceHistories[item.symbol] || [];
    const marketOpen = isMarketOpen();
    
    return (
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{item.symbol}</h2>
              <span className={`text-xs px-2 py-1 rounded ${marketOpen ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                {marketOpen ? 'En operación' : 'Cerrado'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(item.symbol, item.type as 'stock' | 'bond' | 'on')}
              className={`hover:bg-gray-800 ${isFavorite(item.symbol, item.type as 'stock' | 'bond' | 'on') ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite(item.symbol, item.type as 'stock' | 'bond' | 'on') ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Compra</span>
                <span className="text-white">{item.px_bid ? formatCurrency(item.px_bid, 'ARS') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Venta</span>
                <span className="text-white">{item.px_ask ? formatCurrency(item.px_ask, 'ARS') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Último</span>
                <span className="text-white">{item.c ? formatCurrency(item.c, 'ARS') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Variación</span>
                <span className={item.pct_change && item.pct_change > 0 ? 'text-green-500' : 'text-red-500'}>
                  {item.pct_change ? formatPercentage(item.pct_change) : '-'}
                </span>
              </div>
            </div>
            
            <div className="h-[100px] w-full relative">
              {!marketOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                  <div className="text-center">
                    <span className="text-xs text-gray-400 block">Mercado Cerrado</span>
                    <span className="text-xs text-gray-500 block mt-1">Último precio: {formatCurrency(item.c || 0, 'ARS')}</span>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <YAxis 
                    domain={['dataMin', 'dataMax']}
                    hide={true}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [formatCurrency(value, 'ARS'), 'Precio']}
                    labelFormatter={(timestamp: number) => {
                      const date = new Date(timestamp);
                      return `${date.toLocaleTimeString()} ${marketOpen ? '' : '(Cierre)'}`;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={item.pct_change && item.pct_change > 0 ? '#10b981' : '#ef4444'}
                    dot={false}
                    strokeWidth={2}
                    animationDuration={1000}
                    isAnimationActive={marketOpen}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Spread</span>
              <span className="text-white">{formatCurrency(spreadValue, 'ARS')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Spread %</span>
              <span className="text-white">{formatPercentage(spreadPercentage)}</span>
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
              <div>
                <h2 className="text-2xl font-bold text-white">{item.ticker}</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(item.ticker, 'mep')}
              className={`hover:bg-gray-800 ${isFavorite(item.ticker, 'mep') ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite(item.ticker, 'mep') ? 'fill-current' : ''}`} />
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
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortableFields)}
          >
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="symbol" className="text-white hover:bg-gray-700">Símbolo</SelectItem>
              <SelectItem value="px_bid" className="text-white hover:bg-gray-700">Precio Compra</SelectItem>
              <SelectItem value="px_ask" className="text-white hover:bg-gray-700">Precio Venta</SelectItem>
              <SelectItem value="c" className="text-white hover:bg-gray-700">Último</SelectItem>
              <SelectItem value="pct_change" className="text-white hover:bg-gray-700">Variación</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSortOrderChange}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            {isMarketOpen() ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 font-semibold">Mercado Abierto</span>
                <span className="text-gray-400 ml-2">
                  {formatTimeString()} • {countdown}s
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-red-400 font-semibold tracking-wide uppercase text-sm">
                  Mercado Cerrado
                </span>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="bg-gray-800 p-1 mb-4">
            <TabsTrigger 
              value="stocks" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-700 text-white"
            >
              Acciones
            </TabsTrigger>
            <TabsTrigger 
              value="bonds" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-700 text-white"
            >
              Bonos
            </TabsTrigger>
            <TabsTrigger 
              value="on" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-700 text-white"
            >
              ONs
            </TabsTrigger>
            <TabsTrigger 
              value="mep" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-700 text-white"
            >
              MEP
            </TabsTrigger>
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-700 text-white"
            >
              Calculadora MEP
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Cartera
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-gray-800"
            >
              Favoritos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortData(stocks).map((stock) => (
                <MarketCard key={stock.symbol} item={stock} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bonds">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortData(bonds).map((bond) => (
                <MarketCard key={bond.symbol} item={bond} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="on">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortData(ons).map((on) => (
                <MarketCard key={on.symbol} item={on} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mep">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterAndSortMep(mep).map((mepItem) => (
                <MepCard key={mepItem.ticker} item={mepItem} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calculator">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card className="overflow-hidden bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-white">AL30</h2>
                        <p className="text-sm text-gray-400">Bono en ARS</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Ingrese monto ARS:</div>
                      <Input
                        type="text"
                        value={mepCalculator.amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white text-right font-mono"
                        placeholder="$ 100.000"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">Precio AL30:</div>
                      <div className="text-sm font-semibold text-white">
                        {formatCurrency(bonds.find(item => item.symbol === 'AL30')?.px_ask || 0, 'ARS')}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">Nominales:</div>
                      <div className="text-sm font-semibold text-white">
                        {formatNumber(mepCalculator.nominals)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-white">AL30D</h2>
                        <p className="text-sm text-gray-400">Resultado en USD</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">Precio AL30D:</div>
                      <div className="text-sm font-semibold text-white">
                        {formatCurrency(bonds.find(item => item.symbol === 'AL30D')?.px_ask || 0, 'USD')}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">USD a recibir:</div>
                      <div className="text-sm font-semibold text-white">
                        {formatCurrency(mepCalculator.usdAmount, 'USD')}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">MEP estimado:</div>
                        <div className="text-sm font-semibold text-white">
                          {formatCurrency(mepCalculator.mepEstimado, 'ARS')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Monto ARS / USD a recibir)
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">MEP bonos:</div>
                        <div className="text-sm font-semibold text-white">
                          {formatCurrency(mepCalculator.mepBonos, 'ARS')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (AL30/AL30D)
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="text-xs text-gray-500">
                        Los precios se actualizan automáticamente
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioCard 
              stocks={stocks}
              bonds={bonds}
              on={ons}
              mep={mep}
            />
          </TabsContent>

          <TabsContent value="favorites">
            <h1 className="text-3xl font-bold mb-6 text-white">Favoritos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Stocks favoritos */}
              {stocks
                .filter(item => isFavorite(item.symbol, 'stock'))
                .map(item => (
                  <MarketCard key={`stock-${item.symbol}`} item={item} />
              ))}
              
              {/* Bonos favoritos */}
              {bonds
                .filter(item => isFavorite(item.symbol, 'bond'))
                .map(item => (
                  <MarketCard key={`bond-${item.symbol}`} item={item} />
              ))}
              
              {/* ONs favoritos */}
              {ons
                .filter(item => isFavorite(item.symbol, 'on'))
                .map(item => (
                  <MarketCard key={`on-${item.symbol}`} item={item} />
              ))}
              
              {/* MEP favoritos */}
              {mep
                .filter(item => isFavorite(item.ticker, 'mep'))
                .map(item => (
                  <MepCard key={`mep-${item.ticker}`} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}