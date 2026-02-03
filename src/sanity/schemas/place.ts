/**
 * Place schema for locations in Átrias
 * Supports hierarchy: Continent > Region > City > District > Building
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'place',
  title: 'Place',
  type: 'document',
  icon: () => '🗺️',
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
      name: 'placeType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Continent', value: 'continent' },
          { title: 'Region', value: 'region' },
          { title: 'City', value: 'city' },
          { title: 'Village', value: 'village' },
          { title: 'District', value: 'district' },
          { title: 'Building', value: 'building' },
          { title: 'Dungeon', value: 'dungeon' },
          { title: 'Landmark', value: 'landmark' },
          { title: 'Plane', value: 'plane' },
          { title: 'Island', value: 'island' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentLocation',
      title: 'Parent Location',
      type: 'reference',
      to: [{ type: 'place' }],
      description: 'e.g., City belongs to Region, Building belongs to City',
    }),
    defineField({
      name: 'population',
      title: 'Population',
      type: 'number',
      description: 'Approximate population (for cities/villages)',
    }),
    defineField({
      name: 'ruler',
      title: 'Ruler / Leader',
      type: 'reference',
      to: [{ type: 'character' }],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'map',
      title: 'Map',
      type: 'image',
      description: 'Map or layout of this location',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'history',
      title: 'History',
      type: 'blockContent',
    }),
    defineField({
      name: 'government',
      title: 'Government',
      type: 'blockContent',
      description: 'How this place is governed',
    }),
    defineField({
      name: 'commerce',
      title: 'Commerce & Economy',
      type: 'blockContent',
    }),
    defineField({
      name: 'notableResidents',
      title: 'Notable Residents',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'character' }] }],
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
      type: 'placeType',
      media: 'image',
      parent: 'parentLocation.name',
    },
    prepare({ title, type, media, parent }) {
      const typeEmoji = {
        continent: '🌍',
        region: '🏔️',
        city: '🏰',
        village: '🏘️',
        district: '🏛️',
        building: '🏠',
        dungeon: '⚔️',
        landmark: '🗿',
        plane: '✨',
        island: '🏝️',
      }[type as string] || '📍'
      return {
        title: `${typeEmoji} ${title}`,
        subtitle: parent ? `in ${parent}` : type,
        media,
      }
    },
  },
})
