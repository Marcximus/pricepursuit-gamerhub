import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { generateMockPriceHistory } from '@/data/mockPriceHistory';
import type { Product } from '@/types/product';

interface PriceHistoryChartProps {
  product: Product;
}

export function PriceHistoryChart({ product }: PriceHistoryChartProps) {
  // Use mock price history data
  const priceHistory = useMemo(
    () => generateMockPriceHistory(product.id, product.current_price),
    [product.id, product.current_price]
  );

  // Calculate stats
  const prices = priceHistory.map(h => h.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const currentPrice = product.current_price;
  const priceTrend = prices.length > 1 ? currentPrice - prices[0] : 0;

  // Format data for chart
  const chartData = priceHistory.map(h => ({
    date: format(new Date(h.timestamp), 'MMM dd'),
    price: h.price,
    fullDate: format(new Date(h.timestamp), 'PPP'),
  }));

  return (
    <section className="mb-8 lg:mb-10">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 lg:mb-6">Price History</h2>
      
      <div className="bg-card border border-border rounded-lg p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-2xl font-bold text-foreground">${Math.round(currentPrice)}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Lowest Price</p>
            <p className="text-2xl font-bold text-green-600">${Math.round(lowestPrice)}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Highest Price</p>
            <p className="text-2xl font-bold text-destructive">${Math.round(highestPrice)}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Average Price</p>
            <p className="text-2xl font-bold text-foreground">${Math.round(averagePrice)}</p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {priceTrend < 0 ? (
            <>
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">
                Price decreased by ${Math.abs(Math.round(priceTrend))} from tracking start
              </span>
            </>
          ) : priceTrend > 0 ? (
            <>
              <TrendingUp className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-medium">
                Price increased by ${Math.round(priceTrend)} from tracking start
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Price has remained stable</span>
          )}
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                domain={['dataMin - 50', 'dataMax + 50']}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${Math.round(value)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Best time to buy suggestion */}
        {currentPrice <= lowestPrice * 1.05 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-600 font-medium">
              🎉 Great time to buy! Current price is near the lowest we've tracked.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
