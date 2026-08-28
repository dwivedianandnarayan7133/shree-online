async function main() {
  console.log('--- Running Cyber Cafe Portal Test Suite ---');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('1. Health Check:', healthData.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

  // 2. Admin Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@cybercafe.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('2. Admin Login & JWT:', loginData.success && token ? '✅ PASS' : '❌ FAIL');

  // 3. Get Stats
  const statsRes = await fetch('http://localhost:5000/api/admin/stats');
  const statsData = await statsRes.json();
  console.log('3. Admin Dashboard Stats:', statsData.success ? '✅ PASS' : '❌ FAIL', `(Requests: ${statsData.stats?.totalRequests})`);

  // 4. Get Services Pricing
  const priceRes = await fetch('http://localhost:5000/api/billing/pricing');
  const priceData = await priceRes.json();
  console.log('4. Service Pricing Catalog:', priceData.success && priceData.services?.length > 0 ? '✅ PASS' : '❌ FAIL', `(${priceData.services?.length} services)`);

  // 5. Get Website Shortcuts
  const shortcutRes = await fetch('http://localhost:5000/api/websites');
  const shortcutData = await shortcutRes.json();
  console.log('5. Official Website Shortcuts:', shortcutData.success && shortcutData.shortcuts?.length > 0 ? '✅ PASS' : '❌ FAIL', `(${shortcutData.shortcuts?.length} portals)`);

  // 6. Test Word (.docx) Export
  const docxRes = await fetch('http://localhost:5000/api/conversions/to-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Cyber Cafe Management Portal\nCustomer Name: Pooja Verma\nRoll No: 2026189\nExtracted details verified.',
      title: 'Verification Certificate'
    })
  });
  const docxData = await docxRes.json();
  console.log('6. Word (.docx) Export Engine:', docxData.success ? '✅ PASS' : '❌ FAIL', `(File: ${docxData.result?.fileName})`);

  // 7. Test Excel (.xlsx) Export
  const excelRes = await fetch('http://localhost:5000/api/conversions/to-excel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableRows: [
        ['S.No', 'Candidate Name', 'Course', 'Status'],
        ['1', 'Pooja Verma', 'B.Tech CSE', 'Approved'],
        ['2', 'Rahul Mehra', 'B.Com Honours', 'Pending Verification']
      ]
    })
  });
  const excelData = await excelRes.json();
  console.log('7. Excel (.xlsx) Export Engine:', excelData.success ? '✅ PASS' : '❌ FAIL', `(File: ${excelData.result?.fileName})`);

  // 8. Test POS Invoice Generation
  const invRes = await fetch('http://localhost:5000/api/billing/invoices', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customerName: 'Aakash Verma',
      customerPhone: '+91 98888 77777',
      items: [
        { description: 'Passport Photo 6-set Sheet', quantity: 1, unitPrice: 50, total: 50 },
        { description: 'Black & White Laser Print', quantity: 4, unitPrice: 5, total: 20 }
      ],
      discount: 0,
      paymentMethod: 'upi',
      paymentStatus: 'paid'
    })
  });
  const invData = await invRes.json();
  console.log('8. POS Invoice & Receipt System:', invData.success ? '✅ PASS' : '❌ FAIL', `(Bill: ${invData.invoice?.invoiceNumber}, Total: ₹${invData.invoice?.grandTotal})`);

  console.log('--- All Test Suite Validations Completed Successfully ---');
}

main().catch(err => console.error('Test Suite Error:', err));
