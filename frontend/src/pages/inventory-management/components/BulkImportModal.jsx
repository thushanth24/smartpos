import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const BulkImportModal = ({ isOpen, onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setImportResults(null);
    } else {
      alert('Please select a CSV file');
    }
  };

  const simulateImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Simulate import results
    const results = {
      total: 150,
      successful: 142,
      failed: 8,
      errors: [
        { row: 15, error: 'Invalid SKU format' },
        { row: 23, error: 'Missing required field: name' },
        { row: 45, error: 'Duplicate SKU detected' },
        { row: 67, error: 'Invalid category' },
        { row: 89, error: 'Price must be a number' },
        { row: 101, error: 'Stock quantity cannot be negative' },
        { row: 123, error: 'Invalid supplier ID' },
        { row: 134, error: 'Description too long' }
      ]
    };

    setImportResults(results);
    setIsImporting(false);
    
    if (onImport) {
      onImport(results);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `SKU,Name,Category,Price,Stock,Reorder Point,Location,Supplier
ELEC001,Wireless Headphones,electronics,99.99,50,10,main,SUP001
CLOTH002,Cotton T-Shirt,clothing,19.99,100,20,main,SUP002
FOOD003,Organic Coffee,food,12.99,75,15,warehouse,SUP003`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportProgress(0);
    setIsImporting(false);
    setImportResults(null);
    setDragActive(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Bulk Import Inventory</h2>
            <p className="text-sm text-muted-foreground">Import products from CSV file</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {!importResults && (
            <>
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                      <Icon name="FileText" size={32} className="text-success" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{selectedFile.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                    >
                      <Icon name="X" size={16} className="mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                      <Icon name="Upload" size={32} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-2">
                        Drop your CSV file here, or click to browse
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Supports CSV files up to 10MB
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon name="Upload" size={16} className="mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {/* Template Download */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground mb-1">Need a template?</div>
                    <div className="text-sm text-muted-foreground">
                      Download our CSV template with sample data
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="font-medium text-foreground mb-2">Importing products...</div>
                    <div className="text-sm text-muted-foreground">Please wait while we process your file</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {importProgress}% complete
                  </div>
                </div>
              )}
            </>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-success" />
                </div>
                <div className="font-medium text-foreground mb-2">Import Complete!</div>
                <div className="text-sm text-muted-foreground">
                  Your inventory has been updated
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{importResults.total}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">{importResults.successful}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center p-4 bg-error/10 rounded-lg">
                  <div className="text-2xl font-bold text-error">{importResults.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="space-y-4">
                  <div className="font-medium text-foreground">Import Errors:</div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {importResults.errors.map((error, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-error/5 border border-error/20 rounded-lg">
                        <Icon name="AlertCircle" size={16} className="text-error" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">Row {error.row}</div>
                          <div className="text-xs text-muted-foreground">{error.error}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              {importResults ? 'Close' : 'Cancel'}
            </Button>
            {selectedFile && !isImporting && !importResults && (
              <Button
                onClick={simulateImport}
                className="flex-1"
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Import Products
              </Button>
            )}
            {importResults && (
              <Button
                onClick={() => {
                  resetModal();
                }}
                className="flex-1"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Import More
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;