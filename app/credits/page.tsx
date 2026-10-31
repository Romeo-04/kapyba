import type { Metadata } from "next";
import credits from "@/src/demo/photos/credits.json";

export const metadata: Metadata = { title: "Photo credits | KapyBa" };

// The sample karinderyas (src/demo/seed.ts) use these Wikimedia Commons photos. CC BY and CC BY-SA ask for the
// author, the license and a link back, so each one is named here.
export default function CreditsPage() {
  return (
    <main id="main" className="wrap stack">
      <h1>Photo credits</h1>
      <p className="mute">
        The stalls marked (sample) are made up for the demo, and so are their ratings. Their dish photos are real, from
        Wikimedia Commons, cropped and made smaller. A stall&apos;s own photos are taken by its owner.
      </p>
      <section className="card stack">
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {credits.map((c) => (
            <li key={c.slug}>
              <a href={c.source} rel="noopener noreferrer" target="_blank">{c.title}</a>
              <br />
              <span className="mute small">
                by {c.author},{" "}
                {c.licenseUrl ? <a href={c.licenseUrl} rel="noopener noreferrer" target="_blank">{c.license}</a> : c.license}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
