import Sidebar from '@/components/layout/Sidebar';
import AIAssistant from '@/components/AIAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 p-4 overflow-y-auto"
        style={{ backgroundColor: 'var(--bg)', backgroundImage: 'var(--bg-pattern)' }}
      >
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}
