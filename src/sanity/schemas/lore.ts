/**
 * Lore schema for historical events, legends, and world history
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'lore',
  title: 'Lore',
  type: 'document',
  icon: () => '📜',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'loreType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Historical Event', value: 'event' },
          { title: 'Legend', value: 'legend' },
          { title: 'Prophecy', value: 'prophecy' },
          { title: 'Era', value: 'era' },
          { title: 'War', value: 'war' },
          { title: 'Discovery', value: 'discovery' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'era',
      title: 'Era / Age',
      type: 'string',
      description: 'When this occurred in Átrias history',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Brief summary for previews',
    }),
    defineField({
      name: 'content',
      title: 'Full Content',
      type: 'blockContent',
    }),
    defineField({
      name: 'relatedCharacters',
      title: 'Related Characters',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
    }),
    defineField({
      name: 'relatedPlaces',
      title: 'Related Places',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'place' }] }],
    }),
    defineField({
      name: 'relatedFactions',
      title: 'Related Factions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'faction' }] }],
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
  preview: {
    select: {
      title: 'title',
      type: 'loreType',
      era: 'era',
      media: 'image',
    },
    prepare({ title, type, era, media }) {
      return {
        title: `📜 ${title}`,
        subtitle: era ? `${type} - ${era}` : type,
        media,
      }
    },
  },
})
