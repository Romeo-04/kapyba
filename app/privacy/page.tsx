import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy | KapyBa" };

// Mirrors docs/PRIVACY.md (a draft for legal review). Keep the two in step.
export default function PrivacyPage() {
  const contact = process.env.NEXT_PUBLIC_PRIVACY_EMAIL;
  return (
    <main className="wrap stack">
      <h1>Privacy</h1>
      <p className="mute">
        KapyBa follows the Data Privacy Act of 2012 (RA 10173). This page is a draft that the team is still reviewing.
      </p>

      <section className="card stack">
        <h2>What we keep</h2>
        <p><strong>Owners:</strong> your email, stall name, area, dishes, prices, and the portions you cook, sell and have left over.</p>
        <p><strong>Customers:</strong> a random code stored on your phone, the ratings and tags you send, the day, and any deal you reserve.</p>
        <p className="mute">We do not keep customer names, emails, phone numbers, payment details or exact location.</p>
      </section>

      <section className="card stack">
        <h2>How it is used</h2>
        <p>Your individual rating is never shown to the public and never linked to a person. The public sees a dish score only after enough customers have rated it.</p>
        <p>Owners see ratings and tags for their own dishes, not the codes on phones. If an owner reports a burst of ratings, a reviewer sees codes and times only.</p>
        <p>We do not sell data. Deals are never tied to ratings. The Bagyo screen is a simulation: no money is held or paid out.</p>
      </section>

      <section className="card stack">
        <h2>How long we keep it</h2>
        <p>Ratings and logs: up to 12 months. Phone codes: deleted after 12 months without use. Owners can ask us to delete their account and stall, and we do it within 30 days. Customers can clear the cookie; ratings already sent stay as anonymous totals.</p>
      </section>

      <section className="card stack">
        <h2>Your rights</h2>
        <p>You can ask to see, correct or delete your data, object to how it is used, or complain to the National Privacy Commission.</p>
        <p>{contact ? <>Contact us: <a href={`mailto:${contact}`}>{contact}</a></> : "Contact email: to be set by the team before launch."}</p>
      </section>
    </main>
  );
}
