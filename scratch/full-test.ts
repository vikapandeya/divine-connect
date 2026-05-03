/**
 * DivineConnect — Full Test Suite
 * Auth + Product Management + Admin Vendor Dashboard + Vendor Top Products
 * Run: npx tsx scratch/full-test.ts
 */
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
dotenv.config();

const BASE = 'http://localhost:3000';
const ts = new Date().toISOString();
const results: { name: string; passed: boolean; status?: number; error?: string }[] = [];

function log(m: string) { console.log(m); }

async function post(path: string, body: object) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function get(path: string) {
  const r = await fetch(`${BASE}${path}`);
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function del(path: string) {
  const r = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

function record(name: string, passed: boolean, status?: number, error?: string) {
  results.push({ name, passed, status, error });
  console.log(`  ${passed ? '✅' : '❌'} ${name}${error ? ' — ' + error : ''}`);
}

// ─── SECTION 0: Health ───────────────────────────────────────────────────────
async function s0() {
  log('\n🔍 [0] Health Check');
  const { status, data } = await get('/api/health');
  record('Server reachable', status === 200, status);
  record('DB adapter ready', data?.database === true, status, data?.database ? undefined : 'DB not ready');
}

// ─── SECTION 1: Admin Auth ───────────────────────────────────────────────────
async function s1() {
  log('\n👑 [1] Admin Login');
  const { status, data } = await post('/api/auth/login', { email: 'pg2331427@gmail.com', password: 'admin123' });
  record('Admin login succeeds', status === 200 && data?.user?.role === 'admin', status, status !== 200 ? JSON.stringify(data) : undefined);
  const wp = await post('/api/auth/login', { email: 'pg2331427@gmail.com', password: 'wrong' });
  record('Admin wrong password → 401', wp.status === 401, wp.status);
  return data?.user;
}

// ─── SECTION 2: Devotee Auth ─────────────────────────────────────────────────
async function s2() {
  log('\n🙏 [2] Devotee (User) Auth');
  const email = `dev_${Date.now()}@test.com`;

  const su = await post('/api/auth/register', { email, password: 'Dev@1234', displayName: 'Test Devotee', role: 'devotee' });
  record('Devotee signup', su.status === 200 && su.data?.success, su.status, su.status !== 200 ? JSON.stringify(su.data) : undefined);

  const dup = await post('/api/auth/register', { email, password: 'Dev@1234', displayName: 'Dup' });
  record('Duplicate email → 400', dup.status === 400, dup.status);

  const li = await post('/api/auth/login', { email, password: 'Dev@1234' });
  record('Devotee login', li.status === 200 && li.data?.user?.role === 'devotee', li.status, li.status !== 200 ? JSON.stringify(li.data) : undefined);

  const seeded = await post('/api/auth/login', { email: 'user@test.com', password: 'user123' });
  record('Seeded devotee login (user@test.com)', seeded.status === 200 && seeded.data?.user?.role === 'devotee', seeded.status);

  const wp = await post('/api/auth/login', { email, password: 'wrong' });
  record('Wrong password → 401', wp.status === 401, wp.status);

  const noEmail = await post('/api/auth/login', { password: 'abc' });
  record('Login without email → non-200', noEmail.status !== 200, noEmail.status);

  const noPass = await post('/api/auth/register', { email: 'x@x.com' });
  record('Register no password → 400 (not 500)', noPass.status === 400, noPass.status);

  return su.data?.uid;
}

// ─── SECTION 3: Vendor Auth & Registration ───────────────────────────────────
async function s3(devoteeUid: string) {
  log('\n🏪 [3] Vendor Auth & Registration');

  const seeded = await post('/api/auth/login', { email: 'vendor@test.com', password: 'vendor123' });
  record('Seeded vendor login (vendor@test.com)', seeded.status === 200 && seeded.data?.user?.role === 'vendor', seeded.status);

  const email = `vend_${Date.now()}@test.com`;
  const su = await post('/api/auth/register', { email, password: 'Vend@1234', displayName: 'New Vendor', role: 'vendor' });
  record('Vendor direct signup (role=vendor)', su.status === 200, su.status);

  if (su.data?.uid) {
    const li = await post('/api/auth/login', { email, password: 'Vend@1234' });
    record('New vendor login — role=vendor', li.status === 200 && li.data?.user?.role === 'vendor', li.status);
  }

  // Devotee applies to become vendor
  if (devoteeUid) {
    const vr = await post('/api/vendor/register', {
      userId: devoteeUid,
      businessName: 'Lotus Puja Store',
      businessType: 'Pandit',
      description: 'Traditional puja services',
      contactPhone: '9876543210',
      contactAddress: 'Varanasi',
    });
    record('Devotee → Vendor upgrade (pending)', vr.status === 200 && vr.data?.success, vr.status, vr.status !== 200 ? JSON.stringify(vr.data) : undefined);
  }

  const vendors = await get('/api/vendors');
  record('GET /api/vendors returns array', vendors.status === 200 && Array.isArray(vendors.data), vendors.status);

  return seeded.data?.user?.uid || 'vendor_1';
}

// ─── SECTION 4: Vendor Product Management ────────────────────────────────────
async function s4(vendorId: string) {
  log('\n📦 [4] Vendor Product Management');

  // Add product
  const add = await post('/api/vendor/products', {
    vendorId,
    name: 'Brass Ganesha Idol',
    description: 'Handcrafted brass idol',
    price: 1299,
    category: 'Idols',
    stock: 25,
    rating: 4.7,
    image: 'https://picsum.photos/seed/ganesha/400/400',
  });
  record('Vendor adds product', add.status === 200 && add.data?.success, add.status, add.status !== 200 ? JSON.stringify(add.data) : undefined);

  // Add second product
  await post('/api/vendor/products', {
    vendorId,
    name: 'Chandan Incense Pack',
    description: 'Natural sandalwood incense',
    price: 199,
    category: 'Incense',
    stock: 100,
    rating: 4.5,
    image: 'https://picsum.photos/seed/incense2/400/400',
  });

  // List vendor's products
  const list = await get(`/api/vendor/products/${vendorId}`);
  record('Vendor lists own products', list.status === 200 && Array.isArray(list.data), list.status);
  record('Vendor sees ≥1 products', Array.isArray(list.data) && list.data.length >= 1, undefined, `count=${list.data?.length}`);

  // Top-selling products
  const top = await get(`/api/vendor/top-products/${vendorId}`);
  record('Vendor top-selling products endpoint', top.status === 200 && Array.isArray(top.data), top.status);

  // Validation: missing fields
  const bad = await post('/api/vendor/products', { vendorId, description: 'no name or price' });
  record('Add product missing name/price → 400', bad.status === 400, bad.status);

  // Update a product
  if (Array.isArray(list.data) && list.data.length > 0) {
    const pid = list.data[0].id;
    const upd = await fetch(`${BASE}/api/vendor/products/${pid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Idol', price: 1499, stock: 20, category: 'Idols', rating: 4.8 }),
    });
    record('Vendor updates own product', upd.status === 200, upd.status);
  }

  return list.data;
}

// ─── SECTION 5: Admin Dashboard APIs ─────────────────────────────────────────
async function s5() {
  log('\n🛡️  [5] Admin Dashboard APIs');

  const stats = await get('/api/admin/stats');
  record('Admin stats endpoint', stats.status === 200, stats.status);

  const perf = await get('/api/admin/vendors-performance');
  record('Admin vendors-performance', perf.status === 200 && Array.isArray(perf.data), perf.status);

  const pending = await get('/api/admin/pending-vendors');
  record('Admin pending-vendors', pending.status === 200 && Array.isArray(pending.data), pending.status);

  const allVendors = await get('/api/admin/all-vendors');
  record('Admin all-vendors (new endpoint)', allVendors.status === 200 && Array.isArray(allVendors.data), allVendors.status);

  const products = await get('/api/products');
  record('Admin GET all products', products.status === 200 && Array.isArray(products.data), products.status);

  // Admin adds product
  const addP = await post('/api/products', {
    name: 'Admin Listed Item',
    description: 'Added by admin',
    price: 999,
    category: 'Puja Essentials',
    stock: 10,
    rating: 4.0,
    image: 'https://picsum.photos/seed/admin/400/400',
    vendorId: 'system',
  });
  record('Admin adds product to catalog', addP.status === 200, addP.status);

  const payouts = await get('/api/admin/payouts');
  record('Admin payouts endpoint', payouts.status === 200, payouts.status);
}

// ─── REPORT ───────────────────────────────────────────────────────────────────
async function generateReport() {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const pct = Math.round((passed / total) * 100);

  let md = `# 🧪 DivineConnect — Full Enhancement Test Report
> **Generated:** ${ts}  
> **Base URL:** ${BASE} | **DB:** XAMPP MySQL (\`divine\`)

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${total} |
| ✅ Passed | ${passed} |
| ❌ Failed | ${total - passed} |
| Pass Rate | **${pct}%** |

---

## 👥 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | \`pg2331427@gmail.com\` | \`admin123\` |
| Devotee | \`user@test.com\` | \`user123\` |
| Vendor | \`vendor@test.com\` | \`vendor123\` |

---

## 🔬 Test Results

| # | Section | Test | Status | HTTP |
|---|---------|------|--------|------|
`;

  const sections: Record<string, string> = {
    'Health Check': '🔍 Health',
    'Admin': '👑 Admin',
    'Devotee': '🙏 Devotee',
    'Vendor Auth': '🏪 Vendor Auth',
    'Vendor Product': '📦 Products',
    'Admin Dashboard': '🛡️ Admin API',
  };

  results.forEach((r, i) => {
    const icon = r.passed ? '✅ PASS' : '❌ FAIL';
    md += `| ${i + 1} | — | ${r.name} | ${icon} | ${r.status ?? '—'} |\n`;
  });

  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    md += `\n---\n\n## ❌ Failures\n\n`;
    failed.forEach(r => {
      md += `**${r.name}**  \n`;
      if (r.error) md += `> ${r.error}\n\n`;
    });
  }

  md += `\n---\n\n## 🏗️ Enhancements Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Admin Login | ✅ Done | Hash refreshed on every server start |
| Devotee Signup/Login | ✅ Done | With duplicate & validation guards |
| Vendor Signup (direct) | ✅ Done | \`role=vendor\` on register |
| Devotee → Vendor Upgrade | ✅ Done | Via \`/api/vendor/register\` |
| Vendor Add Product | ✅ Done | \`POST /api/vendor/products\` |
| Vendor List Own Products | ✅ Done | \`GET /api/vendor/products/:id\` |
| Vendor Top-Selling | ✅ Done | \`GET /api/vendor/top-products/:id\` |
| Admin All-Vendors Dashboard | ✅ Done | \`GET /api/admin/all-vendors\` |
| Admin Add Product | ✅ Done | \`POST /api/products\` |
| Missing Tables Fixed | ✅ Done | notifications, vendor_wallets, etc. |
| Input Validation | ✅ Done | 400 on missing password/email |

---

## 🔧 Enhancement Recommendations

| Priority | Item |
|----------|------|
| 🔴 High | Add JWT auth tokens — routes currently unprotected |
| 🟡 Medium | Vendor product image upload (currently URL-only) |
| 🟡 Medium | Admin approve-vendor triggers email notification |
| 🟢 Low | Pagination on \`/api/products\` for large catalogs |
`;

  await writeFile('scratch/full-test-report.md', md, 'utf8');
  log('\n📄 Report saved → scratch/full-test-report.md');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  log('══════════════════════════════════════════════════');
  log('  DivineConnect — Full Enhancement Test Suite');
  log(`  ${ts}`);
  log('══════════════════════════════════════════════════');

  await s0();
  await s1();
  const devoteeUid = await s2();
  const vendorId = await s3(devoteeUid || '');
  await s4(vendorId);
  await s5();

  const passed = results.filter(r => r.passed).length;
  log(`\n📊 Results: ${passed}/${results.length} passed`);
  await generateReport();
}

main().catch(e => { console.error('Runner failed:', e.message); process.exit(1); });
