'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link as LinkIcon } from 'lucide-react';

interface GymQRCodeProps {
  qrCodeUrl: string | null;
  gymUrl: string;
  gymName: string;
}

export function GymQRCode({ qrCodeUrl, gymUrl, gymName }: GymQRCodeProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!qrCodeUrl) return;
    try {
      setDownloading(true);
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${gymName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (!qrCodeUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gym Access QR Code</CardTitle>
          <CardDescription>Your gym's unique access link</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground">QR Code not available. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gym Access QR Code</CardTitle>
        <CardDescription>Members can scan this to access your gym portal.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative h-48 w-48 overflow-hidden rounded-lg border bg-white p-2">
          <Image
            src={qrCodeUrl}
            alt={`${gymName} QR Code`}
            fill
            className="object-contain"
          />
        </div>
        
        <div className="flex flex-col items-center space-y-2 w-full max-w-sm">
          <div className="flex w-full items-center space-x-2 rounded-md border p-2 bg-muted/50">
            <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate flex-1 text-center">
              {gymUrl}
            </span>
          </div>
          
          <Button 
            onClick={handleDownload} 
            disabled={downloading}
            className="w-full"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? 'Downloading...' : 'Download QR Code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
