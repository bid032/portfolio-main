import { defineField, defineType } from "sanity";

export default defineType({
  name: "skills",
  title: "Soft Skills",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Skills List",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Soft Skills",
      };
    },
  },
});
