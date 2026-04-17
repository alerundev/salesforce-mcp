import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { query } from '../salesforce.js';

export const run_soql = {
  name: 'run_soql',
  description: '직접 SOQL 쿼리를 실행합니다. 사용 가능한 오브젝트: Account, Contact, Opportunity, Lead, Task. 스키마 확인은 get_schema 툴을 사용하세요.',
  args: {
    soql: z.string().describe('실행할 SOQL 쿼리'),
  },
  handle: async ({ soql }: { soql: string }): Promise<CallToolResult> => {
    const records = await query(soql);
    return { content: [{ type: 'text', text: JSON.stringify(records, null, 2) }] };
  },
};
