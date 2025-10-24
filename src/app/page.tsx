import { Building } from 'lucide-react';
import MainDashboard from '@/components/dashboard/main-dashboard';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-semibold">
            مساعد الهندسة المدنية
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0">
        <MainDashboard />
      </main>
    </div>
  );
}
