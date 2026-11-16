"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/tenant";

async function loadContext(engagementId:string,assessmentId:string) {
 const {db,organizationId,userId}=await getCurrentOrganization();
 const rows=await db.query(
  `select ea.id,ea.assessment_status,tv.schema_definition,e.id as engagement_id
   from engagement_assessments ea
   join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id
   join assessment_template_versions tv on tv.id=ea.template_version_id
   join assessment_templates t on t.id=tv.template_id
   where ea.id=$1 and e.id=$2 and ea.organization_id=$3 and t.instrument_number=1 limit 1`,
  [assessmentId,engagementId,organizationId]
 );
 if(!rows.length) throw new Error("Assessment not found in this engagement.");
 return {db,organizationId,userId,row:rows[0]};
}

export async function saveOwnerDiscovery(formData:FormData) {
 const engagementId=String(formData.get("engagement_id")||"");
 const assessmentId=String(formData.get("assessment_id")||"");
 const intent=String(formData.get("intent")||"draft");
 const {db,organizationId,userId,row}=await loadContext(engagementId,assessmentId);
 const schema=row.schema_definition as {sections?:{questions?:{key:string;type:string}[]}[]};
 const allowed=(schema.sections||[]).flatMap(s=>s.questions||[]);
 if(intent==="submit") {
  const missing=allowed.filter((q:any)=>q.required && !String(formData.get(q.key)||"").trim());
  if(missing.length) throw new Error("Complete the required fields before marking this questionnaire complete: "+missing.map((q:any)=>q.label).join(", "));
 }
 for(const q of allowed) {
  const raw=formData.get(q.key);
  if(raw===null) continue;
  const value=String(raw).trim();
  await db.query(
   `insert into assessment_responses(organization_id,engagement_assessment_id,question_key,response_value,response_type,evidence_status,entered_by,updated_at)
    values($1,$2,$3,$4::jsonb,$5,'owner_reported',$6,now())
    on conflict(engagement_assessment_id,question_key)
    do update set response_value=excluded.response_value,response_type=excluded.response_type,evidence_status=excluded.evidence_status,entered_by=excluded.entered_by,updated_at=now()`,
   [organizationId,assessmentId,q.key,JSON.stringify(value),q.type,userId]
  );
 }
 if(intent==="submit") {
  await db.query("update engagement_assessments set assessment_status='submitted',completed_at=now(),updated_at=now() where id=$1 and organization_id=$2",[assessmentId,organizationId]);
  await db.query("insert into engagement_activity(organization_id,engagement_id,user_id,activity_type,description,metadata) values($1,$2,$3,'assessment_submitted',$4,$5::jsonb)",[organizationId,engagementId,userId,"Owner Discovery Questionnaire marked complete.",JSON.stringify({assessment_id:assessmentId})]);
 } else {
  await db.query("update engagement_assessments set assessment_status='in_progress',started_at=COALESCE(started_at,now()),completed_at=null,updated_at=now() where id=$1 and organization_id=$2",[assessmentId,organizationId]);
  await db.query("insert into engagement_activity(organization_id,engagement_id,user_id,activity_type,description,metadata) values($1,$2,$3,'assessment_saved',$4,$5::jsonb)",[organizationId,engagementId,userId,"Owner Discovery Questionnaire progress saved.",JSON.stringify({assessment_id:assessmentId})]);
 }
 revalidatePath("/engagements/"+engagementId);
 revalidatePath("/engagements/"+engagementId+"/assessments/"+assessmentId);
 redirect("/engagements/"+engagementId+"/assessments/"+assessmentId+"?saved="+(intent==="submit"?"submitted":"draft"));
}
