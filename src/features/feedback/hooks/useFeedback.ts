import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { submitFeedback, submitBugReport } from '../services/feedback.service';
import type { FeedbackFormData, BugReportFormData } from '../types';

export function useSubmitFeedback() {
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (data: FeedbackFormData) => submitFeedback(data, user?.id ?? null),
    onSuccess: () => {
      toast.success('Thanks for your feedback!', {
        description: 'We read every submission and use it to improve TravelMate.',
      });
    },
    onError: () => {
      toast.error('Could not send feedback', {
        description: 'Please try again or email us directly.',
      });
    },
  });
}

export function useSubmitBugReport() {
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (data: BugReportFormData) => submitBugReport(data, user?.id ?? null),
    onSuccess: () => {
      toast.success('Bug report submitted', {
        description: "We'll investigate and fix this as soon as possible.",
      });
    },
    onError: () => {
      toast.error('Could not submit bug report', {
        description: 'Please try again.',
      });
    },
  });
}
