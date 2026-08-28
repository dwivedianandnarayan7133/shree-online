const { UPLOAD_PATHS } = require('../config/constants');
﻿const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const SystemConfig = require('../models/SystemConfig');
const { logAudit } = require('../utils/logger');

function initCleanupScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const config = await SystemConfig.findOne() || { retentionHours: 24 };
      const retentionHours = config.retentionHours || 24;
      const maxAgeMs = retentionHours * 60 * 60 * 1000;
      const now = Date.now();

      const tempDir = path.join(UPLOAD_PATHS.TEMP, );
      const processedDir = path.join(UPLOAD_PATHS.PROCESSED, );

      let cleanedFilesCount = 0;
      let freedBytes = 0;

      [tempDir, processedDir].forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            const filePath = path.join(dir, file);
            try {
              const stat = fs.statSync(filePath);
              if (stat.isFile()) {
                if (now - stat.mtimeMs > maxAgeMs) {
                  freedBytes += stat.size;
                  fs.unlinkSync(filePath);
                  cleanedFilesCount++;
                }
              }
            } catch (e) {}
          });
        }
      });

      if (cleanedFilesCount > 0) {
        console.log(`[Auto-Cleanup] Cleaned ${cleanedFilesCount} expired temporary files (${Math.round(freedBytes / 1024)} KB freed).`);
        await logAudit({
          action: 'AUTOMATIC_CLEANUP_EXECUTED',
          user: 'System Cron',
          role: 'system',
          details: { cleanedFilesCount, freedBytes, retentionHours }
        });
      }
    } catch (err) {
      console.error('Cleanup scheduler error:', err.message);
    }
  });

  console.log('Automated File Retention Cleaner initialized.');
}

async function performManualCleanup(retentionHours = 1) {
  const maxAgeMs = retentionHours * 60 * 60 * 1000;
  const now = Date.now();
  const tempDir = path.join(UPLOAD_PATHS.TEMP, );
  const processedDir = path.join(UPLOAD_PATHS.PROCESSED, );

  let cleanedFilesCount = 0;
  let freedBytes = 0;

  [tempDir, processedDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            if (now - stat.mtimeMs > maxAgeMs) {
              freedBytes += stat.size;
              fs.unlinkSync(filePath);
              cleanedFilesCount++;
            }
          }
        } catch (e) {}
      });
    }
  });

  return {
    cleanedFilesCount,
    freedBytes,
    freedKb: Math.round(freedBytes / 1024)
  };
}

module.exports = { initCleanupScheduler, performManualCleanup };
