/**
 * Sanity schema index - exports all content types
 */

import blockContent from './blockContent'
import character from './character'
import place from './place'
import faction from './faction'
import item from './item'
import lore from './lore'
import session from './session'
import monster from './monster'
import adventure from './adventure'

export const schemaTypes = [
  // Block content (used by other schemas)
  blockContent,
  
  // Main content types
  character,
  place,
  faction,
  item,
  lore,
  session,
  monster,
  adventure,
]
