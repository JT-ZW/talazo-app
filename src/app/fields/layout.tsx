import ProtectedLayout from '@/components/ProtectedLayout';

export default function FieldsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
