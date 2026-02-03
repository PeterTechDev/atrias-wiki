/**
 * Adventure schema for one-shots and campaign arcs
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'adventure',
  title: 'Adventure',
  type: 'document',
  icon: () => '📖',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'adventureType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'One-Shot', value: 'oneshot' },
          { title: 'Campaign', value: 'campaign' },
          { title: 'Arc', value: 'arc' },
          { title: 'Side Quest', value: 'sidequest' },
        ],
      },
    }),
    defineField({
      name: 'levelRange',
      title: 'Recommended Levels',
      type: 'string',
      description: 'e.g., 1-5, 5-10',
    }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'synopsis',
      title: 'Synopsis',
      type: 'text',
      rows: 3,
      description: 'Brief summary (no spoilers) for preview',
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'blockContent',
      description: '⚠️ DM only - full adventure details',
    }),
    defineField({
      name: 'locations',
      title: 'Featured Locations',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'place' }] }],
    }),
    defineField({
      name: 'keyNPCs',
      title: 'Key NPCs',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
    }),
    defineField({
      name: 'relatedAdventures',
      title: 'Related Adventures',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'adventure' }] }],
    }),
    defineField({
      name: 'sessions',
      title: 'Sessions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'session' }] }],
      description: 'Sessions that are part of this adventure',
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
      initialValue: true,
      description: 'Adventures are hidden by default until completed',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      type: 'adventureType',
      level: 'levelRange',
      media: 'image',
    },
    prepare({ title, type, level, media }) {
      const typeEmoji = {
        oneshot: '🎯',
        campaign: '📚',
        arc: '📖',
        sidequest: '❓',
      }[type as string] || '📖'
      return {
        title: `${typeEmoji} ${title}`,
        subtitle: level ? `${type} - Levels ${level}` : type,
        media,
      }
    },
  },
})
