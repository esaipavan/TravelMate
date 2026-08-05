import { supabase } from '@/lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

const RETURN_TO_KEY = 'auth:return_to';

function getAppUrl(): string {
  return window.location.origin;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapAuthError(error));
}

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getAppUrl()}/onboarding`,
    },
  });
  if (error) throw new Error(mapAuthError(error));
}

export async function signInWithGoogle(returnTo = '/dashboard'): Promise<void> {
  const safePath = returnTo.startsWith('/') ? returnTo : '/dashboard';
  if (safePath !== '/dashboard') {
    sessionStorage.setItem(RETURN_TO_KEY, safePath);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getAppUrl()}/auth/callback`,
    },
  });

  if (error) {
    sessionStorage.removeItem(RETURN_TO_KEY);
    throw new Error(mapAuthError(error));
  }
}

export function getOAuthReturnTo(): string {
  const stored = sessionStorage.getItem(RETURN_TO_KEY) ?? '/dashboard';
  sessionStorage.removeItem(RETURN_TO_KEY);
  return stored.startsWith('/') ? stored : '/dashboard';
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function resendConfirmationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${getAppUrl()}/onboarding` },
  });
  if (error) throw new Error(mapAuthError(error));
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/reset-password`,
  });
  if (error) throw new Error(mapAuthError(error));
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(mapAuthError(error));
}

function mapAuthError(error: AuthError): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Incorrect email or password.';
    case 'email_not_confirmed':
      return 'Please verify your email address before signing in.';
    case 'user_already_exists':
      return 'An account with this email already exists.';
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'same_password':
      return 'Your new password must be different from your current password.';
    case 'weak_password':
      return 'Password does not meet the security requirements.';
    case 'email_address_not_authorized':
      return 'This email address is not authorized to sign up.';
    case 'session_not_found':
      return 'Your session has expired. Please sign in again.';
    default:
      return error.message;
  }
}
