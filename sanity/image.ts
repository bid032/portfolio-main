// import imageUrlBuilder from "@sanity/image-url";
// import { client } from "./client";

// const builder = imageUrlBuilder(client);

// export function urlFor(source: any) {
//   const isLive = process.env.NODE_ENV==="production"
//   return builder.image(source);
// }

import { createImageUrlBuilder } from '@sanity/image-url'
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "ann2w0x9",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}