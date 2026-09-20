import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import About from "@/components/About";

const Skills = dynamic(() => import("@/components/Skills"));
const Software = dynamic(() => import("@/components/Software"));
const Experience = dynamic(() => import("@/components/Experience"));
const Process = dynamic(() => import("@/components/Process"));
const ProjectsGrid = dynamic(() => import("@/components/ProjectsGrid"));
const Contact = dynamic(() => import("@/components/Contact"));

import { client } from "@/sanity/client";
import {
  projectsQuery,
  aboutQuery,
  experienceQuery,
  skillsQuery,
  softwareQuery,
  educationQuery,
} from "@/sanity/queries";

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getData() {
  try {
    const [projects, about, experience, skills, software, education] =
      await Promise.all([
        client.fetch(projectsQuery).catch(() => []),
        client.fetch(aboutQuery).catch(() => null),
        client.fetch(experienceQuery).catch(() => []),
        client.fetch(skillsQuery).catch(() => null),
        client.fetch(softwareQuery).catch(() => []),
        client.fetch(educationQuery).catch(() => []),
      ]);

    return { projects, about, experience, skills, software, education };
  } catch {
    return {
      projects: [],
      about: null,
      experience: [],
      skills: null,
      software: [],
      education: [],
    };
  }
}

export default async function Home() {
  const { projects, about, experience, skills, software, education } =
    await getData();

  return (
    <>
      <Hero />
      <About data={about} />
      {/* <Education data={education} /> */}
      <Skills data={skills} />
      <Software data={software} />
      <Experience data={experience} />
      <Process />
      <ProjectsGrid projects={projects} />
      <Contact />
    </>
  );
}
