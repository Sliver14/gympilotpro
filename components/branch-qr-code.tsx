'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link as LinkIcon, Printer, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BranchQRCodeProps {
  branchId: string;
  branchName: string;
  gymSlug: string | null;
  gymData: any | null;
}

export function BranchQRCode({ branchId, branchName, gymSlug, gymData }: BranchQRCodeProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const protocol = 'https://';
  const domain = gymData?.customDomain && gymData?.domainVerified 
    ? gymData.customDomain 
    : `${gymSlug || 'klimarx'}.gympilotpro.com`;
    
  const branchSlug = branchName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  // The signup URL for this branch
  const signupUrl = `${protocol}${domain}/signup?branch=${branchSlug}`;
  
  // Use public qrserver API to render the QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(signupUrl)}&refresh=${refreshKey}`;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(qrCodeUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${branchName.replace(/\s+/g, '-').toLowerCase()}-attendance-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(signupUrl);
    toast.success('Registration URL copied to clipboard');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${branchName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: sans-serif;
              margin: 0;
            }
            .container {
              text-align: center;
              border: 2px solid #eaeaea;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            img {
              width: 250px;
              height: 250px;
              margin-bottom: 20px;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrCodeUrl}" alt="QR Code" />
            <h1>${branchName}</h1>
            <p>Scan to Register</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('QR Code refreshed');
  };

  return (
    <Card className="border border-border rounded-3xl overflow-hidden shadow-lg bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black uppercase tracking-tight">Branch Registration QR</CardTitle>
        <CardDescription className="text-xs">Scan this QR code to access registration for {branchName}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative h-48 w-48 overflow-hidden rounded-2xl border bg-white p-3 flex items-center justify-center shadow-md">
          <img
            src={qrCodeUrl}
            alt={`${branchName} QR Code`}
            className="object-contain w-full h-full"
          />
        </div>
        
        <div className="flex flex-col items-center space-y-2 w-full">
          <div className="flex w-full items-center space-x-2 rounded-xl border p-2 bg-muted/30">
            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs font-semibold truncate flex-1 text-center select-all font-mono">
              {signupUrl}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleDownload} 
              disabled={downloading}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {downloading ? 'Saving...' : 'Download'}
            </Button>

            <Button 
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs"
            >
              <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
              Copy Link
            </Button>

            <Button 
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print QR
            </Button>

            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
