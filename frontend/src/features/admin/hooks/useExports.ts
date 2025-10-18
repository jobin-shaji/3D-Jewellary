// useExports.ts
// Centralized export/download logic for admin dashboard

export type ExportType = 'orders-csv' | 'revenue-csv' | 'sales-pdf' | 'inventory-xml' | 'tax-report';

interface ExportOptions {
  type: ExportType;
  endpoint: string;
  filename: string;
  method?: 'GET' | 'POST';
  body?: any;
}

export function useExports() {
  // Generic export function
  const exportFile = async (options: ExportOptions) => {
    const token = localStorage.getItem('token');
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
      (fetchOptions.headers as any)['Content-Type'] = 'application/json';
    }
    const response = await fetch(options.endpoint, fetchOptions);
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Specific helpers
  const exportOrdersCsv = () =>
    exportFile({
      type: 'orders-csv',
      endpoint: '/api/orders/export',
      filename: 'orders.csv',
    });

  const exportRevenueCsv = (period?: string) =>
    exportFile({
      type: 'revenue-csv',
      endpoint: `/api/analytics/revenue/export${period ? `?period=${period}` : ''}`,
      filename: 'revenue_report.csv',
    });

  const exportTaxReport = () =>
    exportFile({
      type: 'tax-report',
      endpoint: '/api/analytics/tax-report/export',
      filename: 'tax_report.csv',
    });

  // Add more as needed (inventory, tax report, etc.)

  return {
    exportOrdersCsv,
    exportRevenueCsv,
    exportTaxReport,
    exportFile, // for advanced/custom use
  };
}
