import { defineCollection, z } from 'astro:content';

const contentBaseSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  heroImage: z.string().optional(),
});

const blog = defineCollection({
  type: 'content',
  schema: contentBaseSchema.extend({
    layout: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: contentBaseSchema.extend({
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    intro: z.string().optional(),
    datasetUrl: z.string().url().optional(),
  }),
});

const courses = defineCollection({
  type: 'content',
  schema: contentBaseSchema.extend({
    lessonNumber: z.number().optional(),
    intro: z.string().optional(),
  }),
});

export const collections = { blog, projects, courses };