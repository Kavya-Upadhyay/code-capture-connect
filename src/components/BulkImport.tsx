
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { bulkImportStudents } from "@/services/supabaseService";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const BulkImport: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept CSV and Excel files
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }
    
    try {
      setIsImporting(true);
      setProgress(10);
      
      // Simple parsing implementation - in a real app, use a proper CSV/Excel parser library
      const text = await file.text();
      setProgress(30);
      
      // Split by lines and headers
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Parse each line into an object
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const student: Record<string, string> = {};
        
        for (let j = 0; j < headers.length; j++) {
          student[headers[j]] = values[j] || '';
        }
        
        students.push(student);
        setProgress(30 + Math.floor((i / lines.length) * 40));
      }
      
      // Import students to database
      setProgress(70);
      const result = await bulkImportStudents(students);
      setProgress(100);
      
      setImportResult(result);
      if (result.failed === 0) {
        toast.success(`Successfully imported ${result.success} students`);
      } else {
        toast.warning(`Imported ${result.success} students with ${result.failed} failures`);
      }
    } catch (error) {
      console.error("Error importing students:", error);
      toast.error("Failed to import students");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="mt-4">
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isImporting}
          >
            <Upload size={16} />
            Bulk Import Students
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Student Data</AlertDialogTitle>
            <AlertDialogDescription>
              Upload a CSV or Excel file containing student data. The file should have headers matching the required fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isImporting ? (
            <div className="py-4">
              <p className="text-sm mb-2">Importing students...</p>
              <Progress value={progress} className="h-2" />
            </div>
          ) : importResult ? (
            <div className="border rounded-md p-4 my-2">
              <div className="flex items-center gap-2 mb-2">
                {importResult.failed === 0 ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <AlertTriangle className="text-yellow-500" size={20} />
                )}
                <h3 className="font-medium">Import Results</h3>
              </div>
              <p className="text-sm">Successfully imported: {importResult.success} students</p>
              {importResult.failed > 0 && (
                <>
                  <p className="text-sm text-red-500">Failed imports: {importResult.failed} students</p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-500 max-h-20 overflow-y-auto">
                      <p className="font-semibold">Errors:</p>
                      <ul className="list-disc pl-4">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="py-4">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full"
              >
                Select File
              </Button>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setImportResult(null)}
              disabled={isImporting}
            >
              Close
            </AlertDialogCancel>
            {importResult && (
              <AlertDialogAction 
                onClick={() => {
                  setImportResult(null);
                  fileInputRef.current?.click();
                }}
              >
                Import Another
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BulkImport;
