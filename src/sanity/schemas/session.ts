/**
 * Session schema for game session recaps
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'session',
  title: 'Session',
  type: 'document',
  icon: () => '🎲',
  fields: [
    defineField({
      name: 'number',
      title: 'Session Number',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional session title',
    }),
    defineField({
      name: 'campaign',
      title: 'Campaign',
      type: 'string',
      description: 'Which campaign this session belongs to',
    }),
    defineField({
      name: 'realDate',
      title: 'Play Date (Real World)',
      type: 'date',
    }),
    defineField({
      name: 'inGameDate',
      title: 'In-Game Date',
      type: 'string',
      description: 'Date in Átrias calendar',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'blockContent',
    }),
    defineField({
      name: 'charactersPresent',
      title: 'Characters Present',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
    }),
    defineField({
      name: 'locationsVisited',
      title: 'Locations Visited',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'place' }] }],
    }),
    defineField({
      name: 'keyEvents',
      title: 'Key Events',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'lore' }] }],
      description: 'Major events that occurred',
    }),
    defineField({
      name: 'dmNotes',
      title: 'DM Notes',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'isSpoiler',
      title: 'Spoiler',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Session Number',
      name: 'sessionNumber',
      by: [{ field: 'number', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      number: 'number',
      title: 'title',
      date: 'realDate',
      campaign: 'campaign',
    },
    prepare({ number, title, date, campaign }) {
      return {
        title: `🎲 Session ${number}${title ? `: ${title}` : ''}`,
        subtitle: `${campaign || 'Campaign'} - ${date || 'Date TBD'}`,
      }
    },
  },
})
