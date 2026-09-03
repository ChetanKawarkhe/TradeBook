export type JournalEntry = {
  id: string;
  date: string;

  mood?: string;
  marketBias?: string;

  plan: string;
  whatWentWell: string;
  whatWentWrong: string;
  lesson: string;

  notes: string;

  createdAt: string;
  updatedAt: string;
};

export type PlaybookRule = {
  id: string;
  title: string;
  description: string;
  category: "ENTRY" | "RISK" | "EXIT" | "MINDSET";
  active: boolean;
  createdAt: string;
};