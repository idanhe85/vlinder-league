import { AppShell } from '@/app/components/nav/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
