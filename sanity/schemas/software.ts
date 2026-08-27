import { defineField, defineType } from "sanity";

export default defineType({
  name: "software",
  title: "Software & Tools",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Tool Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "image",
      description: "Upload a logo/icon for the tool",
    }),
    defineField({
      name: "proficiency",
      title: "Proficiency",
      type: "number",
      description: "Proficiency percentage (0-100)",
      validation: (Rule) => Rule.min(0).max(100),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "icon",
    },
  },
});
