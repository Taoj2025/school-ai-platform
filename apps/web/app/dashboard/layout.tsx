import Sidebar from '@/components/layout/Sidebar';
import GlobalAIAssist from '@/components/AIAssistant/GlobalAIAssist';
import { AIProvider } from '@/lib/ai-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main
          className="flex-1 p-4 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg)', backgroundImage: 'var(--bg-pattern)' }}
        >
          {children}
        </main>
        <GlobalAIAssist />
      </div>
    </AIProvider>
  );
}
