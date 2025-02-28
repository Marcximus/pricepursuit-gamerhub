
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { checkForDuplicateAsins, DuplicateAsinResult } from '@/utils/laptop/stats/duplicateAsinChecker';
import { cleanupLaptopDatabase } from '@/utils/laptop/cleanupLaptops';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DuplicateAsinChecker = () => {
  const { toast } = useToast();
  const [duplicates, setDuplicates] = useState<DuplicateAsinResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCheckDuplicates = async () => {
    setLoading(true);
    try {
      const results = await checkForDuplicateAsins();
      setDuplicates(results);
      setChecked(true);
      
      if (results.length === 0) {
        toast({
          title: "No Duplicates Found",
          description: "Your database has no duplicate ASINs. Everything looks clean! 🎉",
        });
      } else {
        const totalDuplicateEntries = results.reduce((sum, item) => sum + item.count - 1, 0);
        toast({
          title: "Duplicates Found",
          description: `Found ${results.length} ASINs with duplicates (${totalDuplicateEntries} duplicate entries)`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to check duplicates: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDatabase = async () => {
    setCleaningUp(true);
    try {
      const result = await cleanupLaptopDatabase();
      
      if (result.success) {
        toast({
          title: "Cleanup Complete",
          description: `Successfully cleaned up the database. Removed ${result.removedForbiddenKeywords || 0} products with forbidden keywords and addressed duplicate ASINs.`,
        });
        // Recheck duplicates
        const results = await checkForDuplicateAsins();
        setDuplicates(results);
      } else {
        toast({
          title: "Cleanup Failed",
          description: `Error: ${result.error?.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to cleanup database: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setCleaningUp(false);
    }
  };

  // Calculate total duplicate entries
  const totalDuplicateEntries = duplicates.reduce((sum, item) => sum + item.count - 1, 0);

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          ASIN Duplicate Checker
          {checked && (
            <Badge variant={duplicates.length > 0 ? "destructive" : "default"}>
              {duplicates.length > 0 
                ? `${duplicates.length} Duplicate ASINs` 
                : "No Duplicates"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Check for and clean up duplicate ASINs in the product database
        </CardDescription>
      </CardHeader>
      <CardContent>
        {duplicates.length > 0 && (
          <div className="my-4">
            <div className="text-sm font-medium mb-2">
              Found {duplicates.length} ASINs with duplicates ({totalDuplicateEntries} duplicate entries)
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="py-2 px-4 text-left">#</th>
                    <th className="py-2 px-4 text-left">ASIN</th>
                    <th className="py-2 px-4 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((item, index) => (
                    <tr key={item.asin} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4 font-mono text-xs">{item.asin}</td>
                      <td className="py-2 px-4 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {checked && duplicates.length === 0 && (
          <div className="my-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-md text-green-600 dark:text-green-400">
            ✅ No duplicate ASINs found in the database. Your data is clean!
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button 
          onClick={handleCheckDuplicates} 
          disabled={loading || cleaningUp}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : "Check for Duplicates"}
        </Button>
        {duplicates.length > 0 && (
          <Button 
            onClick={handleCleanupDatabase} 
            disabled={loading || cleaningUp}
            variant="default"
            className="w-full"
          >
            {cleaningUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cleaning Up...
              </>
            ) : "Clean Up Database"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DuplicateAsinChecker;
