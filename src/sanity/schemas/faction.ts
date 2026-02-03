/**
 * Faction schema for organizations, guilds, religions, etc.
 * Includes special fields for religions (dogma, proverbs, hierarchy)
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'faction',
  title: 'Faction',
  type: 'document',
  icon: () => '⚔️',
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
      name: 'factionType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Kingdom', value: 'kingdom' },
          { title: 'Guild', value: 'guild' },
          { title: 'Religion', value: 'religion' },
          { title: 'Military Order', value: 'military' },
          { title: 'Secret Society', value: 'secret' },
          { title: 'Trading Company', value: 'trading' },
          { title: 'Criminal Organization', value: 'criminal' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'symbol',
      title: 'Symbol / Emblem',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'headquarters',
      title: 'Headquarters',
      type: 'reference',
      to: [{ type: 'place' }],
    }),
    defineField({
      name: 'leader',
      title: 'Leader',
      type: 'reference',
      to: [{ type: 'character' }],
    }),
    defineField({
      name: 'members',
      title: 'Notable Members',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'goals',
      title: 'Goals',
      type: 'text',
      description: 'Public objectives of the faction',
      rows: 3,
    }),
    // Religion-specific fields
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      description: 'For religions/deities',
      hidden: ({ document }) => document?.factionType !== 'religion',
    }),
    defineField({
      name: 'domains',
      title: 'Domains',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Divine domains (e.g., Justice, Light, Order)',
      hidden: ({ document }) => document?.factionType !== 'religion',
    }),
    defineField({
      name: 'holySymbol',
      title: 'Holy Symbol Description',
      type: 'text',
      hidden: ({ document }) => document?.factionType !== 'religion',
    }),
    defineField({
      name: 'dogma',
      title: 'Dogma',
      type: 'blockContent',
      description: 'Religious teachings and beliefs',
      hidden: ({ document }) => document?.factionType !== 'religion',
    }),
    defineField({
      name: 'proverbs',
      title: 'Proverbs',
      type: 'array',
      of: [{ type: 'text' }],
      description: 'Religious sayings and wisdom',
      hidden: ({ document }) => document?.factionType !== 'religion',
    }),
    defineField({
      name: 'hierarchy',
      title: 'Hierarchy / Ranks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Title' },
            { name: 'description', type: 'text', title: 'Description' },
          ],
        },
      ],
      description: 'Organizational ranks',
    }),
    defineField({
      name: 'secrets',
      title: 'Secrets',
      type: 'text',
      description: '⚠️ DM only - hidden objectives or secret info',
      rows: 4,
    }),
    defineField({
      name: 'dmNotes',
      title: 'DM Notes',
      type: 'text',
      description: '⚠️ Hidden from players',
      rows: 4,
    }),
    defineField({
      name: 'isSpoiler',
      title: 'Spoiler',
      type: 'boolean',
      description: 'Hide from players until revealed',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      type: 'factionType',
      media: 'symbol',
    },
    prepare({ title, type, media }) {
      const typeEmoji = {
        kingdom: '👑',
        guild: '🛠️',
        religion: '⛪',
        military: '⚔️',
        secret: '🕵️',
        trading: '💰',
        criminal: '🗡️',
      }[type as string] || '🏴'
      return {
        title: `${typeEmoji} ${title}`,
        subtitle: type,
        media,
      }
    },
  },
})
