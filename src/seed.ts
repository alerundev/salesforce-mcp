/**
 * SK Chemicals Global Sales - Sample Data Seed Script
 * SK케미칼 글로벌 영업 샘플 데이터 시딩 (데모용)
 *
 * Objects: Account(40) + Contact(60) + Opportunity(200) + Lead(100) + Task(100) = 500개
 * Products: SKYGREEN, ECOZEN, ECOTRIA, SKYPET CR, SKYPURA, SKYPEL, SKYTRA, SKYBON,
 *           SKYDMT, SKYCHDM, SKYDMCD, SKYCHDA, ECOTRION, CnR
 *
 * Run: npm run seed
 */
import https from 'https';

interface TokenResponse { access_token: string; instance_url: string; error?: string; error_description?: string; }
interface CreateResult { id: string; success: boolean; errors: unknown[]; }

async function getToken(): Promise<{ token: string; base: string }> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env['SF_CONSUMER_KEY']!,
    client_secret: process.env['SF_CONSUMER_SECRET']!,
  }).toString();
  const loginHost = new URL(process.env['SF_LOGIN_URL'] || 'https://login.salesforce.com').hostname;
  const data: TokenResponse = await new Promise((resolve, reject) => {
    const req = https.request({ hostname: loginHost, path: '/services/oauth2/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => { let raw = ''; res.on('data', (c: Buffer) => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e){ reject(e); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
  if (!data.access_token) throw new Error(data.error_description || JSON.stringify(data));
  console.log('✅ Salesforce Connected:', data.instance_url);
  return { token: data.access_token, base: data.instance_url };
}

async function create(token: string, base: string, sobject: string, record: Record<string, unknown>): Promise<string> {
  const body = JSON.stringify(record);
  const result: CreateResult = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: new URL(base).hostname,
      path: `/services/data/v59.0/sobjects/${sobject}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body), 'Sforce-Duplicate-Rule-Header': 'allowSave=true' },
    }, res => { let raw = ''; res.on('data', (c: Buffer) => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e){ reject(e); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
  if (!result.success) { console.warn(`  ⚠️ Failed: ${JSON.stringify(result)}`); return ''; }
  return result.id;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function seed() {
  console.log('🌱 SK Chemicals Global Sales - Data Seeding Start\n');
  const { token, base } = await getToken();

  // ── 1. Accounts (40개) ───────────────────────────────────────────────────────
  console.log('\n📦 Creating Accounts (40)...');
  const accountDefs = [
    // 화장품/뷰티 패키징 (0~7)
    { Name: "L'Oreal", Industry: 'Consumer Goods', AnnualRevenue: 38200000000, BillingCity: 'Paris', BillingCountry: 'France', NumberOfEmployees: 88000, Phone: '+33-1-4756-7000', Description: 'SKYGREEN/ECOZEN 화장품 용기 주요 고객. 친환경 패키징 전환 프로젝트 진행 중.' },
    { Name: 'Estee Lauder Companies', Industry: 'Consumer Goods', AnnualRevenue: 15600000000, BillingCity: 'New York', BillingCountry: 'United States', NumberOfEmployees: 62000, Phone: '+1-212-572-4200', Description: 'ECOTRIA CR 화장품 용기 적용. 럭셔리 브랜드의 지속가능 패키징 전환 파트너.' },
    { Name: 'Shiseido', Industry: 'Consumer Goods', AnnualRevenue: 9200000000, BillingCity: 'Tokyo', BillingCountry: 'Japan', NumberOfEmployees: 33000, Phone: '+81-3-3572-5111', Description: 'SKYGREEN/ECOTRIA CLARO 화장품 용기 채택. 일본 내 친환경 패키징 선도 기업.' },
    { Name: 'Amorepacific', Industry: 'Consumer Goods', AnnualRevenue: 4100000000, BillingCity: 'Seoul', BillingCountry: 'South Korea', NumberOfEmployees: 26000, Phone: '+82-2-709-5114', Description: 'SKYGREEN 국내 화장품 용기 장기 공급처. ECOZEN Pro 신규 적용 검토 중.' },
    { Name: 'LVMH Parfums Cosmetiques', Industry: 'Consumer Goods', AnnualRevenue: 22000000000, BillingCity: 'Paris', BillingCountry: 'France', NumberOfEmployees: 45000, Phone: '+33-1-4422-2222', Description: 'ECOTRIA CLARO 럭셔리 화장품 패키징 적용 중. 유럽 친환경 규제 대응 협력.' },
    { Name: 'Toly Group', Industry: 'Manufacturing', AnnualRevenue: 850000000, BillingCity: 'Mosta', BillingCountry: 'Malta', NumberOfEmployees: 2800, Phone: '+356-21-411-411', Description: '글로벌 화장품 패키징 전문업체. ECOTRIA CLARO 70% 함유 용기 개발 파트너(LUXE PACK Monaco 공동 발표).' },
    { Name: 'Aptar Group', Industry: 'Manufacturing', AnnualRevenue: 3300000000, BillingCity: 'Crystal Lake', BillingCountry: 'United States', NumberOfEmployees: 14000, Phone: '+1-815-477-0424', Description: '화장품/제약 디스펜서 패키징 전문. SKYGREEN 적용 친환경 펌프 용기 개발 중.' },
    { Name: 'Albea Group', Industry: 'Manufacturing', AnnualRevenue: 1400000000, BillingCity: 'Gennevilliers', BillingCountry: 'France', NumberOfEmployees: 15000, Phone: '+33-1-7075-8000', Description: '글로벌 화장품 포장 전문. ECOTRIA CR 립스틱 케이스 등 패키징 소재 전환 협의.' },
    // 식품/음료 포장 (8~13)
    { Name: 'Nestle', Industry: 'Food & Beverage', AnnualRevenue: 94400000000, BillingCity: 'Vevey', BillingCountry: 'Switzerland', NumberOfEmployees: 275000, Phone: '+41-21-924-2111', Description: 'ECOZEN 식품용기/SKYPET CR 생수병 글로벌 최대 수요처. ESG 규제 대응 재활용 소재 전환 프로젝트.' },
    { Name: 'Danone', Industry: 'Food & Beverage', AnnualRevenue: 27700000000, BillingCity: 'Paris', BillingCountry: 'France', NumberOfEmployees: 99000, Phone: '+33-1-4435-2020', Description: 'ECOTRIA CLARO 음료병 ESG 전환 프로젝트. 유럽 rPET 의무화 규정 대응 파트너.' },
    { Name: 'PepsiCo', Industry: 'Food & Beverage', AnnualRevenue: 91500000000, BillingCity: 'Purchase', BillingCountry: 'United States', NumberOfEmployees: 315000, Phone: '+1-914-253-2000', Description: 'SKYPET CR 음료병/ECOZEN 스포츠음료병 북미 공급 협의. 2030 순환경제 목표 달성을 위한 전략 파트너.' },
    { Name: 'Coca-Cola Company', Industry: 'Food & Beverage', AnnualRevenue: 45800000000, BillingCity: 'Atlanta', BillingCountry: 'United States', NumberOfEmployees: 82500, Phone: '+1-404-676-2121', Description: 'SKYPET CR 100% 재활용 PET 음료병 북미/유럽 공급 검토. World Without Waste 전략 파트너.' },
    { Name: 'Amcor', Industry: 'Manufacturing', AnnualRevenue: 14500000000, BillingCity: 'Zurich', BillingCountry: 'Switzerland', NumberOfEmployees: 44000, Phone: '+41-44-316-7700', Description: '글로벌 패키징 전문업체. ECOTRIA CR/SKYPET CR 기반 유연 포장재 공동 개발 파트너.' },
    { Name: 'Berry Global', Industry: 'Manufacturing', AnnualRevenue: 13300000000, BillingCity: 'Evansville', BillingCountry: 'United States', NumberOfEmployees: 48000, Phone: '+1-812-424-2904', Description: 'SKYGREEN/ECOTRIA CLARO 기반 친환경 용기 북미 공급. 플라스틱 재활용 솔루션 협력.' },
    // 가전/소비재 (14~18)
    { Name: 'Samsung Electronics', Industry: 'Electronics', AnnualRevenue: 200000000000, BillingCity: 'Suwon', BillingCountry: 'South Korea', NumberOfEmployees: 270000, Phone: '+82-31-200-1114', Description: 'SKYBON 냉장고/세탁기 강판 코팅 국내 최대 고객사. SKYPURA 전자제품 소재 신규 적용 검토.' },
    { Name: 'LG Electronics', Industry: 'Electronics', AnnualRevenue: 63000000000, BillingCity: 'Seoul', BillingCountry: 'South Korea', NumberOfEmployees: 74000, Phone: '+82-2-3777-1114', Description: 'SKYBON 가전 강판 코팅 공급처. ECOZEN 친환경 가전 외장재 적용 협의 중.' },
    { Name: 'Panasonic', Industry: 'Electronics', AnnualRevenue: 65000000000, BillingCity: 'Osaka', BillingCountry: 'Japan', NumberOfEmployees: 233000, Phone: '+81-6-6908-1121', Description: 'SKYBON 가전 코팅/SKYPURA 전자부품 일본 공급처. 친환경 소재 전환 로드맵 공동 수립.' },
    { Name: 'Philips', Industry: 'Electronics', AnnualRevenue: 18100000000, BillingCity: 'Amsterdam', BillingCountry: 'Netherlands', NumberOfEmployees: 77000, Phone: '+31-20-5977-777', Description: 'ECOZEN 가전/의료기기 소재 유럽 공급. SKYPURA 내열 부품 적용 기술 검토 중.' },
    { Name: 'Midea Group', Industry: 'Electronics', AnnualRevenue: 52000000000, BillingCity: 'Foshan', BillingCountry: 'China', NumberOfEmployees: 190000, Phone: '+86-757-2338-8888', Description: 'SKYBON 코일코팅 가전 강판 중국 최대 수요처. ECOZEN 가전 외장재 채택 논의.' },
    // 자동차 (19~24)
    { Name: 'Hyundai Motor', Industry: 'Automotive', AnnualRevenue: 105000000000, BillingCity: 'Seoul', BillingCountry: 'South Korea', NumberOfEmployees: 120000, Phone: '+82-2-3464-1114', Description: 'SKYPET CR 자동차 카펫/매트, SKYPEL 자동차 부품 국내 최대 자동차 고객. EV 플랫폼 친환경 소재 전환 협력.' },
    { Name: 'BMW Group', Industry: 'Automotive', AnnualRevenue: 142000000000, BillingCity: 'Munich', BillingCountry: 'Germany', NumberOfEmployees: 149000, Phone: '+49-89-382-0', Description: 'SKYPET CR 자동차 내장재, SKYTRA 엔지니어링 플라스틱 부품 유럽 공급. iSeries EV 친환경 소재 전환.' },
    { Name: 'Volkswagen Group', Industry: 'Automotive', AnnualRevenue: 293000000000, BillingCity: 'Wolfsburg', BillingCountry: 'Germany', NumberOfEmployees: 675000, Phone: '+49-5361-9-0', Description: 'SKYPEL 자동차 케이블/부품, SKYTRA 내장재 부품 유럽 최대 자동차 고객. ID시리즈 EV 소재 협력.' },
    { Name: 'Toyota Motor', Industry: 'Automotive', AnnualRevenue: 274000000000, BillingCity: 'Toyota City', BillingCountry: 'Japan', NumberOfEmployees: 372000, Phone: '+81-565-28-2121', Description: 'SKYPET CR 자동차 카펫/SKYPEL 자동차 부품 일본 공급. 수소차 플랫폼 신소재 적용 검토.' },
    { Name: 'Durmont', Industry: 'Automotive', AnnualRevenue: 320000000, BillingCity: 'Vienna', BillingCountry: 'Austria', NumberOfEmployees: 1200, Phone: '+43-1-8904-0', Description: '유럽 자동차 카펫 전문 제조사. SKYPET CR 독점 공급 MOU 체결(2025). BMW/VW 납품용 친환경 카펫 생산.' },
    { Name: 'Lear Corporation', Industry: 'Automotive', AnnualRevenue: 23500000000, BillingCity: 'Southfield', BillingCountry: 'United States', NumberOfEmployees: 186000, Phone: '+1-248-447-1500', Description: 'SKYPEL 자동차 시트/전기 부품 북미 공급. EV 플랫폼 경량화 소재 채택 논의.' },
    // 전기전자/부품 (25~29)
    { Name: 'Bosch', Industry: 'Electronics', AnnualRevenue: 91600000000, BillingCity: 'Stuttgart', BillingCountry: 'Germany', NumberOfEmployees: 429000, Phone: '+49-711-811-0', Description: 'SKYTRA 태양광 정션박스/모터 인슐레이터, SKYPEL E&E 부품 유럽 공급. 산업자동화 신소재 적용.' },
    { Name: 'TE Connectivity', Industry: 'Electronics', AnnualRevenue: 16000000000, BillingCity: 'Schaffhausen', BillingCountry: 'Switzerland', NumberOfEmployees: 89000, Phone: '+41-52-631-6161', Description: 'SKYPEL 커넥터/케이블 부품 글로벌 공급. 전기차 고전압 커넥터용 TPEE 소재 채택 검토.' },
    { Name: 'Molex', Industry: 'Electronics', AnnualRevenue: 5000000000, BillingCity: 'Lisle', BillingCountry: 'United States', NumberOfEmployees: 40000, Phone: '+1-630-969-4550', Description: 'SKYPEL 전자 커넥터 부품 북미 공급. 데이터센터 고밀도 커넥터 소재 전환 협의.' },
    { Name: 'Foxconn', Industry: 'Electronics', AnnualRevenue: 222000000000, BillingCity: 'New Taipei City', BillingCountry: 'Taiwan', NumberOfEmployees: 1000000, Phone: '+886-2-2268-3466', Description: 'SKYPURA 전자제품 하우징/SKYTRA E&E 부품 대만 공급. 애플 제품 친환경 소재 전환 대응.' },
    { Name: 'Sumitomo Electric', Industry: 'Electronics', AnnualRevenue: 28000000000, BillingCity: 'Osaka', BillingCountry: 'Japan', NumberOfEmployees: 280000, Phone: '+81-6-6220-4141', Description: 'SKYPEL 케이블 피복 소재 일본 최대 공급처. 자동차 와이어링 하네스용 TPEE 채택.' },
    // 코팅/건자재 (30~34)
    { Name: 'AkzoNobel', Industry: 'Chemical', AnnualRevenue: 10900000000, BillingCity: 'Amsterdam', BillingCountry: 'Netherlands', NumberOfEmployees: 34000, Phone: '+31-20-502-7555', Description: 'SKYBON 코일/캔 코팅 수지 유럽 최대 공급처. SKYCHDM/SKYCHDA 코팅 원료 장기 공급 계약.' },
    { Name: 'PPG Industries', Industry: 'Chemical', AnnualRevenue: 18200000000, BillingCity: 'Pittsburgh', BillingCountry: 'United States', NumberOfEmployees: 54000, Phone: '+1-412-434-3131', Description: 'SKYBON 산업용 코팅 수지 북미 공급. SKYDMCD 코팅 원료 연간 공급 계약 체결.' },
    { Name: 'BASF Coatings', Industry: 'Chemical', AnnualRevenue: 8500000000, BillingCity: 'Munster', BillingCountry: 'Germany', NumberOfEmployees: 23000, Phone: '+49-251-305-0', Description: 'SKYBON 자동차 코팅 수지/SKYCHDA 분체도장 원료 유럽 공급. 친환경 수성 코팅 전환 협력.' },
    { Name: 'Sherwin-Williams', Industry: 'Chemical', AnnualRevenue: 22200000000, BillingCity: 'Cleveland', BillingCountry: 'United States', NumberOfEmployees: 61000, Phone: '+1-216-566-2000', Description: 'SKYCHDA/SKYDMCD 산업용 도료 원료 북미 공급. 고성능 분체 도장 소재 채택 확대.' },
    { Name: 'POSCO', Industry: 'Manufacturing', AnnualRevenue: 65000000000, BillingCity: 'Pohang', BillingCountry: 'South Korea', NumberOfEmployees: 18000, Phone: '+82-54-220-0114', Description: 'SKYBON 강판 코일 코팅 수지 국내 최대 공급처. 가전/건설 강판 코팅 소재 장기 공급 계약.' },
    // 섬유/타이어코드 (35~37)
    { Name: 'Hyosung Advanced Materials', Industry: 'Textiles', AnnualRevenue: 3800000000, BillingCity: 'Seoul', BillingCountry: 'South Korea', NumberOfEmployees: 5200, Phone: '+82-2-707-7000', Description: 'SKYDMT/SKYPET CR 타이어코드 국내 최대 고객. 재활용 PET 타이어코드 적용으로 ESG 성과 창출.' },
    { Name: 'Toray Industries', Industry: 'Textiles', AnnualRevenue: 21000000000, BillingCity: 'Tokyo', BillingCountry: 'Japan', NumberOfEmployees: 50000, Phone: '+81-3-3245-5111', Description: 'SKYDMT 엔지니어링 플라스틱 원료 일본 공급. 탄소섬유 복합재료 연계 신소재 개발 파트너.' },
    { Name: 'Indorama Ventures', Industry: 'Chemical', AnnualRevenue: 15000000000, BillingCity: 'Bangkok', BillingCountry: 'Thailand', NumberOfEmployees: 26000, Phone: '+66-2-661-6661', Description: 'SKYDMT 폴리에스터 원료 동남아 최대 공급처. SKYCHDM CHDM 원료 협력 파트너.' },
    // 제약/정밀화학 (38~39)
    { Name: 'Evonik Industries', Industry: 'Chemical', AnnualRevenue: 15400000000, BillingCity: 'Essen', BillingCountry: 'Germany', NumberOfEmployees: 34000, Phone: '+49-201-177-01', Description: 'SKYDMCD/SKYCHDA 의약 중간체 원료 유럽 공급. 고순도 제약용 원료 품질 인증 진행 중.' },
    { Name: 'Lonza Group', Industry: 'Pharmaceutical', AnnualRevenue: 6700000000, BillingCity: 'Basel', BillingCountry: 'Switzerland', NumberOfEmployees: 16000, Phone: '+41-61-316-8111', Description: 'SKYDMCD 제약 중간체 원료 유럽 공급. FDA/EMA 규격 대응 고순도 원료 공급 파트너.' },
  ];

  const accountIds: string[] = [];
  for (const acc of accountDefs) {
    const id = await create(token, base, 'Account', acc);
    accountIds.push(id);
    console.log(`  ✅ ${acc.Name} (${acc.BillingCountry})`);
    await sleep(50);
  }

  // ── 2. Contacts (60개) ───────────────────────────────────────────────────────
  console.log('\n👤 Creating Contacts (60)...');
  const contactDefs = [
    // L'Oreal (0) - 2명
    { FirstName: 'Sophie', LastName: 'Martin', Email: 's.martin@loreal.com', Phone: '+33-1-4756-7101', Title: 'VP Sustainable Packaging', AccountId: accountIds[0] },
    { FirstName: 'Jean-Pierre', LastName: 'Dubois', Email: 'jp.dubois@loreal.com', Phone: '+33-1-4756-7102', Title: 'Raw Material Procurement Director', AccountId: accountIds[0] },
    // Estee Lauder (1) - 2명
    { FirstName: 'Emily', LastName: 'Chen', Email: 'e.chen@esteelauder.com', Phone: '+1-212-572-4301', Title: 'Sustainability Packaging Manager', AccountId: accountIds[1] },
    { FirstName: 'Michael', LastName: 'Ross', Email: 'm.ross@esteelauder.com', Phone: '+1-212-572-4302', Title: 'Component Sourcing Director', AccountId: accountIds[1] },
    // Shiseido (2) - 2명
    { FirstName: '田中', LastName: '美咲', Email: 'm.tanaka@shiseido.com', Phone: '+81-3-3572-5211', Title: 'パッケージング調達部長', AccountId: accountIds[2] },
    { FirstName: '佐藤', LastName: '健一', Email: 'k.sato@shiseido.com', Phone: '+81-3-3572-5212', Title: '環境素材開発マネージャー', AccountId: accountIds[2] },
    // Amorepacific (3) - 1명
    { FirstName: '김', LastName: '지원', Email: 'jw.kim@amorepacific.com', Phone: '+82-2-709-5214', Title: '친환경 패키징 구매팀장', AccountId: accountIds[3] },
    // LVMH (4) - 1명
    { FirstName: 'Claire', LastName: 'Fontaine', Email: 'c.fontaine@lvmh.com', Phone: '+33-1-4422-2301', Title: 'Sustainable Materials Director', AccountId: accountIds[4] },
    // Toly Group (5) - 1명
    { FirstName: 'Mark', LastName: 'Camilleri', Email: 'm.camilleri@toly.com', Phone: '+356-21-411-501', Title: 'R&D and Innovation Director', AccountId: accountIds[5] },
    // Aptar Group (6) - 1명
    { FirstName: 'David', LastName: 'Hughes', Email: 'd.hughes@aptar.com', Phone: '+1-815-477-0524', Title: 'Material Innovation Manager', AccountId: accountIds[6] },
    // Albea Group (7) - 1명
    { FirstName: 'Marie', LastName: 'Leclerc', Email: 'm.leclerc@albea.com', Phone: '+33-1-7075-8101', Title: 'Procurement Director Europe', AccountId: accountIds[7] },
    // Nestle (8) - 2명
    { FirstName: 'Hans', LastName: 'Mueller', Email: 'h.mueller@nestle.com', Phone: '+41-21-924-2201', Title: 'Head of Sustainable Packaging', AccountId: accountIds[8] },
    { FirstName: 'Anna', LastName: 'Weber', Email: 'a.weber@nestle.com', Phone: '+41-21-924-2202', Title: 'Packaging Material Procurement Manager', AccountId: accountIds[8] },
    // Danone (9) - 2명
    { FirstName: 'Pierre', LastName: 'Laurent', Email: 'p.laurent@danone.com', Phone: '+33-1-4435-2101', Title: 'Circular Economy Director', AccountId: accountIds[9] },
    { FirstName: 'Isabelle', LastName: 'Bernard', Email: 'i.bernard@danone.com', Phone: '+33-1-4435-2102', Title: 'Packaging Sustainability Manager', AccountId: accountIds[9] },
    // PepsiCo (10) - 1명
    { FirstName: 'James', LastName: 'Williams', Email: 'j.williams@pepsico.com', Phone: '+1-914-253-2101', Title: 'Global Packaging Procurement Lead', AccountId: accountIds[10] },
    // Coca-Cola (11) - 1명
    { FirstName: 'Sarah', LastName: 'Johnson', Email: 's.johnson@coca-cola.com', Phone: '+1-404-676-2201', Title: 'Sustainable Packaging Director', AccountId: accountIds[11] },
    // Amcor (12) - 1명
    { FirstName: 'Thomas', LastName: 'Keller', Email: 't.keller@amcor.com', Phone: '+41-44-316-7801', Title: 'Material Technology Director', AccountId: accountIds[12] },
    // Berry Global (13) - 1명
    { FirstName: 'Robert', LastName: 'Anderson', Email: 'r.anderson@berryglobal.com', Phone: '+1-812-424-2904', Title: 'Sustainable Materials Sourcing Lead', AccountId: accountIds[13] },
    // Samsung Electronics (14) - 2명
    { FirstName: '이', LastName: '준호', Email: 'jh.lee@samsung.com', Phone: '+82-31-200-2014', Title: '소재 구매팀장 (가전사업부)', AccountId: accountIds[14] },
    { FirstName: '박', LastName: '소연', Email: 'sy.park@samsung.com', Phone: '+82-31-200-2015', Title: '친환경 소재 개발 담당', AccountId: accountIds[14] },
    // LG Electronics (15) - 1명
    { FirstName: '최', LastName: '영민', Email: 'ym.choi@lge.com', Phone: '+82-2-3777-2015', Title: '소재/부품 구매팀장', AccountId: accountIds[15] },
    // Panasonic (16) - 1명
    { FirstName: '山田', LastName: '太郎', Email: 't.yamada@panasonic.com', Phone: '+81-6-6908-2016', Title: '材料調達マネージャー', AccountId: accountIds[16] },
    // Philips (17) - 1명
    { FirstName: 'Erik', LastName: 'van der Berg', Email: 'e.vandenberg@philips.com', Phone: '+31-20-5977-2017', Title: 'Sustainable Sourcing Manager', AccountId: accountIds[17] },
    // Midea Group (18) - 1명
    { FirstName: '王', LastName: '建国', Email: 'jg.wang@midea.com', Phone: '+86-757-2338-2018', Title: '材料采购总监', AccountId: accountIds[18] },
    // Hyundai Motor (19) - 2명
    { FirstName: '정', LastName: '대현', Email: 'dh.jung@hyundai.com', Phone: '+82-2-3464-2019', Title: '친환경 소재 구매팀장', AccountId: accountIds[19] },
    { FirstName: '강', LastName: '민지', Email: 'mj.kang@hyundai.com', Phone: '+82-2-3464-2020', Title: 'EV 플랫폼 소재 개발 담당', AccountId: accountIds[19] },
    // BMW Group (20) - 2명
    { FirstName: 'Klaus', LastName: 'Richter', Email: 'k.richter@bmw.com', Phone: '+49-89-382-2001', Title: 'Sustainable Material Sourcing Director', AccountId: accountIds[20] },
    { FirstName: 'Petra', LastName: 'Schmidt', Email: 'p.schmidt@bmw.com', Phone: '+49-89-382-2002', Title: 'EV Interior Material Lead', AccountId: accountIds[20] },
    // Volkswagen Group (21) - 1명
    { FirstName: 'Friedrich', LastName: 'Wagner', Email: 'f.wagner@vw.com', Phone: '+49-5361-9-2001', Title: 'Procurement Manager - Sustainable Materials', AccountId: accountIds[21] },
    // Toyota Motor (22) - 1명
    { FirstName: '鈴木', LastName: '一郎', Email: 'i.suzuki@toyota.com', Phone: '+81-565-28-2201', Title: '環境材料調達部長', AccountId: accountIds[22] },
    // Durmont (23) - 1명
    { FirstName: 'Wolfgang', LastName: 'Huber', Email: 'w.huber@durmont.com', Phone: '+43-1-8904-2301', Title: 'Supply Chain Director', AccountId: accountIds[23] },
    // Lear Corporation (24) - 1명
    { FirstName: 'Carlos', LastName: 'Rodriguez', Email: 'c.rodriguez@lear.com', Phone: '+1-248-447-2401', Title: 'Sustainable Materials Engineering Lead', AccountId: accountIds[24] },
    // Bosch (25) - 2명
    { FirstName: 'Andreas', LastName: 'Fischer', Email: 'a.fischer@bosch.com', Phone: '+49-711-811-2501', Title: 'Advanced Materials Procurement', AccountId: accountIds[25] },
    { FirstName: 'Sabine', LastName: 'Hoffman', Email: 's.hoffman@bosch.com', Phone: '+49-711-811-2502', Title: 'Polymer Application Engineer', AccountId: accountIds[25] },
    // TE Connectivity (26) - 1명
    { FirstName: 'Daniel', LastName: 'Meier', Email: 'd.meier@te.com', Phone: '+41-52-631-6261', Title: 'Material Engineering Manager', AccountId: accountIds[26] },
    // Molex (27) - 1명
    { FirstName: 'Kevin', LastName: 'Park', Email: 'k.park@molex.com', Phone: '+1-630-969-4650', Title: 'Component Material Sourcing Lead', AccountId: accountIds[27] },
    // Foxconn (28) - 1명
    { FirstName: '陳', LastName: '志明', Email: 'zm.chen@foxconn.com', Phone: '+886-2-2268-3566', Title: '環保材料採購经理', AccountId: accountIds[28] },
    // Sumitomo Electric (29) - 1명
    { FirstName: '中村', LastName: '哲也', Email: 't.nakamura@sei.co.jp', Phone: '+81-6-6220-4241', Title: 'ケーブル材料調達マネージャー', AccountId: accountIds[29] },
    // AkzoNobel (30) - 2명
    { FirstName: 'Dirk', LastName: 'van Houten', Email: 'd.vanhouten@akzonobel.com', Phone: '+31-20-502-7655', Title: 'Raw Material Procurement Director', AccountId: accountIds[30] },
    { FirstName: 'Laura', LastName: 'de Vries', Email: 'l.devries@akzonobel.com', Phone: '+31-20-502-7656', Title: 'Resin Technology Manager', AccountId: accountIds[30] },
    // PPG Industries (31) - 1명
    { FirstName: 'Gregory', LastName: 'Thompson', Email: 'g.thompson@ppg.com', Phone: '+1-412-434-3231', Title: 'Coating Resin Procurement Manager', AccountId: accountIds[31] },
    // BASF Coatings (32) - 1명
    { FirstName: 'Markus', LastName: 'Braun', Email: 'm.braun@basf.com', Phone: '+49-251-305-3201', Title: 'Polyester Resin Application Lead', AccountId: accountIds[32] },
    // Sherwin-Williams (33) - 1명
    { FirstName: 'William', LastName: 'Davis', Email: 'w.davis@sherwin.com', Phone: '+1-216-566-2101', Title: 'Industrial Coatings Raw Material Manager', AccountId: accountIds[33] },
    // POSCO (34) - 1명
    { FirstName: '윤', LastName: '철수', Email: 'cs.yun@posco.com', Phone: '+82-54-220-2014', Title: '강판코팅 소재 구매팀장', AccountId: accountIds[34] },
    // Hyosung Advanced Materials (35) - 2명
    { FirstName: '한', LastName: '상진', Email: 'sj.han@hyosung.com', Phone: '+82-2-707-7101', Title: '타이어코드 원료 구매팀장', AccountId: accountIds[35] },
    { FirstName: '오', LastName: '민아', Email: 'ma.oh@hyosung.com', Phone: '+82-2-707-7102', Title: 'DMT/PET 원료 개발 담당', AccountId: accountIds[35] },
    // Toray Industries (36) - 1명
    { FirstName: '松本', LastName: '由美', Email: 'y.matsumoto@toray.com', Phone: '+81-3-3245-5211', Title: '繊維原料調達部長', AccountId: accountIds[36] },
    // Indorama Ventures (37) - 1명
    { FirstName: 'Priya', LastName: 'Sharma', Email: 'p.sharma@indorama.com', Phone: '+66-2-661-6761', Title: 'Monomer Procurement Director', AccountId: accountIds[37] },
    // Evonik Industries (38) - 1명
    { FirstName: 'Lukas', LastName: 'Schneider', Email: 'l.schneider@evonik.com', Phone: '+49-201-177-3801', Title: 'Fine Chemicals Raw Material Lead', AccountId: accountIds[38] },
    // Lonza Group (39) - 1명
    { FirstName: 'Marc', LastName: 'Zimmermann', Email: 'm.zimmermann@lonza.com', Phone: '+41-61-316-8211', Title: 'API Raw Material Procurement Manager', AccountId: accountIds[39] },
  ];

  for (const c of contactDefs) {
    await create(token, base, 'Contact', c);
    console.log(`  ✅ ${c.FirstName} ${c.LastName} (${c.Title})`);
    await sleep(50);
  }

  // ── 3. Opportunities (200개) ─────────────────────────────────────────────────
  console.log('\n💰 Creating Opportunities (200)...');

  const oppDefs: Array<{Name:string;StageName:string;Amount:number;CloseDate:string;AccountId:string;Probability:number;Description:string}> = [
    // ── SKYGREEN (20건) ──
    { Name: "[SKYGREEN] L'Oreal 화장품 용기 신규 적용 장기계약", StageName: 'Closed Won', Amount: 2800000000, CloseDate: '2025-03-15', AccountId: accountIds[0]!, Probability: 100, Description: 'SKYGREEN 투명 코폴리에스터 화장품 용기 신규 적용. 연간 예상 수요: 320톤. BPA-free 인증 요구 충족. 3년 장기 공급 계약 체결.' },
    { Name: '[SKYGREEN] Shiseido 친환경 패키징 전환 프로젝트', StageName: 'Closed Won', Amount: 1950000000, CloseDate: '2025-06-20', AccountId: accountIds[2]!, Probability: 100, Description: 'SKYGREEN 일본 화장품 시장 친환경 패키징 전환. 연간 예상 수요: 230톤. 일본 소비자 BPA-free 선호도 대응.' },
    { Name: '[SKYGREEN] Amorepacific 설화수 라인 용기 소재 전환', StageName: 'Closed Won', Amount: 1200000000, CloseDate: '2024-11-10', AccountId: accountIds[3]!, Probability: 100, Description: 'SKYGREEN 설화수 화장품 용기 소재 전환. 연간 예상 수요: 145톤. 국내 친환경 패키징 선도 프로젝트.' },
    { Name: "[SKYGREEN] Berry Global 식품 포장 용기 대량 공급", StageName: 'Closed Won', Amount: 3400000000, CloseDate: '2025-01-25', AccountId: accountIds[13]!, Probability: 100, Description: 'SKYGREEN 식품 포장 용기 북미 대량 공급. 연간 예상 수요: 410톤. FDA 식품접촉물질 규정 충족.' },
    { Name: '[SKYGREEN] Aptar Group 친환경 디스펜서 소재 채택', StageName: 'Closed Won', Amount: 880000000, CloseDate: '2024-09-30', AccountId: accountIds[6]!, Probability: 100, Description: 'SKYGREEN 화장품 펌프 디스펜서 소재 채택. 연간 예상 수요: 105톤. 재활용 가능 단일 소재 패키징 구현.' },
    { Name: '[SKYGREEN] Albea Group 립스틱 케이스 소재 협의', StageName: 'Negotiation/Review', Amount: 650000000, CloseDate: '2026-03-20', AccountId: accountIds[7]!, Probability: 80, Description: 'SKYGREEN 립스틱 케이스 소재 전환. 연간 예상 수요: 78톤. 유럽 단일 소재 재활용 규제 대응.' },
    { Name: "[SKYGREEN] L'Oreal Luxe 럭셔리 라인 용기 추가 채택", StageName: 'Proposal/Price Quote', Amount: 1750000000, CloseDate: '2026-05-10', AccountId: accountIds[0]!, Probability: 60, Description: 'SKYGREEN 럭셔리 화장품 라인 추가 채택. 연간 예상 수요: 210톤. 기존 공급 실적 기반 확장 계약.' },
    { Name: '[SKYGREEN] Philips 가전 부품 소재 검토', StageName: 'Value Proposition', Amount: 420000000, CloseDate: '2026-06-15', AccountId: accountIds[17]!, Probability: 45, Description: 'SKYGREEN 소형 가전 외장 부품 채택 검토. 연간 예상 수요: 50톤. 내화학성 및 투명성 요구 대응.' },
    { Name: '[SKYGREEN] Midea Group 소형 가전 외장재 공급', StageName: 'Id. Decision Makers', Amount: 980000000, CloseDate: '2026-07-30', AccountId: accountIds[18]!, Probability: 50, Description: 'SKYGREEN 소형 가전 투명 외장재 중국 공급. 연간 예상 수요: 118톤. 중국 소비재 친환경 규제 대응.' },
    { Name: '[SKYGREEN] Amcor 유연 포장재 소재 개발', StageName: 'Needs Analysis', Amount: 730000000, CloseDate: '2026-08-20', AccountId: accountIds[12]!, Probability: 35, Description: 'SKYGREEN 기반 유연 포장재 공동 개발. 연간 예상 수요: 88톤. 식품 포장 단일 소재화 프로젝트.' },
    { Name: '[SKYGREEN] Estee Lauder 기초화장품 용기 소재 전환', StageName: 'Qualification', Amount: 1100000000, CloseDate: '2026-09-15', AccountId: accountIds[1]!, Probability: 25, Description: 'SKYGREEN 기초화장품 용기 소재 전환 검토. 연간 예상 수요: 133톤. 기존 ECOTRIA CR 병행 적용 방안 검토.' },
    { Name: '[SKYGREEN] Toly Group 신규 용기 라인 공동 개발', StageName: 'Qualification', Amount: 350000000, CloseDate: '2026-10-10', AccountId: accountIds[5]!, Probability: 25, Description: 'SKYGREEN 신규 화장품 용기 라인 공동 개발. 연간 예상 수요: 42톤. Luxe Pack 전시회 계기 협력 시작.' },
    { Name: '[SKYGREEN] LVMH 향수 용기 소재 검토', StageName: 'Prospecting', Amount: 2100000000, CloseDate: '2026-11-20', AccountId: accountIds[4]!, Probability: 10, Description: 'SKYGREEN 럭셔리 향수 용기 소재 검토. 연간 예상 수요: 250톤. 초기 접촉 단계.' },
    { Name: '[SKYGREEN] Foxconn 가전 하우징 소재 공급', StageName: 'Prospecting', Amount: 560000000, CloseDate: '2026-12-15', AccountId: accountIds[28]!, Probability: 10, Description: 'SKYGREEN 소형 가전 투명 하우징 소재. 연간 예상 수요: 67톤. 제품 샘플 평가 단계.' },
    { Name: "[SKYGREEN] L'Oreal 북미 법인 공급 확대", StageName: 'Closed Lost', Amount: 1300000000, CloseDate: '2024-08-15', AccountId: accountIds[0]!, Probability: 0, Description: '북미 시장 SKYGREEN 공급 확대 시도. 연간 예상 수요: 156톤. 현지 경쟁사 대비 가격 경쟁력 부족으로 실패.' },
    { Name: '[SKYGREEN] PepsiCo 식품 용기 소재 전환', StageName: 'Closed Lost', Amount: 2200000000, CloseDate: '2024-06-30', AccountId: accountIds[10]!, Probability: 0, Description: 'SKYGREEN 식품 용기 소재 전환 시도. 연간 예상 수요: 265톤. SKYPET CR 재활용 PET 대안으로 전환.' },
    { Name: '[SKYGREEN] Amorepacific 이니스프리 라인 추가 적용', StageName: 'Perception Analysis', Amount: 680000000, CloseDate: '2026-04-25', AccountId: accountIds[3]!, Probability: 40, Description: 'SKYGREEN 이니스프리 화장품 라인 추가 채택. 연간 예상 수요: 82톤. 기존 설화수 적용 실적 기반.' },
    { Name: '[SKYGREEN] Panasonic 소형 가전 투명 커버 채택', StageName: 'Perception Analysis', Amount: 510000000, CloseDate: '2026-05-30', AccountId: accountIds[16]!, Probability: 40, Description: 'SKYGREEN 소형 가전 투명 커버 일본 공급. 연간 예상 수요: 62톤. 내열성 및 BPA-free 요건 충족.' },
    { Name: '[SKYGREEN] Berry Global 신규 식품 용기 라인 확장', StageName: 'Negotiation/Review', Amount: 1800000000, CloseDate: '2025-11-15', AccountId: accountIds[13]!, Probability: 80, Description: 'SKYGREEN 기존 계약 확장. 연간 예상 수요: 215톤. 북미 식품 안전 규정 대응 신규 용기 라인.' },
    { Name: '[SKYGREEN] Albea Group 마스카라 용기 소재 개발', StageName: 'Needs Analysis', Amount: 290000000, CloseDate: '2026-09-30', AccountId: accountIds[7]!, Probability: 35, Description: 'SKYGREEN 마스카라 케이스 소재 전환. 연간 예상 수요: 35톤. 투명성 및 내화학성 요건 충족 확인 중.' },
    // ── ECOZEN (25건) ──
    { Name: '[ECOZEN] Nestle 친환경 식품용기 글로벌 장기공급계약', StageName: 'Closed Won', Amount: 8500000000, CloseDate: '2024-12-01', AccountId: accountIds[8]!, Probability: 100, Description: 'ECOZEN 식품용기 글로벌 공급 5년 장기계약. 연간 예상 수요: 850톤. BPA-free, 고내열, EU 식품접촉물질 규정 완전 충족.' },
    { Name: '[ECOZEN] Danone 스포츠음료 전용병 신규 적용', StageName: 'Closed Won', Amount: 3200000000, CloseDate: '2025-02-28', AccountId: accountIds[9]!, Probability: 100, Description: 'ECOZEN 스포츠음료 전용병 유럽 공급. 연간 예상 수요: 380톤. 고내열 BPA-free 인증. 프랑스 환경부 친환경 인증 취득.' },
    { Name: '[ECOZEN] Amorepacific 아기용품 용기 전량 전환', StageName: 'Closed Won', Amount: 1450000000, CloseDate: '2025-04-15', AccountId: accountIds[3]!, Probability: 100, Description: 'ECOZEN 아기용품 전 라인 용기 소재 전환. 연간 예상 수요: 172톤. FDA/KFDA BPA-free 인증. 프리미엄 아기용품 브랜드 채택.' },
    { Name: '[ECOZEN] LG Electronics 블렌더/믹서기 용기 채택', StageName: 'Closed Won', Amount: 920000000, CloseDate: '2024-10-20', AccountId: accountIds[15]!, Probability: 100, Description: 'ECOZEN Pro 블렌더 용기 국내 가전 공급. 연간 예상 수요: 110톤. 고내열 블렌더 용기 소재 채택. 글로벌 확대 예정.' },
    { Name: '[ECOZEN] Panasonic 주방가전 용기 일본 공급', StageName: 'Closed Won', Amount: 1750000000, CloseDate: '2025-08-10', AccountId: accountIds[16]!, Probability: 100, Description: 'ECOZEN 주방가전 내열 용기 일본 공급. 연간 예상 수요: 210톤. 일본 JHOSPA 기준 충족. 3년 독점 공급 계약.' },
    { Name: "[ECOZEN] L'Oreal 바이오매스 화장품 용기 전환", StageName: 'Closed Won', Amount: 2100000000, CloseDate: '2025-05-25', AccountId: accountIds[0]!, Probability: 100, Description: 'ECOZEN 바이오매스 기반 화장품 용기 전환. 연간 예상 수요: 252톤. 탄소발자국 30% 저감 목표 달성.' },
    { Name: '[ECOZEN] Berry Global 아기용품 용기 북미 공급', StageName: 'Closed Won', Amount: 2650000000, CloseDate: '2024-07-15', AccountId: accountIds[13]!, Probability: 100, Description: 'ECOZEN 아기용품 용기 북미 대량 공급. 연간 예상 수요: 315톤. FDA BPA-free 인증 완료. 주요 북미 유통 브랜드 납품.' },
    { Name: '[ECOZEN] Shiseido 프리미엄 화장품 용기 전환', StageName: 'Closed Won', Amount: 1890000000, CloseDate: '2025-09-30', AccountId: accountIds[2]!, Probability: 100, Description: 'ECOZEN 프리미엄 화장품 라인 용기 소재 전환. 연간 예상 수요: 226톤. 일본 BPA-free 규제 대응 선도.' },
    { Name: '[ECOZEN Pro] Nestle 밀폐용기 라인 신규 채택', StageName: 'Closed Won', Amount: 3800000000, CloseDate: '2025-11-20', AccountId: accountIds[8]!, Probability: 100, Description: 'ECOZEN Pro 고강도 식품 밀폐용기. 연간 예상 수요: 455톤. 전자레인지 사용 가능 내열 등급. EU/미국 전 지역 공급.' },
    { Name: '[ECOZEN] PepsiCo 스포츠음료병 북미 공급', StageName: 'Negotiation/Review', Amount: 5200000000, CloseDate: '2026-02-28', AccountId: accountIds[10]!, Probability: 80, Description: 'ECOZEN 스포츠음료 전용병 북미 공급. 연간 예상 수요: 620톤. 가격 협상 최종 단계. 경쟁사 대비 내열성 우수.' },
    { Name: '[ECOZEN] Philips 가전 식품 관련 부품 채택', StageName: 'Proposal/Price Quote', Amount: 680000000, CloseDate: '2026-04-10', AccountId: accountIds[17]!, Probability: 60, Description: 'ECOZEN 식품접촉 가전 부품 유럽 공급. 연간 예상 수요: 82톤. 에어프라이어 내열 트레이 등 적용.' },
    { Name: '[ECOZEN] Midea Group 주방가전 내열 부품 공급', StageName: 'Id. Decision Makers', Amount: 2100000000, CloseDate: '2026-05-15', AccountId: accountIds[18]!, Probability: 50, Description: 'ECOZEN 주방가전 내열 용기/부품 중국 공급. 연간 예상 수요: 250톤. 중국 국가 표준 GB 인증 진행 중.' },
    { Name: '[ECOZEN] Coca-Cola 친환경 음료 용기 전환 검토', StageName: 'Perception Analysis', Amount: 4500000000, CloseDate: '2026-06-30', AccountId: accountIds[11]!, Probability: 40, Description: 'ECOZEN 친환경 음료 용기 채택 검토. 연간 예상 수요: 535톤. World Without Waste 전략 연계 소재 평가 중.' },
    { Name: '[ECOZEN Pro] LG Electronics 글로벌 주방가전 확대', StageName: 'Value Proposition', Amount: 1350000000, CloseDate: '2026-07-20', AccountId: accountIds[15]!, Probability: 45, Description: 'ECOZEN Pro 글로벌 주방가전 라인 확장 공급. 연간 예상 수요: 162톤. 기존 국내 공급 실적 기반 해외 확장.' },
    { Name: '[ECOZEN] Amcor 바이오매스 유연 포장재 개발', StageName: 'Needs Analysis', Amount: 950000000, CloseDate: '2026-08-15', AccountId: accountIds[12]!, Probability: 35, Description: 'ECOZEN 바이오매스 기반 유연 포장재 공동 개발. 연간 예상 수요: 114톤. 탄소중립 포장재 솔루션 개발.' },
    { Name: '[ECOZEN] Estee Lauder 프리미엄 스킨케어 용기', StageName: 'Qualification', Amount: 1650000000, CloseDate: '2026-09-10', AccountId: accountIds[1]!, Probability: 25, Description: 'ECOZEN 프리미엄 스킨케어 용기 소재 전환. 연간 예상 수요: 197톤. 럭셔리 화장품 바이오매스 소재 도입 검토.' },
    { Name: '[ECOZEN] Samsung Electronics 가전 내열 부품', StageName: 'Qualification', Amount: 780000000, CloseDate: '2026-10-05', AccountId: accountIds[14]!, Probability: 25, Description: 'ECOZEN 가전 내열 플라스틱 부품 채택. 연간 예상 수요: 93톤. 에어프라이어, 음식물처리기 내열 부품 대상.' },
    { Name: '[ECOZEN] Aptar Group 제약 디스펜서 소재 전환', StageName: 'Prospecting', Amount: 430000000, CloseDate: '2026-11-15', AccountId: accountIds[6]!, Probability: 10, Description: 'ECOZEN 제약/의료 디스펜서 BPA-free 소재 전환. 연간 예상 수요: 52톤. 의료기기 FDA 규격 검토 중.' },
    { Name: '[ECOZEN] LVMH 바이오매스 향수 용기 도입', StageName: 'Prospecting', Amount: 2800000000, CloseDate: '2026-12-10', AccountId: accountIds[4]!, Probability: 10, Description: 'ECOZEN 럭셔리 향수 바이오매스 용기. 연간 예상 수요: 335톤. 브랜드 지속가능성 전략 연계 초기 검토.' },
    { Name: '[ECOZEN] Danone 아시아 시장 음료 용기 확대', StageName: 'Closed Lost', Amount: 1900000000, CloseDate: '2024-05-20', AccountId: accountIds[9]!, Probability: 0, Description: 'ECOZEN 아시아 음료 용기 확대 시도. 연간 예상 수요: 228톤. 아시아 현지 경쟁사 가격 우위로 실패.' },
    { Name: '[ECOZEN] Toly Group 아이섀도우 팔레트 케이스', StageName: 'Closed Won', Amount: 420000000, CloseDate: '2025-07-10', AccountId: accountIds[5]!, Probability: 100, Description: 'ECOZEN 아이섀도우 팔레트 케이스 적용. 연간 예상 수요: 50톤. 투명 뚜껑 고투명성 요건 충족.' },
    { Name: '[ECOZEN Pro] Berry Global 재사용 식품용기 확대', StageName: 'Closed Won', Amount: 2950000000, CloseDate: '2025-10-15', AccountId: accountIds[13]!, Probability: 100, Description: 'ECOZEN Pro 재사용 식품 밀폐용기 북미 확장. 연간 예상 수요: 352톤. 기존 계약 기반 제품군 확장.' },
    { Name: '[ECOZEN] Foxconn 가전 투명 부품 소재', StageName: 'Needs Analysis', Amount: 650000000, CloseDate: '2026-07-25', AccountId: accountIds[28]!, Probability: 35, Description: 'ECOZEN 가전 투명 부품 소재 검토. 연간 예상 수요: 78톤. 애플 부품 BPA-free 내열 소재 요건 대응.' },
    { Name: "[ECOZEN] L'Oreal Garnier 매스 브랜드 용기 전환", StageName: 'Perception Analysis', Amount: 3100000000, CloseDate: '2026-06-05', AccountId: accountIds[0]!, Probability: 40, Description: 'ECOZEN 매스 화장품 라인 용기 전환. 연간 예상 수요: 370톤. 글로벌 대량 공급 단가 협의 중.' },
    { Name: '[ECOZEN] Nestle 동남아 시장 식품용기 공급', StageName: 'Id. Decision Makers', Amount: 2400000000, CloseDate: '2026-04-20', AccountId: accountIds[8]!, Probability: 50, Description: 'ECOZEN 동남아 시장 식품용기 신규 공급. 연간 예상 수요: 287톤. 태국/인도네시아 공장 납품 기반 확대.' },
    // ── ECOTRIA / ECOTRIA CR / ECOTRIA CLARO (25건) ──
    { Name: '[ECOTRIA CR] Estee Lauder 화학재활용 화장품 용기', StageName: 'Closed Won', Amount: 2200000000, CloseDate: '2024-11-25', AccountId: accountIds[1]!, Probability: 100, Description: 'ECOTRIA CR 화학재활용 화장품 용기 전환. 연간 예상 수요: 264톤. 100% 화학재활용 원료. ESG 보고서 탄소중립 성과 반영.' },
    { Name: "[ECOTRIA CLARO] Danone 유럽 음료병 rPET 전환", StageName: 'Closed Won', Amount: 4800000000, CloseDate: '2025-01-20', AccountId: accountIds[9]!, Probability: 100, Description: 'ECOTRIA CLARO 유럽 음료병 전면 전환. 연간 예상 수요: 574톤. EU rPET 의무화 규정 완전 대응. 2024 유럽 친환경 패키징 어워드 수상.' },
    { Name: "[ECOTRIA CLARO] PepsiCo Gatorade 스포츠음료 병 전환", StageName: 'Closed Won', Amount: 6100000000, CloseDate: '2025-04-30', AccountId: accountIds[10]!, Probability: 100, Description: 'ECOTRIA CLARO Gatorade 전용병 북미/유럽 전환. 연간 예상 수요: 730톤. 재활용 가능 단일 소재. 탄소발자국 35% 저감.' },
    { Name: '[ECOTRIA CR] Toly Group 화장품 용기 순환경제 솔루션', StageName: 'Closed Won', Amount: 580000000, CloseDate: '2024-10-15', AccountId: accountIds[5]!, Probability: 100, Description: 'ECOTRIA CR 70% 함유 화장품 용기. 연간 예상 수요: 70톤. LUXE PACK Monaco 2024 공동 발표 제품. 럭셔리 브랜드 친환경 패키징 선도.' },
    { Name: "[ECOTRIA CR] L'Oreal 전 브랜드 화학재활용 전환 MOU", StageName: 'Closed Won', Amount: 9200000000, CloseDate: '2025-07-10', AccountId: accountIds[0]!, Probability: 100, Description: 'ECOTRIA CR 전 브랜드 단계적 전환 MOU. 연간 예상 수요: 1100톤. 2027년 전 제품 친환경 패키징 전환 목표. SK케미칼 전략 파트너십.' },
    { Name: '[ECOTRIA CLARO] Coca-Cola 순환경제 음료병 프로젝트', StageName: 'Closed Won', Amount: 7500000000, CloseDate: '2025-09-15', AccountId: accountIds[11]!, Probability: 100, Description: 'ECOTRIA CLARO 순환경제 음료병 글로벌 프로젝트. 연간 예상 수요: 895톤. 사용 후 PET 분리배출 시스템 연계.' },
    { Name: '[ECOTRIA CR] Amcor 순환경제 포장재 공동개발', StageName: 'Closed Won', Amount: 1850000000, CloseDate: '2024-08-20', AccountId: accountIds[12]!, Probability: 100, Description: 'ECOTRIA CR 기반 유연 포장재 공동 개발. 연간 예상 수요: 220톤. Amcor Pledge 2025 친환경 목표 달성 파트너십.' },
    { Name: '[ECOTRIA CLARO] Nestle 생수 라인 순환 패키징 전환', StageName: 'Closed Won', Amount: 5600000000, CloseDate: '2025-11-30', AccountId: accountIds[8]!, Probability: 100, Description: 'ECOTRIA CLARO 생수 라인 전면 전환. 연간 예상 수요: 670톤. 유럽 생수 시장 rPET 의무화 대응.' },
    { Name: '[ECOTRIA CR] Shiseido 럭셔리 라인 화학재활용 용기', StageName: 'Negotiation/Review', Amount: 2400000000, CloseDate: '2026-03-15', AccountId: accountIds[2]!, Probability: 80, Description: 'ECOTRIA CR 럭셔리 화장품 용기 전환. 연간 예상 수요: 287톤. 프리미엄 화장품 화학재활용 선도 브랜드 전략.' },
    { Name: '[ECOTRIA CLARO] Berry Global 투명 음료용기 대량공급', StageName: 'Negotiation/Review', Amount: 4100000000, CloseDate: '2026-02-20', AccountId: accountIds[13]!, Probability: 80, Description: 'ECOTRIA CLARO 투명 대용량 음료용기 북미 공급. 연간 예상 수요: 490톤. 기존 SKYGREEN 공급 기반 확대.' },
    { Name: '[ECOTRIA CR] LVMH 럭셔리 화장품 재활용 소재 전환', StageName: 'Proposal/Price Quote', Amount: 3800000000, CloseDate: '2026-04-25', AccountId: accountIds[4]!, Probability: 60, Description: 'ECOTRIA CR 럭셔리 브랜드 전면 전환 제안. 연간 예상 수요: 455톤. 유럽 명품 화장품 재활용 소재 선도 전략.' },
    { Name: '[ECOTRIA CLARO] PepsiCo 아시아 음료병 전환', StageName: 'Id. Decision Makers', Amount: 3500000000, CloseDate: '2026-05-20', AccountId: accountIds[10]!, Probability: 50, Description: 'ECOTRIA CLARO 아시아 음료병 전환. 연간 예상 수요: 418톤. 중국/동남아 음료 시장 친환경 소재 전환.' },
    { Name: '[ECOTRIA CR] Albea Group 화학재활용 용기 전환', StageName: 'Perception Analysis', Amount: 980000000, CloseDate: '2026-06-10', AccountId: accountIds[7]!, Probability: 40, Description: 'ECOTRIA CR 화장품 포장 전면 전환. 연간 예상 수요: 117톤. 유럽 SUP 규제 대응 재활용 소재 전환.' },
    { Name: '[ECOTRIA CLARO] Danone 아시아 음료 포장 전환', StageName: 'Value Proposition', Amount: 2700000000, CloseDate: '2026-07-15', AccountId: accountIds[9]!, Probability: 45, Description: 'ECOTRIA CLARO 아시아 음료병 전환. 연간 예상 수요: 323톤. 유럽 성공 사례 기반 아시아 시장 확대.' },
    { Name: '[ECOTRIA CR] Aptar Group 재활용 디스펜서 개발', StageName: 'Needs Analysis', Amount: 560000000, CloseDate: '2026-08-30', AccountId: accountIds[6]!, Probability: 35, Description: 'ECOTRIA CR 디스펜서 패키징 전환. 연간 예상 수요: 67톤. 화장품/의료용 재활용 디스펜서 공동 개발.' },
    { Name: '[ECOTRIA CR] Estee Lauder 남성 화장품 용기', StageName: 'Qualification', Amount: 850000000, CloseDate: '2026-09-20', AccountId: accountIds[1]!, Probability: 25, Description: 'ECOTRIA CR 남성 화장품 라인 용기 전환. 연간 예상 수요: 102톤. 신규 남성 뷰티 라인 친환경 포지셔닝.' },
    { Name: '[ECOTRIA CLARO] Amcor 동남아 음료 포장 개발', StageName: 'Prospecting', Amount: 1900000000, CloseDate: '2026-11-10', AccountId: accountIds[12]!, Probability: 10, Description: 'ECOTRIA CLARO 동남아 음료 포장재 개발. 연간 예상 수요: 228톤. 신흥 시장 순환경제 포장재 솔루션.' },
    { Name: '[ECOTRIA CR] Amorepacific 전 브랜드 재활용 전환', StageName: 'Prospecting', Amount: 2100000000, CloseDate: '2026-12-05', AccountId: accountIds[3]!, Probability: 10, Description: 'ECOTRIA CR 전 브랜드 단계적 전환 계획. 연간 예상 수요: 251톤. K-뷰티 친환경 소재 선도 프로젝트.' },
    { Name: '[ECOTRIA CLARO] Coca-Cola 아시아 신흥시장 음료병', StageName: 'Closed Lost', Amount: 3200000000, CloseDate: '2024-04-10', AccountId: accountIds[11]!, Probability: 0, Description: '아시아 신흥시장 음료병 전환 시도. 연간 예상 수요: 383톤. 현지 재활용 인프라 미비로 사업 연기.' },
    { Name: '[ECOTRIA CR] Berry Global 화학재활용 용기 북미', StageName: 'Closed Won', Amount: 3300000000, CloseDate: '2025-08-25', AccountId: accountIds[13]!, Probability: 100, Description: 'ECOTRIA CR 화학재활용 용기 북미 공급. 연간 예상 수요: 395톤. California SB 54 플라스틱 규제 대응.' },
    { Name: '[ECOTRIA CLARO] Nestle Nespresso 캡슐 포장', StageName: 'Id. Decision Makers', Amount: 2800000000, CloseDate: '2026-04-05', AccountId: accountIds[8]!, Probability: 50, Description: 'ECOTRIA CLARO Nespresso 커피 캡슐 포장 전환. 연간 예상 수요: 335톤. 재활용 가능 단일 소재 전환.' },
    { Name: '[ECOTRIA CR] Toly Group LUXE PACK 후속 확대', StageName: 'Closed Won', Amount: 720000000, CloseDate: '2025-12-10', AccountId: accountIds[5]!, Probability: 100, Description: 'ECOTRIA CR LUXE PACK 성공 후 추가 라인 확대. 연간 예상 수요: 86톤. 유럽 럭셔리 브랜드 채택 확산.' },
    { Name: '[ECOTRIA CLARO] PepsiCo 유럽 탄산음료 병 전환', StageName: 'Negotiation/Review', Amount: 5100000000, CloseDate: '2026-01-30', AccountId: accountIds[10]!, Probability: 80, Description: 'ECOTRIA CLARO 유럽 탄산음료 병 전환. 연간 예상 수요: 610톤. EU SUPD 규제 완전 대응.' },
    { Name: "[ECOTRIA CR] L'Oreal 메이크업 용기 재활용 선도", StageName: 'Perception Analysis', Amount: 4200000000, CloseDate: '2026-06-20', AccountId: accountIds[0]!, Probability: 40, Description: 'ECOTRIA CR 메이크업 전 라인 용기 전환. 연간 예상 수요: 502톤. L\'Oreal 2030 탄소중립 목표 달성 핵심 파트너십.' },
    { Name: '[ECOTRIA CLARO] Danone Evian 생수병 순환경제 전환', StageName: 'Closed Won', Amount: 4600000000, CloseDate: '2025-06-15', AccountId: accountIds[9]!, Probability: 100, Description: 'ECOTRIA CLARO Evian 생수병 전면 전환. 연간 예상 수요: 550톤. 프리미엄 생수 브랜드 순환경제 패키징 선도.' },
    // ── SKYPET CR (20건) ──
    { Name: '[SKYPET CR] Durmont 자동차 카펫 독점 공급 MOU', StageName: 'Closed Won', Amount: 2800000000, CloseDate: '2025-03-01', AccountId: accountIds[23]!, Probability: 100, Description: 'SKYPET CR 자동차 카펫 독점 공급 MOU 체결. 연간 예상 수요: 450톤. BMW/VW 납품용. 오스트리아 자동차 카펫 No.1 업체.' },
    { Name: '[SKYPET CR] Hyundai Motor EV 플랫폼 카펫 전환', StageName: 'Closed Won', Amount: 3500000000, CloseDate: '2024-09-20', AccountId: accountIds[19]!, Probability: 100, Description: 'SKYPET CR 현대차 EV 전 모델 카펫/매트 전환. 연간 예상 수요: 560톤. IONIQ 시리즈 친환경 소재 공식 채택.' },
    { Name: '[SKYPET CR] Toyota Motor 수소차 내장재 공급', StageName: 'Closed Won', Amount: 4200000000, CloseDate: '2025-05-15', AccountId: accountIds[22]!, Probability: 100, Description: 'SKYPET CR 수소차/EV 내장재 일본 공급. 연간 예상 수요: 670톤. GR86, Mirai 등 친환경 소재 내장재 채택.' },
    { Name: '[SKYPET CR] Hyosung Advanced Materials 타이어코드', StageName: 'Closed Won', Amount: 5800000000, CloseDate: '2024-06-10', AccountId: accountIds[35]!, Probability: 100, Description: 'SKYPET CR 타이어코드 국내 최대 공급 계약. 연간 예상 수요: 930톤. 한국타이어, 금호타이어 납품 체인 연계.' },
    { Name: '[SKYPET CR] BMW Group 유럽 자동차 내장재', StageName: 'Closed Won', Amount: 6100000000, CloseDate: '2025-08-25', AccountId: accountIds[20]!, Probability: 100, Description: 'SKYPET CR BMW iSeries 전 차종 내장재. 연간 예상 수요: 975톤. Durmont 통해 간접 공급. BMW 지속가능성 인증 취득.' },
    { Name: '[SKYPET CR] Volkswagen Group EV 플랫폼 소재', StageName: 'Closed Won', Amount: 5500000000, CloseDate: '2025-10-20', AccountId: accountIds[21]!, Probability: 100, Description: 'SKYPET CR VW ID시리즈 전 차종 내장재. 연간 예상 수요: 880�ton. MEB 플랫폼 친환경 소재 공식 채택.' },
    { Name: '[SKYPET CR] Lear Corporation 자동차 시트 소재', StageName: 'Closed Won', Amount: 3800000000, CloseDate: '2024-12-15', AccountId: accountIds[24]!, Probability: 100, Description: 'SKYPET CR 자동차 시트 섬유 소재 공급. 연간 예상 수요: 610톤. GM, Ford 납품 체인. 북미 자동차 시장 확대.' },
    { Name: '[SKYPET CR] Toray Industries 재활용 섬유 원료', StageName: 'Closed Won', Amount: 4900000000, CloseDate: '2025-02-10', AccountId: accountIds[36]!, Probability: 100, Description: 'SKYPET CR 고기능 재활용 섬유 원료 공급. 연간 예상 수요: 783톤. 일본 스포츠의류 브랜드 납품 체인.' },
    { Name: '[SKYPET CR] Amcor 재활용 포장재 원료 공급', StageName: 'Negotiation/Review', Amount: 3200000000, CloseDate: '2026-02-15', AccountId: accountIds[12]!, Probability: 80, Description: 'SKYPET CR 재활용 유연 포장재 원료 공급. 연간 예상 수요: 511톤. 글로벌 식품 브랜드 친환경 포장재 솔루션.' },
    { Name: '[SKYPET CR] Indorama Ventures 아시아 원료 공급', StageName: 'Proposal/Price Quote', Amount: 7200000000, CloseDate: '2026-04-30', AccountId: accountIds[37]!, Probability: 60, Description: 'SKYPET CR 동남아 폴리에스터 원료 대량 공급. 연간 예상 수요: 1150톤. 태국 생산 기반 아시아 확대.' },
    { Name: '[SKYPET CR] Hyundai Motor 2026년 전 모델 확대', StageName: 'Id. Decision Makers', Amount: 4500000000, CloseDate: '2026-05-25', AccountId: accountIds[19]!, Probability: 50, Description: 'SKYPET CR 현대차 전 모델 확대 적용. 연간 예상 수요: 720톤. 기존 EV 외 내연기관 모델로 확대.' },
    { Name: '[SKYPET CR] Berry Global 재활용 포장 용기 원료', StageName: 'Perception Analysis', Amount: 2600000000, CloseDate: '2026-06-20', AccountId: accountIds[13]!, Probability: 40, Description: 'SKYPET CR 재활용 용기 원료 공급. 연간 예상 수요: 415톤. 북미 재활용 플라스틱 의무 사용 규제 대응.' },
    { Name: '[SKYPET CR] Toyota Motor 북미 생산 기지 공급', StageName: 'Value Proposition', Amount: 3100000000, CloseDate: '2026-07-10', AccountId: accountIds[22]!, Probability: 45, Description: 'SKYPET CR 도요타 북미 공장 직접 공급. 연간 예상 수요: 495톤. 켄터키/인디애나 공장 납품 체계 구축.' },
    { Name: '[SKYPET CR] Durmont 유럽 자동차 브랜드 확대', StageName: 'Needs Analysis', Amount: 1800000000, CloseDate: '2026-08-20', AccountId: accountIds[23]!, Probability: 35, Description: 'SKYPET CR 납품 자동차 브랜드 확대. 연간 예상 수요: 288톤. BMW/VW 외 Mercedes-Benz, Audi 납품 확대.' },
    { Name: '[SKYPET CR] Volkswagen Group 아시아 생산 공급', StageName: 'Qualification', Amount: 2800000000, CloseDate: '2026-09-15', AccountId: accountIds[21]!, Probability: 25, Description: 'SKYPET CR VW 중국/한국 생산기지 직접 공급. 연간 예상 수요: 447톤. 아시아 생산 물량 직접 공급 체계 구축.' },
    { Name: '[SKYPET CR] Lear Corporation 유럽 시장 진출', StageName: 'Prospecting', Amount: 2100000000, CloseDate: '2026-11-05', AccountId: accountIds[24]!, Probability: 10, Description: 'SKYPET CR 유럽 자동차 시트 시장 진출. 연간 예상 수요: 335톤. 유럽 공장 신규 납품 체계 구축 계획.' },
    { Name: '[SKYPET CR] Hyosung 글로벌 타이어 메이커 확대', StageName: 'Prospecting', Amount: 4200000000, CloseDate: '2026-12-20', AccountId: accountIds[35]!, Probability: 10, Description: 'SKYPET CR 해외 타이어 메이커 확대. 연간 예상 수요: 670톤. Michelin, Bridgestone 납품 체계 구축 계획.' },
    { Name: '[SKYPET CR] BMW Group 공급량 50% 확대 협의', StageName: 'Negotiation/Review', Amount: 4800000000, CloseDate: '2026-03-10', AccountId: accountIds[20]!, Probability: 80, Description: 'SKYPET CR BMW 공급량 확대 협의. 연간 예상 수요: 767톤. 신차 모델 추가 적용으로 물량 확대.' },
    { Name: '[SKYPET CR] Toray Industries 스포츠용품 섬유 확대', StageName: 'Id. Decision Makers', Amount: 3600000000, CloseDate: '2026-05-05', AccountId: accountIds[36]!, Probability: 50, Description: 'SKYPET CR 스포츠용품 섬유 원료 확대. 연간 예상 수요: 575톤. Nike, Adidas 납품 체인 연계.' },
    { Name: '[SKYPET CR] Indorama 중국 시장 공급 협력', StageName: 'Closed Lost', Amount: 3900000000, CloseDate: '2024-07-25', AccountId: accountIds[37]!, Probability: 0, Description: '중국 시장 SKYPET CR 공급 시도. 연간 예상 수요: 623톤. 중국 현지 경쟁사 가격 우위로 실패.' },
    // ── SKYPURA (15건) ──
    { Name: '[SKYPURA] Samsung Electronics 프리미엄 가전 부품', StageName: 'Closed Won', Amount: 3200000000, CloseDate: '2024-10-05', AccountId: accountIds[14]!, Probability: 100, Description: 'SKYPURA 프리미엄 가전 내열 플라스틱 부품. 연간 예상 수요: 180톤. 세탁기/냉장고 내열 부품 채택. 국내 최대 공급 계약.' },
    { Name: '[SKYPURA] Panasonic 고내열 전자부품 채택', StageName: 'Closed Won', Amount: 2100000000, CloseDate: '2025-02-15', AccountId: accountIds[16]!, Probability: 100, Description: 'SKYPURA 고내열 전자부품 일본 공급. 연간 예상 수요: 118톤. 산업용 전자기기 내열 부품 장기 공급 계약.' },
    { Name: '[SKYPURA] Foxconn 애플 부품 내열 소재 채택', StageName: 'Closed Won', Amount: 4500000000, CloseDate: '2025-06-20', AccountId: accountIds[28]!, Probability: 100, Description: 'SKYPURA 애플 제품군 내열 플라스틱 부품 공급. 연간 예상 수요: 253톤. iPhone/Mac 내열 부품 채택.' },
    { Name: '[SKYPURA] Bosch 산업자동화 부품 소재 공급', StageName: 'Closed Won', Amount: 2800000000, CloseDate: '2024-08-30', AccountId: accountIds[25]!, Probability: 100, Description: 'SKYPURA 산업자동화 로봇 부품 소재. 연간 예상 수요: 158톤. 고온/고습 환경 내구성 우수. 공장자동화 부품 채택.' },
    { Name: '[SKYPURA] Hyundai Motor 자동차 내장 부품 채택', StageName: 'Closed Won', Amount: 1950000000, CloseDate: '2025-09-10', AccountId: accountIds[19]!, Probability: 100, Description: 'SKYPURA 자동차 내장 플라스틱 부품 공급. 연간 예상 수요: 110톤. EV 배터리 주변 내열 부품 채택.' },
    { Name: '[SKYPURA] LG Electronics 고내열 가전 부품', StageName: 'Negotiation/Review', Amount: 1600000000, CloseDate: '2026-02-28', AccountId: accountIds[15]!, Probability: 80, Description: 'SKYPURA 고내열 가전 부품 공급. 연간 예상 수요: 90톤. 에어컨, 냉장고 고온부 부품 적용.' },
    { Name: '[SKYPURA] TE Connectivity EV 커넥터 소재', StageName: 'Proposal/Price Quote', Amount: 3100000000, CloseDate: '2026-04-15', AccountId: accountIds[26]!, Probability: 60, Description: 'SKYPURA EV 고전압 커넥터 소재 채택. 연간 예상 수요: 175톤. 800V 아키텍처 내열 절연 소재.' },
    { Name: '[SKYPURA] Sumitomo Electric 자동차 부품 공급', StageName: 'Id. Decision Makers', Amount: 2400000000, CloseDate: '2026-05-30', AccountId: accountIds[29]!, Probability: 50, Description: 'SKYPURA 자동차 와이어링 하네스 부품. 연간 예상 수요: 135톤. EV 고전압 시스템 내열 부품 채택.' },
    { Name: '[SKYPURA] Philips 의료기기 내열 부품 검토', StageName: 'Value Proposition', Amount: 850000000, CloseDate: '2026-07-10', AccountId: accountIds[17]!, Probability: 45, Description: 'SKYPURA 의료기기 내열 플라스틱 부품. 연간 예상 수요: 48톤. FDA/CE 의료기기 규격 인증 진행 중.' },
    { Name: '[SKYPURA] Midea Group 고성능 가전 부품', StageName: 'Needs Analysis', Amount: 1800000000, CloseDate: '2026-08-25', AccountId: accountIds[18]!, Probability: 35, Description: 'SKYPURA 가전 고온부 플라스틱 부품 공급. 연간 예상 수요: 101톤. 에어컨 압축기 주변 내열 부품 채택 검토.' },
    { Name: '[SKYPURA] BMW Group 고온 엔진 주변 부품', StageName: 'Qualification', Amount: 2600000000, CloseDate: '2026-09-20', AccountId: accountIds[20]!, Probability: 25, Description: 'SKYPURA 엔진룸 고온 환경 부품 소재. 연간 예상 수요: 146톤. 전기차 모터/인버터 주변 내열 부품.' },
    { Name: '[SKYPURA] Toyota Motor 수소연료전지 부품', StageName: 'Prospecting', Amount: 3800000000, CloseDate: '2026-11-15', AccountId: accountIds[22]!, Probability: 10, Description: 'SKYPURA 수소연료전지 시스템 내열 부품. 연간 예상 수요: 214톤. Mirai 차세대 모델 소재 검토 초기 단계.' },
    { Name: '[SKYPURA] Foxconn 서버 하우징 내열 소재', StageName: 'Prospecting', Amount: 2100000000, CloseDate: '2026-12-10', AccountId: accountIds[28]!, Probability: 10, Description: 'SKYPURA 데이터센터 서버 내열 하우징 소재. 연간 예상 수요: 118톤. AI 서버 발열 대응 내열 소재 탐색.' },
    { Name: '[SKYPURA] Volkswagen Group 내장재 플라스틱', StageName: 'Closed Lost', Amount: 2200000000, CloseDate: '2024-05-15', AccountId: accountIds[21]!, Probability: 0, Description: 'SKYPURA VW 내장재 채택 시도. 연간 예상 수요: 124톤. 기존 거래처 교체 실패. 2026년 재도전 계획.' },
    { Name: '[SKYPURA] Bosch 태양광 인버터 내열 부품', StageName: 'Perception Analysis', Amount: 1400000000, CloseDate: '2026-06-05', AccountId: accountIds[25]!, Probability: 40, Description: 'SKYPURA 태양광 인버터 내열 플라스틱 부품. 연간 예상 수요: 79톤. 옥외 장기 내후성 요건 충족 평가 중.' },
    // ── SKYPEL (20건) ──
    { Name: '[SKYPEL] Sumitomo Electric 자동차 와이어링 하네스', StageName: 'Closed Won', Amount: 4200000000, CloseDate: '2025-01-15', AccountId: accountIds[29]!, Probability: 100, Description: 'SKYPEL 자동차 와이어링 하네스 일본 최대 공급. 연간 예상 수요: 340톤. EV 고전압 케이블 피복 소재 채택. 3년 독점 공급 계약.' },
    { Name: '[SKYPEL] Volkswagen Group 자동차 케이블 부품', StageName: 'Closed Won', Amount: 5100000000, CloseDate: '2025-04-25', AccountId: accountIds[21]!, Probability: 100, Description: 'SKYPEL EV 고전압 케이블 유럽 공급. 연간 예상 수요: 413톤. ID시리즈 전 차종 채택. VW 그룹 전체 공급 확장.' },
    { Name: '[SKYPEL] TE Connectivity 커넥터 소재 채택', StageName: 'Closed Won', Amount: 3600000000, CloseDate: '2024-11-20', AccountId: accountIds[26]!, Probability: 100, Description: 'SKYPEL 전기 커넥터 소재 글로벌 공급. 연간 예상 수요: 292톤. EV 충전 커넥터 TPEE 소재 공식 채택.' },
    { Name: '[SKYPEL] Hyundai Motor EV 케이블 소재 채택', StageName: 'Closed Won', Amount: 3900000000, CloseDate: '2025-07-10', AccountId: accountIds[19]!, Probability: 100, Description: 'SKYPEL 현대차 EV 케이블/전기 부품 공급. 연간 예상 수요: 316톤. IONIQ 6/7 고전압 케이블 채택.' },
    { Name: '[SKYPEL] Toyota Motor 전기부품 소재 채택', StageName: 'Closed Won', Amount: 4500000000, CloseDate: '2025-09-30', AccountId: accountIds[22]!, Probability: 100, Description: 'SKYPEL 도요타 EV/HEV 전기 케이블 일본 공급. 연간 예상 수요: 365톤. Prius/bZ4X 시리즈 채택.' },
    { Name: '[SKYPEL] Bosch 산업용 케이블 피복 소재', StageName: 'Closed Won', Amount: 2800000000, CloseDate: '2024-07-15', AccountId: accountIds[25]!, Probability: 100, Description: 'SKYPEL 산업용 로봇/자동화 케이블 피복. 연간 예상 수요: 227톤. 공장자동화 케이블 내굴곡성 우수 채택.' },
    { Name: '[SKYPEL] BMW Group EV 고전압 케이블', StageName: 'Closed Won', Amount: 4800000000, CloseDate: '2025-11-15', AccountId: accountIds[20]!, Probability: 100, Description: 'SKYPEL BMW iSeries 고전압 케이블 소재. 연간 예상 수요: 389톤. 800V 아키텍처 내전압 소재 채택.' },
    { Name: '[SKYPEL] Molex 고성능 커넥터 부품 소재', StageName: 'Negotiation/Review', Amount: 1800000000, CloseDate: '2026-02-10', AccountId: accountIds[27]!, Probability: 80, Description: 'SKYPEL 데이터센터 고성능 커넥터 소재. 연간 예상 수요: 146톤. AI 서버 고밀도 커넥터 TPEE 소재 채택.' },
    { Name: '[SKYPEL] Lear Corporation 자동차 시트 케이블', StageName: 'Proposal/Price Quote', Amount: 2600000000, CloseDate: '2026-04-05', AccountId: accountIds[24]!, Probability: 60, Description: 'SKYPEL 자동차 시트 케이블/배선 소재. 연간 예상 수요: 211톤. EV 시트 전동화 부품 확대 대응.' },
    { Name: '[SKYPEL] Foxconn 서버 케이블 소재 채택', StageName: 'Id. Decision Makers', Amount: 2100000000, CloseDate: '2026-05-20', AccountId: accountIds[28]!, Probability: 50, Description: 'SKYPEL 데이터센터 서버 케이블 소재. 연간 예상 수요: 170톤. AI 인프라 확장에 따른 수요 급증.' },
    { Name: '[SKYPEL] Volkswagen 아시아 생산기지 공급', StageName: 'Perception Analysis', Amount: 3200000000, CloseDate: '2026-06-15', AccountId: accountIds[21]!, Probability: 40, Description: 'SKYPEL VW 아시아 생산기지 직접 공급. 연간 예상 수요: 259톤. 중국 합작공장 납품 체계 구축.' },
    { Name: '[SKYPEL] Sumitomo Electric 5G 통신 케이블', StageName: 'Value Proposition', Amount: 3500000000, CloseDate: '2026-07-30', AccountId: accountIds[29]!, Probability: 45, Description: 'SKYPEL 5G 기지국 통신 케이블 소재. 연간 예상 수요: 284톤. 저유전율 특성 요건 검토 중.' },
    { Name: '[SKYPEL] TE Connectivity 의료기기 케이블', StageName: 'Needs Analysis', Amount: 1400000000, CloseDate: '2026-08-10', AccountId: accountIds[26]!, Probability: 35, Description: 'SKYPEL 의료기기 케이블 소재 채택. 연간 예상 수요: 113톤. 의료기기 FDA/CE 기준 내화학성 소재.' },
    { Name: '[SKYPEL] Hyundai Motor 2026년 신모델 확대', StageName: 'Qualification', Amount: 2900000000, CloseDate: '2026-09-25', AccountId: accountIds[19]!, Probability: 25, Description: 'SKYPEL 현대차 신모델 적용 확대. 연간 예상 수요: 235톤. GV80 쿠페 등 신모델 케이블 채택.' },
    { Name: '[SKYPEL] BMW Group 수소차 케이블 소재', StageName: 'Prospecting', Amount: 4100000000, CloseDate: '2026-11-20', AccountId: accountIds[20]!, Probability: 10, Description: 'SKYPEL 수소연료전지차 케이블 소재. 연간 예상 수요: 332톤. BMW 수소차 프로젝트 초기 소재 탐색.' },
    { Name: '[SKYPEL] Bosch 풍력발전 케이블 소재', StageName: 'Prospecting', Amount: 2400000000, CloseDate: '2026-12-15', AccountId: accountIds[25]!, Probability: 10, Description: 'SKYPEL 해상 풍력발전 케이블 피복 소재. 연간 예상 수요: 194톤. 해수 내식성 특수 소재 탐색.' },
    { Name: '[SKYPEL] Toyota Motor 북미 공장 직납 체계', StageName: 'Id. Decision Makers', Amount: 3800000000, CloseDate: '2026-05-10', AccountId: accountIds[22]!, Probability: 50, Description: 'SKYPEL 도요타 북미 공장 직납 체계 구축. 연간 예상 수요: 308톤. TNGA 플랫폼 전 차종 적용 확대.' },
    { Name: '[SKYPEL] Lear Corporation EV 시트 모듈 확대', StageName: 'Closed Won', Amount: 3300000000, CloseDate: '2025-12-05', AccountId: accountIds[24]!, Probability: 100, Description: 'SKYPEL EV 전동 시트 모듈 케이블 확대. 연간 예상 수요: 268톤. GM Ultium 플랫폼 납품 확정.' },
    { Name: '[SKYPEL] Molex AI 서버 케이블 시장 진출', StageName: 'Needs Analysis', Amount: 1600000000, CloseDate: '2026-08-30', AccountId: accountIds[27]!, Probability: 35, Description: 'SKYPEL AI 서버 고속 케이블 소재. 연간 예상 수요: 130톤. 112G PAM4 고속 전송 케이블 소재 검토.' },
    { Name: '[SKYPEL] Volkswagen Group 공급 가격 재협상', StageName: 'Closed Lost', Amount: 2800000000, CloseDate: '2024-09-10', AccountId: accountIds[21]!, Probability: 0, Description: 'SKYPEL VW 가격 재협상 실패. 연간 예상 수요: 227톤. 원가 인하 요구 과다로 협상 결렬. 2026년 재협상 예정.' },
    // ── SKYTRA (15건) ──
    { Name: '[SKYTRA] Bosch 태양광 정션박스 부품 공급', StageName: 'Closed Won', Amount: 1950000000, CloseDate: '2025-02-20', AccountId: accountIds[25]!, Probability: 100, Description: 'SKYTRA 태양광 모듈 정션박스 부품 유럽 공급. 연간 예상 수요: 132톤. 고난연성 UL94 V-0 인증. 독일/스페인 태양광 설비 납품.' },
    { Name: '[SKYTRA] Foxconn 전자기기 모터 인슐레이터', StageName: 'Closed Won', Amount: 2800000000, CloseDate: '2024-12-20', AccountId: accountIds[28]!, Probability: 100, Description: 'SKYTRA 가전 모터 인슐레이터/보빈 공급. 연간 예상 수요: 189톤. 260°C 이상 내열. 에너지 효율 등급 전동기 부품.' },
    { Name: '[SKYTRA] Panasonic 에너지 솔루션 부품', StageName: 'Closed Won', Amount: 2200000000, CloseDate: '2025-05-10', AccountId: accountIds[16]!, Probability: 100, Description: 'SKYTRA 태양광/ESS 시스템 부품 일본 공급. 연간 예상 수요: 148톤. 옥외 장기 내후성 요건 충족.' },
    { Name: '[SKYTRA] BMW Group 자동차 내장재 부품', StageName: 'Closed Won', Amount: 3500000000, CloseDate: '2025-08-15', AccountId: accountIds[20]!, Probability: 100, Description: 'SKYTRA 자동차 내장 플라스틱 부품 유럽 공급. 연간 예상 수요: 236톤. PC 대비 내화학성 우수. iSeries 채택.' },
    { Name: '[SKYTRA] TE Connectivity 고온 커넥터 소재', StageName: 'Closed Won', Amount: 2100000000, CloseDate: '2024-09-25', AccountId: accountIds[26]!, Probability: 100, Description: 'SKYTRA 고온 산업용 커넥터 소재. 연간 예상 수요: 142톤. 260°C+ 내열 커넥터 채택. 슈퍼 EP 시장 진출.' },
    { Name: '[SKYTRA] Volkswagen Group 전기차 내장재', StageName: 'Negotiation/Review', Amount: 2800000000, CloseDate: '2026-03-05', AccountId: accountIds[21]!, Probability: 80, Description: 'SKYTRA VW ID시리즈 내장 부품 공급. 연간 예상 수요: 189톤. PC 대비 내화학성 우수 특성 평가 완료.' },
    { Name: '[SKYTRA] Bosch 산업용 커넥터/릴레이 소켓', StageName: 'Proposal/Price Quote', Amount: 1600000000, CloseDate: '2026-04-20', AccountId: accountIds[25]!, Probability: 60, Description: 'SKYTRA 산업자동화 전기 부품 소재. 연간 예상 수요: 108톤. UL94 V-0 고난연 커넥터/소켓 채택.' },
    { Name: '[SKYTRA] Samsung Electronics 에너지 시스템', StageName: 'Id. Decision Makers', Amount: 1900000000, CloseDate: '2026-05-25', AccountId: accountIds[14]!, Probability: 50, Description: 'SKYTRA 태양광/ESS 시스템 부품 국내 공급. 연간 예상 수요: 128톤. 삼성SDI 배터리 시스템 연계.' },
    { Name: '[SKYTRA] Midea Group 에어컨 전기부품', StageName: 'Value Proposition', Amount: 1400000000, CloseDate: '2026-07-05', AccountId: accountIds[18]!, Probability: 45, Description: 'SKYTRA 에어컨 인버터 전기 부품 중국 공급. 연간 예상 수요: 94톤. 인버터 에어컨 고온부 부품 채택.' },
    { Name: '[SKYTRA] Foxconn 서버 전원부 부품', StageName: 'Needs Analysis', Amount: 2100000000, CloseDate: '2026-08-15', AccountId: accountIds[28]!, Probability: 35, Description: 'SKYTRA AI 서버 전원 공급 장치 부품. 연간 예상 수요: 142톤. 고온 환경 서버 전원부 내열 소재.' },
    { Name: '[SKYTRA] Hyundai Motor 자동차 전장부품', StageName: 'Qualification', Amount: 1700000000, CloseDate: '2026-09-10', AccountId: accountIds[19]!, Probability: 25, Description: 'SKYTRA EV 전장 시스템 내열 부품. 연간 예상 수요: 115톤. OBC/인버터 주변 고온 환경 부품 검토.' },
    { Name: '[SKYTRA] LG Electronics 태양광 부품 채택', StageName: 'Prospecting', Amount: 1200000000, CloseDate: '2026-11-25', AccountId: accountIds[15]!, Probability: 10, Description: 'SKYTRA LG 태양광 모듈 부품 공급. 연간 예상 수요: 81톤. LG에너지솔루션 연계 태양광 시스템 부품.' },
    { Name: '[SKYTRA] Panasonic 미래 에너지 솔루션', StageName: 'Prospecting', Amount: 1800000000, CloseDate: '2026-12-20', AccountId: accountIds[16]!, Probability: 10, Description: 'SKYTRA 차세대 에너지 시스템 부품. 연간 예상 수요: 122톤. 수소/ESS 시스템 부품 초기 탐색.' },
    { Name: '[SKYTRA] TE Connectivity 5G 기지국 부품', StageName: 'Closed Lost', Amount: 1500000000, CloseDate: '2024-06-20', AccountId: accountIds[26]!, Probability: 0, Description: 'SKYTRA 5G 기지국 전기 부품 시도. 연간 예상 수요: 101톤. 경쟁사 PPS 소재 대비 가격 열위.' },
    { Name: '[SKYTRA] Bosch 전기차 충전기 부품 채택', StageName: 'Perception Analysis', Amount: 2300000000, CloseDate: '2026-06-25', AccountId: accountIds[25]!, Probability: 40, Description: 'SKYTRA 전기차 충전기 내열 전기 부품. 연간 예상 수요: 155톤. 고전압 충전 환경 내열성 평가 진행 중.' },
    // ── SKYBON (15건) ──
    { Name: '[SKYBON] Samsung Electronics 가전 강판 연간계약', StageName: 'Closed Won', Amount: 12000000000, CloseDate: '2024-04-01', AccountId: accountIds[14]!, Probability: 100, Description: 'SKYBON 냉장고/세탁기/에어컨 강판 코팅 수지 연간 계약. 연간 예상 수요: 1200톤. 국내 최대 가전사 독점 공급.' },
    { Name: '[SKYBON] POSCO 컬러강판 코팅 장기 공급', StageName: 'Closed Won', Amount: 18000000000, CloseDate: '2024-07-01', AccountId: accountIds[34]!, Probability: 100, Description: 'SKYBON 건축/가전용 컬러강판 코일 코팅 수지. 연간 예상 수요: 1800톤. 5년 장기 공급 계약. 국내 철강 시장 1위 납품처.' },
    { Name: '[SKYBON] LG Electronics 가전 강판 코팅', StageName: 'Closed Won', Amount: 8500000000, CloseDate: '2025-01-10', AccountId: accountIds[15]!, Probability: 100, Description: 'SKYBON 가전 강판 코팅 수지 국내 공급. 연간 예상 수요: 850톤. 세탁기/냉장고/에어컨 전 라인 적용.' },
    { Name: '[SKYBON] AkzoNobel 코일/캔 코팅 수지 유럽 공급', StageName: 'Closed Won', Amount: 15000000000, CloseDate: '2024-10-15', AccountId: accountIds[30]!, Probability: 100, Description: 'SKYBON 유럽 코일/캔 코팅 수지 장기 공급. 연간 예상 수요: 1500톤. 3년 독점 공급 계약 체결.' },
    { Name: '[SKYBON] PPG Industries 산업용 코팅 수지', StageName: 'Closed Won', Amount: 9800000000, CloseDate: '2025-04-20', AccountId: accountIds[31]!, Probability: 100, Description: 'SKYBON 건축/산업용 코팅 수지 북미 공급. 연간 예상 수요: 980톤. PPG 전략적 공급 파트너 선정.' },
    { Name: '[SKYBON] Midea Group 가전 강판 코팅 수지', StageName: 'Closed Won', Amount: 11000000000, CloseDate: '2025-07-05', AccountId: accountIds[18]!, Probability: 100, Description: 'SKYBON 가전 강판 코팅 수지 중국 공급. 연간 예상 수요: 1100톤. 중국 최대 가전사 장기 공급 계약.' },
    { Name: '[SKYBON] BASF Coatings 자동차 코팅 수지', StageName: 'Closed Won', Amount: 7200000000, CloseDate: '2024-08-25', AccountId: accountIds[32]!, Probability: 100, Description: 'SKYBON 자동차 코팅용 폴리에스터 수지. 연간 예상 수요: 720톤. 유럽 친환경 수성 코팅 전환 파트너.' },
    { Name: '[SKYBON] Panasonic 가전 강판 일본 공급', StageName: 'Negotiation/Review', Amount: 6500000000, CloseDate: '2026-02-05', AccountId: accountIds[16]!, Probability: 80, Description: 'SKYBON 가전 강판 코팅 일본 공급 확대. 연간 예상 수요: 650톤. 기존 계약 만료 후 물량 확대 재계약.' },
    { Name: '[SKYBON] Sherwin-Williams 산업용 도료 수지', StageName: 'Proposal/Price Quote', Amount: 8900000000, CloseDate: '2026-04-10', AccountId: accountIds[33]!, Probability: 60, Description: 'SKYBON 산업용 도료 폴리에스터 수지 공급. 연간 예상 수요: 890톤. 인프라/건설 분야 내식성 도료 소재.' },
    { Name: '[SKYBON] AkzoNobel 유럽 공급 확대 계약', StageName: 'Id. Decision Makers', Amount: 9500000000, CloseDate: '2026-05-15', AccountId: accountIds[30]!, Probability: 50, Description: 'SKYBON 유럽 공급량 30% 확대 재계약. 연간 예상 수요: 950톤. 기존 계약 만료 후 물량 확대.' },
    { Name: '[SKYBON] Samsung Electronics 2026년 계약 갱신', StageName: 'Perception Analysis', Amount: 13500000000, CloseDate: '2026-06-01', AccountId: accountIds[14]!, Probability: 40, Description: 'SKYBON 연간 계약 갱신 협상. 연간 예상 수요: 1350톤. 원가 인상분 반영 단가 협의 진행 중.' },
    { Name: '[SKYBON] BASF Coatings 수성 코팅 전환 확대', StageName: 'Value Proposition', Amount: 5800000000, CloseDate: '2026-07-20', AccountId: accountIds[32]!, Probability: 45, Description: 'SKYBON 친환경 수성 코팅 수지 확대. 연간 예상 수요: 580톤. EU VOC 규제 대응 수성 코팅 전환 가속화.' },
    { Name: '[SKYBON] Philips 산업용 가전 부품 코팅', StageName: 'Needs Analysis', Amount: 2100000000, CloseDate: '2026-08-30', AccountId: accountIds[17]!, Probability: 35, Description: 'SKYBON 의료/산업용 가전 코팅 수지. 연간 예상 수요: 210톤. 내화학성/내스크래치성 코팅 소재 검토.' },
    { Name: '[SKYBON] PPG Industries 아시아 시장 확대', StageName: 'Qualification', Amount: 6800000000, CloseDate: '2026-09-25', AccountId: accountIds[31]!, Probability: 25, Description: 'SKYBON 아시아 코팅 시장 공급 확대. 연간 예상 수요: 680톤. PPG 아시아 생산 기지 직납 체계.' },
    { Name: '[SKYBON] Midea Group 중국 시장 추가 확대', StageName: 'Closed Lost', Amount: 7000000000, CloseDate: '2024-03-20', AccountId: accountIds[18]!, Probability: 0, Description: 'SKYBON 중국 시장 추가 확대 시도. 연간 예상 수요: 700톤. 중국 현지 경쟁사 저가 공세로 일부 물량 실패.' },
    // ── SKYDMT (15건) ──
    { Name: '[SKYDMT] Hyosung Advanced Materials 타이어코드 원료', StageName: 'Closed Won', Amount: 32000000000, CloseDate: '2024-05-01', AccountId: accountIds[35]!, Probability: 100, Description: 'SKYDMT 타이어코드 폴리에스터 원료. 연간 예상 수요: 18000톤. 국내 최대 타이어코드 메이커 독점 공급. 아시아 유일 대량 생산.' },
    { Name: '[SKYDMT] Toray Industries 폴리에스터 원료 공급', StageName: 'Closed Won', Amount: 28000000000, CloseDate: '2025-03-15', AccountId: accountIds[36]!, Probability: 100, Description: 'SKYDMT 고기능 폴리에스터 필름/섬유 원료. 연간 예상 수요: 15700톤. 일본 최대 공급처. 5년 장기 계약.' },
    { Name: '[SKYDMT] Indorama Ventures 동남아 공급', StageName: 'Closed Won', Amount: 45000000000, CloseDate: '2024-09-01', AccountId: accountIds[37]!, Probability: 100, Description: 'SKYDMT 동남아 폴리에스터 원료 대량 공급. 연간 예상 수요: 25000톤. 태국/인도네시아/인도 공장 납품.' },
    { Name: '[SKYDMT] Evonik Industries 유럽 수출 확대', StageName: 'Closed Won', Amount: 15000000000, CloseDate: '2025-06-20', AccountId: accountIds[38]!, Probability: 100, Description: 'SKYDMT 유럽 폴리에스터 수지 원료 공급. 연간 예상 수요: 8400톤. 유럽 DMT 생산 철수 이후 공급 확대.' },
    { Name: '[SKYDMT] Hyosung 글로벌 타이어코드 물량 확대', StageName: 'Negotiation/Review', Amount: 18000000000, CloseDate: '2026-02-01', AccountId: accountIds[35]!, Probability: 80, Description: 'SKYDMT 물량 20% 확대 재계약. 연간 예상 수요: 21600톤. 글로벌 타이어 수요 증가 대응.' },
    { Name: '[SKYDMT] Toray Industries 유럽 공장 직납', StageName: 'Proposal/Price Quote', Amount: 12000000000, CloseDate: '2026-04-25', AccountId: accountIds[36]!, Probability: 60, Description: 'SKYDMT 도레이 유럽 생산기지 직납 체계. 연간 예상 수요: 6700톤. 유럽 생산 물류비 절감 방안.' },
    { Name: '[SKYDMT] Indorama Ventures 2026 장기계약', StageName: 'Id. Decision Makers', Amount: 52000000000, CloseDate: '2026-05-10', AccountId: accountIds[37]!, Probability: 50, Description: 'SKYDMT 2026-2031 5년 장기 계약 협의. 연간 예상 수요: 29000톤. 동남아 최대 폴리에스터 메이커 독점 공급.' },
    { Name: '[SKYDMT] 유럽 PBT 제조사 신규 공급', StageName: 'Value Proposition', Amount: 8500000000, CloseDate: '2026-07-15', AccountId: accountIds[38]!, Probability: 45, Description: 'SKYDMT PBT 원료 유럽 신규 공급. 연간 예상 수요: 4800톤. 자동차/전기전자 PBT 수요 증가 대응.' },
    { Name: '[SKYDMT] Toray Industries 신규 필름 라인', StageName: 'Needs Analysis', Amount: 9800000000, CloseDate: '2026-08-20', AccountId: accountIds[36]!, Probability: 35, Description: 'SKYDMT 차세대 폴리에스터 필름 신규 라인. 연간 예상 수요: 5500톤. 전기차 배터리 필름 수요 급증 대응.' },
    { Name: '[SKYDMT] Hyosung 수소연료전지 멤브레인 원료', StageName: 'Qualification', Amount: 6200000000, CloseDate: '2026-09-30', AccountId: accountIds[35]!, Probability: 25, Description: 'SKYDMT 수소연료전지 멤브레인 원료 신규 적용. 연간 예상 수요: 3500톤. 친환경 에너지 신규 시장 개척.' },
    { Name: '[SKYDMT] Indorama Ventures 중동 시장 확대', StageName: 'Prospecting', Amount: 22000000000, CloseDate: '2026-11-01', AccountId: accountIds[37]!, Probability: 10, Description: 'SKYDMT 중동 폴리에스터 시장 공급 확대. 연간 예상 수요: 12000톤. SABIC 인근 경쟁 환경 분석 중.' },
    { Name: '[SKYDMT] Evonik Industries 의약 원료 신규', StageName: 'Prospecting', Amount: 5500000000, CloseDate: '2026-12-15', AccountId: accountIds[38]!, Probability: 10, Description: 'SKYDMT 고순도 의약용 원료 신규 적용. 연간 예상 수요: 3100톤. 제약 DMT 시장 초기 탐색.' },
    { Name: '[SKYDMT] Toray Industries 탄소섬유 복합재', StageName: 'Closed Lost', Amount: 14000000000, CloseDate: '2024-08-10', AccountId: accountIds[36]!, Probability: 0, Description: 'SKYDMT 탄소섬유 복합재 원료 신규 시장 진출 실패. 도레이 자체 생산 체계 구축 결정.' },
    { Name: '[SKYDMT] Indorama Ventures 북미 공장 직납', StageName: 'Perception Analysis', Amount: 18000000000, CloseDate: '2026-06-10', AccountId: accountIds[37]!, Probability: 40, Description: 'SKYDMT 북미 공장 직납 물류 체계 구축. 연간 예상 수요: 10000톤. 물류비 절감 및 납기 단축 방안.' },
    { Name: '[SKYDMT] Hyosung 재활용 폴리에스터 원료 전환', StageName: 'Id. Decision Makers', Amount: 14000000000, CloseDate: '2026-05-20', AccountId: accountIds[35]!, Probability: 50, Description: 'SKYDMT 기반 재활용 폴리에스터 원료 전환. 연간 예상 수요: 7900톤. 타이어코드 재활용 원료 의무화 대응.' },
    // ── SKYCHDM (10건) ──
    { Name: '[SKYCHDM] AkzoNobel 코팅 수지 원료 장기공급', StageName: 'Closed Won', Amount: 8200000000, CloseDate: '2025-01-20', AccountId: accountIds[30]!, Probability: 100, Description: 'SKYCHDM 코일/캔 코팅 수지 원료. 연간 예상 수요: 2800톤. CHDM 기반 내가수분해성/내후성 코팅 수지 독점 공급.' },
    { Name: '[SKYCHDM] BASF Coatings 친환경 수지 원료', StageName: 'Closed Won', Amount: 5600000000, CloseDate: '2024-08-15', AccountId: accountIds[32]!, Probability: 100, Description: 'SKYCHDM 친환경 수성 코팅 수지 원료. 연간 예상 수요: 1900톤. EU VOC 저감 수성 코팅 원료 전환.' },
    { Name: '[SKYCHDM] Indorama Ventures 코폴리에스터 원료', StageName: 'Closed Won', Amount: 12000000000, CloseDate: '2025-06-10', AccountId: accountIds[37]!, Probability: 100, Description: 'SKYCHDM 코폴리에스터 원료 대량 공급. 연간 예상 수요: 4100톤. CHDM 생산능력 25% 확대 물량 우선 배정.' },
    { Name: '[SKYCHDM] PPG Industries 고성능 코팅 원료', StageName: 'Negotiation/Review', Amount: 6800000000, CloseDate: '2026-02-20', AccountId: accountIds[31]!, Probability: 80, Description: 'SKYCHDM 고성능 내후성 코팅 수지 원료. 연간 예상 수요: 2300톤. 건축/인프라용 고내구 도료 원료.' },
    { Name: '[SKYCHDM] Sherwin-Williams 산업용 코팅 원료', StageName: 'Proposal/Price Quote', Amount: 5200000000, CloseDate: '2026-04-15', AccountId: accountIds[33]!, Probability: 60, Description: 'SKYCHDM 산업용 분체 도장 원료. 연간 예상 수요: 1800톤. 내부식성/내화학성 요건 충족 원료.' },
    { Name: '[SKYCHDM] Evonik Industries 폴리우레탄 원료', StageName: 'Id. Decision Makers', Amount: 4100000000, CloseDate: '2026-05-30', AccountId: accountIds[38]!, Probability: 50, Description: 'SKYCHDM 폴리우레탄 코팅용 폴리에스터 폴리올 원료. 연간 예상 수요: 1400톤. 고성능 PU 코팅 원료 채택.' },
    { Name: '[SKYCHDM] AkzoNobel 아시아 공급 확대', StageName: 'Value Proposition', Amount: 4500000000, CloseDate: '2026-07-10', AccountId: accountIds[30]!, Probability: 45, Description: 'SKYCHDM 아시아 코팅 시장 공급 확대. 연간 예상 수요: 1550톤. 아시아 코팅 수지 수요 증가 대응.' },
    { Name: '[SKYCHDM] BASF Coatings 자동차 코팅 확대', StageName: 'Needs Analysis', Amount: 3800000000, CloseDate: '2026-08-25', AccountId: accountIds[32]!, Probability: 35, Description: 'SKYCHDM 자동차 OEM 코팅 원료 확대. 연간 예상 수요: 1300톤. 전기차 도장 공정 친환경 원료 전환.' },
    { Name: '[SKYCHDM] Lonza Group 제약용 원료 신규', StageName: 'Qualification', Amount: 2200000000, CloseDate: '2026-09-15', AccountId: accountIds[39]!, Probability: 25, Description: 'SKYCHDM 의약용 고순도 CHDM 원료. 연간 예상 수요: 750톤. FDA/EMA 의약 원료 규격 인증 진행 중.' },
    { Name: '[SKYCHDM] Indorama Ventures 중동 공장 공급', StageName: 'Prospecting', Amount: 8500000000, CloseDate: '2026-11-20', AccountId: accountIds[37]!, Probability: 10, Description: 'SKYCHDM 중동 폴리에스터 공장 원료 공급. 연간 예상 수요: 2900톤. SABIC 인근 공장 직납 체계 검토.' },
    // ── SKYDMCD (10건) ──
    { Name: '[SKYDMCD] PPG Industries 코팅 원료 장기공급', StageName: 'Closed Won', Amount: 4500000000, CloseDate: '2024-11-10', AccountId: accountIds[31]!, Probability: 100, Description: 'SKYDMCD 코팅용 폴리에스터 수지 원료. 연간 예상 수요: 1200톤. 액상 편리성 우수. 분말형 SKYCHDA 대체.' },
    { Name: '[SKYDMCD] BASF Coatings IT소재 시약 공급', StageName: 'Closed Won', Amount: 3200000000, CloseDate: '2025-04-15', AccountId: accountIds[32]!, Probability: 100, Description: 'SKYDMCD IT소재 시약용 고순도 원료. 연간 예상 수요: 850톤. 반도체 공정 관련 특수 화학 원료.' },
    { Name: '[SKYDMCD] Evonik Industries 의약 중간체', StageName: 'Closed Won', Amount: 5800000000, CloseDate: '2025-08-20', AccountId: accountIds[38]!, Probability: 100, Description: 'SKYDMCD 제약 중간체 원료 유럽 공급. 연간 예상 수요: 1550톤. GMP 인증 의약 원료 공급.' },
    { Name: '[SKYDMCD] Lonza Group 고순도 제약 원료', StageName: 'Closed Won', Amount: 7200000000, CloseDate: '2024-07-05', AccountId: accountIds[39]!, Probability: 100, Description: 'SKYDMCD 고순도 의약 중간체 유럽 공급. 연간 예상 수요: 1920톤. FDA/EMA 인증 GMP 시설 직납.' },
    { Name: '[SKYDMCD] Sherwin-Williams 분체도장 원료', StageName: 'Negotiation/Review', Amount: 3800000000, CloseDate: '2026-03-10', AccountId: accountIds[33]!, Probability: 80, Description: 'SKYDMCD 산업용 분체 도장 원료. 연간 예상 수요: 1010톤. 액상 원료 공정 효율화 전환.' },
    { Name: '[SKYDMCD] AkzoNobel 고성능 도료 원료', StageName: 'Proposal/Price Quote', Amount: 4100000000, CloseDate: '2026-04-30', AccountId: accountIds[30]!, Probability: 60, Description: 'SKYDMCD 고성능 방청 도료 원료. 연간 예상 수요: 1090톤. 해양/인프라 내식성 도료 원료 채택.' },
    { Name: '[SKYDMCD] Lonza Group 물량 확대 재계약', StageName: 'Id. Decision Makers', Amount: 8500000000, CloseDate: '2026-05-25', AccountId: accountIds[39]!, Probability: 50, Description: 'SKYDMCD 계약 물량 20% 확대 재계약. 연간 예상 수요: 2270톤. 신규 의약 파이프라인 원료 수요 증가.' },
    { Name: '[SKYDMCD] Evonik Industries 아시아 공급', StageName: 'Value Proposition', Amount: 3500000000, CloseDate: '2026-07-20', AccountId: accountIds[38]!, Probability: 45, Description: 'SKYDMCD 아시아 정밀화학 시장 공급. 연간 예상 수요: 930톤. 한국/일본 정밀화학 공장 직납.' },
    { Name: '[SKYDMCD] BASF Coatings 자동차 코팅 원료 확대', StageName: 'Needs Analysis', Amount: 2800000000, CloseDate: '2026-08-15', AccountId: accountIds[32]!, Probability: 35, Description: 'SKYDMCD 자동차 클리어코트 원료 확대. 연간 예상 수요: 745톤. 전기차 경량화 소재 코팅 원료.' },
    { Name: '[SKYDMCD] Lonza Group 미국 공장 직납', StageName: 'Prospecting', Amount: 5200000000, CloseDate: '2026-11-10', AccountId: accountIds[39]!, Probability: 10, Description: 'SKYDMCD 미국 제약 공장 직납 체계. 연간 예상 수요: 1390톤. FDA 인증 미국 공장 직납 검토.' },
    // ── SKYCHDA (10건) ──
    { Name: '[SKYCHDA] AkzoNobel 분체도장 수지 원료', StageName: 'Closed Won', Amount: 5500000000, CloseDate: '2025-02-05', AccountId: accountIds[30]!, Probability: 100, Description: 'SKYCHDA 분체 도장용 폴리에스터 수지 원료. 연간 예상 수요: 1400톤. 자동차/건축 분체 도장 원료 독점 공급.' },
    { Name: '[SKYCHDA] Sherwin-Williams 항공우주 코팅 원료', StageName: 'Closed Won', Amount: 4800000000, CloseDate: '2024-10-20', AccountId: accountIds[33]!, Probability: 100, Description: 'SKYCHDA 항공우주 고성능 코팅 원료. 연간 예상 수요: 1220톤. 내황변성/내후성 우수. Boeing/Airbus 납품 체인.' },
    { Name: '[SKYCHDA] Evonik Industries 제약 원료 중간체', StageName: 'Closed Won', Amount: 6200000000, CloseDate: '2025-05-25', AccountId: accountIds[38]!, Probability: 100, Description: 'SKYCHDA 의약 원료 중간체 유럽 공급. 연간 예상 수요: 1580톤. GMP 인증 고순도 원료 장기 공급.' },
    { Name: '[SKYCHDA] BASF Coatings 폴리우레탄 코팅', StageName: 'Closed Won', Amount: 3900000000, CloseDate: '2024-06-30', AccountId: accountIds[32]!, Probability: 100, Description: 'SKYCHDA 폴리우레탄 코팅 원료 공급. 연간 예상 수요: 990톤. 건축/자동차 2K PU 코팅 원료.' },
    { Name: '[SKYCHDA] PPG Industries 내식성 코팅 원료', StageName: 'Negotiation/Review', Amount: 4200000000, CloseDate: '2026-03-20', AccountId: accountIds[31]!, Probability: 80, Description: 'SKYCHDA 내식성 코팅 원료 장기 계약. 연간 예상 수요: 1070톤. 해양/인프라 내식성 코팅 원료.' },
    { Name: '[SKYCHDA] Lonza Group 고순도 의약 원료', StageName: 'Proposal/Price Quote', Amount: 7800000000, CloseDate: '2026-05-05', AccountId: accountIds[39]!, Probability: 60, Description: 'SKYCHDA 고순도 의약 중간체 유럽 공급. 연간 예상 수요: 1990톤. FDA 인증 GMP 시설 납품.' },
    { Name: '[SKYCHDA] AkzoNobel 자동차 도장 원료 확대', StageName: 'Id. Decision Makers', Amount: 3600000000, CloseDate: '2026-06-20', AccountId: accountIds[30]!, Probability: 50, Description: 'SKYCHDA 자동차 OEM 도장 원료 확대. 연간 예상 수요: 920톤. EV 친환경 도장 공정 원료 전환.' },
    { Name: '[SKYCHDA] Evonik Industries 아시아 공장 공급', StageName: 'Value Proposition', Amount: 2900000000, CloseDate: '2026-07-25', AccountId: accountIds[38]!, Probability: 45, Description: 'SKYCHDA 아시아 정밀화학 시장 확대. 연간 예상 수요: 740톤. 싱가포르/한국 생산 기지 직납.' },
    { Name: '[SKYCHDA] Sherwin-Williams 건설 인프라 코팅', StageName: 'Needs Analysis', Amount: 3100000000, CloseDate: '2026-08-10', AccountId: accountIds[33]!, Probability: 35, Description: 'SKYCHDA 건설/인프라 고성능 코팅 원료. 연간 예상 수요: 790톤. 교량/철도 구조물 내식성 코팅 원료.' },
    { Name: '[SKYCHDA] Lonza Group 바이오 원료 신규 적용', StageName: 'Prospecting', Amount: 4500000000, CloseDate: '2026-12-05', AccountId: accountIds[39]!, Probability: 10, Description: 'SKYCHDA 바이오 의약품 원료 신규 적용. 연간 예상 수요: 1150톤. 바이오 의약 파이프라인 원료 초기 탐색.' },
  ];

  let oppCount = 0;
  for (const opp of oppDefs) {
    await create(token, base, 'Opportunity', opp);
    oppCount++;
    if (oppCount % 20 === 0) console.log(`  ✅ Opportunities ${oppCount}건 완료`);
    await sleep(50);
  }
  console.log(`  ✅ 총 Opportunities ${oppCount}건 생성 완료`);

  // ── 4. Leads (100개) ─────────────────────────────────────────────────────────
  console.log('\n🎯 Creating Leads (100)...');
  const leadDefs = [
    // 유럽 (30개)
    { FirstName: 'Oliver', LastName: 'Schmidt', Company: 'Henkel AG', Email: 'o.schmidt@henkel.com', Title: 'Sustainable Packaging Lead', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'Germany', Phone: '+49-211-797-0', Description: 'ECOTRIA CR 세탁세제 용기 친환경 전환 문의. Henkel 2030 플라스틱 전략 연계.' },
    { FirstName: 'Emma', LastName: 'Wilson', Company: 'Unilever', Email: 'e.wilson@unilever.com', Title: 'Packaging Innovation Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'United Kingdom', Phone: '+44-20-7822-5252', Description: 'ECOTRIA CLARO 샴푸/바디워시 용기 전환. Unilever Sustainable Living Plan 연계.' },
    { FirstName: 'Lucas', LastName: 'Müller', Company: 'BASF SE', Email: 'l.mueller@basf.com', Title: 'Specialty Polymer Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Germany', Phone: '+49-621-60-0', Description: 'SKYCHDM/SKYDMCD 폴리우레탄 원료 문의. BASF 특수 수지 원료 다변화 검토.' },
    { FirstName: 'Sophie', LastName: 'Leroy', Company: 'Pernod Ricard', Email: 's.leroy@pernodricard.com', Title: 'Packaging Sustainability Manager', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'France', Phone: '+33-1-7075-6100', Description: 'SKYGREEN 프리미엄 주류 병 투명 용기 문의. Pernod Ricard 친환경 패키징 전략.' },
    { FirstName: 'Jan', LastName: 'de Boer', Company: 'Heineken NV', Email: 'j.deboer@heineken.com', Title: 'Global Packaging Procurement', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Netherlands', Phone: '+31-20-523-9239', Description: 'SKYPET CR 맥주병/캔 포장 친환경 전환 탐색. EverGreen 전략 연계.' },
    { FirstName: 'Lena', LastName: 'Fischer', Company: 'Mondelez International', Email: 'l.fischer@mdlz.com', Title: 'Packaging R&D Manager', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Switzerland', Phone: '+41-43-434-2200', Description: 'ECOZEN 식품 포장 친환경 소재 문의. 초코렛/과자 포장 BPA-free 전환 프로젝트.' },
    { FirstName: 'Marco', LastName: 'Rossi', Company: 'Ferrero Group', Email: 'm.rossi@ferrero.com', Title: 'Sustainable Packaging Director', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Italy', Phone: '+39-0172-218111', Description: 'SKYGREEN/ECOZEN 초콜릿 선물 포장 친환경 소재. Ferrero 지속가능성 전략 연계.' },
    { FirstName: 'Klara', LastName: 'Novak', Company: 'Siegwerk Group', Email: 'k.novak@siegwerk.com', Title: 'Coating Raw Material Manager', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'Germany', Phone: '+49-2241-304-0', Description: 'SKYDMCD/SKYCHDA 인쇄 잉크 원료 문의. 식품 포장 인쇄 친환경 원료 전환.' },
    { FirstName: 'Anna', LastName: 'Kowalski', Company: 'PKN Orlen', Email: 'a.kowalski@orlen.pl', Title: 'Chemical Procurement Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Poland', Phone: '+48-24-256-0000', Description: 'SKYDMT 폴리에스터 원료 폴란드 공급 탐색. 동유럽 화학 원료 공급망 다변화.' },
    { FirstName: 'Pierre', LastName: 'Moreau', Company: 'Air Liquide', Email: 'p.moreau@airliquide.com', Title: 'Specialty Chemicals Lead', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'France', Phone: '+33-1-4075-7500', Description: 'SKYDMCD 산업가스 관련 화학 원료 탐색. 초기 접촉 단계.' },
    { FirstName: 'Gustav', LastName: 'Lindqvist', Company: 'Neste Oyj', Email: 'g.lindqvist@neste.com', Title: 'Bio-based Material Sourcing', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Finland', Phone: '+358-10-458-11', Description: 'ECOZEN/ECOTRIA CR 바이오 기반 소재 협력 탐색. 핀란드 바이오리파이너리 연계 순환경제.' },
    { FirstName: 'Ingrid', LastName: 'Hansen', Company: 'Orkla ASA', Email: 'i.hansen@orkla.com', Title: 'Packaging Procurement Director', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Norway', Phone: '+47-22-54-40-00', Description: 'ECOTRIA CLARO 식품 포장 친환경 전환. 노르딕 시장 친환경 패키징 선도 전략.' },
    { FirstName: 'James', LastName: 'Murphy', Company: 'Reckitt Benckiser', Email: 'j.murphy@reckitt.com', Title: 'Sustainable Packaging Manager', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'United Kingdom', Phone: '+44-1753-217-800', Description: 'ECOTRIA CR 세정제/위생용품 용기 친환경 전환. Reckitt ESG 2030 목표 대응.' },
    { FirstName: 'Felix', LastName: 'Wagner', Company: 'Covestro AG', Email: 'f.wagner@covestro.com', Title: 'Raw Material Sourcing Lead', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Warm', Country: 'Germany', Phone: '+49-214-6009-0', Description: 'SKYCHDM CHDM 원료 문의. 코베스트로 폴리우레탄 원료 다변화 검토.' },
    { FirstName: 'Hanna', LastName: 'Svensson', Company: 'Essity AB', Email: 'h.svensson@essity.com', Title: 'Sustainable Material Director', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Sweden', Phone: '+46-8-788-5100', Description: 'SKYPET CR 위생용품 포장 친환경 전환. 스웨덴 친환경 포장 규제 대응.' },
    { FirstName: 'Diego', LastName: 'Garcia', Company: 'Repsol SA', Email: 'd.garcia@repsol.com', Title: 'Specialty Chemical Manager', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'Spain', Phone: '+34-91-348-8000', Description: 'SKYDMT 스페인 석유화학 원료 공급 탐색. 스페인 폴리에스터 시장 진출 검토.' },
    { FirstName: 'Roberto', LastName: 'Bianchi', Company: 'Mapei SpA', Email: 'r.bianchi@mapei.com', Title: 'Construction Material Sourcing', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Italy', Phone: '+39-02-3764-0', Description: 'SKYCHDA 건설용 코팅 원료 문의. 이탈리아 건설 자재 친환경 소재 전환.' },
    { FirstName: 'Martina', LastName: 'Hofer', Company: 'Anton Paar GmbH', Email: 'm.hofer@antonpaar.com', Title: 'Laboratory Equipment Sourcing', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Cold', Country: 'Austria', Phone: '+43-316-257-0', Description: 'SKYPURA 실험장비 내열 부품 소재 문의. 오스트리아 정밀기기 소재 탐색.' },
    { FirstName: 'Thomas', LastName: 'Bauer', Company: 'Linde plc', Email: 't.bauer@linde.com', Title: 'Industrial Gas Equipment Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Cold', Country: 'Germany', Phone: '+49-89-3572-0', Description: 'SKYTRA 산업가스 설비 부품 소재 탐색. 초기 사전 검토 단계.' },
    { FirstName: 'Pilar', LastName: 'Martinez', Company: 'Alpek Polyester', Email: 'p.martinez@alpek.com', Title: 'Monomer Procurement Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Spain', Phone: '+34-93-400-0000', Description: 'SKYDMT/SKYCHDM 코폴리에스터 원료 문의. Alpek 유럽 생산 기지 원료 공급 협력.' },
    { FirstName: 'Charlotte', LastName: 'Dubois', Company: 'L\'Occitane Group', Email: 'c.dubois@loccitane.com', Title: 'Packaging Sustainability Manager', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'France', Phone: '+33-4-9205-7600', Description: 'ECOTRIA CLARO 천연 화장품 용기 친환경 전환. 프리미엄 자연주의 브랜드 지속가능 패키징.' },
    { FirstName: 'Lars', LastName: 'Eriksson', Company: 'Alfa Laval AB', Email: 'l.eriksson@alfalaval.com', Title: 'Industrial Equipment Material Lead', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'Sweden', Phone: '+46-46-36-65-00', Description: 'SKYTRA 산업용 열교환기 부품 소재 탐색. 초기 문의 단계.' },
    { FirstName: 'Nikolai', LastName: 'Petrov', Company: 'Gazprom Neft', Email: 'n.petrov@gazpromneft.ru', Title: 'Chemical Raw Material Buyer', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Russia', Phone: '+7-812-363-3000', Description: 'SKYDMT DMT 원료 러시아 공급 문의. 러시아 폴리에스터 시장 진출 탐색.' },
    { FirstName: 'Elena', LastName: 'Vasquez', Company: 'Inditex Group', Email: 'e.vasquez@inditex.com', Title: 'Sustainable Textile Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Spain', Phone: '+34-981-185-400', Description: 'SKYPET CR 재활용 섬유 원료 문의. Zara 등 패스트패션 친환경 소재 전환 프로젝트.' },
    { FirstName: 'Michael', LastName: 'Brennan', Company: 'CRH plc', Email: 'm.brennan@crh.com', Title: 'Construction Material Procurement', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Ireland', Phone: '+353-1-634-4340', Description: 'SKYCHDA 건설용 분체 도장 원료 문의. 유럽 건설 인프라 친환경 코팅 소재.' },
    { FirstName: 'Antoine', LastName: 'Blanc', Company: 'Tereos Group', Email: 'a.blanc@tereos.com', Title: 'Bio-based Chemical Sourcing', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'France', Phone: '+33-3-2025-7300', Description: 'ECOTRION 바이오 기반 모노머 협력 문의. 바이오매스 화학 원료 파트너십 탐색.' },
    { FirstName: 'Stefan', LastName: 'Hoffmann', Company: 'Wacker Chemie AG', Email: 's.hoffmann@wacker.com', Title: 'Polymer Raw Material Manager', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Germany', Phone: '+49-89-6279-0', Description: 'SKYCHDM 실리콘 폴리에스터 혼합 수지 원료 문의. 특수 코팅 수지 신규 원료 탐색.' },
    { FirstName: 'Fiona', LastName: 'MacAllister', Company: 'DS Smith plc', Email: 'f.macallister@dssmith.com', Title: 'Sustainable Packaging Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'United Kingdom', Phone: '+44-207-756-1800', Description: 'ECOTRIA CR 재활용 포장재 원료 문의. DS Smith Now & Next 지속가능 전략 연계.' },
    { FirstName: 'Arjun', LastName: 'Sharma', Company: 'Tata Chemicals Europe', Email: 'a.sharma@tatachemicals.com', Title: 'Chemical Procurement Director', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'United Kingdom', Phone: '+44-117-915-2000', Description: 'SKYDMT/SKYCHDM 특수 화학 원료 문의. Tata 그룹 유럽 사업 소재 공급망 검토.' },
    { FirstName: 'Matteo', LastName: 'Conti', Company: 'Snam SpA', Email: 'm.conti@snam.it', Title: 'Green Energy Material Lead', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'Italy', Phone: '+39-02-3703-1', Description: 'SKYTRA 수소 파이프라인 관련 부품 소재 탐색. 이탈리아 그린에너지 인프라 소재 검토.' },
    // 북미 (25개)
    { FirstName: 'Jennifer', LastName: 'Adams', Company: 'Procter & Gamble', Email: 'j.adams@pg.com', Title: 'Packaging Sustainability VP', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'United States', Phone: '+1-513-983-1100', Description: 'ECOTRIA CR 세제/샴푸 용기 친환경 전환. P&G Ambition 2030 패키징 목표 달성 파트너.' },
    { FirstName: 'David', LastName: 'Miller', Company: 'Church & Dwight', Email: 'd.miller@churchdwight.com', Title: 'Sustainable Materials Director', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'United States', Phone: '+1-609-806-1200', Description: 'SKYGREEN/ECOTRIA CR 소비재 포장 친환경 전환. ARM & HAMMER 등 브랜드 패키징 전환.' },
    { FirstName: 'Lisa', LastName: 'Thompson', Company: 'Colgate-Palmolive', Email: 'l.thompson@colgate.com', Title: 'Packaging Innovation Lead', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'United States', Phone: '+1-212-310-2000', Description: 'ECOTRIA CLARO 치약/세안 포장 친환경 전환. Colgate 지속가능 패키징 전략.' },
    { FirstName: 'Kevin', LastName: 'Brown', Company: 'Graphic Packaging International', Email: 'k.brown@graphicpkg.com', Title: 'Sustainable Material Sourcing Lead', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'United States', Phone: '+1-770-240-7200', Description: 'SKYPET CR 식품 포장 원료 문의. 식품 패키징 재활용 소재 전환 프로젝트.' },
    { FirstName: 'Patricia', LastName: 'White', Company: 'Pactiv Evergreen', Email: 'p.white@pactivevergreen.com', Title: 'Packaging Material Director', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'United States', Phone: '+1-847-482-2000', Description: 'ECOZEN 식품 용기/ECOTRIA 포장재 문의. 북미 식품 서비스 포장재 친환경 전환.' },
    { FirstName: 'Brian', LastName: 'Taylor', Company: 'Sealed Air Corporation', Email: 'b.taylor@sealedair.com', Title: 'Advanced Material Sourcing Lead', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'United States', Phone: '+1-201-791-7600', Description: 'ECOTRIA CR 식품 보호 포장재 재활용 소재 문의. SEE 2025 지속가능 전략 연계.' },
    { FirstName: 'Nancy', LastName: 'Clark', Company: 'Sonoco Products', Email: 'n.clark@sonoco.com', Title: 'Packaging Sustainability Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'United States', Phone: '+1-843-383-7000', Description: 'SKYPET CR 재활용 포장 소재 문의. Sonoco 지속가능 포장 혁신 전략.' },
    { FirstName: 'Richard', LastName: 'Johnson', Company: 'Eastman Chemical', Email: 'r.johnson@eastman.com', Title: 'Monomer Technology Director', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'United States', Phone: '+1-423-229-2000', Description: 'SKYCHDM CHDM 원료 기술 협력 문의. Eastman 코폴리에스터 사업 원료 다변화.' },
    { FirstName: 'Helen', LastName: 'Martinez', Company: 'Avery Dennison', Email: 'h.martinez@averydennison.com', Title: 'Sustainable Label Material Manager', Status: 'Open - Not Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'United States', Phone: '+1-626-304-2000', Description: 'SKYBON 라벨 코팅 수지 원료 문의. 친환경 라벨 소재 전환 프로젝트.' },
    { FirstName: 'Steven', LastName: 'Anderson', Company: 'Bemis Company', Email: 's.anderson@bemis.com', Title: 'Flexible Packaging Material Lead', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'United States', Phone: '+1-920-727-4100', Description: 'ECOTRIA CR 유연 포장재 소재 문의. 식품 포장재 화학재활용 소재 전환.' },
    { FirstName: 'Michelle', LastName: 'Lee', Company: 'AptarGroup Inc', Email: 'm.lee@aptargroup.com', Title: 'Biobased Material Innovation Manager', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'United States', Phone: '+1-815-477-0624', Description: 'ECOZEN 바이오매스 디스펜서 소재 신규 문의. 의료/화장품 친환경 소재 탐색.' },
    { FirstName: 'Carlos', LastName: 'Hernandez', Company: 'Jarden Corporation', Email: 'c.hernandez@jarden.com', Title: 'Consumer Product Material Lead', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'United States', Phone: '+1-561-912-4700', Description: 'ECOZEN Pro 소비재 용기 문의. 캠핑/아웃도어 제품 친환경 소재 전환.' },
    { FirstName: 'Rachel', LastName: 'Robinson', Company: 'DowDuPont Specialty', Email: 'r.robinson@dow.com', Title: 'Specialty Polymer Sourcing', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'United States', Phone: '+1-989-636-1000', Description: 'SKYCHDM 특수 폴리머 원료 탐색. Dow 코폴리에스터 원료 다변화 초기 검토.' },
    { FirstName: 'Daniel', LastName: 'Wilson', Company: 'Ashland Global Holdings', Email: 'd.wilson@ashland.com', Title: 'Specialty Chemical Procurement', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'United States', Phone: '+1-740-753-4341', Description: 'SKYDMCD 특수 화학 원료 문의. 코팅/접착제 원료 다변화 검토.' },
    { FirstName: 'Susan', LastName: 'Jackson', Company: 'Momentive Performance', Email: 's.jackson@momentive.com', Title: 'Advanced Material Sourcing Lead', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Cold', Country: 'United States', Phone: '+1-518-233-3737', Description: 'SKYCHDA 실록산 혼합 코팅 원료 탐색. 초기 기술 검토 단계.' },
    { FirstName: 'Thomas', LastName: 'Davis', Company: 'Celanese Corporation', Email: 't.davis@celanese.com', Title: 'Engineered Materials Director', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'United States', Phone: '+1-972-443-4000', Description: 'SKYPURA 엔지니어링 플라스틱 원료 문의. Celanese 특수 수지 포트폴리오 확대.' },
    { FirstName: 'Angela', LastName: 'Harris', Company: 'International Flavors', Email: 'a.harris@iff.com', Title: 'Sustainable Packaging Sourcing', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'United States', Phone: '+1-212-765-5500', Description: 'ECOTRIA CR 향료/화장품 포장 친환경 소재 문의. IFF 지속가능 포장 전략.' },
    { FirstName: 'Mark', LastName: 'Taylor', Company: 'Albemarle Corporation', Email: 'm.taylor@albemarle.com', Title: 'Fine Chemical Raw Material Lead', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'United States', Phone: '+1-980-299-5700', Description: 'SKYDMCD 정밀화학 원료 문의. 리튬/특수화학 포트폴리오 확대 연계.' },
    { FirstName: 'Deborah', LastName: 'Moore', Company: 'Cabot Corporation', Email: 'd.moore@cabot-corp.com', Title: 'Specialty Chemical Sourcing', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'United States', Phone: '+1-617-345-0100', Description: 'SKYCHDA 분체 도장 원료 탐색. 초기 문의 단계.' },
    { FirstName: 'Paul', LastName: 'Thompson', Company: 'HB Fuller Company', Email: 'p.thompson@hbfuller.com', Title: 'Adhesive Raw Material Manager', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Hot', Country: 'United States', Phone: '+1-651-236-5900', Description: 'SKYBON 접착제 수지 원료 문의. 산업용 접착제 폴리에스터 수지 원료 전환.' },
    { FirstName: 'Karen', LastName: 'Lewis', Company: 'RPM International', Email: 'k.lewis@rpminc.com', Title: 'Coating Raw Material Director', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'United States', Phone: '+1-330-273-5090', Description: 'SKYCHDA/SKYDMCD 코팅 원료 문의. RPM 고성능 건축 코팅 원료 공급망 다변화.' },
    { FirstName: 'George', LastName: 'Brown', Company: 'Sun Chemical', Email: 'g.brown@sunchemical.com', Title: 'Printing Ink Raw Material Lead', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'United States', Phone: '+1-201-478-5000', Description: 'SKYDMCD 인쇄 잉크 원료 문의. 식품 포장 인쇄 친환경 원료 전환.' },
    { FirstName: 'Dorothy', LastName: 'Wilson', Company: 'Ferro Corporation', Email: 'd.wilson2@ferro.com', Title: 'Specialty Coating Material Manager', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'United States', Phone: '+1-216-875-5600', Description: 'SKYCHDA 세라믹/유리 코팅 원료 탐색. 특수 기능성 코팅 원료 검토.' },
    { FirstName: 'Charles', LastName: 'Johnson', Company: 'Cytec Solvay Group', Email: 'c.johnson@cytec.com', Title: 'Advanced Composite Material Lead', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'United States', Phone: '+1-973-357-3100', Description: 'SKYTRA 복합재료 원료 문의. 항공우주 고성능 복합재 소재 탐색.' },
    { FirstName: 'Ruth', LastName: 'Davis', Company: 'W. L. Gore & Associates', Email: 'r.davis@gore.com', Title: 'Advanced Material Sourcing', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'United States', Phone: '+1-410-506-7787', Description: 'SKYPEL 고기능 멤브레인 소재 탐색. Gore-Tex 관련 특수 소재 초기 검토.' },
    // 아시아 (25개)
    { FirstName: '伊藤', LastName: '一郎', Company: 'KAO Corporation', Email: 'i.ito@kao.com', Title: '環境パッケージング部長', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'Japan', Phone: '+81-3-3660-7111', Description: 'ECOTRIA CLARO 세제/화장품 용기 친환경 전환. Kao ESG 2030 전략 연계.' },
    { FirstName: '渡辺', LastName: '誠', Company: 'Lion Corporation', Email: 'm.watanabe@lion.co.jp', Title: '持続可能パッケージング担当', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Japan', Phone: '+81-3-3621-6211', Description: 'SKYGREEN 세제/구강용품 용기 소재 문의. Lion 친환경 패키징 전략.' },
    { FirstName: '高橋', LastName: '花子', Company: 'Ajinomoto Co', Email: 'h.takahashi@ajinomoto.com', Title: '調達サステナビリティ担当', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Japan', Phone: '+81-3-5250-8111', Description: 'ECOZEN 식품 조미료 용기 친환경 소재 문의. Ajinomoto ASV 전략 연계.' },
    { FirstName: '中村', LastName: '健二', Company: 'Nippon Paint Holdings', Email: 'k.nakamura@nipponpaint.co.jp', Title: '塗料原料調達マネージャー', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Japan', Phone: '+81-6-6455-7161', Description: 'SKYBON/SKYCHDA 도료 원료 일본 공급 문의. 건축/자동차 도료 소재 탐색.' },
    { FirstName: '佐々木', LastName: '雄一', Company: 'Teijin Limited', Email: 'y.sasaki@teijin.co.jp', Title: 'ポリエステル原料調達部長', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'Japan', Phone: '+81-3-3506-4529', Description: 'SKYDMT DMT 원료 일본 공급 문의. Teijin 폴리에스터 섬유/필름 원료 다변화.' },
    { FirstName: '김', LastName: '민준', Company: '삼성물산', Email: 'mj.kim@samsung.com', Title: '친환경 소재 사업개발팀장', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'South Korea', Phone: '+82-2-2145-2114', Description: 'ECOTRIA CR/SKYPET CR 재활용 소재 유통 문의. 삼성물산 친환경 소재 사업 확대.' },
    { FirstName: '이', LastName: '재현', Company: '롯데케미칼', Email: 'jh.lee2@lotte.com', Title: 'ESG 소재 개발 담당', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'South Korea', Phone: '+82-2-6974-1114', Description: 'SKYDMT/SKYCHDM 폴리에스터 원료 문의. 롯데케미칼 코폴리에스터 사업 협력 탐색.' },
    { FirstName: '박', LastName: '성민', Company: '코오롱인더스트리', Email: 'sm.park@kolon.com', Title: '섬유소재 구매팀장', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'South Korea', Phone: '+82-2-3677-3114', Description: 'SKYPET CR 타이어코드/산업용 섬유 원료 문의. 코오롱 재활용 섬유 사업 확대.' },
    { FirstName: '최', LastName: '지훈', Company: '한화케미칼', Email: 'jh.choi@hanwha.com', Title: '화학 원료 구매 담당', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'South Korea', Phone: '+82-2-729-3114', Description: 'SKYDMT 화학 원료 국내 공급 탐색. 초기 문의 단계.' },
    { FirstName: '张', LastName: '伟', Company: 'Haier Group', Email: 'w.zhang@haier.com', Title: '可持续材料采购总监', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'China', Phone: '+86-532-8893-1888', Description: 'SKYBON 가전 강판 코팅 수지 중국 공급 문의. Haier 글로벌 가전 친환경 소재 전환.' },
    { FirstName: '李', LastName: '娜', Company: 'Hisense Group', Email: 'n.li@hisense.com', Title: '环保材料采购经理', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'China', Phone: '+86-532-8196-7988', Description: 'SKYBON 가전 강판 코팅 수지 문의. Hisense 냉장고/TV 친환경 소재 전환 탐색.' },
    { FirstName: '王', LastName: '伟', Company: 'BYD Company', Email: 'w.wang@byd.com', Title: '新能源汽车材料采购总监', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'China', Phone: '+86-755-8988-8888', Description: 'SKYPET CR 전기차 내장재/SKYPEL 케이블 소재 문의. BYD EV 친환경 소재 전환.' },
    { FirstName: '陈', LastName: '晓明', Company: 'CATL', Email: 'xm.chen@catl.com', Title: '电池材料采购经理', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'China', Phone: '+86-593-8963-8888', Description: 'SKYTRA 배터리 셀 하우징 내열 부품 소재 탐색. CATL 배터리 팩 친환경 소재 검토.' },
    { FirstName: 'Siti', LastName: 'Rahimah', Company: 'LH Plus', Email: 's.rahimah@lhplus.com', Title: 'Product Development Director', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'Malaysia', Phone: '+60-3-7885-0000', Description: 'ECOZEN/SKYPET CR 친환경 주방용품 문의. 2025년 MOU 체결 후속 확대 논의.' },
    { FirstName: 'Somchai', LastName: 'Wongkun', Company: 'Thai Union Group', Email: 's.wongkun@thaiunion.com', Title: 'Sustainable Packaging Director', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Thailand', Phone: '+66-2-298-0024', Description: 'ECOTRIA CLARO 참치 캔 대체 포장 소재 문의. 태국 식품 수출 친환경 포장 탐색.' },
    { FirstName: 'Ananya', LastName: 'Singh', Company: 'Reliance Industries', Email: 'a.singh@ril.com', Title: 'Polyester Raw Material Sourcing', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'India', Phone: '+91-22-3555-5000', Description: 'SKYDMT/SKYCHDM 원료 인도 공급 문의. Reliance 인도 폴리에스터 시장 확대 대응.' },
    { FirstName: 'Rajesh', LastName: 'Kumar', Company: 'Tata Chemicals Ltd', Email: 'r.kumar@tatachemicals.com', Title: 'Specialty Chemical Director', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'India', Phone: '+91-22-6665-8282', Description: 'SKYDMCD 정밀화학 원료 인도 공급 탐색. Tata 인도 화학 사업 포트폴리오 확대.' },
    { FirstName: 'Budi', LastName: 'Santoso', Company: 'Indofood CBP', Email: 'b.santoso@indofood.com', Title: 'Packaging Material Procurement', Status: 'Working - Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Indonesia', Phone: '+62-21-5795-8822', Description: 'ECOZEN 인스턴트 식품 포장 친환경 소재 문의. 인도네시아 식품 포장 규제 대응.' },
    { FirstName: 'Nguyen', LastName: 'Van Minh', Company: 'Vingroup JSC', Email: 'nm.nguyen@vingroup.vn', Title: 'Automotive Material Procurement', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'Vietnam', Phone: '+84-24-3974-9999', Description: 'SKYPET CR 전기차 내장재 소재 문의. VinFast 전기차 친환경 소재 탐색.' },
    { FirstName: '山田', LastName: '次郎', Company: 'Nitto Denko Corporation', Email: 'j.yamada@nitto.com', Title: '機能性材料調達マネージャー', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'Japan', Phone: '+81-6-7632-2111', Description: 'SKYPEL 기능성 필름/테이프 소재 문의. Nitto 전자부품 소재 탐색.' },
    { FirstName: '홍', LastName: '길동', Company: 'SK이노베이션', Email: 'gd.hong@skinnovation.com', Title: 'ESG 원료 사업개발 담당', Status: 'Open - Not Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'South Korea', Phone: '+82-2-2121-5114', Description: 'ECOTRIA CR 화학재활용 원료 협력 문의. SK그룹 내 순환경제 협력 탐색.' },
    { FirstName: 'Huang', LastName: 'Wei', Company: 'Fosun International', Email: 'w.huang@fosun.com', Title: 'Health & Pharma Material Lead', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Cold', Country: 'China', Phone: '+86-21-2306-0000', Description: 'SKYDMCD 제약 원료 중국 공급 탐색. Fosun Pharma 제약 원료 다변화 초기 검토.' },
    { FirstName: '나', LastName: '영수', Company: '금호석유화학', Email: 'ys.na@kkpc.com', Title: '폴리에스터 원료 구매팀장', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'South Korea', Phone: '+82-2-6961-1114', Description: 'SKYDMT DMT 원료 국내 공급 협력 문의. 금호석유화학 폴리에스터 원료 다변화.' },
    { FirstName: 'Kazuki', LastName: 'Yamamoto', Company: 'Mitsubishi Chemical', Email: 'k.yamamoto@m-chemical.co.jp', Title: '機能樹脂原料調達部長', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Japan', Phone: '+81-3-6748-7300', Description: 'SKYCHDM CHDM 원료 일본 공급 문의. 미쓰비시화학 코폴리에스터 원료 다변화.' },
    { FirstName: 'Park', LastName: 'Jae-won', Company: 'LG Chem', Email: 'jw.park@lgchem.com', Title: '특수화학 원료 소싱 담당', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'South Korea', Phone: '+82-2-3773-1114', Description: 'SKYCHDM/SKYDMCD 특수화학 원료 공급 협력 문의. LG화학 코폴리에스터 포트폴리오 확대.' },
    // 중동/남미/아프리카/기타 (20개)
    { FirstName: 'Mohammed', LastName: 'Al-Rashid', Company: 'SABIC', Email: 'm.rashid@sabic.com', Title: 'Chemical Raw Material Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Saudi Arabia', Phone: '+966-1-225-8000', Description: 'SKYDMT/SKYCHDM 원료 중동 공급 문의. SABIC 특수 화학 포트폴리오 확대.' },
    { FirstName: 'Ahmed', LastName: 'Hassan', Company: 'Mubadala Technology', Email: 'a.hassan@mubadala.com', Title: 'Sustainable Material Investment Lead', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'United Arab Emirates', Phone: '+971-2-413-0000', Description: 'ECOTRIA CR/SKYPET CR 순환경제 소재 투자 탐색. UAE 탄소중립 2050 전략 연계.' },
    { FirstName: 'Farouk', LastName: 'Ibrahim', Company: 'Qatar Petrochemical', Email: 'f.ibrahim@qapco.com', Title: 'Chemical Procurement Manager', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Qatar', Phone: '+974-4477-0000', Description: 'SKYDMT 카타르 석유화학 원료 공급 탐색. 중동 폴리에스터 시장 진출 검토.' },
    { FirstName: 'Khalid', LastName: 'Al-Mansouri', Company: 'Abu Dhabi National Energy', Email: 'k.mansouri@taqa.com', Title: 'Sustainable Material Lead', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Cold', Country: 'United Arab Emirates', Phone: '+971-2-691-6100', Description: 'SKYTRA 에너지 설비 부품 소재 탐색. 중동 에너지 인프라 친환경 소재 초기 검토.' },
    { FirstName: 'Carlos', LastName: 'Mendoza', Company: 'Braskem SA', Email: 'c.mendoza@braskem.com', Title: 'Bio-based Polymer Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'Brazil', Phone: '+55-71-3184-1414', Description: 'ECOTRION 바이오 기반 모노머 협력 문의. Braskem 그린 폴리머 원료 파트너십 탐색.' },
    { FirstName: 'Ana', LastName: 'Silva', Company: 'Embraer SA', Email: 'a.silva@embraer.com', Title: 'Aerospace Material Procurement', Status: 'Open - Not Contacted', LeadSource: 'Trade Show', Rating: 'Warm', Country: 'Brazil', Phone: '+55-12-3927-4404', Description: 'SKYCHDA 항공우주 코팅 원료 문의. 브라질 항공기 소재 친환경 전환 탐색.' },
    { FirstName: 'Felipe', LastName: 'Torres', Company: 'Alpek SA de CV', Email: 'f.torres@alpek.com', Title: 'Monomer Procurement Director', Status: 'Working - Contacted', LeadSource: 'Partner Referral', Rating: 'Hot', Country: 'Mexico', Phone: '+52-81-8748-1111', Description: 'SKYDMT/SKYCHDM 멕시코 공급 문의. Alpek 북미 코폴리에스터 원료 다변화.' },
    { FirstName: 'Gustavo', LastName: 'Ramirez', Company: 'Grupo Bimbo', Email: 'g.ramirez@grupobimbo.com', Title: 'Sustainable Packaging Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Mexico', Phone: '+52-55-5268-6600', Description: 'ECOTRIA CR 식품 포장 친환경 소재 문의. Grupo Bimbo 글로벌 지속가능 포장 전략.' },
    { FirstName: 'Thabo', LastName: 'Nkosi', Company: 'Sasol Limited', Email: 't.nkosi@sasol.com', Title: 'Chemical Raw Material Sourcing', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'South Africa', Phone: '+27-10-344-5000', Description: 'SKYDMT 아프리카 화학 원료 공급 탐색. 남아프리카 화학 산업 원료 다변화.' },
    { FirstName: 'Leila', LastName: 'Ahmadi', Company: 'National Petrochemical Iran', Email: 'l.ahmadi@npc.ir', Title: 'Polyester Raw Material Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Iran', Phone: '+98-21-6641-0000', Description: 'SKYDMT 이란 폴리에스터 원료 공급 탐색. 중동 폴리에스터 시장 진출 검토.' },
    { FirstName: 'Sergio', LastName: 'Vasquez', Company: 'Sociedad Quimica', Email: 's.vasquez@sqm.com', Title: 'Specialty Chemical Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'Chile', Phone: '+56-2-2425-2000', Description: 'SKYDMCD 칠레 특수화학 원료 공급 문의. SQM 리튬/특수화학 포트폴리오 연계.' },
    { FirstName: 'Nadia', LastName: 'Khalil', Company: 'Egyptian Petrochemicals', Email: 'n.khalil@egpc.com.eg', Title: 'Chemical Procurement Manager', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Cold', Country: 'Egypt', Phone: '+20-2-2792-0000', Description: 'SKYDMT 이집트 석유화학 원료 공급 탐색. 아프리카 폴리에스터 시장 진출 초기 검토.' },
    { FirstName: 'Ravi', LastName: 'Patel', Company: 'Aarti Industries', Email: 'r.patel@aartiind.com', Title: 'Specialty Chemical Sourcing', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'India', Phone: '+91-22-6756-4000', Description: 'SKYDMCD/SKYCHDA 인도 정밀화학 원료 문의. Aarti 제약/농약 중간체 원료 다변화.' },
    { FirstName: 'Omar', LastName: 'Abdullah', Company: 'Kuwait Petroleum Corp', Email: 'o.abdullah@kpc.com.kw', Title: 'Chemical Division Manager', Status: 'Open - Not Contacted', LeadSource: 'LinkedIn', Rating: 'Warm', Country: 'Kuwait', Phone: '+965-2244-2444', Description: 'SKYDMT 쿠웨이트 석유화학 원료 공급 탐색. GCC 폴리에스터 시장 진출 검토.' },
    { FirstName: 'Isabella', LastName: 'Fernandez', Company: 'PDVSA Petroquimica', Email: 'i.fernandez@pdvsa.com', Title: 'Chemical Raw Material Lead', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'Venezuela', Phone: '+58-212-708-4111', Description: 'SKYDMT 중남미 원료 공급 탐색. 베네수엘라 석유화학 원료 시장 초기 검토.' },
    { FirstName: 'Yaw', LastName: 'Asante', Company: 'Ghana Bauxite Company', Email: 'y.asante@ghanabauxite.com', Title: 'Industrial Material Procurement', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Cold', Country: 'Ghana', Phone: '+233-20-123-4567', Description: 'SKYPURA 산업용 내열 소재 문의. 서아프리카 광업 인프라 소재 초기 탐색.' },
    { FirstName: 'Priya', LastName: 'Nair', Company: 'ONGC Petro additions', Email: 'p.nair@ongcpetro.com', Title: 'Chemical Feedstock Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Hot', Country: 'India', Phone: '+91-265-2337-800', Description: 'SKYDMT 인도 화학 원료 대량 공급 문의. 인도 폴리에스터 산업 성장 대응.' },
    { FirstName: 'Abdullah', LastName: 'Al-Zahrani', Company: 'Tasnee Company', Email: 'a.zahrani@tasnee.com', Title: 'Polymer Raw Material Director', Status: 'Working - Contacted', LeadSource: 'Trade Show', Rating: 'Hot', Country: 'Saudi Arabia', Phone: '+966-11-265-9000', Description: 'SKYCHDM/SKYDMCD 사우디 원료 공급 문의. Tasnee 특수화학 포트폴리오 확대.' },
    { FirstName: 'Camila', LastName: 'Rodriguez', Company: 'Petrobras Distribuidora', Email: 'c.rodriguez2@petrobras.com', Title: 'Specialty Material Procurement', Status: 'Open - Not Contacted', LeadSource: 'Web', Rating: 'Warm', Country: 'Brazil', Phone: '+55-21-3224-1510', Description: 'SKYBON 브라질 코팅 수지 시장 공급 탐색. 남미 도료/코팅 시장 진출 검토.' },
    { FirstName: 'Javier', LastName: 'Morales', Company: 'Pemex Petrochemicals', Email: 'j.morales@pemex.com', Title: 'Chemical Feedstock Manager', Status: 'Open - Not Contacted', LeadSource: 'Cold Call', Rating: 'Cold', Country: 'Mexico', Phone: '+52-55-1944-2500', Description: 'SKYDMT 멕시코 석유화학 원료 공급 탐색. 중남미 폴리에스터 시장 초기 검토.' },
    { FirstName: 'Suleiman', LastName: 'Oduya', Company: 'Dangote Industries', Email: 's.oduya@dangote.com', Title: 'Chemical Procurement Director', Status: 'Working - Contacted', LeadSource: 'Conference', Rating: 'Warm', Country: 'Nigeria', Phone: '+234-1-448-8000', Description: 'SKYDMT 나이지리아 폴리에스터 원료 공급 문의. 아프리카 최대 산업그룹 원료 공급망 구축.' },
  ];

  let leadCount = 0;
  for (const lead of leadDefs) {
    await create(token, base, 'Lead', lead);
    leadCount++;
    if (leadCount % 20 === 0) console.log(`  ✅ Leads ${leadCount}건 완료`);
    await sleep(50);
  }
  console.log(`  ✅ 총 Leads ${leadCount}건 생성 완료`);

  // ── 5. Tasks (100개) ─────────────────────────────────────────────────────────
  console.log('\n📋 Creating Tasks (100)...');
  const taskDefs: Array<{Subject:string;Status:string;Priority:string;ActivityDate:string;Description:string}> = [
    // SKYGREEN 관련 (12건)
    { Subject: "SKYGREEN L'Oreal 화장품 용기 장기계약 협의 미팅", Status: 'Completed', Priority: 'High', ActivityDate: '2025-01-15', Description: "SKYGREEN 3년 장기 공급 계약 최종 협의. 담당자: Sophie Martin. 연간 320톤 단가 및 물량 확정." },
    { Subject: 'SKYGREEN Shiseido Tokyo 기술 미팅', Status: 'Completed', Priority: 'High', ActivityDate: '2025-03-20', Description: 'SKYGREEN 화장품 용기 BPA-free 인증 검토. 담당자: 田中 美咲. 일본 규제 대응 방안 논의.' },
    { Subject: 'SKYGREEN Amorepacific 설화수 샘플 제공', Status: 'Completed', Priority: 'Normal', ActivityDate: '2024-10-08', Description: 'SKYGREEN 설화수 용기 소재 샘플 5종 제공. 담당자: 김지원. 투명성/광택도 평가 진행.' },
    { Subject: 'SKYGREEN Berry Global 북미 공급 화상회의', Status: 'Completed', Priority: 'High', ActivityDate: '2025-02-12', Description: 'SKYGREEN FDA 식품접촉 인증서 제출. 담당자: Robert Anderson. 공급 물량 및 납기 협의.' },
    { Subject: "SKYGREEN L'Oreal Luxe 럭셔리 라인 샘플 평가", Status: 'In Progress', Priority: 'High', ActivityDate: '2026-03-10', Description: "SKYGREEN 럭셔리 화장품 용기 샘플 평가. 담당자: Jean-Pierre Dubois. 광택/투명도 기준 충족 여부 확인 중." },
    { Subject: 'SKYGREEN Midea Group 중국 시장 제품 설명회', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-05-18', Description: 'SKYGREEN 소형 가전 외장재 적용 사례 발표. 담당자: 王建国. Shanghai 현지 설명회 진행.' },
    { Subject: 'SKYGREEN Albea Group Paris 기술 미팅', Status: 'In Progress', Priority: 'Normal', ActivityDate: '2026-02-28', Description: 'SKYGREEN 립스틱 케이스 소재 전환 기술 협의. 담당자: Marie Leclerc. EU 단일 소재 재활용 규정 대응 방안.' },
    { Subject: 'SKYGREEN LVMH 향수 용기 초기 제품 프레젠테이션', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-04-15', Description: 'SKYGREEN 럭셔리 향수 용기 소재 제안. 담당자: Claire Fontaine. 첫 번째 공식 프레젠테이션 예정.' },
    { Subject: 'SKYGREEN Philips 유럽 가전 소재 Technical Meeting', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-08-22', Description: 'SKYGREEN 가전 부품 소재 기술 검토. 담당자: Erik van der Berg. 내화학성 테스트 결과 공유.' },
    { Subject: 'SKYGREEN Aptar Group 디스펜서 품질 검토', Status: 'Completed', Priority: 'High', ActivityDate: '2024-09-05', Description: 'SKYGREEN 화장품 펌프 디스펜서 품질 최종 검토. 담당자: David Hughes. 인증 완료 확인.' },
    { Subject: 'SKYGREEN Amcor 포장재 개발 화상회의', Status: 'In Progress', Priority: 'Normal', ActivityDate: '2026-05-20', Description: 'SKYGREEN 유연 포장재 공동 개발 프로젝트 현황 공유. 담당자: Thomas Keller. 시제품 테스트 일정 협의.' },
    { Subject: 'SKYGREEN Toly Group LUXE PACK Monaco 후속 미팅', Status: 'Completed', Priority: 'Normal', ActivityDate: '2024-11-15', Description: 'LUXE PACK Monaco 2024 전시회 후속 미팅. 담당자: Mark Camilleri. 신규 용기 라인 공동 개발 협의.' },
    // ECOZEN 관련 (14건)
    { Subject: 'ECOZEN Nestle Vevey 글로벌 공급 계약 협상', Status: 'Completed', Priority: 'High', ActivityDate: '2024-11-20', Description: 'ECOZEN 5년 장기 공급 계약 최종 서명. 담당자: Hans Mueller. 연간 850톤 공급 조건 확정.' },
    { Subject: 'ECOZEN Danone 스포츠음료병 기술 인증', Status: 'Completed', Priority: 'High', ActivityDate: '2025-01-30', Description: 'ECOZEN 스포츠음료병 EU 식품접촉물질 인증 완료. 담당자: Pierre Laurent. 프랑스 환경부 인증서 수령.' },
    { Subject: 'ECOZEN Amorepacific 아기용품 FDA 인증 제출', Status: 'Completed', Priority: 'High', ActivityDate: '2025-03-25', Description: 'ECOZEN 아기용품 FDA BPA-free 인증서 제출. 담당자: 김지원. 미국 시장 판매용 인증 완료.' },
    { Subject: 'ECOZEN LG Electronics 블렌더 샘플 평가', Status: 'Completed', Priority: 'Normal', ActivityDate: '2024-09-15', Description: 'ECOZEN Pro 블렌더 용기 내열 테스트. 담당자: 최영민. 130도 내열 기준 통과 확인.' },
    { Subject: 'ECOZEN Panasonic Osaka 주방가전 독점계약 체결', Status: 'Completed', Priority: 'High', ActivityDate: '2025-07-10', Description: 'ECOZEN 주방가전 3년 독점 공급 계약 서명. 담당자: 山田 太郎. 일본 JHOSPA 기준 충족 확인.' },
    { Subject: "ECOZEN L'Oreal 바이오매스 인증 제품 설명회", Status: 'Completed', Priority: 'High', ActivityDate: '2025-04-18', Description: 'ECOZEN 바이오매스 함량 인증 자료 제출. 담당자: Sophie Martin. 탄소발자국 30% 저감 계산서 제출.' },
    { Subject: 'ECOZEN Nestle 동남아 공장 납품 조율', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-04-05', Description: 'ECOZEN 동남아 공장 직납 물류 체계 구축. 담당자: Anna Weber. 태국/베트남 공장 납기 조율.' },
    { Subject: 'ECOZEN PepsiCo 스포츠음료 기술 협의', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-01-22', Description: 'ECOZEN 내열 테스트 결과 공유. 담당자: James Williams. 파스퇴르 살균 내열 기준 충족 확인 중.' },
    { Subject: 'ECOZEN Berry Global 아기용품 품질 감사', Status: 'Completed', Priority: 'High', ActivityDate: '2024-06-20', Description: 'ECOZEN 아기용품 용기 품질 현장 감사. 담당자: Robert Anderson. 공장 감사 완료, 품질 기준 100% 충족.' },
    { Subject: 'ECOZEN Shiseido 럭셔리 라인 Application Testing', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-08-08', Description: 'ECOZEN 프리미엄 화장품 용기 내화학성 테스트. 담당자: 田中 美咲. 향료 내화학성 기준 통과.' },
    { Subject: 'ECOZEN Midea Group 주방가전 현지 인증 지원', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-06-10', Description: 'ECOZEN 중국 국가 표준 GB 인증 지원. 담당자: 王建国. 중국 인증기관 제출 자료 준비 예정.' },
    { Subject: 'ECOZEN Philips 가전 EU 식품접촉 인증 검토', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-11-12', Description: 'ECOZEN 식품접촉 가전 EU 규정 검토. 담당자: Erik van der Berg. EC No 10/2011 적합성 확인.' },
    { Subject: 'ECOZEN Toly Group 아이섀도우 용기 납기 조율', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-07-22', Description: 'ECOZEN 아이섀도우 팔레트 케이스 납기 조율. 담당자: Mark Camilleri. Q4 크리스마스 시즌 납기 확정.' },
    { Subject: 'ECOZEN Coca-Cola 친환경 음료 용기 샘플 제공', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-03-28', Description: 'ECOZEN 음료 용기 평가용 샘플 5종 제공. 담당자: Sarah Johnson. World Without Waste 전략 연계 평가 진행 중.' },
    // ECOTRIA 관련 (14건)
    { Subject: 'ECOTRIA CR Estee Lauder 화학재활용 인증 미팅', Status: 'Completed', Priority: 'High', ActivityDate: '2024-10-25', Description: 'ECOTRIA CR 화학재활용 인증서 및 탄소발자국 자료 제출. 담당자: Emily Chen. ESG 보고서 반영 자료 확인.' },
    { Subject: "ECOTRIA CLARO Danone 유럽 음료병 전환 계약 체결", Status: 'Completed', Priority: 'High', ActivityDate: '2025-01-15', Description: 'ECOTRIA CLARO 유럽 음료병 전면 전환 계약 서명. 담당자: Pierre Laurent. EU rPET 의무화 대응 완료.' },
    { Subject: "ECOTRIA CLARO PepsiCo Gatorade 병 납품 시작", Status: 'Completed', Priority: 'High', ActivityDate: '2025-05-03', Description: 'ECOTRIA CLARO Gatorade 전용병 양산 납품 시작. 담당자: James Williams. 북미/유럽 동시 납품 체계 가동.' },
    { Subject: "ECOTRIA CR Toly Group LUXE PACK 공동 발표 준비", Status: 'Completed', Priority: 'High', ActivityDate: '2024-09-30', Description: 'LUXE PACK Monaco 2024 공동 발표 자료 준비. 담당자: Mark Camilleri. 70% 함유 화장품 용기 시제품 완성.' },
    { Subject: "ECOTRIA CR L'Oreal MOU 체결 후속 이행 점검", Status: 'Completed', Priority: 'High', ActivityDate: '2025-08-20', Description: 'ECOTRIA CR 전 브랜드 전환 MOU 이행 점검. 담당자: Jean-Pierre Dubois. 1단계 전환 브랜드 목록 확정.' },
    { Subject: "ECOTRIA CLARO Coca-Cola 순환경제 프로젝트 킥오프", Status: 'Completed', Priority: 'High', ActivityDate: '2025-10-08', Description: 'ECOTRIA CLARO 순환경제 음료병 프로젝트 시작. 담당자: Sarah Johnson. 글로벌 파일럿 지역 선정.' },
    { Subject: "ECOTRIA CR Amcor 유연 포장재 공동 개발 진행 보고", Status: 'Completed', Priority: 'Normal', ActivityDate: '2024-07-30', Description: 'ECOTRIA CR 유연 포장재 개발 중간 보고. 담당자: Thomas Keller. Amcor Pledge 2025 연계 성과 보고.' },
    { Subject: "ECOTRIA CLARO Nestle 생수 라인 전환 일정 협의", Status: 'Completed', Priority: 'High', ActivityDate: '2025-12-05', Description: 'ECOTRIA CLARO 전환 일정 최종 협의. 담당자: Hans Mueller. 유럽 6개 공장 단계별 전환 일정 확정.' },
    { Subject: "ECOTRIA CR Shiseido 럭셔리 라인 제품 설명회", Status: 'In Progress', Priority: 'High', ActivityDate: '2026-02-18', Description: 'ECOTRIA CR 럭셔리 화장품 화학재활용 소재 설명회. 담당자: 田中 美咲. Tokyo 본사 임원진 발표 예정.' },
    { Subject: "ECOTRIA CLARO Berry Global 투명 용기 Technical Review", Status: 'In Progress', Priority: 'High', ActivityDate: '2026-01-28', Description: 'ECOTRIA CLARO 투명도/내충격성 기술 검토. 담당자: Robert Anderson. 북미 식품 포장 기준 충족 여부 확인.' },
    { Subject: "ECOTRIA CR LVMH 럭셔리 브랜드 경영진 발표", Status: 'Not Started', Priority: 'High', ActivityDate: '2026-04-20', Description: 'ECOTRIA CR 럭셔리 전환 전략 C-level 발표. 담당자: Claire Fontaine. LVMH 이사회 친환경 전략 연계 발표.' },
    { Subject: "ECOTRIA CLARO PepsiCo 아시아 파일럿 현장 방문", Status: 'Deferred', Priority: 'Normal', ActivityDate: '2026-05-15', Description: 'ECOTRIA CLARO 아시아 파일럿 공장 방문. 담당자: James Williams. 코로나 이후 방문 일정 재조율.' },
    { Subject: "ECOTRIA CR Berry Global 화학재활용 California SB54 대응", Status: 'Completed', Priority: 'High', ActivityDate: '2025-09-12', Description: 'ECOTRIA CR California 재활용 의무화 대응 방안 협의. 담당자: Robert Anderson. SB 54 규정 충족 인증 전략 수립.' },
    { Subject: "ECOTRIA CLARO Danone Evian 생수병 양산 납품 확인", Status: 'Completed', Priority: 'High', ActivityDate: '2025-07-02', Description: 'ECOTRIA CLARO Evian 생수병 양산 첫 납품 확인. 담당자: Isabelle Bernard. 품질 기준 100% 충족 확인.' },
    // SKYPET CR 관련 (12건)
    { Subject: 'SKYPET CR Durmont Vienna 독점 공급 MOU 서명', Status: 'Completed', Priority: 'High', ActivityDate: '2025-02-28', Description: 'SKYPET CR 자동차 카펫 독점 공급 MOU 체결. 담당자: Wolfgang Huber. 오스트리아 현지 서명식 진행.' },
    { Subject: 'SKYPET CR Hyundai Motor IONIQ EV 소재 납품 시작', Status: 'Completed', Priority: 'High', ActivityDate: '2024-10-01', Description: 'SKYPET CR IONIQ 5/6 카펫 양산 납품 시작. 담당자: 정대현. 월 50톤 납품 체계 가동.' },
    { Subject: 'SKYPET CR Toyota Motor 수소차 소재 평가', Status: 'Completed', Priority: 'High', ActivityDate: '2025-04-28', Description: 'SKYPET CR 수소차 Mirai 내장재 소재 평가. 담당자: 鈴木 一郎. Toyota GISC 기준 충족 확인.' },
    { Subject: 'SKYPET CR Hyosung 타이어코드 품질 점검', Status: 'Completed', Priority: 'High', ActivityDate: '2024-05-20', Description: 'SKYPET CR 타이어코드 분기별 품질 점검. 담당자: 한상진. 한국타이어 납품 품질 기준 100% 충족.' },
    { Subject: 'SKYPET CR BMW iSeries 소재 인증 완료 보고', Status: 'Completed', Priority: 'High', ActivityDate: '2025-09-05', Description: 'SKYPET CR BMW 지속가능성 소재 인증 취득 보고. 담당자: Klaus Richter. BMW Group 공식 승인 소재 등록 완료.' },
    { Subject: 'SKYPET CR Volkswagen 아시아 공급 체계 협의', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-04-18', Description: 'SKYPET CR VW 아시아 생산기지 납품 체계 구축. 담당자: Friedrich Wagner. 중국 합작공장 직납 협의 진행 중.' },
    { Subject: 'SKYPET CR Toray Industries 스포츠섬유 계약 연장', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-01-25', Description: 'SKYPET CR 스포츠 섬유 원료 계약 연장. 담당자: 松本 由美. Nike/Adidas 납품 체인 물량 기반 협의.' },
    { Subject: 'SKYPET CR Indorama Ventures 아시아 공급 제안서 제출', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-03-15', Description: 'SKYPET CR 동남아 대량 공급 제안서 제출. 담당자: Priya Sharma. 5년 장기 계약 조건 포함.' },
    { Subject: 'SKYPET CR Lear Corporation EV 시트 품질 감사', Status: 'Completed', Priority: 'Normal', ActivityDate: '2024-12-10', Description: 'SKYPET CR 자동차 시트 섬유 품질 현장 감사. 담당자: Carlos Rodriguez. GM IVER 기준 충족 확인.' },
    { Subject: 'SKYPET CR BMW/Durmont 공급망 연계 미팅', Status: 'Completed', Priority: 'High', ActivityDate: '2025-10-22', Description: 'SKYPET CR BMW-Durmont 공급망 3자 미팅. BMW 품질 요건 직접 소통. Durmont 통해 간접 공급 체계 확인.' },
    { Subject: 'SKYPET CR Hyundai Motor 2026년 신모델 확대 협의', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-05-20', Description: 'SKYPET CR 현대차 신모델 적용 확대 협의. 담당자: 강민지. 2026년 하반기 신차 소재 납품 계획 수립.' },
    { Subject: 'SKYPET CR Hyosung 재활용 타이어코드 의무화 대응', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-04-25', Description: 'SKYPET CR 재활용 타이어코드 의무화 규제 대응. 담당자: 오민아. 유럽 타이어 재활용 의무화 법규 검토.' },
    // SKYPURA / SKYPEL / SKYTRA 관련 (18건)
    { Subject: 'SKYPURA Samsung Electronics 가전 부품 연간 품질 점검', Status: 'Completed', Priority: 'High', ActivityDate: '2024-10-15', Description: 'SKYPURA 가전 내열 부품 연간 품질 점검. 담당자: 이준호. 세탁기/냉장고 부품 품질 기준 전항목 통과.' },
    { Subject: 'SKYPURA Foxconn 애플 부품 소재 승인 획득', Status: 'Completed', Priority: 'High', ActivityDate: '2025-06-08', Description: 'SKYPURA 애플 제품 소재 공식 승인. 담당자: 陳志明. Apple AMS 기준 완전 충족 확인.' },
    { Subject: 'SKYPURA TE Connectivity EV 커넥터 내열 테스트', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-03-22', Description: 'SKYPURA 800V EV 커넥터 내열 성능 테스트. 담당자: Daniel Meier. UL746C 기준 충족 여부 확인 중.' },
    { Subject: 'SKYPURA Toyota Motor 수소차 부품 Application Testing', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-05-30', Description: 'SKYPURA 수소연료전지 시스템 부품 테스트. 담당자: 鈴木 一郎. Toyota GISC 수소 관련 기준 적용 예정.' },
    { Subject: 'SKYPEL Sumitomo Electric 와이어링 하네스 납기 조율', Status: 'Completed', Priority: 'High', ActivityDate: '2025-02-05', Description: 'SKYPEL 자동차 와이어링 하네스 분기 납기 조율. 담당자: 中村 哲也. Q2 물량 확대 대응 납기 조율 완료.' },
    { Subject: 'SKYPEL Volkswagen EV 케이블 Technical Meeting', Status: 'Completed', Priority: 'High', ActivityDate: '2025-05-15', Description: 'SKYPEL VW ID시리즈 고전압 케이블 기술 미팅. 담당자: Friedrich Wagner. VDA 기준 충족 확인.' },
    { Subject: 'SKYPEL BMW 고전압 케이블 800V 아키텍처 평가', Status: 'Completed', Priority: 'High', ActivityDate: '2025-10-30', Description: 'SKYPEL 800V 아키텍처 내전압 성능 평가. 담당자: Petra Schmidt. BMW TS16949 기준 전항목 통과.' },
    { Subject: 'SKYPEL Molex AI 서버 케이블 샘플 제공', Status: 'In Progress', Priority: 'Normal', ActivityDate: '2026-04-10', Description: 'SKYPEL 데이터센터 고성능 케이블 소재 샘플 제공. 담당자: Kevin Park. 112G 고속 전송 평가 진행 중.' },
    { Subject: 'SKYPEL TE Connectivity 의료기기 케이블 FDA 검토', Status: 'Deferred', Priority: 'Normal', ActivityDate: '2026-02-20', Description: 'SKYPEL 의료기기 케이블 FDA 510(k) 검토. 담당자: Daniel Meier. 추가 자료 요청으로 일정 지연.' },
    { Subject: 'SKYPEL Hyundai Motor EV 케이블 양산 품질 점검', Status: 'Completed', Priority: 'High', ActivityDate: '2025-07-18', Description: 'SKYPEL IONIQ 케이블 양산 품질 점검. 담당자: 정대현. 월 26톤 납품 품질 기준 전항목 통과.' },
    { Subject: 'SKYTRA Bosch 태양광 정션박스 UL 인증 완료', Status: 'Completed', Priority: 'High', ActivityDate: '2025-03-10', Description: 'SKYTRA 태양광 정션박스 UL94 V-0 인증 취득. 담당자: Andreas Fischer. 유럽/북미 판매용 인증 완료.' },
    { Subject: 'SKYTRA Foxconn 모터 인슐레이터 품질 평가', Status: 'Completed', Priority: 'High', ActivityDate: '2024-12-18', Description: 'SKYTRA 가전 모터 인슐레이터 260°C 내열 평가. 담당자: 陳志明. IEC 기준 전항목 통과.' },
    { Subject: 'SKYTRA BMW 자동차 내장 부품 VDA 인증 획득', Status: 'Completed', Priority: 'High', ActivityDate: '2025-09-25', Description: 'SKYTRA BMW 내장 부품 VDA 6.3 인증 완료. 담당자: Klaus Richter. iSeries 공식 채택 승인.' },
    { Subject: 'SKYTRA Volkswagen EV 내장재 제품 설명회', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-02-15', Description: 'SKYTRA VW ID시리즈 내장재 적용 사례 발표. 담당자: Friedrich Wagner. BMW 실적 기반 VW 설득 발표.' },
    { Subject: 'SKYTRA Samsung ESS 시스템 부품 샘플 제공', Status: 'Not Started', Priority: 'Normal', ActivityDate: '2026-05-25', Description: 'SKYTRA 태양광/ESS 시스템 부품 평가 샘플 제공. 담당자: 이준호. 삼성SDI 연계 ESS 프로젝트 대응.' },
    { Subject: 'SKYTRA Bosch 전기차 충전기 부품 Application Testing', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-06-05', Description: 'SKYTRA 전기차 충전기 고전압 부품 내열 테스트. 담당자: Sabine Hoffman. IEC 61851 기준 충족 여부 확인 중.' },
    { Subject: 'SKYPEL TE Connectivity 글로벌 공급 계약 검토', Status: 'Completed', Priority: 'High', ActivityDate: '2024-11-28', Description: 'SKYPEL 글로벌 EV 커넥터 공급 계약 최종 검토. 담당자: Daniel Meier. 3년 공급 계약 조건 확정.' },
    { Subject: 'SKYTRA Panasonic 에너지 솔루션 기술 미팅 Tokyo', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-05-22', Description: 'SKYTRA 태양광/ESS 부품 기술 미팅. 담당자: 山田 太郎. Panasonic Energy 솔루션 사업부 발표.' },
    // SKYBON / 모노머 관련 (14건)
    { Subject: 'SKYBON Samsung Electronics 가전 강판 연간 계약 체결', Status: 'Completed', Priority: 'High', ActivityDate: '2024-04-01', Description: 'SKYBON 가전 강판 코팅 수지 연간 계약 체결. 담당자: 박소연. 냉장고/세탁기/에어컨 전 라인 1200톤 계약.' },
    { Subject: 'SKYBON POSCO 컬러강판 코팅 5년 장기계약 서명', Status: 'Completed', Priority: 'High', ActivityDate: '2024-07-01', Description: 'SKYBON 건축/가전 컬러강판 5년 장기 계약 서명. 담당자: 윤철수. 연간 1800톤 최저 보장 물량 조건.' },
    { Subject: 'SKYBON AkzoNobel 유럽 코일코팅 품질 감사', Status: 'Completed', Priority: 'High', ActivityDate: '2025-01-20', Description: 'SKYBON 유럽 코일/캔 코팅 품질 현장 감사. 담당자: Dirk van Houten. ECCA 코팅 기준 전항목 통과.' },
    { Subject: 'SKYBON Midea Group 중국 가전 강판 기술 지원', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-08-15', Description: 'SKYBON 가전 강판 코팅 기술 현지 지원. 담당자: 王建国. Foshan 공장 코팅 공정 최적화 지원.' },
    { Subject: 'SKYBON PPG Industries 북미 코팅 공급 계약 협의', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-03-28', Description: 'SKYBON 북미 산업용 코팅 수지 공급 계약 협의. 담당자: Gregory Thompson. 가격 조건 최종 협의 중.' },
    { Subject: 'SKYDMT Hyosung 타이어코드 원료 2026년 물량 협의', Status: 'In Progress', Priority: 'High', ActivityDate: '2026-02-08', Description: 'SKYDMT 2026년 물량 20% 확대 재계약 협의. 담당자: 한상진. 글로벌 타이어 수요 증가 반영 물량 조율.' },
    { Subject: 'SKYDMT Toray Industries 일본 공장 품질 점검', Status: 'Completed', Priority: 'High', ActivityDate: '2025-04-05', Description: 'SKYDMT 도레이 폴리에스터 필름 원료 품질 점검. 담당자: 松本 由美. JIS 기준 전항목 통과 확인.' },
    { Subject: 'SKYDMT Indorama Ventures 태국 공장 현장 방문', Status: 'Completed', Priority: 'High', ActivityDate: '2024-09-22', Description: 'SKYDMT 동남아 공급 물류 체계 현장 확인. 담당자: Priya Sharma. 방콕 공장 납품 체계 최적화.' },
    { Subject: 'SKYDMT Evonik 유럽 수출 확대 제안서 제출', Status: 'Completed', Priority: 'High', ActivityDate: '2025-07-05', Description: 'SKYDMT 유럽 DMT 시장 공급 확대 제안서 제출. 담당자: Lukas Schneider. 유럽 DMT 생산 철수 이후 수요 대응.' },
    { Subject: 'SKYCHDM AkzoNobel 코팅 원료 Application Testing', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-02-18', Description: 'SKYCHDM 코일/캔 코팅 수지 응용 테스트. 담당자: Laura de Vries. 내가수분해성/내후성 기준 통과.' },
    { Subject: 'SKYCHDM Indorama Ventures 대량 공급 계약 서명', Status: 'Completed', Priority: 'High', ActivityDate: '2025-06-12', Description: 'SKYCHDM 동남아 코폴리에스터 원료 대량 공급 계약. 담당자: Priya Sharma. CHDM 생산능력 확대 물량 우선 배정.' },
    { Subject: 'SKYDMCD Lonza Group GMP 인증 현장 감사', Status: 'Completed', Priority: 'High', ActivityDate: '2024-07-15', Description: 'SKYDMCD GMP 제약 원료 인증 현장 감사. 담당자: Marc Zimmermann. FDA/EMA 기준 전항목 통과. 공식 승인 완료.' },
    { Subject: 'SKYDMCD Evonik Industries 의약 중간체 Technical Review', Status: 'Completed', Priority: 'High', ActivityDate: '2025-09-18', Description: 'SKYDMCD 제약 중간체 기술 검토. 담당자: Lukas Schneider. 유럽 약전 기준 충족 확인.' },
    { Subject: 'SKYCHDA AkzoNobel 분체도장 수지 원료 계약 체결', Status: 'Completed', Priority: 'High', ActivityDate: '2025-02-10', Description: 'SKYCHDA 분체 도장용 폴리에스터 수지 원료 계약 체결. 담당자: Dirk van Houten. 연간 1400톤 독점 공급 확정.' },
    // 글로벌 전략/크로스제품 (16건)
    { Subject: "SK케미칼 글로벌 파트너십 연간 전략 리뷰 — L'Oreal", Status: 'Completed', Priority: 'High', ActivityDate: '2025-12-10', Description: "L'Oreal과 2026년 전 제품 라인 SK케미칼 소재 전환 로드맵 리뷰. 담당자: Sophie Martin, Jean-Pierre Dubois. SKYGREEN/ECOZEN/ECOTRIA CR 통합 공급 전략 확정." },
    { Subject: 'SK케미칼 Nestle 지속가능 파트너십 연례 회의', Status: 'Completed', Priority: 'High', ActivityDate: '2025-11-28', Description: 'Nestle 2026년 ECOZEN/ECOTRIA CLARO/SKYPET CR 전체 공급 계획 리뷰. 담당자: Hans Mueller, Anna Weber.' },
    { Subject: 'SK케미칼 Chinaplas 2024 전시회 참가', Status: 'Completed', Priority: 'High', ActivityDate: '2024-04-23', Description: 'Chinaplas 2024 Shanghai 참가. ECOTRIA CR/SKYPET CR/SKYGREEN 중국 고객 발표. 신규 리드 32건 확보.' },
    { Subject: 'SK케미칼 NPE 2024 북미 전시회 참가', Status: 'Completed', Priority: 'High', ActivityDate: '2024-05-06', Description: 'NPE 2024 Florida 참가. 북미 시장 SKYGREEN/ECOTRIA CR 홍보. 신규 리드 28건 확보.' },
    { Subject: 'SK케미칼 LUXE PACK Monaco 2024 화장품 전시회', Status: 'Completed', Priority: 'High', ActivityDate: '2024-10-07', Description: 'LUXE PACK Monaco 2024 참가. Toly Group과 ECOTRIA CLARO 화장품 용기 공동 발표. 유럽 럭셔리 브랜드 10개사 미팅.' },
    { Subject: 'SK케미칼 Drinktec 2025 음료 포장 전시회 참가', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-09-15', Description: 'Drinktec Munich 2025 참가. ECOTRIA CLARO/SKYPET CR 음료병 솔루션 발표. EU rPET 의무화 대응 솔루션 홍보.' },
    { Subject: 'SK케미칼 K-Show 2025 독일 플라스틱 전시회', Status: 'Completed', Priority: 'High', ActivityDate: '2025-10-08', Description: 'K-Show 2025 Düsseldorf 참가. 전 제품 라인 유럽 고객 발표. BMW/VW/AkzoNobel 핵심 고객 미팅 진행.' },
    { Subject: 'SK케미칼 Toyota Hyundai 자동차 소재 공동 세미나', Status: 'Completed', Priority: 'High', ActivityDate: '2025-06-25', Description: 'SKYPET CR/SKYPEL/SKYTRA 자동차 소재 통합 세미나. Toyota+Hyundai 공동 기술 발표. 아시아 자동차 친환경 소재 표준 논의.' },
    { Subject: 'SK케미칼 AkzoNobel PPG 코팅 원료 통합 설명회', Status: 'Completed', Priority: 'High', ActivityDate: '2025-04-22', Description: 'SKYBON/SKYCHDM/SKYCHDA/SKYDMCD 코팅 원료 통합 설명회. AkzoNobel+PPG 동시 초청. 유럽 코팅 시장 친환경 원료 전략 발표.' },
    { Subject: 'SK케미칼 Hyosung Toray Indorama 섬유 원료 포럼', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-03-18', Description: 'SKYDMT/SKYPET CR 섬유 원료 고객 포럼. 아시아 3대 폴리에스터 메이커 초청. 원료 공급 안정화 및 재활용 전환 논의.' },
    { Subject: 'SK케미칼 Lonza Evonik 제약 원료 기술 세미나', Status: 'Completed', Priority: 'Normal', ActivityDate: '2024-11-08', Description: 'SKYDMCD/SKYCHDA 제약 중간체 원료 세미나. Basel+Essen 고객 동시 초청. FDA/EMA 기준 충족 사례 발표.' },
    { Subject: 'SK케미칼 연간 고객 만족도 조사 — 유럽 권역', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-12-20', Description: '유럽 주요 고객 15개사 만족도 조사. AkzoNobel, Danone, BMW 등 품질/납기/서비스 평가. 전체 4.5/5.0 점수 획득.' },
    { Subject: 'SK케미칼 2026년 신제품 로드맵 발표 — 핵심 고객', Status: 'Not Started', Priority: 'High', ActivityDate: '2026-06-15', Description: 'ECOZEN Pro+/ECOTRIA CR 차세대 제품 로드맵 발표. 상위 20개 핵심 고객 초청. 2026-2028 제품 전략 공유 예정.' },
    { Subject: 'SK케미칼 삼성전자 POSCO 국내 핵심 고객 연례 미팅', Status: 'Completed', Priority: 'High', ActivityDate: '2025-11-05', Description: 'SKYBON/SKYPURA 국내 핵심 고객 연례 전략 미팅. 담당자: 이준호, 윤철수. 2026년 계약 갱신 및 신제품 적용 논의.' },
    { Subject: 'SK케미칼 Braskem Alpek 남미 시장 탐색 출장', Status: 'Completed', Priority: 'Normal', ActivityDate: '2025-08-05', Description: '남미 시장 SKYDMT/ECOTRION 잠재 고객 탐색. Braskem(브라질) + Alpek(멕시코) 방문. 바이오 기반 원료 파트너십 초기 논의.' },
    { Subject: 'SK케미칼 중동 SABIC Tasnee 원료 비즈니스 출장', Status: 'Completed', Priority: 'High', ActivityDate: '2025-10-15', Description: '중동 원료 시장 개척 출장. SABIC+Tasnee 담당자 미팅. SKYDMT/SKYCHDM 중동 공급 가능성 협의 및 현지 수요 조사.' },
  ];

  let taskCount = 0;
  for (const task of taskDefs) {
    await create(token, base, 'Task', task);
    taskCount++;
    if (taskCount % 20 === 0) console.log(`  ✅ Tasks ${taskCount}건 완료`);
    await sleep(50);
  }
  console.log(`  ✅ 총 Tasks ${taskCount}건 생성 완료`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  const totalAccounts = accountDefs.length;
  const totalContacts = contactDefs.length;
  const totalOpps = oppDefs.length;
  const totalLeads = leadDefs.length;
  const totalTasks = taskDefs.length;

  console.log('\n🎉 SK Chemicals Sample Data Seeding Complete!\n');
  console.log('📊 Data Summary:');
  console.log(`  Account     : ${totalAccounts}개  (화장품/식품/가전/자동차/전기전자/코팅/섬유/제약)`);
  console.log(`  Contact     : ${totalContacts}개  (글로벌 구매/조달/지속가능성 담당자)`);
  console.log(`  Opportunity : ${totalOpps}개  (SKYGREEN/ECOZEN/ECOTRIA/SKYPET CR/SKYPURA/SKYPEL/SKYTRA/SKYBON/SKYDMT/SKYCHDM/SKYDMCD/SKYCHDA)`);
  console.log(`  Lead        : ${totalLeads}개  (유럽/북미/아시아/중동/남미 신규 문의)`);
  console.log(`  Task        : ${totalTasks}개  (2024~2026 영업 활동 이력)`);
  console.log(`  Total       : ${totalAccounts + totalContacts + totalOpps + totalLeads + totalTasks}개`);
  console.log('\n💡 Sample Questions for Demo:');
  console.log('  - "ECOZEN 유럽 Closed Won 딜 목록 보여줘"');
  console.log('  - "ECOTRIA CR 화장품 고객사 현황 정리해줘"');
  console.log('  - "SKYDMT 아시아 영업기회 건수와 금액 합계는?"');
  console.log('  - "2026년 Negotiation 단계 딜 중 금액 상위 5개는?"');
  console.log('  - "Hot 등급 유럽 리드 목록 보여줘"');
  console.log('  - "SKYPET CR 자동차 고객사 최근 활동 내역 알려줘"');
  console.log('  - "SKYBON 가전 강판 고객사와 계약 현황은?"');
}

seed().catch((err: Error) => {
  console.error('❌ Seed Failed:', err.message);
  process.exit(1);
});
