import { getCollection, type CollectionEntry } from 'astro:content';
import competitionProjects from '../data/competitionProjects';
import { hasFigure } from './figures';

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
  slug: string;
}

export const slugify = (text: string) =>
  text
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Sheets listed here lead the index in this order; the rest follow by outcome, then year.
const priority = ['earthquake-damage-prediction', 'aircraft-detection', 'iris-smart-gas-ventilation'];

// Facts the content files do not carry, supplied by the author.
const overrides: Record<string, Partial<Sheet>> = {
  'earthquake-damage-prediction': {
    context: 'Frontier Academy · 2025',
    outcome: 'International Data Storytelling Award',
    summary: 'A deep learning model that predicts post-earthquake building damage from the Nepal 2015 dataset, with an intervention framework built on its results.',
  },
  'aircraft-detection': {
    context: 'Harvard Undergraduate Ventures · 2025',
    outcome: 'Web app demo · Repository',
  },
};

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
      figure: hasFigure(slug) ? slug : undefined,
      slug,
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
      figure: hasFigure(entry.id) ? entry.id : undefined,
      image: heroImage,
      slug: entry.id,
      ...overrides[entry.id],
    };
  });

  const rank = (slug: string) => (priority.indexOf(slug) + 1 || priority.length + 1);
  return [...competition, ...written]
    .sort((a, b) => rank(a.slug) - rank(b.slug) || Number(b.win) - Number(a.win) || (b.year ?? 0) - (a.year ?? 0))
    .map((sheet, i) => ({ ...sheet, no: String(i + 1).padStart(2, '0') }));
}
