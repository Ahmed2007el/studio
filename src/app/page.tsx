import { Building } from 'lucide-react';
import MainDashboard from '@/components/dashboard/main-dashboard';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-gray-950 dark:border-gray-800 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building className="h-5 w-5" />
          </div>
          <h1 className="font-headline text-xl font-bold text-gray-800 dark:text-gray-50">
            المهندس المساعد
          </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="w-full mx-auto flex">
          <MainDashboard />
        </div>
      </main>
    </div>
  );
}
