
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

export interface MissingDataDiagnosticsProps {
  runDiagnostic: boolean;
  onComplete: () => void;
}

export function MissingDataDiagnostics({ runDiagnostic, onComplete }: MissingDataDiagnosticsProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    if (runDiagnostic && status !== 'running') {
      runDiagnosticProcess();
    }
  }, [runDiagnostic]);

  const runDiagnosticProcess = () => {
    setStatus('running');
    setProgress(0);
    setIssues([]);
    
    // Simulate diagnostic process
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        
        // Add dummy issues at different stages
        if (newProgress === 30) {
          setIssues(prev => [...prev, "Found 47 laptops with missing processor information"]);
        }
        if (newProgress === 50) {
          setIssues(prev => [...prev, "Found 35 laptops with missing RAM specifications"]);
        }
        if (newProgress === 70) {
          setIssues(prev => [...prev, "Found 62 laptops with missing or invalid prices"]);
        }
        
        // Complete the process
        if (newProgress >= 100) {
          clearInterval(interval);
          setStatus('complete');
          onComplete();
        }
        
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 500);
    
    return () => clearInterval(interval);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium">Diagnostic Tool</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">
            {status === 'idle' ? 'Ready to run' : 
             status === 'running' ? 'Running diagnostic...' : 
             'Diagnostic complete'}
          </span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>
      
      {issues.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Issues Found:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {issues.map((issue, index) => (
              <li key={index} className="text-sm text-gray-700">{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {status === 'complete' && (
        <div className="pt-2">
          <p className="text-sm text-gray-700">
            Diagnostic complete. {issues.length} issues found. 
            Run AI processing to attempt automatic resolution of these issues.
          </p>
        </div>
      )}
    </div>
  );
}
