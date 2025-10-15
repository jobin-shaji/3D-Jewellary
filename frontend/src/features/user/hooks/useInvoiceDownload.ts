import { useState } from 'react';
import { apiUrl } from '@/shared/lib/api';

interface UseInvoiceDownloadResult {
  downloadInvoice: (orderId: string) => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

export const useInvoiceDownload = (): UseInvoiceDownloadResult => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadInvoice = async (orderId: string): Promise<void> => {
    try {
      setIsDownloading(true);
      setError(null);

      console.log('Starting invoice download for order:', orderId);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // Call the backend API to generate invoice
      const response = await fetch(apiUrl(`/api/invoices/generate/${orderId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.invoiceUrl) {
        // Open the PDF in a new tab for download
        const newWindow = window.open(data.invoiceUrl, '_blank');
        
        // Fallback: if popup is blocked, try direct download
        if (!newWindow) {
          console.log('Popup blocked, attempting direct download...');
          
          // Create a temporary link for direct download
          const link = document.createElement('a');
          link.href = data.invoiceUrl;
          link.download = `invoice-${orderId}.pdf`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        console.log('Invoice download initiated successfully');
      } else {
        throw new Error('No invoice URL received from server');
      }

    } catch (err: any) {
      console.error('Invoice download error:', err);
      
      let errorMessage = 'Failed to download invoice. Please try again.';
      
      // Handle different error types
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      
      // Show user-friendly error notification
      if (typeof window !== 'undefined' && 'alert' in window) {
        alert(errorMessage);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadInvoice,
    isDownloading,
    error
  };
};