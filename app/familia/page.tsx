import AccountPageContent from '@/components/AccountPageContent';
import { Users } from 'lucide-react';

export default function FamiliaPage() {
  return (
    <AccountPageContent
      sheet="Familia"
      label="Familia"
      icon={<Users className="w-6 h-6 text-green-400" />}
      accentColor="text-green-400"
    />
  );
}
