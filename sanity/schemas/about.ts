import { defineField, defineType } from "sanity";

export default defineType({
  name: "about",
  title: "About Section",
  type: "document",
  fields: [
    defineField({
      name: "profileImage",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "bio",
      title: "Bio & Story",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "skillsText",
      title: "Philosophy & Skills Note",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "yearsExperience",
      title: "Years of Experience",
      type: "string",
      initialValue: "5+",
    }),
    defineField({
      name: "completedProjects",
      title: "Completed Projects",
      type: "string",
      initialValue: "120+",
    }),
    defineField({
      name: "clientSatisfaction",
      title: "Client Satisfaction",
      type: "string",
      initialValue: "98%",
    }),
    defineField({
      name: "responseRate",
      title: "Response Rate",
      type: "string",
      initialValue: "1 Hour",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "About Section Content",
      };
    },
  },
});
