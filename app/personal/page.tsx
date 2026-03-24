import AccountPageContent from '@/components/AccountPageContent';
import { User } from 'lucide-react';

export default function PersonalPage() {
  return (
    <AccountPageContent
      sheet="Personal"
      label="Personal"
      icon={<User className="w-6 h-6 text-orange-400" />}
      accentColor="text-orange-400"
    />
  );
}
