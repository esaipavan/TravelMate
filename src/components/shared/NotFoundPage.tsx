import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Rendered for any unmatched route. Deliberately layout-free (no AppLayout/
// PublicLayout) since it must render correctly for both signed-in and
// signed-out visitors — the "Go to Dashboard" link relies on the existing
// RequireAuth guard to redirect signed-out users to /login as normal.
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Compass className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
