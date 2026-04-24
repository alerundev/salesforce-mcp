/**
 * Seed 데이터 삭제 스크립트 (SK케미칼 글로벌 영업 샘플 데이터)
 * 실행: npm run cleanup
 *
 * Contact 삭제를 Account.Name 기반으로 처리 (도메인 누락 버그 수정)
 */
import https from 'https';

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
    }, res => { let r = ''; res.on('data', (c: Buffer) => r += c); res.on('end', () => resolve(JSON.parse(r))); });
    req.on('error', reject); req.write(body); req.end();
  });
  if (!data.access_token) throw new Error(data.error_description);
  return { token: data.access_token, base: data.instance_url };
}

async function queryIds(token: string, base: string, soql: string): Promise<string[]> {
  const path = `/services/data/v59.0/query?q=${encodeURIComponent(soql)}`;
  const data = await new Promise<any>((resolve, reject) => {
    const req = https.request({
      hostname: new URL(base).hostname, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, res => { let r = ''; res.on('data', (c: Buffer) => r += c); res.on('end', () => resolve(JSON.parse(r))); });
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

const ACCOUNT_NAMES = [
  "L'Oreal", 'Estee Lauder Companies', 'Shiseido', 'Amorepacific',
  'LVMH Parfums Cosmetiques', 'Toly Group', 'Aptar Group', 'Albea Group',
  'Nestle', 'Danone', 'PepsiCo', 'Coca-Cola Company',
  'Amcor', 'Berry Global', 'Samsung Electronics', 'LG Electronics',
  'Panasonic', 'Philips', 'Midea Group', 'Hyundai Motor',
  'BMW Group', 'Volkswagen Group', 'Toyota Motor', 'Durmont',
  'Lear Corporation', 'Bosch', 'TE Connectivity', 'Molex',
  'Foxconn', 'Sumitomo Electric', 'AkzoNobel', 'PPG Industries',
  'BASF Coatings', 'Sherwin-Williams', 'POSCO',
  'Hyosung Advanced Materials', 'Toray Industries', 'Indorama Ventures',
  'Evonik Industries', 'Lonza Group',
];

const SK_PRODUCTS = [
  'SKYGREEN', 'ECOZEN', 'ECOTRIA', 'SKYPET CR', 'SKYPURA',
  'SKYPEL', 'SKYTRA', 'SKYBON', 'SKYDMT', 'SKYCHDM',
  'SKYDMCD', 'SKYCHDA', 'ECOTRION', 'CnR',
];

const TASK_KEYWORDS = [
  ...SK_PRODUCTS,
  'SK케미칼 글로벌', 'SK케미칼 연간', 'SK케미칼 Chinaplas',
  'SK케미칼 NPE', 'SK케미칼 LUXE', 'SK케미칼 Drinktec',
  'SK케미칼 K-Show', 'SK케미칼 Toyota', 'SK케미칼 AkzoNobel',
  'SK케미칼 Hyosung', 'SK케미칼 Lonza', 'SK케미칼 중동', 'SK케미칼 삼성',
];

const LEAD_EMAILS = [
  'o.schmidt@henkel.com', 'e.wilson@unilever.com', 'l.mueller@basf.com',
  's.leroy@pernodricard.com', 'j.deboer@heineken.com', 'l.fischer@mdlz.com',
  'm.rossi@ferrero.com', 'k.novak@siegwerk.com', 'a.kowalski@orlen.pl',
  'p.moreau@airliquide.com', 'g.lindqvist@neste.com', 'i.hansen@orkla.com',
  'j.murphy@reckitt.com', 'f.wagner@covestro.com', 'h.svensson@essity.com',
  'd.garcia@repsol.com', 'r.bianchi@mapei.com', 'm.hofer@antonpaar.com',
  't.bauer@linde.com', 'p.martinez@alpek.com', 'c.dubois@loccitane.com',
  'l.eriksson@alfalaval.com', 'n.petrov@gazpromneft.ru', 'e.vasquez@inditex.com',
  'm.brennan@crh.com', 'a.blanc@tereos.com', 's.hoffmann@wacker.com',
  'f.macallister@dssmith.com', 'a.sharma@tatachemicals.com', 'm.conti@snam.it',
  'j.adams@pg.com', 'd.miller@churchdwight.com', 'l.thompson@colgate.com',
  'k.brown@graphicpkg.com', 'p.white@pactivevergreen.com', 'b.taylor@sealedair.com',
  'n.clark@sonoco.com', 'r.johnson@eastman.com', 'h.martinez@averydennison.com',
  's.anderson@bemis.com', 'm.lee@aptargroup.com', 'c.hernandez@jarden.com',
  'r.robinson@dow.com', 'd.wilson@ashland.com', 's.jackson@momentive.com',
  't.davis@celanese.com', 'a.harris@iff.com', 'm.taylor@albemarle.com',
  'd.moore@cabot-corp.com', 'p.thompson@hbfuller.com', 'k.lewis@rpminc.com',
  'g.brown@sunchemical.com', 'd.wilson2@ferro.com', 'c.johnson@cytec.com',
  'r.davis@gore.com', 'i.ito@kao.com', 'm.watanabe@lion.co.jp',
  'h.takahashi@ajinomoto.com', 'k.nakamura@nipponpaint.co.jp', 'y.sasaki@teijin.co.jp',
  'mj.kim@samsung.com', 'jh.lee2@lotte.com', 'sm.park@kolon.com',
  'jh.choi@hanwha.com', 'w.zhang@haier.com', 'n.li@hisense.com',
  'w.wang@byd.com', 'xm.chen@catl.com', 's.rahimah@lhplus.com',
  's.wongkun@thaiunion.com', 'a.singh@ril.com', 'r.kumar@tatachemicals.com',
  'b.santoso@indofood.com', 'nm.nguyen@vingroup.vn', 'j.yamada@nitto.com',
  'gd.hong@skinnovation.com', 'w.huang@fosun.com', 'ys.na@kkpc.com',
  'k.yamamoto@m-chemical.co.jp', 'jw.park@lgchem.com',
  'm.rashid@sabic.com', 'a.hassan@mubadala.com', 'f.ibrahim@qapco.com',
  'k.mansouri@taqa.com', 'c.mendoza@braskem.com', 'a.silva@embraer.com',
  'f.torres@alpek.com', 'g.ramirez@grupobimbo.com', 't.nkosi@sasol.com',
  'l.ahmadi@npc.ir', 's.vasquez@sqm.com', 'n.khalil@egpc.com.eg',
  'r.patel@aartiind.com', 'o.abdullah@kpc.com.kw', 'i.fernandez@pdvsa.com',
  'y.asante@ghanabauxite.com', 'p.nair@ongcpetro.com', 'a.zahrani@tasnee.com',
  'c.rodriguez2@petrobras.com', 'j.morales@pemex.com', 's.oduya@dangote.com',
];

async function cleanup() {
  console.log('🗑️  SK Chemicals Seed 데이터 삭제 시작...\n');
  const { token, base } = await getToken();
  console.log('✅ Salesforce Connected:', base);

  // 1. Tasks 삭제
  console.log('\n📋 Tasks 삭제 중...');
  let taskCount = 0;
  for (const keyword of TASK_KEYWORDS) {
    const escaped = keyword.replace(/'/g, "\\'");
    const ids = await queryIds(token, base, `SELECT Id FROM Task WHERE Subject LIKE '%${escaped}%' LIMIT 200`);
    for (const id of ids) { await deleteRecord(token, base, 'Task', id); taskCount++; await sleep(30); }
  }
  console.log(`  ✅ Tasks ${taskCount}개 삭제 완료`);

  // 2. Opportunities 삭제
  console.log('\n💰 Opportunities 삭제 중...');
  let oppCount = 0;
  for (const product of SK_PRODUCTS) {
    const escaped = product.replace(/'/g, "\\'");
    const ids = await queryIds(token, base, `SELECT Id FROM Opportunity WHERE Name LIKE '%[${escaped}]%' LIMIT 200`);
    for (const id of ids) { await deleteRecord(token, base, 'Opportunity', id); oppCount++; await sleep(30); }
  }
  console.log(`  ✅ Opportunities ${oppCount}개 삭제 완료`);

  // 3. Contacts 삭제 (Account.Name 기반)
  console.log('\n👤 Contacts 삭제 중...');
  let contactCount = 0;
  for (const name of ACCOUNT_NAMES) {
    const escaped = name.replace(/'/g, "\\'");
    const ids = await queryIds(token, base, `SELECT Id FROM Contact WHERE Account.Name = '${escaped}' LIMIT 200`);
    for (const id of ids) { await deleteRecord(token, base, 'Contact', id); contactCount++; await sleep(30); }
  }
  console.log(`  ✅ Contacts ${contactCount}개 삭제 완료`);

  // 4. Leads 삭제
  console.log('\n🎯 Leads 삭제 중...');
  let leadCount = 0;
  for (const email of LEAD_EMAILS) {
    const ids = await queryIds(token, base, `SELECT Id FROM Lead WHERE Email = '${email}' LIMIT 10`);
    for (const id of ids) { await deleteRecord(token, base, 'Lead', id); leadCount++; await sleep(30); }
  }
  console.log(`  ✅ Leads ${leadCount}개 삭제 완료`);

  // 5. Accounts 삭제
  console.log('\n📦 Accounts 삭제 중...');
  let accountCount = 0;
  for (const name of ACCOUNT_NAMES) {
    const escaped = name.replace(/'/g, "\\'");
    const ids = await queryIds(token, base, `SELECT Id FROM Account WHERE Name = '${escaped}' LIMIT 10`);
    for (const id of ids) { await deleteRecord(token, base, 'Account', id); accountCount++; await sleep(30); }
  }
  console.log(`  ✅ Accounts ${accountCount}개 삭제 완료`);

  console.log('\n🎉 삭제 완료!');
  console.log(`   Task: ${taskCount} / Opportunity: ${oppCount} / Contact: ${contactCount} / Lead: ${leadCount} / Account: ${accountCount}`);
  console.log(`   합계: ${taskCount + oppCount + contactCount + leadCount + accountCount}개`);
  console.log('\n   이제 npm run seed 를 실행하세요.');
}

cleanup().catch((err: Error) => {
  console.error('❌ 실패:', err.message);
  process.exit(1);
});
