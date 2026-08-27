export const projectsQuery = `*[_type == "project"] | order(coalesce(order, 9999) asc, _createdAt desc) {
  _id,
  _createdAt,
  title,
  slug,
  coverImage,
  category,
  date,
  featured,
  order,
  clientName,
  "client": coalesce(clientName, client),
  deliverables,
  toolsUsed,
  "tools": toolsUsed,
  projectUrl,
  "websiteUrl": projectUrl,
  description
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  coverImage,
  gallery,
  category,
  date,
  featured,
  clientName,
  "client": coalesce(clientName, client),
  deliverables,
  toolsUsed,
  "tools": toolsUsed,
  projectUrl,
  "websiteUrl": projectUrl,
  description
}`;

export const aboutQuery = `*[_type == "about"][0] {
  _id,
  bio,
  skillsText,
  profileImage,
  yearsExperience,
  completedProjects,
  clientSatisfaction,
  responseRate
}`;

export const experienceQuery = `*[_type == "experience"] | order(order asc) {
  _id,
  company,
  role,
  duration,
  type,
  description,
  order
}`;

export const skillsQuery = `*[_type == "skills"][0] {
  _id,
  items
}`;

export const softwareQuery = `*[_type == "software"] | order(name asc) {
  _id,
  name,
  category,
  icon,
  proficiency
}`;

export const educationQuery = `*[_type == "education"] | order(order asc) {
  _id,
  university,
  degree,
  year,
  order
}`;

export const processQuery = `*[_type == "process"] | order(order asc) {
  _id,
  num,
  tag,
  title,
  description,
  order
}`;

export const heroQuery = `*[_type == "hero"][0] {
  _id,
  badge,
  firstName,
  lastName,
  subtitle,
  logo,
  metrics
}`;
