import AccountPageContent from '@/components/AccountPageContent';
import { Building2 } from 'lucide-react';

export default function EmpresaPage() {
  return (
    <AccountPageContent
      sheet="Empresa"
      label="Empresa"
      icon={<Building2 className="w-6 h-6 text-indigo-400" />}
      accentColor="text-indigo-400"
    />
  );
}
