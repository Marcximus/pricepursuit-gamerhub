
import { toast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, BrainCircuit, Filter, BarChart, FileText } from "lucide-react";
import { useLaptops } from "@/hooks/useLaptops";
import { cleanupLaptopDatabase } from "@/utils/laptop/cleanupLaptops";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logDataStatistics } from "@/services/laptopAnalytics";

interface LaptopStats {
  total: number;
  missingPrice: number;
  missingProcessor: number;
  missingRam: number;
  missingStorage: number;
  missingGraphics: number;
  missingScreenSize: number;
  lastUpdatedOlderThan24h: number;
  lastCheckedOlderThan24h: number;
  neverChecked: number;
  // Additional stats for graphics analysis
  emptyGraphics: number;
  nullGraphics: number;
  shortGraphics: number; // Graphics values that are too short to be useful
}

interface GraphicsDistribution {
  label: string;
  count: number;
  percentage: number;
}

const Admin = () => {
  const { collectLaptops, updateLaptops, processLaptopsAI } = useLaptops();
  const [stats, setStats] = useState<LaptopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [graphicsDistribution, setGraphicsDistribution] = useState<GraphicsDistribution[]>([]);

  useEffect(() => {
    fetchLaptopStats();
  }, []);

  const fetchLaptopStats = async () => {
    try {
      setLoading(true);
      
      // Get total count
      const { count: total, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true);
        
      if (countError) throw countError;
      
      // Get missing price count
      const { count: missingPrice, error: priceError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .is('current_price', null);
        
      if (priceError) throw priceError;
      
      // Get missing processor count
      const { count: missingProcessor, error: processorError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .or('processor.is.null,processor.eq.');
        
      if (processorError) throw processorError;
      
      // Get missing RAM count
      const { count: missingRam, error: ramError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .or('ram.is.null,ram.eq.');
        
      if (ramError) throw ramError;
      
      // Get missing storage count
      const { count: missingStorage, error: storageError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .or('storage.is.null,storage.eq.');
        
      if (storageError) throw storageError;
      
      // For graphics, let's get more detailed information
      // 1. Count NULL graphics
      const { count: nullGraphics, error: nullGraphicsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .is('graphics', null);
      
      if (nullGraphicsError) throw nullGraphicsError;
      
      // 2. Count empty string graphics
      const { count: emptyGraphics, error: emptyGraphicsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .eq('graphics', '');
      
      if (emptyGraphicsError) throw emptyGraphicsError;
      
      // 3. Count very short graphics values (likely not meaningful)
      const { count: shortGraphics, error: shortGraphicsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .not('graphics', 'is', null)
        .not('graphics', 'eq', '')
        .lt('length(graphics)', 5);
      
      if (shortGraphicsError) throw shortGraphicsError;

      // Total missing graphics is the sum of null, empty, and too short
      const missingGraphics = nullGraphics + emptyGraphics + shortGraphics;
      
      // Get missing screen size count
      const { count: missingScreenSize, error: screenError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .or('screen_size.is.null,screen_size.eq.');
        
      if (screenError) throw screenError;
      
      // Get counts for laptops not updated in last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      
      const { count: lastUpdatedOlderThan24h, error: updatedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .or(`last_updated.lt.${oneDayAgo.toISOString()},last_updated.is.null`);
        
      if (updatedError) throw updatedError;
      
      const { count: lastCheckedOlderThan24h, error: checkedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .or(`last_checked.lt.${oneDayAgo.toISOString()},last_checked.is.null`);
        
      if (checkedError) throw checkedError;
      
      // Get count of laptops never checked
      const { count: neverChecked, error: neverCheckedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_laptop', true)
        .is('last_checked', null);
        
      if (neverCheckedError) throw neverCheckedError;
      
      // Get distribution of graphics card types for analysis
      const { data: graphicsData, error: graphicsDistError } = await supabase
        .from('products')
        .select('graphics')
        .eq('is_laptop', true)
        .not('graphics', 'is', null)
        .not('graphics', 'eq', '');
        
      if (graphicsDistError) throw graphicsDistError;
      
      // Process graphics distribution
      const graphicsMap = new Map<string, number>();
      graphicsData.forEach(item => {
        if (!item.graphics) return;
        
        // Simplified category extraction - get the first word of the graphics description
        let category = 'Unknown';
        const graphics = item.graphics.trim();
        
        if (graphics.toLowerCase().includes('nvidia')) category = 'NVIDIA';
        else if (graphics.toLowerCase().includes('rtx') || graphics.toLowerCase().includes('gtx')) category = 'NVIDIA';
        else if (graphics.toLowerCase().includes('intel')) category = 'Intel Integrated';
        else if (graphics.toLowerCase().includes('amd') || graphics.toLowerCase().includes('radeon')) category = 'AMD';
        else if (graphics.toLowerCase().includes('apple')) category = 'Apple';
        else if (graphics.length < 5) category = 'Too Short';
        else category = 'Other';
        
        graphicsMap.set(category, (graphicsMap.get(category) || 0) + 1);
      });
      
      // Convert to array and calculate percentages
      const distribution: GraphicsDistribution[] = [];
      graphicsMap.forEach((count, label) => {
        distribution.push({
          label,
          count,
          percentage: Math.round((count / (total || 1)) * 100)
        });
      });
      
      // Sort by count descending
      distribution.sort((a, b) => b.count - a.count);
      setGraphicsDistribution(distribution);
      
      setStats({
        total: total || 0,
        missingPrice: missingPrice || 0,
        missingProcessor: missingProcessor || 0,
        missingRam: missingRam || 0,
        missingStorage: missingStorage || 0,
        missingGraphics: missingGraphics || 0,
        missingScreenSize: missingScreenSize || 0,
        lastUpdatedOlderThan24h: lastUpdatedOlderThan24h || 0,
        lastCheckedOlderThan24h: lastCheckedOlderThan24h || 0,
        neverChecked: neverChecked || 0,
        emptyGraphics: emptyGraphics || 0,
        nullGraphics: nullGraphics || 0,
        shortGraphics: shortGraphics || 0
      });
      
      // Log some of these stats to console
      console.log('Laptop database statistics:', {
        total: total || 0,
        missingPrice: missingPrice || 0,
        missingProcessor: missingProcessor || 0,
        missingRam: missingRam || 0,
        missingStorage: missingStorage || 0,
        missingGraphics: missingGraphics || 0,
        graphicsBreakdown: {
          nullGraphics,
          emptyGraphics,
          shortGraphics
        },
        missingScreenSize: missingScreenSize || 0,
        neverChecked: neverChecked || 0
      });
      
    } catch (error) {
      console.error('Error fetching laptop stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch laptop statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectLaptops = async () => {
    try {
      console.log('Starting laptop collection process...');
      const result = await collectLaptops();
      console.log('Collection process result:', result);
      
      toast({
        title: "Collection Started",
        description: "Started collecting new laptops. This may take a few minutes.",
      });
      
      // Refresh stats after collection starts
      setTimeout(fetchLaptopStats, 2000);
    } catch (error) {
      console.error('Error collecting laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop collection",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLaptops = async () => {
    try {
      await updateLaptops();
      toast({
        title: "Update Started",
        description: "Started updating laptop information. This may take a few minutes.",
      });
      
      // Refresh stats after update starts
      setTimeout(fetchLaptopStats, 2000);
    } catch (error) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop updates",
        variant: "destructive"
      });
    }
  };

  const handleAIProcess = async () => {
    try {
      const result = await processLaptopsAI();
      if (result.success) {
        toast({
          title: "AI Processing Started",
          description: `Processing initiated for ${result.processed} laptops`,
        });
        
        // Refresh stats after AI processing starts
        setTimeout(fetchLaptopStats, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start AI processing",
        });
      }
    } catch (error) {
      console.error('Error processing laptops with AI:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process laptops with AI",
      });
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await cleanupLaptopDatabase();
      if (result.success) {
        toast({
          title: "Cleanup Complete",
          description: `Successfully cleaned up the laptop database. ${result.removedForbiddenKeywords} products with forbidden keywords were removed.`,
        });
        
        // Refresh stats after cleanup
        fetchLaptopStats();
      }
    } catch (error) {
      console.error('Error cleaning up laptop database:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clean up laptop database",
      });
    }
  };

  const handleFixGraphicsData = async () => {
    try {
      toast({
        title: "Graphics Data Fix",
        description: "Starting to process and fix missing graphics data. This may take a few minutes.",
      });
      
      // This will trigger the AI processing with focus on graphics data
      const result = await processLaptopsAI({
        focus: 'graphics',
        limit: 50 // Process in smaller batches
      });
      
      if (result.success) {
        toast({
          title: "Graphics Processing Started",
          description: `Processing initiated for ${result.processed} laptops with missing graphics data`,
        });
        
        // Refresh stats after graphics processing starts
        setTimeout(fetchLaptopStats, 2000);
      }
    } catch (error) {
      console.error('Error fixing graphics data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start graphics data fix process",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Database Statistics</h2>
            {loading ? (
              <div className="text-center py-4">Loading statistics...</div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Laptops</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Missing Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.missingPrice}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.missingPrice / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Never Checked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.neverChecked}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.neverChecked / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Missing Processor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.missingProcessor}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.missingProcessor / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Missing RAM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.missingRam}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.missingRam / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Missing Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.missingStorage}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.missingStorage / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-yellow-50 border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                      Graphics Data Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-gray-500">Total Missing</div>
                          <div className="text-2xl font-bold">{stats.missingGraphics}</div>
                          <div className="text-xs text-gray-500">
                            {stats.total > 0 ? `${Math.round((stats.missingGraphics / stats.total) * 100)}%` : '0%'} of database
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-gray-500">NULL Values</div>
                          <div className="text-2xl font-bold">{stats.nullGraphics}</div>
                          <div className="text-xs text-gray-500">
                            {stats.total > 0 ? `${Math.round((stats.nullGraphics / stats.total) * 100)}%` : '0%'} of database
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="text-sm font-medium text-gray-500">Empty Strings</div>
                          <div className="text-2xl font-bold">{stats.emptyGraphics}</div>
                          <div className="text-xs text-gray-500">
                            {stats.total > 0 ? `${Math.round((stats.emptyGraphics / stats.total) * 100)}%` : '0%'} of database
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Graphics Distribution</h4>
                        <div className="space-y-2">
                          {graphicsDistribution.map((item, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-32 text-sm truncate">{item.label}</div>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-20 text-right text-sm">{item.count} ({item.percentage}%)</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-100 p-3 rounded text-sm">
                        <p className="font-medium">Note about graphics data:</p>
                        <p>
                          While the database shows many laptops without graphics data, the product pages may show graphics information 
                          because it's being extracted from the laptop title or using fallback values. This data isn't being stored 
                          in the database field, which explains the discrepancy.
                        </p>
                        <Button 
                          onClick={handleFixGraphicsData}

                          size="sm" 
                          className="mt-2"
                          variant="outline"
                        >
                          Process Missing Graphics Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Missing Graphics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.missingGraphics}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.missingGraphics / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Missing Screen Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.missingScreenSize}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.missingScreenSize / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Not Updated (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.lastUpdatedOlderThan24h}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 
                        ? `${Math.round((stats.lastUpdatedOlderThan24h / stats.total) * 100)}% of database`
                        : '0% of database'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-4 text-red-500">Failed to load statistics</div>
            )}
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchLaptopStats} 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Stats
              </Button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Laptop Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Update Laptops</h3>
                  <p className="text-sm text-gray-500">Update prices and information for existing laptops</p>
                </div>
                <Button
                  onClick={handleUpdateLaptops}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update Prices
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Discover New Laptops</h3>
                  <p className="text-sm text-gray-500">Search and add new laptops to the database</p>
                </div>
                <Button
                  onClick={handleCollectLaptops}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Collect New
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Process with AI</h3>
                  <p className="text-sm text-gray-500">Use AI to standardize laptop specifications</p>
                </div>
                <Button
                  onClick={handleAIProcess}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BrainCircuit className="h-4 w-4" />
                  Process with AI
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Clean Database</h3>
                  <p className="text-sm text-gray-500">Remove accessories, duplicates and non-laptop products</p>
                </div>
                <Button
                  onClick={handleCleanup}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clean Database
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;

