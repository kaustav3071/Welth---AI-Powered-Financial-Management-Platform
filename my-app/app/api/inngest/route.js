import { inngest } from '@/lib/inngest/client';
import { checkBudgetAlerts, generateMonthlyReports, processRecurringTransaction, triggerRecurringTransactions } from '@/lib/inngest/functions';

import {serve} from 'inngest/next';


export const {GET,POST,PUT} = serve({
    client:inngest,
    functions:[
        checkBudgetAlerts,
        processRecurringTransaction,
        triggerRecurringTransactions,
        generateMonthlyReports,
        

        

    ]
});