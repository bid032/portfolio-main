import { defineField, defineType } from "sanity";

export const presetDeliverables = [
  { title: "Full-Stack Web App", value: "Full-Stack Web App" },
  { title: "Web Design & UI/UX", value: "Web Design & UI/UX" },
  { title: "Brand Identity & Guidelines", value: "Brand Identity & Guidelines" },
  { title: "Logo Design", value: "Logo Design" },
  { title: "Print & Packaging", value: "Print & Packaging" },
  { title: "Social Media Campaign Kit", value: "Social Media Campaign Kit" },
  { title: "Photo Manipulation & 3D Artwork", value: "Photo Manipulation & 3D Artwork" },
  { title: "Motion Graphics & Reels", value: "Motion Graphics & Reels" },
  { title: "Vector Artwork & Assets", value: "Vector Artwork & Assets" },
  { title: "Typography & Layout", value: "Typography & Layout" },
];

export const presetTools = [
  { title: "Next.js", value: "Next.js" },
  { title: "React", value: "React" },
  { title: "Tailwind CSS", value: "Tailwind CSS" },
  { title: "TypeScript", value: "TypeScript" },
  { title: "Adobe Photoshop", value: "Adobe Photoshop" },
  { title: "Adobe Illustrator", value: "Adobe Illustrator" },
  { title: "Adobe Premiere Pro", value: "Adobe Premiere Pro" },
  { title: "Adobe After Effects", value: "Adobe After Effects" },
  { title: "Figma", value: "Figma" },
  { title: "Blender 3D", value: "Blender 3D" },
  { title: "Cinema 4D", value: "Cinema 4D" },
  { title: "Sanity CMS", value: "Sanity CMS" },
];

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    {
      name: "main",
      title: " البيانات الأساسية",
      default: true,
    },
    {
      name: "media",
      title: "️ الصور والغلاف",
    },
    {
      name: "details",
      title: " التفاصيل والمعلومات",
    },
  ],
  fields: [
    // --- TAB 1: MAIN INFO ---
    defineField({
      name: "title",
      title: "عنوان المشروع (Project Title)",
      type: "string",
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "رابط المشروع (URL Slug)",
      type: "slug",
      group: "main",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "تصنيف المشروع (Project Category)",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "Web Development / تطوير المواقع", value: "web-dev" },
          { title: "Websites & Apps / تطبيقات ومواقع", value: "apps" },
          { title: "Brand Identity & Logo / الهوية البصرية والشعارات", value: "branding" },
          { title: "Photo Manipulation / دمج وتعديل الصور", value: "illustration" },
          { title: "3D Artwork & Render / تصميم وسينما 3D", value: "3d" },
          { title: "Print & Packaging / المطبوعات والتغليف", value: "print" },
          { title: "Digital & Social Media / السوشيال ميديا والحملات", value: "digital" },
          { title: "Typography & Calligraphy / التايبوجرافي والخط العربي", value: "typography" },
          { title: "Editorial & Layout / المجلات والكتالوجات", value: "editorial" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "ترتيب العرض في الموقع (Display Order)",
      type: "number",
      group: "main",
      description: "أدخل رقم الترتيب (مثلاً: 1 للمشروع الأول، 2 للثاني). المشاريع بدون رقم تظهر بالأحدث أولاً.",
    }),
    defineField({
      name: "featured",
      title: "مشروع متميز (Featured Project)",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),
    defineField({
      name: "date",
      title: "تاريخ المشروع (Project Date)",
      type: "date",
      group: "main",
    }),

    // --- TAB 2: MEDIA ---
    defineField({
      name: "coverImage",
      title: "صورة الغلاف الرئيسي (Cover Image)",
      type: "image",
      group: "media",
      description: " المقاس الموصى به: 1200x900 بكسل (نسبة العرض للارتفاع 4:3). اضغط زر Hotspot / Crop لقص الصورة وتحديد الجزء المهم بدقة.",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "معرض صور المشروع (Gallery Images)",
      type: "array",
      group: "media",
      description: " يمكنك رفع صور جديدة أو الضغط على Select لتحديد صورة سبق رفعها من مشروع آخر ونقلها/إضافتها هنا.",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    }),

    // --- TAB 3: DETAILS & CONTENT ---
    defineField({
      name: "clientName",
      title: "اسم العميل / البراند (Client Name)",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "client",
      title: "Client (Legacy)",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "projectUrl",
      title: "رابط المشروع الحي (Project Live URL)",
      type: "url",
      group: "details",
    }),
    defineField({
      name: "deliverables",
      title: "المخرجات والخدمات (Deliverables)",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      options: {
        list: presetDeliverables,
      },
    }),
    defineField({
      name: "toolsUsed",
      title: "الأدوات والبرامج المستخدمة (Tools Used)",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      options: {
        list: presetTools,
      },
    }),
    defineField({
      name: "description",
      title: "تفاصيل ووصف المشروع (Full Description)",
      type: "array",
      group: "details",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      category: "category",
      order: "order",
    },
    prepare(selection) {
      const { title, media, category, order } = selection;
      const orderPrefix = typeof order === "number" ? `#${order} | ` : "";
      return {
        title: `${orderPrefix}${title || "بدون عنوان"}`,
        subtitle: category ? category.toUpperCase() : "بدون تصنيف",
        media,
      };
    },
  },
});
