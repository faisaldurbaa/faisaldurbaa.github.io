// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
    heroImage: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    heroImage: z.string().optional(),
  }),
});

// A single collection for courses. We distinguish between
// landing pages and lessons by filename.
const courses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // These are optional because a landing page might not need them
    lessonNumber: z.number().optional(),
    // All other fields are optional to accommodate both types
    publishDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
  })
});

export const collections = { blog, projects, courses };