import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Minus, ChevronsUpDown } from "lucide-react";

interface BaseAsset {
  priceARS?: number;
  priceUSD?: number;
  px_bid?: number;
  px_ask?: number;
  bid?: number;     
  ask?: number;     
  c?: number;
}

interface SymbolAsset extends BaseAsset {
  type: 'stock' | 'bond' | 'on';
  symbol: string;  
}

interface TickerAsset extends BaseAsset {
  type: 'mep';
  ticker: string;  
}

type Asset = SymbolAsset | TickerAsset;

interface PortfolioItem {
  symbol: string;
  quantity: number;
  priceARS: number;
  priceUSD: number;
  type: 'stock' | 'bond' | 'on' | 'mep';
  c?: number;
}

interface Totals {
  ars: number;
  usd: number;
}

interface PortfolioCardProps {
  stocks: SymbolAsset[];
  bonds: SymbolAsset[];
  on: SymbolAsset[];
  mep: TickerAsset[];
}

export function PortfolioCard({ stocks, bonds, on, mep }: PortfolioCardProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedSymbol, setSelectedSymbol] = React.useState<string>("");
  const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([]);
  const [quantity, setQuantity] = React.useState<string>("");

  const allAssets: Asset[] = [
    ...stocks,
    ...bonds,
    ...on,
    ...mep
  ];

  const getAssetIdentifier = (asset: Asset): string => {
    return asset.type === 'mep' ? asset.ticker : asset.symbol;
  };

  // Type guard para SymbolAsset
  const isSymbolAsset = (asset: Asset): asset is SymbolAsset => {
    return asset.type === 'stock' || asset.type === 'bond' || asset.type === 'on';
  };

  // Type guard para TickerAsset
  const isTickerAsset = (asset: Asset): asset is TickerAsset => {
    return asset.type === 'mep';
  };

  const shouldExcludeAsset = (identifier: string): boolean => {
    return identifier.endsWith('D') || identifier.endsWith('C');
  };

  const matchesSearch = (identifier: string): boolean => {
    return identifier.toLowerCase().includes(searchValue.toLowerCase());
  };

  const filterAsset = (asset: Asset): boolean => {
    const identifier = getAssetIdentifier(asset);
    if (isSymbolAsset(asset)) {
      return !shouldExcludeAsset(identifier) && matchesSearch(identifier);
    }
    return matchesSearch(identifier);
  };

  const findUSDPrice = (identifier: string): number => {
    if (!identifier || identifier.endsWith('D')) return 0;
    const usdSymbol = identifier + 'D';
    
    const bondWithUSD = bonds.find(b => b.symbol === usdSymbol);
    const onWithUSD = on.find(o => o.symbol === usdSymbol);
    
    return bondWithUSD?.c || onWithUSD?.c || 0;
  };

  const calculateItemTotal = (item: PortfolioItem): Totals => {
    if (item.type === 'bond' || item.type === 'on') {
      return {
        ars: item.quantity * (item.priceARS / 100),
        usd: item.quantity * (item.priceUSD / 100)
      };
    }
    return {
      ars: item.quantity * item.priceARS,
      usd: item.quantity * item.priceUSD
    };
  };

  const calculateTotals = (): Totals => {
    return portfolio.reduce((acc, item) => {
      const totals = calculateItemTotal(item);
      return {
        ars: acc.ars + totals.ars,
        usd: acc.usd + totals.usd
      };
    }, { ars: 0, usd: 0 });
  };

  const addToPortfolio = () => {
    if (!selectedSymbol || !quantity) return;
    
    const asset = allAssets.find(a => getAssetIdentifier(a) === selectedSymbol);
    if (!asset) return;

    const priceUSD = findUSDPrice(selectedSymbol);
    const priceARS = asset.c || 
                    asset.px_ask || 
                    asset.px_bid || 
                    asset.ask || 
                    asset.bid || 
                    0;

    const newItem: PortfolioItem = {
      symbol: selectedSymbol,
      quantity: Number(quantity),
      priceARS: asset.type === 'bond' || asset.type === 'on' ? priceARS / 100 : priceARS,
      priceUSD: asset.type === 'bond' || asset.type === 'on' ? priceUSD / 100 : priceUSD,
      type: asset.type,
      c: asset.c
    };

    setPortfolio([...portfolio, newItem]);
    setSelectedSymbol("");
    setQuantity("");
  };

  const removeFromPortfolio = (symbol: string): void => {
    setPortfolio(portfolio.filter(item => item.symbol !== symbol));
  };

  const { ars: totalARS, usd: totalUSD } = calculateTotals();

  return (
    <Card className="bg-gray-900 text-white max-w-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[250px] justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  {selectedSymbol
                    ? allAssets.find((asset) => getAssetIdentifier(asset) === selectedSymbol)
                        ?.symbol || selectedSymbol
                    : "Buscar activo..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0 bg-gray-900 border-gray-700">
                <Command 
                  className="bg-gray-900 rounded-lg"
                  shouldFilter={false}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      const firstMatch = allAssets.find(filterAsset);
                      if (firstMatch) {
                        setSelectedSymbol(getAssetIdentifier(firstMatch));
                        setOpen(false);
                      }
                    }
                  }}
                >
                  <CommandInput 
                    placeholder="Buscar ticker..." 
                    className="h-9 bg-gray-900 text-white border-b border-gray-700 placeholder:text-gray-400"
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandEmpty className="text-white p-2">No se encontró el activo.</CommandEmpty>
                  <CommandList className="text-white max-h-[300px]">
                    {/* Acciones */}
                    {stocks.length > 0 && (
                      <CommandGroup heading="Acciones" className="text-gray-300 font-medium">
                        {stocks.filter(filterAsset).map((asset) => (
                          <button
                            key={getAssetIdentifier(asset)}
                            onClick={() => {
                              setSelectedSymbol(getAssetIdentifier(asset));
                              setOpen(false);
                            }}
                            className="w-full text-left text-white hover:bg-blue-600/50 cursor-pointer rounded px-2 py-1.5 text-sm font-medium data-[state=selected]:bg-blue-600"
                          >
                            {getAssetIdentifier(asset)}
                          </button>
                        ))}
                      </CommandGroup>
                    )}
                    
                    {/* Bonos */}
                    {bonds.length > 0 && (
                      <CommandGroup heading="Bonos" className="text-gray-300 font-medium">
                        {bonds.filter(filterAsset).map((asset) => (
                          <button
                            key={getAssetIdentifier(asset)}
                            onClick={() => {
                              setSelectedSymbol(getAssetIdentifier(asset));
                              setOpen(false);
                            }}
                            className="w-full text-left text-white hover:bg-blue-600/50 cursor-pointer rounded px-2 py-1.5 text-sm font-medium data-[state=selected]:bg-blue-600"
                          >
                            {getAssetIdentifier(asset)}
                          </button>
                        ))}
                      </CommandGroup>
                    )}
                    
                    {/* ONs */}
                    {on.length > 0 && (
                      <CommandGroup heading="ONs" className="text-gray-300 font-medium">
                        {on.filter(filterAsset).map((asset) => (
                          <button
                            key={getAssetIdentifier(asset)}
                            onClick={() => {
                              setSelectedSymbol(getAssetIdentifier(asset));
                              setOpen(false);
                            }}
                            className="w-full text-left text-white hover:bg-blue-600/50 cursor-pointer rounded px-2 py-1.5 text-sm font-medium data-[state=selected]:bg-blue-600"
                          >
                            {getAssetIdentifier(asset)}
                          </button>
                        ))}
                      </CommandGroup>
                    )}
                    
                    {/* MEP */}
                    {mep.length > 0 && (
                      <CommandGroup heading="MEP" className="text-gray-300 font-medium">
                        {mep.filter(filterAsset).map((asset) => (
                          <button
                            key={getAssetIdentifier(asset)}
                            onClick={() => {
                              setSelectedSymbol(getAssetIdentifier(asset));
                              setOpen(false);
                            }}
                            className="w-full text-left text-white hover:bg-blue-600/50 cursor-pointer rounded px-2 py-1.5 text-sm font-medium data-[state=selected]:bg-blue-600"
                          >
                            {getAssetIdentifier(asset)}
                          </button>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              type="number"
              placeholder="Cantidad"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-[120px] bg-gray-800 border-gray-700 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && selectedSymbol && quantity) {
                  addToPortfolio();
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={addToPortfolio}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              disabled={!selectedSymbol || !quantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {portfolio.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-12 gap-2 mb-2 text-sm text-gray-400">
                <div className="col-span-2">Activo</div>
                <div className="col-span-1">Cantidad</div>
                <div className="text-right col-span-2">Precio ARS</div>
                <div className="text-right col-span-2">Precio USD</div>
                <div className="text-right col-span-2">Total ARS</div>
                <div className="text-right col-span-2">Total USD</div>
                <div className="col-span-1"></div>
              </div>
              <div className="space-y-2">
                {portfolio.map((item) => {
                  const totals = calculateItemTotal(item);
                  return (
                    <div key={item.symbol} className="grid grid-cols-12 gap-2 items-center py-2 border-t border-gray-700">
                      <div className="col-span-2">{item.symbol}</div>
                      <div className="col-span-1">{item.quantity.toLocaleString('es-AR')}</div>
                      <div className="text-right col-span-2">
                        ${item.priceARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-right col-span-2">
                        U${item.priceUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-right col-span-2 text-green-400">
                        ${totals.ars.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-right col-span-2 text-green-400">
                        U${totals.usd.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex justify-end col-span-1">
                        <button
                          onClick={() => removeFromPortfolio(item.symbol)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {portfolio.length > 0 && (
            <div className="border-t border-gray-700 mt-4 pt-6">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-sm mb-1">Total ARS</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${totalARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-sm mb-1">Total USD</span>
                  <span className="text-2xl font-bold text-green-400">
                    U${totalUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
