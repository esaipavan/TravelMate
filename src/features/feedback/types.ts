export type FeedbackType = 'bug' | 'feature_request' | 'general' | 'compliment';

export interface FeedbackFormData {
  type: FeedbackType;
  subject: string;
  message: string;
  rating?: number;
}

export interface BugReportFormData {
  title: string;
  description: string;
  steps?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
