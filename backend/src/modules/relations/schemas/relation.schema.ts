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
    id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
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
    depth: z.string()
      .regex(/^\d+$/)
      .transform(val => parseInt(val, 10))
      .optional()
      .default(10),  
    direction: z.enum(['forward', 'backward', 'both']).optional().default('both')
  })
});

export const mostConnectedSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 10)
      .optional()
      .default(10),
    min_connections: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 1)
      .optional()
      .default(1)
  })
});

export const graphSchema = z.object({
  query: z.object({
    max_depth: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 3)
      .optional()
      .default(3),
    entry_id: z.string().uuid('Invalid entry ID format').optional(),
    relation_type: z.enum(['led_to', 'reminded_of', 'inspired_by', 'caused_by', 'related_to', 'resulted_in', 'all'])
      .optional()
      .default('all')
  })
});