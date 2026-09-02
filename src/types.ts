export type SectionId = 'docs' | 'labs' | 'assignments' | 'scores';

export interface CourseRecord {
  id: string;
  section: SectionId;
  slug: string;
  title: string;
  summary: string;
  order: number;
  updated: string | null;
  deadline: string | null;
  points: number | null;
  status: string | null;
  externalUrl: string | null;
  pdfUrl: string | null;
  pdfLabel: string | null;
  pdfs: Array<{ url: string; label: string }>;
  zipUrl: string | null;
  zipLabel: string | null;
  content: string;
}

export interface ContentIndex {
  generatedAt: string;
  records: CourseRecord[];
}
