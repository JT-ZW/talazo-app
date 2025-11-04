import ProtectedLayout from '@/components/ProtectedLayout';

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
