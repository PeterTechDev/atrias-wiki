/**
 * Sanity Studio configuration
 * Access at /studio in your Next.js app
 */

import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'atrias-wiki',
  title: 'Átrias Wiki',
  
  projectId,
  dataset,
  
  plugins: [
    structureTool({
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Content')
          .items([
            // Characters
            S.listItem()
              .title('Characters')
              .icon(() => '👤')
              .child(
                S.documentTypeList('character')
                  .title('Characters')
              ),
            // Places
            S.listItem()
              .title('Places')
              .icon(() => '🗺️')
              .child(
                S.documentTypeList('place')
                  .title('Places')
              ),
            // Factions
            S.listItem()
              .title('Factions')
              .icon(() => '⚔️')
              .child(
                S.documentTypeList('faction')
                  .title('Factions')
              ),
            // Items
            S.listItem()
              .title('Items')
              .icon(() => '🗡️')
              .child(
                S.documentTypeList('item')
                  .title('Items')
              ),
            // Lore
            S.listItem()
              .title('Lore')
              .icon(() => '📜')
              .child(
                S.documentTypeList('lore')
                  .title('Lore')
              ),
            S.divider(),
            // Adventures
            S.listItem()
              .title('Adventures')
              .icon(() => '📖')
              .child(
                S.documentTypeList('adventure')
                  .title('Adventures')
              ),
            // Sessions
            S.listItem()
              .title('Sessions')
              .icon(() => '🎲')
              .child(
                S.documentTypeList('session')
                  .title('Sessions')
              ),
            S.divider(),
            // Monsters (DM only)
            S.listItem()
              .title('🔒 Monsters (DM)')
              .icon(() => '👹')
              .child(
                S.documentTypeList('monster')
                  .title('Monsters')
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],
  
  schema: {
    types: schemaTypes,
  },
})
