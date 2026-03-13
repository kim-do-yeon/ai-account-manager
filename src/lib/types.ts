export interface Account {
  id: string;
  platform: string;
  accountId: string;
  password: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostEntry {
  id: string;
  platform: string;
  period: string;
  amount: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
