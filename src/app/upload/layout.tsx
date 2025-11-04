import ProtectedLayout from '@/components/ProtectedLayout';

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
