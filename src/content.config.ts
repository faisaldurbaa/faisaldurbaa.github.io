import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const contentBaseSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  heroImage: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: contentBaseSchema.extend({
    layout: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: contentBaseSchema.extend({
    repoUrl: z.url().optional(),
    liveUrl: z.url().optional(),
    intro: z.string().optional(),
    datasetUrl: z.url().optional(),
    img1: z.string().optional(),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: contentBaseSchema.extend({
    lessonNumber: z.number().optional(),
    intro: z.string().optional(),
  }),
});

export const collections = { blog, projects, courses };
