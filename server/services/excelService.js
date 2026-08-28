const { UPLOAD_PATHS } = require('../config/constants');
﻿const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate formatted .xlsx Excel file from 2D table grid data
 */
async function generateExcelFromTable(tableRows, options = {}) {
  const { sheetName = 'Converted Data' } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cyber Cafe Management Portal';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  if (!tableRows || !Array.isArray(tableRows) || tableRows.length === 0) {
    worksheet.addRow(['No tabular data detected']);
  } else {
    tableRows.forEach((row, rowIdx) => {
      const addedRow = worksheet.addRow(row);
      
      if (rowIdx === 0) {
        addedRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        addedRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E40AF' }
        };
        addedRow.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        if (rowIdx % 2 === 0) {
          addedRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
      }
      addedRow.height = 24;
    });

    worksheet.columns.forEach(col => {
      let maxLen = 14;
      col.eachCell({ includeEmpty: true }, cell => {
        const val = cell.value ? String(cell.value) : '';
        if (val.length > maxLen) maxLen = Math.min(val.length + 3, 50);
      });
      col.width = maxLen;
    });
  }

  const outName = `sheet-${Date.now()}-${uuidv4().substring(0, 6)}.xlsx`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  await workbook.xlsx.writeFile(outPath);
  const stat = fs.statSync(outPath);

  return {
    filePath: outPath,
    fileName: outName,
    size: stat.size,
    rowCount: tableRows ? tableRows.length : 0
  };
}

module.exports = { generateExcelFromTable };
