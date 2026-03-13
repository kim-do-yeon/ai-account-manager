'use client';

import AnnouncementList from '@/components/AnnouncementList';
import { useAdmin } from '@/components/AdminContext';

export default function AnnouncementsPage() {
  const { isAdmin } = useAdmin();
  return <AnnouncementList isAdmin={isAdmin} />;
}
