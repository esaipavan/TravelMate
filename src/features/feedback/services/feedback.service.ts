import { supabase } from '@/lib/supabase';
import type { FeedbackFormData, BugReportFormData } from '../types';

function browserInfo(): string {
  try {
    return JSON.stringify({
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
    });
  } catch {
    return '{}';
  }
}

export async function submitFeedback(data: FeedbackFormData, userId: string | null): Promise<void> {
  const { error } = await supabase.from('feedback').insert({
    user_id: userId,
    type: data.type,
    subject: data.subject,
    message: data.message,
    rating: data.rating ?? null,
    page_url: window.location.href,
    status: 'new',
  });
  if (error) throw error;
}

export async function submitBugReport(
  data: BugReportFormData,
  userId: string | null,
): Promise<void> {
  const { error } = await supabase.from('bug_reports').insert({
    user_id: userId,
    title: data.title,
    description: data.description,
    steps_to_reproduce: data.steps ?? null,
    severity: data.severity,
    status: 'open',
    browser_info: browserInfo(),
  });
  if (error) throw error;
}
