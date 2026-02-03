"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    error: scanError,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Convert File to base64 on client side (required for Next.js server actions)
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid stack overflow for large files
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64String = btoa(binaryString);
      
      // Pass base64 string and mimeType to server action
      await scanReceiptFn({
        base64: base64String,
        mimeType: file.type,
      });
    } catch (error) {
      toast.error("Failed to process image file");
      console.error("Error converting file to base64:", error);
    }
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  useEffect(() => {
    if (scanError && !scanReceiptLoading) {
      toast.error(scanError.message || "Failed to scan receipt");
    }
  }, [scanError, scanReceiptLoading]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Receipt Scanner
        </label>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReceiptScan(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanReceiptLoading}
        >
          {scanReceiptLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              <span>Scanning Receipt...</span>
            </>
          ) : (
            <>
              <Camera className="mr-2" />
              <span>Scan Receipt with AI</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
