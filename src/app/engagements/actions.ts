"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/tenant";

export async function createEngagement(formData:FormData) {
 const businessId=String(formData.get("business_id")||"").trim();
 const name=String(formData.get("engagement_name")||"").trim();
 const scope=String(formData.get("scope_description")||"").trim();
 const start=String(formData.get("start_date")||"").trim()||null;
 const target=String(formData.get("target_completion_date")||"").trim()||null;
 const type=String(formData.get("engagement_type")||"business_performance_assessment").trim();
 if(!businessId||!name) throw new Error("Choose a business and enter an engagement name.");
 const {db,organizationId,userId}=await getCurrentOrganization();
 const business=await db.query("select id from businesses where id=$1 and organization_id=$2 and business_status='active' limit 1",[businessId,organizationId]);
 if(!business.length) throw new Error("The selected business is not available in this workspace.");
 const inserted=await db.query(
  "insert into engagements(organization_id,business_id,engagement_name,engagement_type,scope_description,start_date,target_completion_date,status,lead_advisor_id) values($1,$2,$3,$4,$5,$6,$7,'setup',$8) returning id",
  [organizationId,businessId,name,type,scope||null,start,target,userId]
 );
 const engagementId=inserted[0].id;
 await db.query(
  `insert into engagement_assessments(organization_id,engagement_id,template_version_id,assessment_status,assigned_advisor_id)
   select $1,$2,tv.id,'not_started',$3
   from assessment_templates t
   join assessment_template_versions tv on tv.template_id=t.id and tv.version_number=t.current_version
   where t.active=true
   order by t.instrument_number`,
  [organizationId,engagementId,userId]
 );
 await db.query("insert into engagement_members(organization_id,engagement_id,user_id,engagement_role) values($1,$2,$3,'lead_advisor') on conflict(engagement_id,user_id) do nothing",[organizationId,engagementId,userId]);
 await db.query("insert into engagement_activity(organization_id,engagement_id,user_id,activity_type,description,metadata) values($1,$2,$3,'engagement_created',$4,$5::jsonb)",[organizationId,engagementId,userId,"Engagement created and nine assessment instruments initialized.",JSON.stringify({assessment_count:9})]);
 revalidatePath("/engagements");
 redirect("/engagements/"+engagementId);
}
