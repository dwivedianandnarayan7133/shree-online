function generateRequestId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CA-${year}-${randomNum}`;
}

function generateInvoiceId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${randomNum}`;
}

function generatePrintJobId() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `PRN-${random}`;
}

module.exports = {
  generateRequestId,
  generateInvoiceId,
  generatePrintJobId
};