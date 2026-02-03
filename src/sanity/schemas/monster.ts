/**
 * Monster schema for unique creatures of Átrias
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'monster',
  title: 'Monster',
  type: 'document',
  icon: () => '👹',
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
      name: 'monsterType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Beast', value: 'beast' },
          { title: 'Undead', value: 'undead' },
          { title: 'Fiend', value: 'fiend' },
          { title: 'Aberration', value: 'aberration' },
          { title: 'Construct', value: 'construct' },
          { title: 'Dragon', value: 'dragon' },
          { title: 'Elemental', value: 'elemental' },
          { title: 'Fey', value: 'fey' },
          { title: 'Giant', value: 'giant' },
          { title: 'Humanoid', value: 'humanoid' },
          { title: 'Monstrosity', value: 'monstrosity' },
          { title: 'Ooze', value: 'ooze' },
          { title: 'Plant', value: 'plant' },
          { title: 'Unique', value: 'unique' },
        ],
      },
    }),
    defineField({
      name: 'challenge',
      title: 'Challenge Rating',
      type: 'string',
      description: 'CR or custom difficulty rating',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'abilities',
      title: 'Abilities',
      type: 'blockContent',
      description: 'Special abilities and attacks',
    }),
    defineField({
      name: 'lore',
      title: 'Lore',
      type: 'blockContent',
      description: 'In-world history and legends about this creature',
    }),
    defineField({
      name: 'habitat',
      title: 'Habitat',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'place' }] }],
      description: 'Where this creature can be found',
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
      description: 'Monsters are hidden by default',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      type: 'monsterType',
      cr: 'challenge',
      media: 'image',
    },
    prepare({ title, type, cr, media }) {
      return {
        title: `👹 ${title}`,
        subtitle: `${type}${cr ? ` - CR ${cr}` : ''}`,
        media,
      }
    },
  },
})
