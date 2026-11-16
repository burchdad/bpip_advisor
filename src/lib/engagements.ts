import { getCurrentOrganization } from "@/lib/tenant";

export async function getEngagements() {
 const {db,organizationId}=await getCurrentOrganization();
 return db.query(
  `select e.id,e.engagement_name,e.engagement_type,e.status,e.start_date,e.target_completion_date,e.created_at,
          b.id as business_id,b.business_name,
          count(ea.id)::int as total_assessments,
          count(ea.id) filter (where ea.assessment_status in ('submitted','approved'))::int as completed_assessments
   from engagements e
   join businesses b on b.id=e.business_id and b.organization_id=e.organization_id
   left join engagement_assessments ea on ea.engagement_id=e.id and ea.organization_id=e.organization_id
   where e.organization_id=$1
   group by e.id,b.id,b.business_name
   order by e.created_at desc`,
  [organizationId]
 );
}

export async function getEngagement(id:string) {
 const {db,organizationId}=await getCurrentOrganization();
 const rows=await db.query(
  `select e.*,b.business_name,b.industry,b.headquarters_location
   from engagements e join businesses b on b.id=e.business_id and b.organization_id=e.organization_id
   where e.id=$1 and e.organization_id=$2 limit 1`,
  [id,organizationId]
 );
 if(!rows.length) return null;
 const assessments=await db.query(
  `select ea.id,ea.assessment_status,ea.started_at,ea.completed_at,
          t.template_name,t.instrument_number,t.template_category
   from engagement_assessments ea
   join assessment_template_versions tv on tv.id=ea.template_version_id
   join assessment_templates t on t.id=tv.template_id
   where ea.engagement_id=$1 and ea.organization_id=$2
   order by t.instrument_number`,
  [id,organizationId]
 );
 return {engagement:rows[0],assessments};
}

export async function getBusinessesForEngagement() {
 const {db,organizationId}=await getCurrentOrganization();
 return db.query("select id,business_name from businesses where organization_id=$1 and business_status='active' order by business_name",[organizationId]);
}
