const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = require('docx');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate formatted .docx Word file from extracted OCR text & paragraphs
 */
async function generateDocxFromText(text, options = {}) {
  const {
    title = 'Converted Document',
    source = 'Scanned Document OCR Conversion',
    tableData = null
  } = options;

  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 }
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `[Notice: Extracted from ${source} on ${new Date().toLocaleDateString()} by Cyber Cafe Portal. Please verify text details against original document.]`,
          italics: true,
          color: '666666',
          size: 18
        })
      ],
      spacing: { after: 300 }
    })
  );

  const rawLines = String(text || '').split('\n');
  let currentPara = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentPara.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: currentPara.join(' '), size: 22 })],
            spacing: { after: 150 }
          })
        );
        currentPara = [];
      }
    } else {
      currentPara.push(trimmed);
    }
  }

  if (currentPara.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: currentPara.join(' '), size: 22 })],
        spacing: { after: 150 }
      })
    );
  }

  if (tableData && Array.isArray(tableData) && tableData.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: 'Extracted Tabular Data',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      })
    );

    const docxRows = tableData.map((row, rIdx) => {
      return new TableRow({
        children: row.map(cellText => {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(cellText || ''),
                    bold: rIdx === 0,
                    size: 20
                  })
                ]
              })
            ],
            shading: rIdx === 0 ? { fill: 'E2E8F0' } : undefined
          });
        })
      });
    });

    const docxTable = new Table({
      rows: docxRows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    });

    paragraphs.push(docxTable);
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outName = `doc-${Date.now()}-${uuidv4().substring(0, 6)}.docx`;
  const outPath = path.join(__dirname, '../uploads/processed', outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);

  return {
    filePath: outPath,
    fileName: outName,
    size: buffer.length
  };
}

module.exports = { generateDocxFromText };
