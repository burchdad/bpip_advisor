import { getCurrentOrganization } from "@/lib/tenant";
export async function getStats() {
 const {db,organizationId}=await getCurrentOrganization();
 const [b,e,a]=await Promise.all([
  db.query("select count(*)::int n from businesses where organization_id=$1 and business_status<>'archived'",[organizationId]),
  db.query("select count(*)::int n from engagements where organization_id=$1 and status<>'complete'",[organizationId]),
  db.query("select count(*)::int n from engagement_assessments where organization_id=$1 and assessment_status in ('in_progress','submitted')",[organizationId])
 ]);
 return {businesses:b[0].n,engagements:e[0].n,assessments:a[0].n,connected:true};
}