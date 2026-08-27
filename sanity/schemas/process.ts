import { defineType, defineField } from "sanity";

export default defineType({
  name: "process",
  title: "Process Step",
  type: "document",
  fields: [
    defineField({
      name: "num",
      title: "Step Number (e.g. 01)",
      type: "string",
    }),
    defineField({
      name: "tag",
      title: "Tag Label",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Step Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Step Description",
      type: "text",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
});
