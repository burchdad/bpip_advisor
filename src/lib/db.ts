import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export async function getStats() {
 const {data:session}=await auth.getSession();
 if(!session?.user) throw new Error("Unauthorized");
 const db=neon(process.env.DATABASE_URL!);
 const orgs=await db.query("select organization_id as id from organization_memberships where user_id = $1 and membership_status = 'active' order by created_at asc limit 1",[session.user.id]);
 const organizationId=orgs[0]?.id;
 if(!organizationId) throw new Error("No active BPIP workspace");
 const [b,e,a]=await Promise.all([
  db.query("select count(*)::int n from businesses where organization_id = $1 and business_status <> 'archived'",[organizationId]),
  db.query("select count(*)::int n from engagements where organization_id = $1 and status <> 'complete'",[organizationId]),
  db.query("select count(*)::int n from engagement_assessments where organization_id = $1 and assessment_status in ('in_progress','submitted')",[organizationId])
 ]);
 return {businesses:b[0].n,engagements:e[0].n,assessments:a[0].n,connected:true};
}
