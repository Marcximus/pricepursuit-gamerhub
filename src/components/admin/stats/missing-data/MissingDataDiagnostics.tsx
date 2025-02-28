
import React from "react";
import { Database, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissingDataDiagnosticsProps {
  onDiagnosticRun: () => void;
}

export function MissingDataDiagnostics({ onDiagnosticRun }: MissingDataDiagnosticsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Data Collection Pipeline</h3>
        <div className="bg-muted p-4 rounded-md space-y-2">
          <div className="flex items-start space-x-2">
            <Database className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Issue: Data Extraction</p>
              <p className="text-sm text-muted-foreground">Specification data appears to be collected but not properly extracted from product titles and descriptions.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Database className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Issue: Normalizer Functions</p>
              <p className="text-sm text-muted-foreground">Normalizers may not be handling the variety of formats present in raw data.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Database className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Issue: Database Updates</p>
              <p className="text-sm text-muted-foreground">Extracted values may not be correctly stored in the database.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Technical Debugging Steps</h3>
        <div className="bg-muted p-4 rounded-md">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <p className="font-medium">Examine specification extraction functions:</p>
              <p className="text-sm text-muted-foreground">Check <code>src/utils/laptopUtils/specsProcessor.ts</code> and other normalizers to verify pattern matching.</p>
            </li>
            <li>
              <p className="font-medium">Verify update query field mapping:</p>
              <p className="text-sm text-muted-foreground">Ensure extracted values are properly mapped to the right database fields.</p>
            </li>
            <li>
              <p className="font-medium">Validate database commits:</p>
              <p className="text-sm text-muted-foreground">Confirm that extracted values are being saved to the database correctly.</p>
            </li>
            <li>
              <p className="font-medium">Test with sample data:</p>
              <p className="text-sm text-muted-foreground">Process known good product titles to verify extraction accuracy.</p>
            </li>
            <li>
              <p className="font-medium">Run AI processing:</p>
              <p className="text-sm text-muted-foreground">Use the AI processing function to improve extraction for existing products.</p>
            </li>
          </ol>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onDiagnosticRun}>
          <WrenchIcon className="mr-2 h-4 w-4" />
          Run Full Diagnostic
        </Button>
      </div>
    </div>
  );
}
