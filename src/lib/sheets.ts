import { getCollection, type CollectionEntry } from 'astro:content';
import competitionProjects from '../data/competitionProjects';

/** One row of the sheet index: a competition build or a project write-up. */
export interface Sheet {
  no: string;
  title: string;
  context: string;
  year?: number;
  outcome: string;
  win: boolean;
  href: string;
  summary: string;
  figure?: string;
  image?: string;
}

export const slugify = (text: string) =>
  text
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Hand-drawn figures, keyed by sheet slug. Sheets without one show their image or summary instead.
const figures: Record<string, string> = { 'iris-smart-gas-ventilation': 'iris' };

export async function getSheets(): Promise<Sheet[]> {
  const competition = competitionProjects.map((p) => {
    const slug = slugify(p.title);
    const year = Number(p.yearTag.match(/\b(20\d\d)\b/)?.[1]) || undefined;
    return {
      title: p.title,
      context: p.yearTag,
      year,
      outcome: p.achievement ?? (p.links ?? []).map((l) => l.label).join(' · '),
      win: Boolean(p.achievement),
      href: `/projects/#${slug}`,
      summary: p.solution,
      figure: figures[slug],
    };
  });

  const written = (await getCollection('projects')).map((entry: CollectionEntry<'projects'>) => {
    const { title, description, tags = [], publishDate, repoUrl, liveUrl, heroImage } = entry.data;
    const award = tags.find((tag: string) => /award/i.test(tag));
    const topic = tags.find((tag: string) => tag !== award);
    const year = publishDate?.getFullYear();
    return {
      title,
      context: [topic, year].filter(Boolean).join(' · '),
      year,
      outcome: award ?? ([repoUrl && 'Repository', liveUrl && 'Live demo'].filter(Boolean).join(' · ') || 'Write-up'),
      win: Boolean(award),
      href: `/projects/${entry.id}/`,
      summary: description,
      figure: figures[entry.id],
      image: heroImage,
    };
  });

  return [...competition, ...written]
    // Judged outcomes first, then sheets with a drawing, then newest.
    .sort((a, b) => Number(b.win) - Number(a.win) || Number(Boolean(b.figure)) - Number(Boolean(a.figure)) || (b.year ?? 0) - (a.year ?? 0))
    .map((sheet, i) => ({ ...sheet, no: String(i + 1).padStart(2, '0') }));
}
