import salesService from './salesService';

const OFFLINE_STORAGE_KEY = 'pos_offline_transactions';
const SYNC_STATUS_KEY = 'pos_sync_status';

const offlineService = {
  // Check if browser supports IndexedDB
  isSupported: () => {
    return 'indexedDB' in window;
  },

  // Save transaction offline
  saveOfflineTransaction: async (transactionData) => {
    try {
      const offlineTransactions = JSON.parse(
        localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]'
      );
      
      const offlineTransaction = {
        ...transactionData,
        offline_id: `offline_${Date.now()}`,
        created_offline: true,
        sync_attempts: 0,
        created_at: new Date().toISOString()
      };
      
      offlineTransactions.push(offlineTransaction);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineTransactions));
      
      // Update sync status
      offlineService.updateSyncStatus({
        pending_transactions: offlineTransactions.length,
        last_offline_save: new Date().toISOString()
      });
      
      return { success: true, data: offlineTransaction };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to save transaction offline' 
      };
    }
  },

  // Get all offline transactions
  getOfflineTransactions: () => {
    try {
      const transactions = JSON.parse(
        localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]'
      );
      return { success: true, data: transactions };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to retrieve offline transactions',
        data: [] 
      };
    }
  },

  // Sync offline transactions to server
  syncOfflineTransactions: async () => {
    try {
      if (!navigator.onLine) {
        return { 
          success: false, 
          error: 'Cannot sync while offline' 
        };
      }

      const offlineTransactions = JSON.parse(
        localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]'
      );

      if (offlineTransactions.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      let syncedCount = 0;
      let failedCount = 0;
      const failedTransactions = [];

      for (const transaction of offlineTransactions) {
        try {
          // Remove offline-specific fields
          const { offline_id, created_offline, sync_attempts, ...syncData } = transaction;
          
          // Process the sale
          const result = await salesService.processSale(syncData);
          
          if (result.success) {
            syncedCount++;
          } else {
            failedCount++;
            failedTransactions.push({
              ...transaction,
              sync_attempts: (transaction.sync_attempts || 0) + 1,
              last_sync_error: result.error
            });
          }
        } catch (error) {
          failedCount++;
          failedTransactions.push({
            ...transaction,
            sync_attempts: (transaction.sync_attempts || 0) + 1,
            last_sync_error: error.message
          });
        }
      }

      // Update local storage with failed transactions only
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(failedTransactions));
      
      // Update sync status
      offlineService.updateSyncStatus({
        pending_transactions: failedTransactions.length,
        last_sync: new Date().toISOString(),
        last_sync_result: {
          synced: syncedCount,
          failed: failedCount
        }
      });

      return { 
        success: true, 
        synced: syncedCount, 
        failed: failedCount,
        remaining: failedTransactions.length
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Sync process failed' 
      };
    }
  },

  // Clear all offline transactions
  clearOfflineTransactions: () => {
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
      offlineService.updateSyncStatus({
        pending_transactions: 0,
        last_clear: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to clear offline transactions' 
      };
    }
  },

  // Get sync status
  getSyncStatus: () => {
    try {
      const status = JSON.parse(
        localStorage.getItem(SYNC_STATUS_KEY) || '{}'
      );
      
      return {
        online: navigator.onLine,
        pending_transactions: status.pending_transactions || 0,
        last_sync: status.last_sync || null,
        last_offline_save: status.last_offline_save || null,
        last_sync_result: status.last_sync_result || null,
        ...status
      };
    } catch (error) {
      return {
        online: navigator.onLine,
        pending_transactions: 0,
        last_sync: null,
        last_offline_save: null,
        error: 'Failed to get sync status'
      };
    }
  },

  // Update sync status
  updateSyncStatus: (updates) => {
    try {
      const currentStatus = JSON.parse(
        localStorage.getItem(SYNC_STATUS_KEY) || '{}'
      );
      
      const newStatus = {
        ...currentStatus,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(newStatus));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update sync status' 
      };
    }
  },

  // Auto-sync when coming online
  setupAutoSync: () => {
    // Listen for online events
    window.addEventListener('online', async () => {
      console.log('Connection restored, attempting to sync...');
      const result = await offlineService.syncOfflineTransactions();
      
      if (result.success && result.synced > 0) {
        // Show success notification (in real app, this would be a toast)
        console.log(`Successfully synced ${result.synced} transactions`);
      }
    });

    // Listen for offline events
    window.addEventListener('offline', () => {
      console.log('Connection lost, transactions will be saved offline');
      offlineService.updateSyncStatus({
        went_offline_at: new Date().toISOString()
      });
    });

    // Initial sync check
    if (navigator.onLine) {
      setTimeout(() => {
        offlineService.syncOfflineTransactions();
      }, 1000);
    }
  },

  // Get offline transaction count
  getOfflineTransactionCount: () => {
    try {
      const transactions = JSON.parse(
        localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]'
      );
      return transactions.length;
    } catch (error) {
      return 0;
    }
  }
};

export default offlineService;