import { z } from 'zod';

export const createRelationSchema = z.object({
  body: z.object({
    from_entry_id: z.string().uuid('Invalid from_entry_id format'),
    to_entry_id: z.string().uuid('Invalid to_entry_id format'),
    relation_type: z.enum(['led_to', 'reminded_of', 'inspired_by', 'caused_by', 'related_to', 'resulted_in']),
    description: z.string().max(500).optional().nullable()
  }).refine(
    data => data.from_entry_id !== data.to_entry_id,
    { message: 'Entry cannot be related to itself' }
  )
});

export const relationIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  })
});

export const entryIdSchema = z.object({
  params: z.object({
    entryId: z.string().uuid('Invalid entry ID format')
  })
});

export const getChainSchema = z.object({
  params: z.object({
    entryId: z.string().uuid('Invalid entry ID format')
  }),
  query: z.object({
    depth: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    direction: z.enum(['forward', 'backward', 'both']).optional().default('both')
  })
});