-- ============================================================
-- Migration 017: Update is_admin() and add is_super_admin()
--
-- Migration 016 added 'super_admin' to user_role_enum but could
-- not use it in the same transaction. Now that the value is
-- committed, these functions can safely reference it.
-- ============================================================

-- Update is_admin() so super_admin passes all admin checks.
-- All existing RLS policies that call is_admin() gain super_admin
-- support automatically — no policy changes required.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND user_role IN ('admin', 'super_admin')
  );
$$;

-- New helper for routes/policies that require super_admin exclusively.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND user_role = 'super_admin'
  );
$$;
