import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export async function getStats() {
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const db = neon(process.env.DATABASE_URL!);
  const [businesses, engagements, assessments] = await Promise.all([
    db.query("select count(*)::int n from businesses where business_status <> 'archived'"),
    db.query("select count(*)::int n from engagements where status <> 'complete'"),
    db.query("select count(*)::int n from engagement_assessments where assessment_status in ('in_progress','submitted')"),
  ]);

  return {
    businesses: businesses[0].n,
    engagements: engagements[0].n,
    assessments: assessments[0].n,
    connected: true,
  };
}
