import { type SchemaTypeDefinition } from "sanity";
import project from "../schemas/project";
import about from "../schemas/about";
import experience from "../schemas/experience";
import skills from "../schemas/skills";
import software from "../schemas/software";
import education from "../schemas/education";
import testimonial from "../schemas/testimonial";
import hero from "../schemas/hero";
import process from "../schemas/process";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    hero,
    about,
    project,
    experience,
    skills,
    software,
    process,
    education,
    testimonial,
  ],
};
