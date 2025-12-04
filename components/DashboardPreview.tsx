import React from 'react';
import { FileSpreadsheet, Download, ExternalLink } from 'lucide-react';

interface DashboardPreviewProps {
  file: File | null;
  sheets: { [sheetName: string]: any[][] } | null;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ 
  file,
  sheets
}) => {
  
  const handleDownload = () => {
    if (file) {
      // If user uploaded a file, create a blob URL to download it again
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (sheets) {
      // If it's the sample scenario, generate an Excel file on the fly
      const XLSX = (window as any).XLSX;
      if (!XLSX) return;

      const wb = XLSX.utils.book_new();
      
      Object.keys(sheets).forEach(name => {
        const ws = XLSX.utils.aoa_to_sheet(sheets[name]);
        XLSX.utils.book_append_sheet(wb, ws, name);
      });

      XLSX.writeFile(wb, "KPI_Dashboard_Under_Construction.xlsx");
    }
  };

  const fileName = file ? file.name : "KPI_Dashboard_Under_Construction.xlsx";

  return (
    <div className="w-full lg:w-1/2 shrink-0 flex flex-col border-r border-slate-200 bg-slate-50 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
        <div className="p-2 bg-green-100 rounded-lg text-green-700">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">Scenario Dashboard</h2>
          <p className="text-xs text-slate-500">Resource Panel</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-md mx-auto space-y-8">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExternalLink className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Open in Microsoft Excel</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              This scenario contains complex visualizations and pivot charts. For the best experience, please download the file and open it directly in Excel.
            </p>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left border border-slate-200">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active File</div>
              <div className="font-medium text-slate-800 flex items-center gap-2 truncate">
                <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>
            </div>

            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              <span>Download Dashboard File</span>
            </button>
          </div>

          <p className="text-sm text-slate-400">
            Keep this file open on your desktop while you answer the questions on the right.
          </p>

        </div>
      </div>
    </div>
  );
};