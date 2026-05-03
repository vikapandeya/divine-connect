/**
 * DivineConnect — Dual-Role Test: User (Devotee) acting as Vendor
 * Appends results to FullTestReport3-may.md
 */
import dotenv from 'dotenv';
import { readFile, writeFile } from 'fs/promises';
dotenv.config();

const BASE = 'http://localhost:3000';
const ts = new Date().toISOString();
const results: { name: string; passed: boolean; status?: number; error?: string }[] = [];

function log(m: string) { console.log(m); }
async function post(p: string, b: object) {
  const r = await fetch(`${BASE}${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function get(p: string) {
  const r = await fetch(`${BASE}${p}`);
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function put(p: string, b: object) {
  const r = await fetch(`${BASE}${p}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function del(p: string) {
  const r = await fetch(`${BASE}${p}`, { method: 'DELETE' });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
function record(name: string, passed: boolean, status?: number, error?: string) {
  results.push({ name, passed, status, error });
  console.log(`  ${passed ? '✅' : '❌'} ${name}${error ? ' — ' + error : ''}`);
}

async function main() {
  log('══════════════════════════════════════════════════');
  log('  DivineConnect — User-as-Vendor Dual-Role Tests');
  log(`  ${ts}`);
  log('══════════════════════════════════════════════════');

  // ── Step 1: Create a fresh devotee ───────────────────────────────────────────
  log('\n🧑 [1] Create Devotee Account');
  const email = `dualrole_${Date.now()}@test.com`;
  const pw = 'DualRole@123';

  const signup = await post('/api/auth/register', { email, password: pw, displayName: 'Dual Role User', role: 'devotee' });
  record('Devotee signup', signup.status === 200 && signup.data?.success, signup.status);
  const uid = signup.data?.uid;

  const loginDev = await post('/api/auth/login', { email, password: pw });
  record('Devotee login — role=devotee confirmed', loginDev.status === 200 && loginDev.data?.user?.role === 'devotee', loginDev.status);

  // ── Step 2: Devotee accesses vendor-facing product APIs ───────────────────────
  log('\n🏪 [2] Devotee acting as Vendor (product APIs)');

  // VendorDashboard allows role=devotee — the backend /api/vendor/products accepts any userId
  const addProd = await post('/api/vendor/products', {
    vendorId: uid,
    name: 'Devotee-listed Kumkum',
    description: 'Pure red kumkum',
    price: 89,
    category: 'Puja Essentials',
    stock: 200,
    rating: 4.3,
    image: 'https://picsum.photos/seed/kumkum/400/400',
  });
  record('Devotee adds product via vendor endpoint', addProd.status === 200, addProd.status, addProd.status !== 200 ? JSON.stringify(addProd.data) : undefined);

  const listProd = await get(`/api/vendor/products/${uid}`);
  record('Devotee lists own products', listProd.status === 200 && Array.isArray(listProd.data), listProd.status);
  record('Devotee product visible in list', Array.isArray(listProd.data) && listProd.data.length >= 1, undefined, `count=${listProd.data?.length}`);

  // Add a second product
  await post('/api/vendor/products', {
    vendorId: uid,
    name: 'Tulsi Mala',
    description: '108 bead tulsi mala',
    price: 249,
    category: 'Mala',
    stock: 50,
    rating: 4.6,
    image: 'https://picsum.photos/seed/mala/400/400',
  });

  const topProd = await get(`/api/vendor/top-products/${uid}`);
  record('Devotee-vendor top products endpoint', topProd.status === 200 && Array.isArray(topProd.data), topProd.status);

  // Update product
  if (Array.isArray(listProd.data) && listProd.data.length > 0) {
    const pid = listProd.data[0].id;
    const upd = await put(`/api/vendor/products/${pid}`, { name: 'Updated Kumkum Premium', price: 99, stock: 180, category: 'Puja Essentials', rating: 4.5 });
    record('Devotee updates own product', upd.status === 200, upd.status);

    // Delete product
    const delR = await del(`/api/vendor/products/${pid}`);
    record('Devotee deletes own product', delR.status === 200, delR.status);
  }

  // ── Step 3: Devotee formally applies to become a vendor ──────────────────────
  log('\n📋 [3] Devotee formally applies to become Vendor');

  const vreg = await post('/api/vendor/register', {
    userId: uid,
    businessName: 'Dual Role Store',
    businessType: 'Shop',
    description: 'Selling puja items',
    contactPhone: '9000000001',
    contactAddress: 'Rishikesh, UK',
  });
  record('Vendor registration request submitted', vreg.status === 200 && vreg.data?.success, vreg.status, vreg.status !== 200 ? JSON.stringify(vreg.data) : undefined);

  // Confirm vendorStatus is pending
  const profile = await get(`/api/users/${uid}`);
  record('User profile shows vendorStatus=pending', profile.data?.vendorStatus === 'pending', profile.status);

  // Try re-submitting — should be blocked
  const reReg = await post('/api/vendor/register', { userId: uid, businessName: 'Again', businessType: 'Shop', description: 'retry' });
  record('Duplicate vendor registration rejected (400)', reReg.status === 400, reReg.status);

  // ── Step 4: Admin approves the devotee as vendor ──────────────────────────────
  log('\n✅ [4] Admin approves Devotee → Vendor');

  const approve = await post('/api/admin/approve-vendor', { vendorId: uid });
  record('Admin approves vendor', approve.status === 200, approve.status);

  // Check role is now vendor
  const profileAfter = await get(`/api/users/${uid}`);
  record('Role updated to vendor after approval', profileAfter.data?.role === 'vendor', profileAfter.status, `role=${profileAfter.data?.role}`);
  record('vendorStatus=approved after approval', profileAfter.data?.vendorStatus === 'approved', profileAfter.status);

  // Login again — role should be vendor now
  const loginVend = await post('/api/auth/login', { email, password: pw });
  record('Re-login after approval returns role=vendor', loginVend.status === 200 && loginVend.data?.user?.role === 'vendor', loginVend.status);

  // ── Step 5: Now acting fully as vendor — add more products ───────────────────
  log('\n📦 [5] Now-approved vendor adds products');

  const addP2 = await post('/api/vendor/products', {
    vendorId: uid,
    name: 'Camphor Tablets',
    description: 'Pure camphor for aarti',
    price: 59,
    category: 'Puja Essentials',
    stock: 500,
    rating: 4.8,
    image: 'https://picsum.photos/seed/camphor/400/400',
  });
  record('Approved vendor adds product', addP2.status === 200, addP2.status);

  const finalList = await get(`/api/vendor/products/${uid}`);
  record('Approved vendor product list ≥1', Array.isArray(finalList.data) && finalList.data.length >= 1, finalList.status, `count=${finalList.data?.length}`);

  // ── Step 6: Admin can see this vendor in the dashboard ────────────────────────
  log('\n🛡️  [6] Admin sees vendor in all-vendors dashboard');

  const allVendors = await get('/api/admin/all-vendors');
  const found = Array.isArray(allVendors.data) && allVendors.data.some((v: any) => v.uid === uid);
  record('New vendor visible in admin all-vendors', found, allVendors.status, !found ? `uid ${uid} not found` : undefined);

  const pendingVendors = await get('/api/admin/pending-vendors');
  record('Pending vendors list accessible', pendingVendors.status === 200, pendingVendors.status);

  // ── Summary ───────────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  log(`\n📊 Dual-Role Results: ${passed}/${total} passed`);

  // ── Append to FullTestReport3-may.md ─────────────────────────────────────────
  const section = `

---

## 👤 Section 6 — User (Devotee) as Vendor — Dual-Role Test
> **Run:** ${ts}

### Scenario
A single account goes through the full lifecycle:
Devotee signup → lists products as devotee → applies for vendor → admin approves → acts as full vendor

| # | Test | Status | HTTP |
|---|------|--------|------|
${results.map((r, i) => `| ${i + 1} | ${r.name} | ${r.passed ? '✅ PASS' : '❌ FAIL'} | ${r.status ?? '—'} |`).join('\n')}

**Dual-Role Pass Rate: ${passed}/${total} (${Math.round(passed/total*100)}%)**

### Dual-Role Flow Summary
\`\`\`
1. Register as devotee (role=devotee)
2. Add/List/Update/Delete products via /api/vendor/products (devotee can act as vendor)
3. Submit vendor registration → vendorStatus=pending
4. Admin approves → role=vendor, vendorStatus=approved
5. Login again → role=vendor confirmed
6. Add more products as approved vendor
7. Visible in admin all-vendors dashboard
\`\`\`

### Test Account Used
| Field | Value |
|-------|-------|
| Email | \`${email}\` |
| Password | \`DualRole@123\` |
| Initial Role | devotee |
| Final Role | vendor (admin-approved) |
`;

  try {
    const existing = await readFile('FullTestReport3-may.md', 'utf8');
    await writeFile('FullTestReport3-may.md', existing + section, 'utf8');
    log('📄 Appended to FullTestReport3-may.md');
  } catch {
    await writeFile('FullTestReport3-may.md', section, 'utf8');
    log('📄 Created FullTestReport3-may.md');
  }
}

main().catch(e => { console.error('Runner failed:', e.message); process.exit(1); });
