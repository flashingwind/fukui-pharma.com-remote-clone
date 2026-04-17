import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const contentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.date().optional(),
});

export const collections = {
  'vitamin-mineral': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/vitamin-mineral' }),
    schema: contentSchema,
  }),
  'nutrient-foods': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/nutrient-foods' }),
    schema: contentSchema,
  }),
  supplement: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/supplement' }),
    schema: contentSchema,
  }),
  'active-oxygen': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/active-oxygen' }),
    schema: contentSchema,
  }),
  atopic: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/atopic' }),
    schema: contentSchema,
  }),
  flowers: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/flowers' }),
    schema: contentSchema,
  }),
  travel: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/travel' }),
    schema: contentSchema,
  }),
  others: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/others' }),
    schema: contentSchema,
  }),
  shop: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/shop' }),
    schema: contentSchema,
  }),
  access: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
    schema: contentSchema,
  }),
};
