import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { query } from '../salesforce.js';

// seed.ts의 제품 목록과 일치
const PRODUCTS = [
  'HBM3E', 'DDR5', 'LPDDR5X', 'NAND', 'SSD', 'CIS', 'eUFS', 'LPDDR5',
];

export const get_opportunities_summary = {
  name: 'get_opportunities_summary',
  description: '영업기회를 다양한 기준으로 집계합니다. 제품별, 단계별, 연도별, 국가별 건수와 총 금액을 요약합니다.',
  args: {
    group_by: z.enum(['stage', 'product', 'year', 'country'])
      .optional().default('stage')
      .describe('집계 기준: stage(단계별), product(제품별), year(연도별), country(국가별)'),
    year: z.string().optional().describe('연도 필터 (예: 2025, 2026)'),
  },
  handle: async ({ group_by = 'stage', year }: { group_by?: string; year?: string }): Promise<CallToolResult> => {
    const yearWhere = year
      ? `CloseDate >= ${year}-01-01 AND CloseDate <= ${year}-12-31`
      : '';

    let records: unknown;

    if (group_by === 'product') {
      // 제품별 집계: Name 필드의 [제품명] 패턴으로 필터
      const results = await Promise.all(
        PRODUCTS.map(async (product) => {
          const where = yearWhere
            ? `WHERE Name LIKE '%${product}%' AND ${yearWhere}`
            : `WHERE Name LIKE '%${product}%'`;

          const [count, amountRows] = await Promise.all([
            query(`SELECT COUNT() FROM Opportunity ${where}`),
            query(`SELECT SUM(Amount) totalAmount FROM Opportunity ${where}`),
          ]);

          const totalAmount = Array.isArray(amountRows)
            ? ((amountRows[0] as Record<string, unknown>)?.totalAmount ?? 0)
            : 0;

          return { product, count, totalAmount };
        })
      );
      records = results.filter(r => (r.count as number) > 0);

    } else if (group_by === 'year') {
      records = await query(
        `SELECT CALENDAR_YEAR(CloseDate) yr, COUNT(Id) cnt, SUM(Amount) totalAmount
         FROM Opportunity GROUP BY CALENDAR_YEAR(CloseDate) ORDER BY CALENDAR_YEAR(CloseDate)`
      );

    } else if (group_by === 'country') {
      const where = yearWhere ? `WHERE ${yearWhere}` : '';
      records = await query(
        `SELECT Account.BillingCountry country, COUNT(Id) cnt, SUM(Amount) totalAmount
         FROM Opportunity ${where}
         GROUP BY Account.BillingCountry ORDER BY COUNT(Id) DESC LIMIT 20`
      );

    } else {
      // stage (default)
      const where = yearWhere ? `WHERE ${yearWhere}` : '';
      records = await query(
        `SELECT StageName, COUNT(Id) cnt, SUM(Amount) totalAmount
         FROM Opportunity ${where} GROUP BY StageName`
      );
    }

    return { content: [{ type: 'text', text: JSON.stringify(records, null, 2) }] };
  },
};
