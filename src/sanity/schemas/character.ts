/**
 * Character schema for PCs, NPCs, Deities, and Creatures
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'character',
  title: 'Character',
  type: 'document',
  icon: () => '👤',
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
      name: 'aliases',
      title: 'Aliases / Titles',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Other names this character is known by',
    }),
    defineField({
      name: 'characterType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'PC (Player Character)', value: 'pc' },
          { title: 'NPC', value: 'npc' },
          { title: 'Deity', value: 'deity' },
          { title: 'Creature', value: 'creature' },
        ],
        layout: 'radio',
      },
      initialValue: 'npc',
    }),
    defineField({
      name: 'race',
      title: 'Race',
      type: 'string',
      description: 'Human, Elf, Dwarf, Halfling, etc.',
    }),
    defineField({
      name: 'characterClass',
      title: 'Class',
      type: 'string',
      description: 'Fighter, Wizard, Cleric, etc. (if applicable)',
    }),
    defineField({
      name: 'age',
      title: 'Age',
      type: 'number',
    }),
    defineField({
      name: 'height',
      title: 'Height',
      type: 'string',
      description: 'e.g., 1.80m',
    }),
    defineField({
      name: 'affiliation',
      title: 'Affiliation',
      type: 'reference',
      to: [{ type: 'faction' }],
    }),
    defineField({
      name: 'location',
      title: 'Current Location',
      type: 'reference',
      to: [{ type: 'place' }],
    }),
    defineField({
      name: 'birthplace',
      title: 'Birthplace',
      type: 'reference',
      to: [{ type: 'place' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Alive', value: 'alive' },
          { title: 'Dead', value: 'dead' },
          { title: 'Unknown', value: 'unknown' },
          { title: 'Missing', value: 'missing' },
        ],
      },
      initialValue: 'alive',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Physical appearance and personality',
    }),
    defineField({
      name: 'history',
      title: 'History / Background',
      type: 'blockContent',
    }),
    defineField({
      name: 'relatedCharacters',
      title: 'Related Characters',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
    }),
    defineField({
      name: 'dmNotes',
      title: 'DM Notes',
      type: 'text',
      description: '⚠️ Hidden from players - only visible to DM',
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
      subtitle: 'race',
      media: 'portrait',
      type: 'characterType',
    },
    prepare({ title, subtitle, media, type }) {
      const typeEmoji = {
        pc: '🎮',
        npc: '👤',
        deity: '⚡',
        creature: '🐉',
      }[type as string] || '👤'
      return {
        title: `${typeEmoji} ${title}`,
        subtitle,
        media,
      }
    },
  },
})
