import { AxiosError } from 'axios';
import axiosClient from './axiosClient';

export interface UploadResponse {
  fileId: string;
  transactionCount: number;
  message: string;
  timestamp: string;
}

export interface ReconcileResponse {
  reconciliationId: string;
  summary: any;
  matches: any[];
  suspenseItems: any[];
  gapCalculations: any;
  validationResult: any;
  processingMetrics: any;
}

export interface MatchesResponse {
  jobId: string;
  summary: {
    reconciliationId: string;
    bankTotal: number;
    accountingTotal: number;
    matchedCount: number;
    suspenseCount: number;
    initialGap: number;
    residualGap: number;
    coverageRatio: number;
    explainedGap: number;
    coveragePercentage: number;
    validationValid: boolean;
    validationErrors: number;
    status: string;
    createdAt: Date;
  };
  matches: Array<{
    id: string;
    bankTx?: any;
    bankTransaction?: any;
    accountingTx?: any;
    accountingTransaction?: any;
    accountingTxs?: any[];
    accountingTransactions?: any[];
    score: number;
    rule: string;
    status: string;
    reconId?: string;
    aiConfidence?: number;
  }>;
  suspense?: Array<{
    id: string;
    transaction?: any;
    transactionId: string;
    transactionType: string;
    type: string;
    reason: string;
    suggestedCategory?: string;
    suggestedAccount?: string;
    aiConfidence?: number;
    status: string;
  }>;
  gapCalculations?: any;
  validationResult?: any;
}

class ApiService {
  private client = axiosClient.getClient();

  private handleError(error: AxiosError): never {
    const message = (error.response?.data as any)?.message || error.message || 'An error occurred';
    throw new Error(message);
  }

  async uploadBankFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post<UploadResponse>('/upload/bank', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async uploadAccountingFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post<UploadResponse>('/upload/accounting', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async startReconciliation(bankUploadId: string, accountingUploadId: string, rules?: any): Promise<ReconcileResponse> {
    try {
      const response = await this.client.post<ReconcileResponse>('/reconciliation/reconcile', {
        bankFileId: bankUploadId,
        accountingFileId: accountingUploadId,
        rules: rules,
      });

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getMatches(jobId: string): Promise<MatchesResponse> {
    try {
      const response = await this.client.get(`/reconciliation/${jobId}`);
      const data = response.data;

      return {
        jobId: data.reconciliationId,
        summary: data.summary,
        matches: data.matches.map((m: any) => ({
          id: m.id,
          bankTx: m.bankTransaction,
          accountingTx: m.accountingTransaction,
          accountingTxs: m.accountingTransactions,
          score: m.score,
          rule: m.rule,
          status: m.status || 'matched',
          aiConfidence: m.aiConfidence,
        })),
        suspense: data.suspenseItems,
        gapCalculations: data.gapCalculations,
        validationResult: data.validationResult,
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async validateMatch(jobId: string, matchId: string, action: string, accountCode?: string): Promise<{ ok: boolean }> {
    try {
      const response = await this.client.post(`/reconciliation/${jobId}/validate`, {
        matchId,
        action,
        accountCode,
      });

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async exportResults(jobId: string, format: string = 'excel'): Promise<any> {
    try {
      const response = await this.client.post(`/exports/reconciliation/${jobId}`, {
        format,
        includeDetails: true,
        includeSummary: true,
        includeGapAnalysis: true,
        includeRegularization: true,
        language: 'fr',
      });

      const result = response.data;
      return {
        success: true,
        downloadUrl: result.downloadUrl,
        filename: result.fileName,
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getRegularizationEntries(jobId: string): Promise<any> {
    try {
      const response = await this.client.post(`/reconciliation/${jobId}/regularize`, {});
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async listReconciliations(): Promise<any[]> {
    try {
      const response = await this.client.get('/reconciliation');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async getFileInfo(fileId: string): Promise<{ transactionCount: number }> {
    try {
      const response = await this.client.get(`/upload/file/${fileId}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async recordLearning(matchId: string, isCorrect: boolean, bankTx: any, accountingTx: any, layerUsed: string): Promise<void> {
    try {
      await this.client.post('/learning/feedback', {
        matchId,
        isCorrect,
        bankTx,
        accountingTx,
        layerUsed,
      });
    } catch (error) {
      console.error('Failed to record learning:', error);
    }
  }
}

export const apiService = new ApiService();