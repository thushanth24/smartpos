import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BarcodeScanner = ({ onProductFound, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanResult, setScanResult] = useState(null);

  // Mock barcode database
  const mockBarcodeDatabase = {
    '1234567890123': {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      sku: 'SKU001',
      barcode: '1234567890123'
    },
    '9876543210987': {
      id: 2,
      name: 'Smartphone Case',
      sku: 'SKU002',
      barcode: '9876543210987'
    },
    '5555666677778': {
      id: 3,
      name: 'USB-C Cable',
      sku: 'SKU003',
      barcode: '5555666677778'
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate camera scanning
    setTimeout(() => {
      const mockScannedBarcode = '1234567890123';
      handleBarcodeDetected(mockScannedBarcode);
    }, 2000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  const handleBarcodeDetected = (barcode) => {
    setIsScanning(false);
    const product = mockBarcodeDatabase[barcode];
    
    if (product) {
      setScanResult({ success: true, product, barcode });
      onProductFound(product);
    } else {
      setScanResult({ success: false, barcode });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Barcode Scanner</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Scanner Content */}
        <div className="p-6 space-y-6">
          {/* Camera Scanner */}
          <div className="text-center">
            <div className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-4">
              {isScanning ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Scanning for barcode...</p>
                  <p className="text-xs text-muted-foreground mt-1">Point camera at barcode</p>
                </div>
              ) : (
                <div className="text-center">
                  <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Camera scanner</p>
                </div>
              )}
            </div>

            {!isScanning ? (
              <Button
                variant="default"
                onClick={handleStartScan}
                iconName="Camera"
                iconPosition="left"
                className="w-full"
              >
                Start Camera Scan
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleStopScan}
                iconName="Square"
                iconPosition="left"
                className="w-full"
              >
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              label="Enter Barcode Manually"
              type="text"
              placeholder="Scan or type barcode number"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              description="Try: 1234567890123, 9876543210987, or 5555666677778"
            />
            <Button
              type="submit"
              variant="outline"
              iconName="Search"
              iconPosition="left"
              className="w-full"
              disabled={!manualBarcode.trim()}
            >
              Search Product
            </Button>
          </form>

          {/* Scan Result */}
          {scanResult && (
            <div className={`p-4 rounded-lg border ${
              scanResult.success 
                ? 'bg-success/10 border-success/20' :'bg-error/10 border-error/20'
            }`}>
              <div className="flex items-start gap-3">
                <Icon 
                  name={scanResult.success ? 'CheckCircle' : 'XCircle'} 
                  size={20} 
                  className={scanResult.success ? 'text-success' : 'text-error'} 
                />
                <div className="flex-1">
                  {scanResult.success ? (
                    <div>
                      <h4 className="font-medium text-success">Product Found!</h4>
                      <p className="text-sm text-foreground mt-1">{scanResult.product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {scanResult.product.sku}</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-error">Product Not Found</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Barcode: {scanResult.barcode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Would you like to create a new product?
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;