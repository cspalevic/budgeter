import { Budget } from "../models/data/budget";
import ApiConfig from "../config";
import { GeneralError, InternalServerError } from "../models/errors";

class BudgetsService {
   private resource: string;
   static instance: BudgetsService;

   constructor() {
      this.resource = "budgets";
   }

   static getInstance(): BudgetsService {
      if(!BudgetsService.instance)
         BudgetsService.instance = new BudgetsService();
      return BudgetsService.instance;
   }

   public async getBudget(day: number, month: number, year: number): Promise<Budget> {
      const apiConfig = ApiConfig.getInstance();
      const url = `${this.resource}?day=${day}&month=${month}&year=${year}`
      const response = await apiConfig.callApiProtected(url);
      const responseBody = await response.json();
      if(response.status === 400) {
         throw new GeneralError(responseBody.message);
      }
      if(response.status === 500) {
         throw new InternalServerError(responseBody.message);
      }
      return {
         incomes: responseBody.incomes.map(x => ({
            id: responseBody.id,
            title: responseBody.title,
            amount: responseBody.amount,
            initialDay: responseBody.initialDay,
            initialDate: responseBody.initialDate,
            initialMonth: responseBody.initialMonth,
            initialYear: responseBody.initialYear,
            recurrence: responseBody.recurrence,
            createdOn: new Date(responseBody.createdOn),
            modifiedOn: new Date(responseBody.modifiedOn),
            dueToday: x.dueToday,
            totalAmount: x.totalAmount
         })),
         payments: responseBody.payments.map(x => ({
            id: responseBody.id,
            title: responseBody.title,
            amount: responseBody.amount,
            initialDay: responseBody.initialDay,
            initialDate: responseBody.initialDate,
            initialMonth: responseBody.initialMonth,
            initialYear: responseBody.initialYear,
            recurrence: responseBody.recurrence,
            createdOn: new Date(responseBody.createdOn),
            modifiedOn: new Date(responseBody.modifiedOn),
            dueToday: x.dueToday,
            totalAmount: x.totalAmount
         }))
      }
   }
}

export default {
   getInstance: () => BudgetsService.getInstance()
}