import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const contentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.date().optional(),
});

const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\.(md|mdx)$/, '');

export const collections = {
  'vitamin-mineral': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/vitamin-mineral', generateId }),
    schema: contentSchema,
  }),
  'nutrient-foods': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/nutrient-foods', generateId }),
    schema: contentSchema,
  }),
  supplement: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/supplement', generateId }),
    schema: contentSchema,
  }),
  'active-oxygen': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/active-oxygen', generateId }),
    schema: contentSchema,
  }),
  atopic: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/atopic', generateId }),
    schema: contentSchema,
  }),
  flowers: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/flowers', generateId }),
    schema: contentSchema,
  }),
  travel: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/travel', generateId }),
    schema: contentSchema,
  }),
  others: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/others', generateId }),
    schema: contentSchema,
  }),
  shop: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/shop', generateId }),
    schema: contentSchema,
  }),
  access: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/about', generateId }),
    schema: contentSchema,
  }),
};
