# Salesforce MCP Server

Node.js / Express / TypeScript 기반 **Salesforce MCP (Model Context Protocol) 서버**

Salesforce Developer Edition과 MCP 서버로 연동하여, AI 플랫폼에서 자연어로 CRM 데이터를 조회하는 방법을 보여주는 데모 프로젝트입니다.

---

## 시작하기

### 1. Salesforce Developer Edition 계정 생성

[developer.salesforce.com/signup](https://developer.salesforce.com/signup) 에서 무료 계정을 생성하세요.

---

### 2. External Client App 생성

**설정 → 앱 → 외부 클라이언트 앱 → 외부 클라이언트 앱 관리자 → 새로운 외부 클라이언트 앱 만들기**

| 항목 | 값 |
|------|-----|
| App Name | `Salesforce MCP Server` (임의 설정) |
| Contact Email | 본인 이메일 |
| Enable OAuth Settings | ✅ 체크 |
| Callback URL | `https://localhost` |
| OAuth Scopes | `API를 통해 사용자 데이터 관리 (api)` 추가 |
| 클라이언트 자격 증명 플로 활성화 | ✅ 체크 |

저장 후 **정책(Policies) 탭**에서:
- 모든 사용자가 자체 인가할 수 있음 (Permitted Users → All users may self-authorize)
- IP 제한 해제 (IP Relaxation → Relax IP restrictions)
- 다음으로 실행 (Run As) → 프로필 설정 세부사항의 사용자 이름(`*@agentforce.com`) 복사해서 입력

저장 후 **설정 탭 → OAuth 설정 → 앱 설정 → 고객 키 및 암호 → 소비자 키 / 소비자 암호** 복사

---

### 3. 클라우드타입 배포

1. **Node.js 템플릿 선택** → GitHub 연동 → 이 저장소 선택
2. **빌드 명령어**: `npm install && npm run build`
3. **환경변수 설정**

| 환경변수 | 설명 |
|---------|------|
| `SF_LOGIN_URL` | Salesforce My Domain URL **(아래 주의사항 참고)** |
| `SF_CONSUMER_KEY` | Connected App 소비자 키 |
| `SF_CONSUMER_SECRET` | Connected App 소비자 암호 |
| `TOKEN` | (선택) MCP 클라이언트 인증용 Bearer 토큰 |

4. **MCP 접속 주소**
   ```
   https://<배포된 도메인>/mcp
   ```

> 💡 자세한 환경변수 설명은 `.env.example` 파일을 참고하세요.

---

### ⚠️ 주의사항

**My Domain URL**을 사용해야 합니다.

```
# ❌ 잘못된 예 (인증 차단됨)
SF_LOGIN_URL=https://login.salesforce.com

# ✅ 올바른 예
SF_LOGIN_URL=https://yourcompany-dev-ed.develop.my.salesforce.com
```

> 💡 **My Domain URL 확인 방법**: Salesforce 로그인 후 브라우저 주소창에서 확인

---

### 4. 샘플 데이터 시딩 (선택)

배포 완료 후 클라우드타입 터미널에서 실행:

```bash
npm run seed
```

삼성전자 반도체 영업 시나리오 샘플 데이터 200개를 생성합니다.

| 오브젝트 | 건수 | 내용 |
|---------|------|------|
| Account | 20개 | 미국, 일본, 대만, 중국, 유럽 주요 반도체 고객사 |
| Contact | 30개 | 전세계 반도체 구매/조달 담당자 |
| Opportunity | 80개 | HBM3E, DDR5, LPDDR5X, NAND, SSD, CIS, eUFS, LPDDR5 각 10건 |
| Lead | 40개 | AI 반도체 수요 신규 문의 기업 |
| Task | 30개 | 2025~2026 영업 활동 내역 |

> ⚠️ `npm run seed`는 **한 번만** 실행하세요. 재실행 시 데이터가 중복됩니다.

---

### 5. Porter AI에 MCP 연동

[Porter AI](https://getporter.ai) 접속 후:

**설정 → MCP 서버 → MCP 서버 추가하기**

| 항목 | 값 |
|------|-----|
| MCP 접속 주소 | `https://<배포된 도메인>/mcp` |
| 인증(Access Token) | 클라우드타입 배포 시 설정한 `TOKEN` 환경변수 값 |

> ※ `TOKEN` 환경변수를 설정하지 않은 경우 인증 없이 연결

연동 후 Porter AI 대화창에서 **`+` 버튼 클릭 → MCP 도구 활성화**

---

## 지원 Tools

| Tool | 설명 |
|------|------|
| `get_schema` | 사용 가능한 오브젝트/필드/예시 쿼리 조회 |
| `get_accounts` | 거래처 목록 조회 |
| `search_accounts` | 키워드로 거래처 검색 |
| `get_opportunities` | 영업기회 목록 조회 (제품/단계/연도 필터 지원) |
| `get_opportunities_by_stage` | 단계별 영업기회 조회 |
| `get_opportunities_summary` | 제품별/단계별/국가별/연도별 집계 |
| `get_contacts` | 담당자 목록 조회 |
| `search_contacts` | 이름으로 담당자 검색 |
| `get_leads` | 잠재고객 목록 조회 |
| `get_leads_by_status` | 상태별 잠재고객 조회 |
| `get_recent_activities` | 최근 활동(Task) 조회 |
| `run_soql` | 직접 SOQL 쿼리 실행 |

---

## 자연어 질문 예시

- `"HBM3E 관련 Closed Won 딜 목록 보여줘"`
- `"2026년 미국 고객사 영업기회 현황 정리해줘"`
- `"Hot 등급 리드 국가별로 정리해줘"`
- `"제품별 영업기회 건수 비교해줘"`
- `"현재 Negotiation 단계 딜 금액 합계는?"`

---

## 로컬 실행

```bash
cp .env.example .env
# .env 파일에 환경변수 입력 후

npm install
npm run build
npm start
```
