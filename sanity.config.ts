'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { myTheme } from './sanity/theme'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'Abdallah Ahmed - Portfolio Studio',
  theme: myTheme,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
  ],
})
