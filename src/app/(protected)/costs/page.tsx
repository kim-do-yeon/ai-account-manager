'use client';

import CostTable from '@/components/CostTable';
import { useAdmin } from '@/components/AdminContext';

export default function CostsPage() {
  const { isAdmin } = useAdmin();
  return <CostTable isAdmin={isAdmin} />;
}
