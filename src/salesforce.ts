import https from 'https';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Token {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number; // ms
}

// ── Token Cache ───────────────────────────────────────────────────────────────

const TOKEN_TTL_MS = 7200 * 1000;   // Salesforce 기본 만료: 2시간
const TOKEN_MARGIN_MS = 60 * 1000;  // 만료 1분 전 갱신

let cachedToken: Token | null = null;

async function fetchToken(): Promise<Token> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env['SF_CONSUMER_KEY']!,
    client_secret: process.env['SF_CONSUMER_SECRET']!,
  }).toString();

  const hostname = new URL(process.env['SF_LOGIN_URL'] || 'https://login.salesforce.com').hostname;

  const data = await post<{ access_token?: string; instance_url?: string; error_description?: string }>(
    hostname, '/services/oauth2/token', body,
    { 'Content-Type': 'application/x-www-form-urlencoded' }
  );

  if (!data.access_token) {
    throw new Error(`Salesforce auth failed: ${data.error_description || JSON.stringify(data)}`);
  }

  console.log('[Salesforce] Connected:', data.instance_url);
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url!,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
}

async function getToken(): Promise<Token> {
  if (!cachedToken || Date.now() > cachedToken.expiresAt - TOKEN_MARGIN_MS) {
    cachedToken = await fetchToken();
  }
  return cachedToken;
}

// ── HTTP Helpers ──────────────────────────────────────────────────────────────

function post<T>(hostname: string, path: string, body: string, headers: Record<string, string>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get<T>(hostname: string, path: string, token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Query ─────────────────────────────────────────────────────────────────────

interface QueryResult {
  totalSize: number;
  records: Record<string, unknown>[];
  errorCode?: string;
  message?: string;
}

export async function query(soql: string): Promise<Record<string, unknown>[] | number> {
  const { accessToken, instanceUrl } = await getToken();
  const hostname = new URL(instanceUrl).hostname;

  // COUNT() 여부 체크
  const isCount = /SELECT\s+COUNT\s*\(\s*\)/i.test(soql);

  // LIMIT 없는 SELECT에 자동으로 LIMIT 100 추가 (대용량 응답 방지)
  const hasLimit = /LIMIT\s+\d+/i.test(soql);
  const finalSoql = (!isCount && !hasLimit) ? `${soql} LIMIT 100` : soql;

  const path = `/services/data/v59.0/query?q=${encodeURIComponent(finalSoql)}`;
  const result = await get<QueryResult>(hostname, path, accessToken);

  if (result.errorCode) {
    throw new Error(`${result.errorCode}: ${result.message}`);
  }

  return isCount ? result.totalSize : result.records;
}
