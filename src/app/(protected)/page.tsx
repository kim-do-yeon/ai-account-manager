'use client';

import AccountTable from '@/components/AccountTable';
import { useAdmin } from '@/components/AdminContext';

export default function HomePage() {
  const { isAdmin } = useAdmin();
  return <AccountTable isAdmin={isAdmin} />;
}
