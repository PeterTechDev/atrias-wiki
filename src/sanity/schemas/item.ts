/**
 * Item schema for weapons, armor, artifacts, and notable objects
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'item',
  title: 'Item',
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
      name: 'itemType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Weapon', value: 'weapon' },
          { title: 'Armor', value: 'armor' },
          { title: 'Artifact', value: 'artifact' },
          { title: 'Wondrous Item', value: 'wondrous' },
          { title: 'Potion', value: 'potion' },
          { title: 'Scroll', value: 'scroll' },
          { title: 'Tool', value: 'tool' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'rarity',
      title: 'Rarity',
      type: 'string',
      options: {
        list: [
          { title: 'Common', value: 'common' },
          { title: 'Uncommon', value: 'uncommon' },
          { title: 'Rare', value: 'rare' },
          { title: 'Very Rare', value: 'veryrare' },
          { title: 'Legendary', value: 'legendary' },
          { title: 'Artifact', value: 'artifact' },
        ],
      },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'currentOwner',
      title: 'Current Owner',
      type: 'reference',
      to: [{ type: 'character' }],
    }),
    defineField({
      name: 'previousOwners',
      title: 'Previous Owners',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
    }),
    defineField({
      name: 'location',
      title: 'Location (if not owned)',
      type: 'reference',
      to: [{ type: 'place' }],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'properties',
      title: 'Properties / Abilities',
      type: 'blockContent',
      description: 'Mechanical properties and special abilities',
    }),
    defineField({
      name: 'history',
      title: 'History',
      type: 'blockContent',
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
      title: 'name',
      rarity: 'rarity',
      type: 'itemType',
      media: 'image',
    },
    prepare({ title, rarity, type, media }) {
      const rarityColors: Record<string, string> = {
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        veryrare: '🟣',
        legendary: '🟠',
        artifact: '🔴',
      }
      return {
        title: `${rarityColors[rarity] || '⚪'} ${title}`,
        subtitle: `${type} - ${rarity}`,
        media,
      }
    },
  },
})
