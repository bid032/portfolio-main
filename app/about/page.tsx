import { client } from "@/sanity/lib/client";

export default async function AboutPage() {
  const about = await client.fetch(`*[_type == "about"][0]`);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>About</h1>

      {/* اطبع الداتا كلها */}
      <pre>{JSON.stringify(about, null, 2)}</pre>
    </div>
  );
}