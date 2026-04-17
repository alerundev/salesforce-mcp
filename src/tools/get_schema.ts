import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const get_schema = {
  name: 'get_schema',
  description: 'Salesforce 데이터 구조(스키마)를 반환합니다. SOQL 작성 전에 이 툴로 오브젝트와 필드를 확인하세요.',
  args: {},
  handle: async (): Promise<CallToolResult> => {
    const schema = {
      objects: {
        Account: {
          description: '거래처(고객사)',
          fields: ['Id', 'Name', 'Industry', 'AnnualRevenue', 'Phone', 'BillingCity', 'BillingCountry', 'NumberOfEmployees', 'Description'],
        },
        Contact: {
          description: '담당자',
          fields: ['Id', 'FirstName', 'LastName', 'Email', 'Phone', 'Title', 'AccountId', 'Account.Name'],
        },
        Opportunity: {
          description: '영업기회. Name 필드에 [제품명] 형식으로 제품 포함.',
          fields: ['Id', 'Name', 'StageName', 'Amount', 'CloseDate', 'AccountId', 'Account.Name', 'Account.BillingCountry', 'Probability', 'Description'],
          products: ['HBM3E', 'DDR5', 'LPDDR5X', 'NAND', 'SSD', 'CIS', 'eUFS', 'LPDDR5'],
          stages: ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Id. Decision Makers', 'Perception Analysis', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'],
        },
        Lead: {
          description: '잠재고객',
          fields: ['Id', 'FirstName', 'LastName', 'Company', 'Email', 'Status', 'LeadSource', 'Rating', 'Country', 'Industry', 'Description'],
          statuses: ['Open - Not Contacted', 'Working - Contacted', 'Closed - Converted', 'Closed - Not Converted'],
        },
        Task: {
          description: '고객 컨택 활동. Subject 필드에 [제품명] 포함.',
          fields: ['Id', 'Subject', 'Status', 'Priority', 'ActivityDate', 'Description'],
          statuses: ['Completed', 'In Progress', 'Not Started'],
        },
      },
      notes: [
        '표준 오브젝트(Account/Contact/Opportunity/Lead/Task)만 사용 가능합니다.',
        '제품 필터: Opportunity.Name LIKE \'%HBM3E%\'',
        '국가 필터: Account.BillingCountry 또는 Lead.Country',
        '연도 필터: CALENDAR_YEAR(CloseDate) = 2026',
      ],
      examples: {
        '제품별 영업기회': "SELECT Name, Account.Name, StageName, Amount FROM Opportunity WHERE Name LIKE '%HBM3E%' ORDER BY CloseDate DESC LIMIT 20",
        '국가별 집계': "SELECT Account.BillingCountry, COUNT(Id) cnt FROM Opportunity GROUP BY Account.BillingCountry ORDER BY COUNT(Id) DESC LIMIT 10",
        'Hot 리드': "SELECT FirstName, LastName, Company, Country, Description FROM Lead WHERE Rating = 'Hot' LIMIT 20",
      },
    };

    return { content: [{ type: 'text', text: JSON.stringify(schema, null, 2) }] };
  },
};
