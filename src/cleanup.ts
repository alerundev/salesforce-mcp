/**
 * Seed 데이터 삭제 스크립트 (Salesforce 기본 샘플 데이터는 유지)
 * 실행: npm run cleanup
 */
import https from 'https';

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getToken(): Promise<{ token: string; base: string }> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env['SF_CONSUMER_KEY']!,
    client_secret: process.env['SF_CONSUMER_SECRET']!,
  }).toString();

  const hostname = new URL(process.env['SF_LOGIN_URL'] || 'https://login.salesforce.com').hostname;
  const data = await new Promise<any>((resolve, reject) => {
    const req = https.request({
      hostname, path: '/services/oauth2/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => { let r = ''; res.on('data', c => r += c); res.on('end', () => resolve(JSON.parse(r))); });
    req.on('error', reject); req.write(body); req.end();
  });
  if (!data.access_token) throw new Error(data.error_description);
  return { token: data.access_token, base: data.instance_url };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function queryIds(token: string, base: string, soql: string): Promise<string[]> {
  const path = `/services/data/v59.0/query?q=${encodeURIComponent(soql)}`;
  const data = await new Promise<any>((resolve, reject) => {
    const req = https.request({
      hostname: new URL(base).hostname, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, res => { let r = ''; res.on('data', c => r += c); res.on('end', () => resolve(JSON.parse(r))); });
    req.on('error', reject); req.end();
  });
  return (data.records || []).map((r: any) => r.Id);
}

async function deleteRecord(token: string, base: string, sobject: string, id: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = https.request({
      hostname: new URL(base).hostname,
      path: `/services/data/v59.0/sobjects/${sobject}/${id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }, res => { res.resume(); res.on('end', resolve); });
    req.on('error', reject); req.end();
  });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Cleanup ───────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log('🗑️  Seed 데이터 삭제 시작...\n');
  const { token, base } = await getToken();
  console.log('✅ Salesforce Connected:', base);

  // ── 1. Tasks 삭제 (Subject에 제품명 포함) ──────────────────────────────────
  console.log('\n📋 Tasks 삭제 중...');
  const products = ['HBM3E', 'DDR5', 'LPDDR5X', 'NAND', 'SSD', 'CIS', 'eUFS', 'LPDDR5', 'NVIDIA 파트너십', 'Apple 차세대', '글로벌 AI'];
  let taskCount = 0;
  for (const p of products) {
    const ids = await queryIds(token, base, `SELECT Id FROM Task WHERE Subject LIKE '%${p}%' LIMIT 200`);
    for (const id of ids) {
      await deleteRecord(token, base, 'Task', id);
      taskCount++;
      await sleep(30);
    }
  }
  console.log(`  ✅ Tasks ${taskCount}개 삭제 완료`);

  // ── 2. Opportunities 삭제 (Name에 [제품명] 포함) ───────────────────────────
  console.log('\n💰 Opportunities 삭제 중...');
  const oppProducts = ['[HBM3E]', '[DDR5]', '[LPDDR5X]', '[NAND]', '[SSD]', '[CIS]', '[eUFS]', '[LPDDR5]'];
  let oppCount = 0;
  for (const p of oppProducts) {
    const ids = await queryIds(token, base, `SELECT Id FROM Opportunity WHERE Name LIKE '%${p}%' LIMIT 200`);
    for (const id of ids) {
      await deleteRecord(token, base, 'Opportunity', id);
      oppCount++;
      await sleep(30);
    }
  }
  console.log(`  ✅ Opportunities ${oppCount}개 삭제 완료`);

  // ── 3. Contacts 삭제 (seed 이메일 도메인으로 필터) ─────────────────────────
  console.log('\n👤 Contacts 삭제 중...');
  const contactDomains = ['apple.com', 'nvidia.com', 'amd.com', 'qualcomm.com', 'intel.com', 'meta.com', 'google.com', 'tesla.com', 'sony.com', 'toyota.com', 'toshiba.com', 'mediatek.com', 'asus.com', 'auoptronics.com', 'xiaomi.com', 'alibaba.com', 'oppo.com', 'bosch.com', 'infineon.com', 'st.com'];
  let contactCount = 0;
  for (const domain of contactDomains) {
    const ids = await queryIds(token, base, `SELECT Id FROM Contact WHERE Email LIKE '%@${domain}' LIMIT 200`);
    for (const id of ids) {
      await deleteRecord(token, base, 'Contact', id);
      contactCount++;
      await sleep(30);
    }
  }
  console.log(`  ✅ Contacts ${contactCount}개 삭제 완료`);

  // ── 4. Leads 삭제 (seed 이메일 주소로 필터) ────────────────────────────────
  console.log('\n🎯 Leads 삭제 중...');
  const leadEmails = [
    'm.anderson@microsoft.com', 'j.taylor@aws.amazon.com', 'd.wilson@micron.com',
    'r.moore@wdc.com', 'c.harris@oracle.com', 'a.clark@broadcom.com',
    's.lewis@marvell.com', 'n.robinson@ibm.com', 'h.wagner@vw.com',
    's.dubois@renault.com', 'm.ferrari@lamborghini.com', 'e.nielsen@ericsson.com',
    'l.bianchi@st.com', 'p.fischer@sap.com', 'm.garcia@airbus.com',
    't.ito@nikon.com', 'm.watanabe@fujitsu.com', 'y.matsumoto@sharp.com',
    't.nakamura@murata.com', 'n.takahashi@canon.com', 'l.zhao@huawei.com',
    'l.sun@vivo.com', 'j.chen@boe.com', 'm.zhou@lenovo.com', 'h.wu@baidu.com',
    'jh.kim@lg.com', 'sj.lee@hyundai.com', 'mc.park@kt.com', 'yr.choi@naver.com',
    'r.patel@tata.com', 'p.sharma@jio.com', 'a.ibrahim@petronas.com',
    's.wongkun@pttdigital.com', 'm.rashid@sabic.com', 'a.hassan@mubadala.com',
  ];
  let leadCount = 0;
  for (const email of leadEmails) {
    const ids = await queryIds(token, base, `SELECT Id FROM Lead WHERE Email = '${email}' LIMIT 10`);
    for (const id of ids) {
      await deleteRecord(token, base, 'Lead', id);
      leadCount++;
      await sleep(30);
    }
  }
  console.log(`  ✅ Leads ${leadCount}개 삭제 완료`);

  // ── 5. Accounts 삭제 (seed 회사명으로 필터) ────────────────────────────────
  console.log('\n📦 Accounts 삭제 중...');
  const accountNames = [
    'Apple Inc.', 'NVIDIA Corporation', 'AMD Inc.', 'Qualcomm Technologies',
    'Intel Corporation', 'Meta Platforms', 'Google LLC', 'Tesla Inc.',
    'Sony Semiconductor', 'Toyota Motor Corporation', 'Toshiba Electronic Devices',
    'MediaTek Inc.', 'ASUSTeK Computer', 'AU Optronics', 'Xiaomi Corporation',
    'Alibaba Cloud', 'OPPO Electronics', 'Bosch Semiconductor',
    'Infineon Technologies', 'STMicroelectronics',
  ];
  let accountCount = 0;
  for (const name of accountNames) {
    const escapedName = name.replace(/'/g, "\\'");
    const ids = await queryIds(token, base, `SELECT Id FROM Account WHERE Name = '${escapedName}' LIMIT 10`);
    for (const id of ids) {
      await deleteRecord(token, base, 'Account', id);
      accountCount++;
      await sleep(30);
    }
  }
  console.log(`  ✅ Accounts ${accountCount}개 삭제 완료`);

  console.log('\n🎉 Seed 데이터 삭제 완료!');
  console.log('   Salesforce 기본 샘플 데이터는 유지됩니다.');
  console.log('   이제 npm run seed 를 실행하세요.');
}

cleanup().catch((err: Error) => {
  console.error('❌ 실패:', err.message);
  process.exit(1);
});
