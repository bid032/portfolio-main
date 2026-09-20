import { defineType, defineField } from "sanity";

export default defineType({
  name: "hero",
  title: "Hero Section",
  type: "document",
  fields: [
    defineField({
      name: "badge",
      title: "Availability Badge Text",
      type: "string",
      initialValue: "Available for Freelance & Part-time",
    }),
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string",
      initialValue: "ABDALLAH",
    }),
    defineField({
      name: "lastName",
      title: "Last Name",
      type: "string",
      initialValue: "AHMED",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Role",
      type: "string",
      initialValue: "Senior Graphic Designer & Web Developer",
    }),
    defineField({
      name: "logo",
      title: "Centerpiece Logo Image / SVG",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "metrics",
      title: "Key Metrics",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", title: "Value", type: "string" },
            { name: "label", title: "Label", type: "string" },
          ],
        },
      ],
    }),
  ],
});
