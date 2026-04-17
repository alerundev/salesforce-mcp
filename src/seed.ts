/**
 * Samsung Electronics Semiconductor Sales - Sample Data Seed Script
 * 삼성전자 반도체 영업 샘플 데이터 시딩
 *
 * Objects: Account(20) + Contact(30) + Opportunity(80) + Lead(40) + Task(30) = 200개
 * Products: HBM, DDR5, LPDDR5, NAND, SSD, CIS, eUFS
 *
 * Run: npm run seed
 */
import https from 'https';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  instance_url: string;
  error?: string;
  error_description?: string;
}

interface CreateResult {
  id: string;
  success: boolean;
  errors: unknown[];
}

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getToken(): Promise<{ token: string; base: string }> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env['SF_CONSUMER_KEY']!,
    client_secret: process.env['SF_CONSUMER_SECRET']!,
  }).toString();

  const loginHost = new URL(process.env['SF_LOGIN_URL'] || 'https://login.salesforce.com').hostname;

  const data: TokenResponse = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: loginHost,
      path: '/services/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  if (!data.access_token) throw new Error(data.error_description || JSON.stringify(data));
  console.log('✅ Salesforce Connected:', data.instance_url);
  return { token: data.access_token, base: data.instance_url };
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function create(
  token: string,
  base: string,
  sobject: string,
  record: Record<string, unknown>
): Promise<string> {
  const body = JSON.stringify(record);
  const result: CreateResult = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: new URL(base).hostname,
      path: `/services/data/v59.0/sobjects/${sobject}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Sforce-Duplicate-Rule-Header': 'allowSave=true',
      },
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  if (!result.success) {
    console.warn(`  ⚠️ Failed: ${JSON.stringify(result)}`);
    return '';
  }
  return result.id;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Seed Data ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Samsung Electronics Semiconductor Sales - Data Seeding Start\n');
  const { token, base } = await getToken();

  // ── 1. Accounts (20개) ───────────────────────────────────────────────────────
  console.log('\n📦 Creating Accounts (20)...');

  const accountDefs = [
    // USA (8)
    { Name: 'Apple Inc.', Industry: 'Electronics', AnnualRevenue: 394000000000, BillingCity: 'Cupertino', BillingCountry: 'United States', NumberOfEmployees: 164000, Phone: '+1-408-996-1010', Description: 'iPhone/Mac용 HBM, LPDDR5, NAND 최대 구매처' },
    { Name: 'NVIDIA Corporation', Industry: 'Electronics', AnnualRevenue: 60000000000, BillingCity: 'Santa Clara', BillingCountry: 'United States', NumberOfEmployees: 29600, Phone: '+1-408-486-2000', Description: 'AI GPU용 HBM3E 최대 수요처, H100/H200 탑재' },
    { Name: 'AMD Inc.', Industry: 'Electronics', AnnualRevenue: 22700000000, BillingCity: 'Santa Clara', BillingCountry: 'United States', NumberOfEmployees: 26000, Phone: '+1-408-749-4000', Description: 'EPYC 서버 CPU용 DDR5, HBM 공급' },
    { Name: 'Qualcomm Technologies', Industry: 'Electronics', AnnualRevenue: 35820000000, BillingCity: 'San Diego', BillingCountry: 'United States', NumberOfEmployees: 51000, Phone: '+1-858-587-1121', Description: 'Snapdragon용 LPDDR5X, eUFS 주요 고객' },
    { Name: 'Intel Corporation', Industry: 'Electronics', AnnualRevenue: 54200000000, BillingCity: 'Santa Clara', BillingCountry: 'United States', NumberOfEmployees: 131900, Phone: '+1-408-765-8080', Description: '데이터센터 서버용 DDR5, HBM 공급' },
    { Name: 'Meta Platforms', Industry: 'Technology', AnnualRevenue: 134900000000, BillingCity: 'Menlo Park', BillingCountry: 'United States', NumberOfEmployees: 86482, Phone: '+1-650-543-4800', Description: 'AI 인프라용 HBM3E 대규모 구매' },
    { Name: 'Google LLC', Industry: 'Technology', AnnualRevenue: 282800000000, BillingCity: 'Mountain View', BillingCountry: 'United States', NumberOfEmployees: 182381, Phone: '+1-650-253-0000', Description: 'TPU용 HBM, 데이터센터 SSD 공급' },
    { Name: 'Tesla Inc.', Industry: 'Automotive', AnnualRevenue: 96700000000, BillingCity: 'Austin', BillingCountry: 'United States', NumberOfEmployees: 127855, Phone: '+1-512-516-8177', Description: 'FSD 칩용 LPDDR5, 자동차용 NAND' },
    // Japan (3)
    { Name: 'Sony Semiconductor', Industry: 'Electronics', AnnualRevenue: 89000000000, BillingCity: 'Tokyo', BillingCountry: 'Japan', NumberOfEmployees: 113000, Phone: '+81-3-6748-2111', Description: 'CIS(이미지센서) 경쟁사이자 협력사, DRAM 공급' },
    { Name: 'Toyota Motor Corporation', Industry: 'Automotive', AnnualRevenue: 274000000000, BillingCity: 'Toyota City', BillingCountry: 'Japan', NumberOfEmployees: 372817, Phone: '+81-565-28-2121', Description: '자율주행용 LPDDR5, 차량용 SSD' },
    { Name: 'Toshiba Electronic Devices', Industry: 'Electronics', AnnualRevenue: 30000000000, BillingCity: 'Kawasaki', BillingCountry: 'Japan', NumberOfEmployees: 117000, Phone: '+81-3-3457-4511', Description: '산업용 SSD, NAND 모듈 공급' },
    // Taiwan (3)
    { Name: 'MediaTek Inc.', Industry: 'Electronics', AnnualRevenue: 17600000000, BillingCity: 'Hsinchu', BillingCountry: 'Taiwan', NumberOfEmployees: 20000, Phone: '+886-3-567-0766', Description: 'Dimensity SoC용 LPDDR5X, eUFS 주요 고객' },
    { Name: 'ASUSTeK Computer', Industry: 'Electronics', AnnualRevenue: 16000000000, BillingCity: 'Taipei', BillingCountry: 'Taiwan', NumberOfEmployees: 17000, Phone: '+886-2-2894-3447', Description: 'AI PC 및 서버용 DDR5, SSD 공급' },
    { Name: 'AU Optronics', Industry: 'Electronics', AnnualRevenue: 12000000000, BillingCity: 'Hsinchu', BillingCountry: 'Taiwan', NumberOfEmployees: 56000, Phone: '+886-3-500-8800', Description: '디스플레이 드라이버용 반도체 협력' },
    // China (3)
    { Name: 'Xiaomi Corporation', Industry: 'Electronics', AnnualRevenue: 36000000000, BillingCity: 'Beijing', BillingCountry: 'China', NumberOfEmployees: 35314, Phone: '+86-10-6060-6666', Description: '스마트폰용 LPDDR5, eUFS, CIS 구매' },
    { Name: 'Alibaba Cloud', Industry: 'Technology', AnnualRevenue: 25000000000, BillingCity: 'Hangzhou', BillingCountry: 'China', NumberOfEmployees: 235000, Phone: '+86-571-8502-2088', Description: '클라우드 데이터센터용 HBM, SSD 수요' },
    { Name: 'OPPO Electronics', Industry: 'Electronics', AnnualRevenue: 18000000000, BillingCity: 'Dongguan', BillingCountry: 'China', NumberOfEmployees: 40000, Phone: '+86-769-8810-0000', Description: '스마트폰용 LPDDR5X, eUFS, CIS 공급' },
    // Europe (3)
    { Name: 'Bosch Semiconductor', Industry: 'Electronics', AnnualRevenue: 91600000000, BillingCity: 'Stuttgart', BillingCountry: 'Germany', NumberOfEmployees: 429000, Phone: '+49-711-811-0', Description: '자동차 반도체, 차량용 NAND 공급' },
    { Name: 'Infineon Technologies', Industry: 'Electronics', AnnualRevenue: 16000000000, BillingCity: 'Munich', BillingCountry: 'Germany', NumberOfEmployees: 58644, Phone: '+49-89-234-0', Description: '전력반도체 보완재, IoT용 NAND' },
    { Name: 'STMicroelectronics', Industry: 'Electronics', AnnualRevenue: 17300000000, BillingCity: 'Geneva', BillingCountry: 'Switzerland', NumberOfEmployees: 50700, Phone: '+41-22-929-2929', Description: '유럽 자동차·산업용 반도체 파트너' },
  ];

  const accountIds: string[] = [];
  for (const acc of accountDefs) {
    const id = await create(token, base, 'Account', acc);
    accountIds.push(id);
    console.log(`  ✅ ${acc.Name} (${acc.BillingCountry})`);
    await sleep(50);
  }

  // ── 2. Contacts (30개) ───────────────────────────────────────────────────────
  console.log('\n👤 Creating Contacts (30)...');

  const contactDefs = [
    // Apple (2)
    { FirstName: 'Jennifer', LastName: 'Kim', Email: 'j.kim@apple.com', Phone: '+1-408-996-2001', Title: 'VP of Component Sourcing', AccountId: accountIds[0] },
    { FirstName: 'Andrew', LastName: 'Park', Email: 'a.park@apple.com', Phone: '+1-408-996-2002', Title: 'Senior Memory Procurement', AccountId: accountIds[0] },
    // NVIDIA (2)
    { FirstName: 'David', LastName: 'Chen', Email: 'd.chen@nvidia.com', Phone: '+1-408-486-3001', Title: 'Director of HBM Procurement', AccountId: accountIds[1] },
    { FirstName: 'Sarah', LastName: 'Williams', Email: 's.williams@nvidia.com', Phone: '+1-408-486-3002', Title: 'AI Infrastructure Lead', AccountId: accountIds[1] },
    // AMD (2)
    { FirstName: 'Michael', LastName: 'Torres', Email: 'm.torres@amd.com', Phone: '+1-408-749-5001', Title: 'Memory Solutions Architect', AccountId: accountIds[2] },
    { FirstName: 'Lisa', LastName: 'Johnson', Email: 'l.johnson@amd.com', Phone: '+1-408-749-5002', Title: 'Supply Chain Director', AccountId: accountIds[2] },
    // Qualcomm (2)
    { FirstName: 'James', LastName: 'Lee', Email: 'j.lee@qualcomm.com', Phone: '+1-858-587-2001', Title: 'Mobile Memory Sourcing Lead', AccountId: accountIds[3] },
    { FirstName: 'Emily', LastName: 'Zhang', Email: 'e.zhang@qualcomm.com', Phone: '+1-858-587-2002', Title: 'SoC Component Manager', AccountId: accountIds[3] },
    // Intel (1)
    { FirstName: 'Robert', LastName: 'Smith', Email: 'r.smith@intel.com', Phone: '+1-408-765-9001', Title: 'Data Center Memory Procurement', AccountId: accountIds[4] },
    // Meta (1)
    { FirstName: 'Kevin', LastName: 'Brown', Email: 'k.brown@meta.com', Phone: '+1-650-543-5001', Title: 'AI Infrastructure Sourcing', AccountId: accountIds[5] },
    // Google (1)
    { FirstName: 'Michelle', LastName: 'Wang', Email: 'm.wang@google.com', Phone: '+1-650-253-1001', Title: 'Cloud Hardware Procurement', AccountId: accountIds[6] },
    // Tesla (1)
    { FirstName: 'Thomas', LastName: 'Wright', Email: 't.wright@tesla.com', Phone: '+1-512-516-9001', Title: 'Automotive Semiconductor Lead', AccountId: accountIds[7] },
    // Sony (2)
    { FirstName: '田中', LastName: '浩一', Email: 'k.tanaka@sony.com', Phone: '+81-3-6748-3001', Title: '調達部長', AccountId: accountIds[8] },
    { FirstName: '山本', LastName: '花子', Email: 'h.yamamoto@sony.com', Phone: '+81-3-6748-3002', Title: 'メモリ部門マネージャー', AccountId: accountIds[8] },
    // Toyota (1)
    { FirstName: '佐藤', LastName: '健太', Email: 'k.sato@toyota.com', Phone: '+81-565-28-3001', Title: '自動車半導体調達担当', AccountId: accountIds[9] },
    // Toshiba (1)
    { FirstName: '鈴木', LastName: '一郎', Email: 'i.suzuki@toshiba.com', Phone: '+81-3-3457-5001', Title: 'NAND調達マネージャー', AccountId: accountIds[10] },
    // MediaTek (2)
    { FirstName: '陳', LastName: '志明', Email: 'z.chen@mediatek.com', Phone: '+886-3-567-1001', Title: 'Memory Sourcing Director', AccountId: accountIds[11] },
    { FirstName: '林', LastName: '佳慧', Email: 'c.lin@mediatek.com', Phone: '+886-3-567-1002', Title: 'Component Procurement Lead', AccountId: accountIds[11] },
    // ASUSTeK (1)
    { FirstName: '張', LastName: '偉豪', Email: 'w.chang@asus.com', Phone: '+886-2-2894-4001', Title: 'AI PC Memory Sourcing', AccountId: accountIds[12] },
    // Xiaomi (2)
    { FirstName: '王', LastName: '海涛', Email: 'h.wang@xiaomi.com', Phone: '+86-10-6060-7001', Title: '存储采购总监', AccountId: accountIds[14] },
    { FirstName: '李', LastName: '明', Email: 'm.li@xiaomi.com', Phone: '+86-10-6060-7002', Title: '影像传感器采购经理', AccountId: accountIds[14] },
    // Alibaba (1)
    { FirstName: '张', LastName: '伟', Email: 'w.zhang@alibaba.com', Phone: '+86-571-8502-3001', Title: '云計算基础设施采购', AccountId: accountIds[15] },
    // OPPO (1)
    { FirstName: '刘', LastName: '强', Email: 'q.liu@oppo.com', Phone: '+86-769-8810-1001', Title: '手机元器件采购总监', AccountId: accountIds[16] },
    // Bosch (2)
    { FirstName: 'Klaus', LastName: 'Mueller', Email: 'k.mueller@bosch.com', Phone: '+49-711-811-1001', Title: 'Automotive Semiconductor Sourcing', AccountId: accountIds[17] },
    { FirstName: 'Anna', LastName: 'Schmidt', Email: 'a.schmidt@bosch.com', Phone: '+49-711-811-1002', Title: 'Supply Chain Manager', AccountId: accountIds[17] },
    // Infineon (1)
    { FirstName: 'Hans', LastName: 'Weber', Email: 'h.weber@infineon.com', Phone: '+49-89-234-1001', Title: 'IoT Memory Procurement', AccountId: accountIds[18] },
    // STMicro (1)
    { FirstName: 'Pierre', LastName: 'Dupont', Email: 'p.dupont@st.com', Phone: '+41-22-929-3001', Title: 'Component Sourcing Lead', AccountId: accountIds[19] },
    // Remaining accounts contacts
    { FirstName: 'Chang', LastName: 'Wei', Email: 'c.wei@auoptronics.com', Phone: '+886-3-500-9001', Title: 'Procurement Manager', AccountId: accountIds[13] },
    { FirstName: 'Yuki', LastName: 'Nakamura', Email: 'y.nakamura@toyota.com', Phone: '+81-565-28-3002', Title: 'EV Component Sourcing', AccountId: accountIds[9] },
    { FirstName: 'Carlos', LastName: 'Garcia', Email: 'c.garcia@tesla.com', Phone: '+1-512-516-9002', Title: 'Autopilot Chip Procurement', AccountId: accountIds[7] },
  ];

  for (const c of contactDefs) {
    await create(token, base, 'Contact', c);
    console.log(`  ✅ ${c.FirstName} ${c.LastName} (${c.Title})`);
    await sleep(50);
  }

  // ── 3. Opportunities (80개) ──────────────────────────────────────────────────
  console.log('\n💰 Creating Opportunities (80)...');

  const products = [
    { name: 'HBM3E', desc: '고대역폭 메모리 (AI/HPC용)', accounts: [1, 2, 3, 5, 6] },
    { name: 'DDR5', desc: '서버/PC 메인 메모리', accounts: [4, 0, 2, 7, 12] },
    { name: 'LPDDR5X', desc: '모바일 저전력 메모리', accounts: [0, 3, 11, 14, 16] },
    { name: 'NAND', desc: '낸드플래시 스토리지', accounts: [7, 9, 10, 17, 18] },
    { name: 'SSD', desc: '솔리드스테이트 드라이브', accounts: [6, 12, 15, 7, 4] },
    { name: 'CIS', desc: 'CMOS 이미지센서', accounts: [0, 3, 14, 16, 8] },
    { name: 'eUFS', desc: '임베디드 UFS 스토리지', accounts: [3, 11, 14, 16, 0] },
    { name: 'LPDDR5', desc: '모바일 메모리 (표준형)', accounts: [9, 7, 11, 13, 19] },
  ];

  const stages = ['Prospecting', 'Qualification', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'];
  const stageWeights = [2, 2, 2, 2, 3, 1]; // Closed Won 많게

  function weightedStage(): string {
    const total = stageWeights.reduce((a, b) => a + b, 0);
    let rand = Math.floor(Math.random() * total);
    for (let i = 0; i < stages.length; i++) {
      rand -= stageWeights[i]!;
      if (rand < 0) return stages[i]!;
    }
    return stages[0]!;
  }

  function randomDate(startYear: number, endYear: number): string {
    const start = new Date(`${startYear}-01-01`).getTime();
    const end = new Date(`${endYear}-12-31`).getTime();
    const d = new Date(start + Math.random() * (end - start));
    return d.toISOString().split('T')[0]!;
  }

  function randomAmount(min: number, max: number): number {
    return Math.round((min + Math.random() * (max - min)) / 1000000) * 1000000;
  }

  const projectTypes = [
    '공급 계약', '파일럿 프로그램', '장기 공급 MOU', '기술 검증 프로젝트',
    '차세대 제품 적용', '대규모 구매 협상', '공동 개발 계약', '연간 공급 계약',
  ];

  let oppCount = 0;
  for (const product of products) {
    const count = 10; // 제품당 10개 = 80개 총
    for (let i = 0; i < count; i++) {
      const accIdx = product.accounts[i % product.accounts.length]!;
      const accName = accountDefs[accIdx]?.Name || 'Unknown';
      const projectType = projectTypes[i % projectTypes.length]!;
      const year = Math.random() > 0.4 ? 2026 : 2025;
      const stage = weightedStage();
      const probability = stage === 'Closed Won' ? 100
        : stage === 'Closed Lost' ? 0
        : stage === 'Negotiation/Review' ? Math.floor(70 + Math.random() * 20)
        : stage === 'Proposal/Price Quote' ? Math.floor(50 + Math.random() * 20)
        : stage === 'Qualification' ? Math.floor(30 + Math.random() * 20)
        : Math.floor(10 + Math.random() * 20);

      const opp = {
        Name: `[${product.name}] ${accName} ${projectType}`,
        StageName: stage,
        Amount: randomAmount(5000000, 500000000),
        CloseDate: randomDate(year, year),
        AccountId: accountIds[accIdx],
        Probability: probability,
        Description: `${product.desc} 관련 ${projectType}. ${accName}의 ${product.name} 수요 대응.`,
      };

      await create(token, base, 'Opportunity', opp);
      oppCount++;
      await sleep(50);
    }
    console.log(`  ✅ [${product.name}] ${count}건 완료 (누적: ${oppCount})`);
  }

  // ── 4. Leads (40개) ──────────────────────────────────────────────────────────
  console.log('\n🎯 Creating Leads (40)...');

  const leadDefs = [
    // USA
    { FirstName: 'Mark', LastName: 'Anderson', Company: 'Microsoft Azure', Email: 'm.anderson@microsoft.com', Title: 'Cloud Infrastructure Director', Status: 'Open - Not Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'United States', Phone: '+1-425-882-1001', Description: 'AI 데이터센터용 HBM3E 대규모 수요 문의' },
    { FirstName: 'Jessica', LastName: 'Taylor', Company: 'Amazon Web Services', Email: 'j.taylor@aws.amazon.com', Title: 'Semiconductor Procurement Lead', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'United States', Phone: '+1-206-266-1001', Description: 'HBM 및 고성능 SSD 연간 구매 협의 요청' },
    { FirstName: 'Daniel', LastName: 'Wilson', Company: 'Micron Technology', Email: 'd.wilson@micron.com', Title: 'Technology Partnership Manager', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'United States', Phone: '+1-208-368-1001', Description: 'Cross-licensing 및 기술 협력 문의' },
    { FirstName: 'Rachel', LastName: 'Moore', Company: 'Western Digital', Email: 'r.moore@wdc.com', Title: 'NAND Sourcing Manager', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Warm', Country: 'United States', Phone: '+1-408-721-1001', Description: '엔터프라이즈 SSD 공급 협력 문의' },
    { FirstName: 'Chris', LastName: 'Harris', Company: 'Oracle Cloud', Email: 'c.harris@oracle.com', Title: 'Infrastructure Procurement', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Hot', Country: 'United States', Phone: '+1-512-501-1001', Description: 'AI 학습용 HBM3E 긴급 수요 발생' },
    { FirstName: 'Amanda', LastName: 'Clark', Company: 'Broadcom Inc.', Email: 'a.clark@broadcom.com', Title: 'Memory Solutions Lead', Status: 'Closed - Converted', LeadSource: 'Web', Rating: 'Hot', Country: 'United States', Phone: '+1-408-433-1001', Description: 'AI 네트워킹 칩용 HBM 채택 확정' },
    { FirstName: 'Steven', LastName: 'Lewis', Company: 'Marvell Technology', Email: 's.lewis@marvell.com', Title: 'Product Manager', Status: 'Open - Not Contacted', LeadSource: 'Email', Rating: 'Cold', Country: 'United States', Phone: '+1-408-222-1001', Description: '스토리지 컨트롤러 연계 NAND 문의' },
    { FirstName: 'Nicole', LastName: 'Robinson', Company: 'IBM Systems', Email: 'n.robinson@ibm.com', Title: 'Server Memory Procurement', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'United States', Phone: '+1-914-499-1001', Description: '메인프레임용 DDR5 RDIMM 대규모 수요' },
    // Europe
    { FirstName: 'Hans', LastName: 'Wagner', Company: 'Volkswagen Electronics', Email: 'h.wagner@vw.com', Title: 'Automotive Chip Sourcing', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'Germany', Phone: '+49-5361-9-1001', Description: 'EV 자율주행용 LPDDR5, NAND 대규모 수요' },
    { FirstName: 'Sophie', LastName: 'Dubois', Company: 'Renault Group', Email: 's.dubois@renault.com', Title: 'Semiconductor Strategy Lead', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Warm', Country: 'France', Phone: '+33-1-7684-1001', Description: '전기차 플랫폼 반도체 공급 파트너십 검토' },
    { FirstName: 'Marco', LastName: 'Ferrari', Company: 'Lamborghini Electronics', Email: 'm.ferrari@lamborghini.com', Title: 'EV Component Manager', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Warm', Country: 'Italy', Phone: '+39-051-9591001', Description: '하이퍼카 EV용 고성능 반도체 수요' },
    { FirstName: 'Emma', LastName: 'Nielsen', Company: 'Ericsson Networks', Email: 'e.nielsen@ericsson.com', Title: '5G Infrastructure Procurement', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'Sweden', Phone: '+46-8-719-1001', Description: '5G 기지국용 저전력 메모리 수요 급증' },
    { FirstName: 'Luca', LastName: 'Bianchi', Company: 'STMicro Systems', Email: 'l.bianchi@st.com', Title: 'IoT Memory Architect', Status: 'Closed - Converted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Italy', Phone: '+39-02-9897-1001', Description: 'IoT 디바이스용 eUFS 채택 확정' },
    { FirstName: 'Peter', LastName: 'Fischer', Company: 'SAP SE', Email: 'p.fischer@sap.com', Title: 'Data Center Hardware Lead', Status: 'Open - Not Contacted', LeadSource: 'Email', Rating: 'Cold', Country: 'Germany', Phone: '+49-6227-7-1001', Description: '클라우드 서버 메모리 인프라 구축 검토' },
    { FirstName: 'Maria', LastName: 'García', Company: 'Airbus Defence', Email: 'm.garcia@airbus.com', Title: 'Aerospace Electronics Sourcing', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Warm', Country: 'France', Phone: '+33-5-6193-1001', Description: '항공우주용 내방사선 메모리 수요' },
    // Japan
    { FirstName: '伊藤', LastName: '隆', Email: 't.ito@nikon.com', Title: '半導体調達マネージャー', Company: 'Nikon Corporation', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Japan', Phone: '+81-3-3773-1001', Description: '반도체 노광장비 연계 CIS 수요 문의' },
    { FirstName: '渡辺', LastName: '誠', Email: 'm.watanabe@fujitsu.com', Title: 'データセンター調達', Company: 'Fujitsu Limited', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'Japan', Phone: '+81-3-6252-1001', Description: '고성능 컴퓨팅용 HBM 수요 급증' },
    { FirstName: '松本', LastName: '由美', Email: 'y.matsumoto@sharp.com', Title: '調達担当部長', Company: 'Sharp Corporation', Status: 'Closed - Converted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Japan', Phone: '+81-6-6621-1001', Description: '8K 디스플레이용 CIS 채택 확정' },
    { FirstName: '中村', LastName: '哲也', Email: 't.nakamura@murata.com', Title: '部品調達マネージャー', Company: 'Murata Manufacturing', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'Japan', Phone: '+81-75-951-1001', Description: 'IoT 모듈용 소형 NAND 플래시 문의' },
    { FirstName: '高橋', LastName: '直子', Email: 'n.takahashi@canon.com', Title: 'センサー部門調達', Company: 'Canon Inc.', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Warm', Country: 'Japan', Phone: '+81-3-3758-1001', Description: '디지털카메라용 고화소 CIS 공급 협의' },
    // China
    { FirstName: '赵', LastName: '磊', Email: 'l.zhao@huawei.com', Title: '半导体采购总监', Company: 'Huawei Technologies', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'China', Phone: '+86-755-2878-1001', Description: '5G 인프라 및 스마트폰용 메모리 수요' },
    { FirstName: '孙', LastName: '丽', Email: 'l.sun@vivo.com', Title: '元器件采购经理', Company: 'Vivo Electronics', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'China', Phone: '+86-755-8656-1001', Description: '플래그십 스마트폰용 LPDDR5X, CIS 문의' },
    { FirstName: '陈', LastName: '建国', Email: 'j.chen@boe.com', Title: '半导体材料采购', Company: 'BOE Technology', Status: 'Closed - Converted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'China', Phone: '+86-10-8480-1001', Description: 'OLED 디스플레이 드라이버 IC 채택 확정' },
    { FirstName: '周', LastName: '明华', Email: 'm.zhou@lenovo.com', Title: 'PC Memory Sourcing Lead', Company: 'Lenovo Group', Status: 'Open - Not Contacted', LeadSource: 'Email', Rating: 'Warm', Country: 'China', Phone: '+86-10-5885-1001', Description: 'AI PC용 DDR5, SSD 연간 구매 협의' },
    { FirstName: '吴', LastName: '海燕', Email: 'h.wu@baidu.com', Title: 'AI计算基础设施采购', Company: 'Baidu AI Cloud', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'China', Phone: '+86-10-5992-1001', Description: 'AI 학습 클러스터용 HBM3E 긴급 수요' },
    // Korea
    { FirstName: '김', LastName: '준혁', Company: 'LG전자', Email: 'jh.kim@lg.com', Title: '반도체 구매팀장', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Korea, Republic of', Phone: '02-3777-1001', Description: '가전제품 및 TV용 메모리, CIS 수요' },
    { FirstName: '이', LastName: '수진', Company: '현대자동차', Email: 'sj.lee@hyundai.com', Title: '자율주행 반도체 구매담당', Status: 'Closed - Converted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'Korea, Republic of', Phone: '02-3464-1001', Description: '자율주행 Level 3+ 적용 LPDDR5 채택 확정' },
    { FirstName: '박', LastName: '민철', Company: 'KT 클라우드', Email: 'mc.park@kt.com', Title: 'AI 인프라 구매팀장', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Korea, Republic of', Phone: '02-2190-1001', Description: 'AI 클라우드 서버 HBM 수요 검토 중' },
    { FirstName: '최', LastName: '유리', Company: '네이버 클라우드', Email: 'yr.choi@naver.com', Title: '서버 인프라 구매담당', Status: 'Working - Contacted', LeadSource: 'Cold Call', Rating: 'Warm', Country: 'Korea, Republic of', Phone: '031-784-1001', Description: '초거대 AI 모델 학습용 HBM 인프라 구축' },
    // India
    { FirstName: 'Raj', LastName: 'Patel', Company: 'Tata Electronics', Email: 'r.patel@tata.com', Title: 'Component Sourcing Director', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'India', Phone: '+91-22-6665-1001', Description: '인도 전자제조 확대에 따른 반도체 수요' },
    { FirstName: 'Priya', LastName: 'Sharma', Company: 'Reliance Jio', Email: 'p.sharma@jio.com', Title: '5G Infrastructure Lead', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'India', Phone: '+91-22-3555-1001', Description: '5G 기지국 및 AI 인프라 반도체 수요 급증' },
    // Southeast Asia
    { FirstName: 'Anwar', LastName: 'Ibrahim', Company: 'Petronas Digital', Email: 'a.ibrahim@petronas.com', Title: 'Digital Infrastructure Procurement', Status: 'Open - Not Contacted', LeadSource: 'Conference', Rating: 'Cold', Country: 'Malaysia', Phone: '+60-3-2051-1001', Description: '디지털 전환 프로젝트 메모리 수요' },
    { FirstName: 'Siri', LastName: 'Wongkun', Company: 'PTT Digital', Email: 's.wongkun@pttdigital.com', Title: 'Technology Procurement', Status: 'Open - Not Contacted', LeadSource: 'Partner Referral', Rating: 'Warm', Country: 'Thailand', Phone: '+66-2-537-1001', Description: '태국 스마트팩토리 반도체 수요' },
    // Middle East
    { FirstName: 'Mohammed', LastName: 'Al-Rashid', Company: 'SABIC Arabia', Email: 'm.rashid@sabic.com', Title: 'Digital Infrastructure Lead', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Saudi Arabia', Phone: '+966-3-812-1001', Description: '중동 AI 인프라 구축 반도체 수요' },
    { FirstName: 'Ahmed', LastName: 'Hassan', Company: 'Mubadala Technology', Email: 'a.hassan@mubadala.com', Title: 'Technology Investment Lead', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Hot', Country: 'United Arab Emirates', Phone: '+971-2-413-1001', Description: 'UAE AI 국가전략 데이터센터 HBM 수요' },
  ];

  for (const lead of leadDefs) {
    await create(token, base, 'Lead', lead);
    console.log(`  ✅ ${lead.FirstName} ${lead.LastName} (${lead.Company} / ${lead.Country})`);
    await sleep(50);
  }

  // ── 5. Tasks (30개) ──────────────────────────────────────────────────────────
  console.log('\n📋 Creating Tasks (30)...');

  const taskDefs = [
    // HBM 관련
    { Subject: '[HBM3E] NVIDIA H200 탑재용 공급 협상 미팅', Status: 'Completed', Priority: 'High', ActivityDate: '2025-03-15', Description: 'NVIDIA H200 GPU 탑재 HBM3E 연간 공급 계약 협상. 단가 및 물량 조율 완료.' },
    { Subject: '[HBM3E] Meta AI 인프라 팀 기술 세미나', Status: 'Completed', Priority: 'High', ActivityDate: '2025-05-20', Description: 'Meta AI 데이터센터 HBM3E 성능 및 전력 효율 기술 발표. 연간 계약 논의 시작.' },
    { Subject: '[HBM3E] Google TPU v5 적용 테스트 결과 검토', Status: 'Completed', Priority: 'High', ActivityDate: '2025-08-10', Description: 'Google TPU v5용 HBM3E 성능 테스트 통과. 양산 적용 결정.' },
    { Subject: '[HBM3E] AMD MI300X 공급 단가 협상', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-02-28', Description: 'AMD MI300X 가속기 HBM3E 2026년 물량 단가 협상 진행 중.' },
    { Subject: '[HBM3E] Intel Gaudi 3용 샘플 제공', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-11-05', Description: 'Intel Gaudi 3 AI 가속기용 HBM3E 엔지니어링 샘플 제공.' },
    // DDR5 관련
    { Subject: '[DDR5] Apple Mac Pro 차세대 모델 메모리 스펙 확정', Status: 'Completed', Priority: 'High', ActivityDate: '2025-04-12', Description: 'Apple Silicon M4 Pro 탑재 Mac Pro용 DDR5 규격 확정 미팅.' },
    { Subject: '[DDR5] Intel 서버 플랫폼 메모리 인증 완료', Status: 'Completed', Priority: 'High', ActivityDate: '2025-07-22', Description: 'Intel Xeon Platinum 서버 플랫폼 DDR5 RDIMM 인증 완료.' },
    { Subject: '[DDR5] ASUSTeK AI PC 시리즈 메모리 협의', Status: 'Not Started', Priority: 'Normal', ActivityDate: '2026-04-30', Description: 'AI PC ProArt 시리즈 DDR5 공급 장기 계약 사전 협의 예정.' },
    // LPDDR5X 관련
    { Subject: '[LPDDR5X] Qualcomm Snapdragon 8 Gen 4 적용 확정', Status: 'Completed', Priority: 'High', ActivityDate: '2025-06-18', Description: 'Snapdragon 8 Gen 4 레퍼런스 디자인 LPDDR5X 채택 확정.' },
    { Subject: '[LPDDR5X] MediaTek Dimensity 9400 공급 계약 체결', Status: 'Completed', Priority: 'High', ActivityDate: '2025-09-30', Description: 'Dimensity 9400 탑재 스마트폰용 LPDDR5X 연간 공급 계약 체결.' },
    { Subject: '[LPDDR5X] Xiaomi 15 Pro 메모리 단가 재협상', Status: 'In Progress', Priority: 'Normal', ActivityDate: '2026-03-15', Description: '2026년 하반기 플래그십 모델 LPDDR5X 물량 및 단가 재협상.' },
    // NAND 관련
    { Subject: '[NAND] Tesla FSD 칩 차량용 NAND 공급 미팅', Status: 'Completed', Priority: 'High', ActivityDate: '2025-10-08', Description: 'Tesla FSD 차량용 저온 동작 NAND 공급 사양 협의.' },
    { Subject: '[NAND] Bosch 자동차 반도체 인증 프로세스 착수', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-12-01', Description: 'AEC-Q100 차량용 NAND 인증 시작. 완료 예정 2026년 Q2.' },
    { Subject: '[NAND] Infineon IoT 모듈용 소형 패키지 샘플', Status: 'Not Started', Priority: 'Normal', ActivityDate: '2026-05-20', Description: 'IoT 엣지 디바이스용 소형 NAND 패키지 샘플 제공 예정.' },
    // SSD 관련
    { Subject: '[SSD] Google Cloud 엔터프라이즈 SSD 대규모 계약', Status: 'Completed', Priority: 'High', ActivityDate: '2025-02-28', Description: 'Google Cloud 데이터센터 NVMe SSD 3년 장기 공급 계약 체결.' },
    { Subject: '[SSD] Alibaba Cloud 스토리지 인프라 확장 협의', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-01-20', Description: 'Alibaba Cloud AI 학습 클러스터 고성능 SSD 대규모 구매 협의.' },
    { Subject: '[SSD] ASUSTeK ProArt 워크스테이션 SSD 공급', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-08-25', Description: 'AI 컨텐츠 크리에이터용 워크스테이션 PCIe 5.0 SSD 채택 확정.' },
    // CIS 관련
    { Subject: '[CIS] Apple iPhone 17 카메라 센서 공급 확정', Status: 'Completed', Priority: 'High', ActivityDate: '2025-01-15', Description: 'iPhone 17 Pro 후면 카메라용 200MP CIS 공급 최종 확정.' },
    { Subject: '[CIS] Qualcomm 스냅드래곤 ISP 최적화 협력', Status: 'Completed', Priority: 'High', ActivityDate: '2025-04-30', Description: 'Snapdragon ISP와 CIS 최적화 공동 개발 MOU 체결.' },
    { Subject: '[CIS] OPPO 폴더블폰 카메라 모듈 기술 미팅', Status: 'In Progress', Priority: 'Normal', ActivityDate: '2026-02-10', Description: '폴더블폰 언더-패널 카메라용 초소형 CIS 기술 협의.' },
    { Subject: '[CIS] Xiaomi 위성통신 카메라 CIS 샘플 제공', Status: 'Not Started', Priority: 'Normal', ActivityDate: '2026-04-25', Description: '스마트폰 위성통신 지원 카메라용 CIS 샘플 제공 예정.' },
    // eUFS 관련
    { Subject: '[eUFS] Qualcomm 레퍼런스 폰 eUFS 4.0 인증', Status: 'Completed', Priority: 'High', ActivityDate: '2025-03-28', Description: 'Qualcomm 레퍼런스 스마트폰 eUFS 4.0 공식 인증 완료.' },
    { Subject: '[eUFS] MediaTek 중급형 칩셋 eUFS 3.1 협의', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-06-10', Description: '중급형 Dimensity 칩셋 탑재 eUFS 3.1 볼륨 계약 체결.' },
    { Subject: '[eUFS] OPPO 차세대 플래그십 저장장치 협의', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-03-30', Description: '2026년 하반기 플래그십 모델 eUFS 4.1 적용 협의 예정.' },
    // LPDDR5 관련
    { Subject: '[LPDDR5] Toyota EV 플랫폼 메모리 채택 확정', Status: 'Completed', Priority: 'High', ActivityDate: '2025-09-15', Description: 'Toyota bZ 플랫폼 자율주행 ECU용 LPDDR5 공급 확정.' },
    { Subject: '[LPDDR5] Bosch ADAS 시스템 메모리 공급', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-01-10', Description: 'ADAS Level 2+ 지원 차량용 LPDDR5 양산 공급 협의.' },
    { Subject: '[LPDDR5] 현대자동차 자율주행 플랫폼 공급 확정', Status: 'Completed', Priority: 'High', ActivityDate: '2025-11-20', Description: '현대차 완전자율주행 플랫폼 Level 3용 LPDDR5 채택 완료.' },
    // Cross-product
    { Subject: 'NVIDIA 파트너십 연간 전략 리뷰', Status: 'Completed', Priority: 'High', ActivityDate: '2025-12-15', Description: 'NVIDIA와 2026년 HBM/DDR5 전체 공급 물량 및 로드맵 리뷰.' },
    { Subject: 'Apple 차세대 제품 라인업 반도체 로드맵 협의', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-04-15', Description: 'Apple 2027년 제품 라인업 전체 메모리/스토리지/CIS 로드맵 사전 협의.' },
    { Subject: '글로벌 AI 반도체 수요 동향 발표 — CES 2026', Status: 'Completed', Priority: 'Normal', ActivityDate: '2026-01-08', Description: 'CES 2026에서 삼성전자 반도체 AI 시대 솔루션 전략 발표. 신규 리드 15건 확보.' },
  ];

  for (const task of taskDefs) {
    await create(token, base, 'Task', task);
    console.log(`  ✅ ${task.Subject}`);
    await sleep(50);
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seeding Complete!\n');
  console.log('📊 Data Summary:');
  console.log(`  Account     : ${accountDefs.length}개  (USA 8, Japan 3, Taiwan 3, China 3, Europe 3)`);
  console.log(`  Contact     : ${contactDefs.length}개  (전세계 주요 반도체 구매/조달 담당자)`);
  console.log(`  Opportunity : ${oppCount}개  (HBM3E/DDR5/LPDDR5X/NAND/SSD/CIS/eUFS/LPDDR5 각 10건)`);
  console.log(`  Lead        : ${leadDefs.length}개  (AI반도체 수요 신규 문의 기업)`);
  console.log(`  Task        : ${taskDefs.length}개  (2025~2026 영업 활동)`);
  console.log(`  Total       : ${accountDefs.length + contactDefs.length + oppCount + leadDefs.length + taskDefs.length}개`);
  console.log('\n💡 Sample Questions:');
  console.log('  - "HBM3E 관련 Closed Won 딜 목록 보여줘"');
  console.log('  - "2026년 미국 고객사 영업기회 현황 정리해줘"');
  console.log('  - "Hot 등급 리드 국가별로 정리해줘"');
  console.log('  - "제품별 영업기회 건수 비교해줘"');
}

seed().catch((err: Error) => {
  console.error('❌ Seed Failed:', err.message);
  process.exit(1);
});
