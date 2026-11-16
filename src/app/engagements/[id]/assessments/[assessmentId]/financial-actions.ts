"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/tenant";
async function loadContext(engagementId:string,assessmentId:string) {
 const {db,organizationId,userId}=await getCurrentOrganization();
 const rows=await db.query(`select ea.id,tv.schema_definition from engagement_assessments ea
 join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id
 join assessment_template_versions tv on tv.id=ea.template_version_id
 join assessment_templates t on t.id=tv.template_id
 where ea.id=$1 and e.id=$2 and ea.organization_id=$3 and t.instrument_number=3 limit 1`,[assessmentId,engagementId,organizationId]);
 if(!rows.length) throw new Error("Financial analysis not found in this engagement.");
 return {db,organizationId,userId,row:rows[0]};
}
export async function saveFinancialAnalysis(formData:FormData) {
 const engagementId=String(formData.get("engagement_id")||""); const assessmentId=String(formData.get("assessment_id")||""); const intent=String(formData.get("intent")||"draft");
 const {db,organizationId,userId,row}=await loadContext(engagementId,assessmentId);
 const schema=row.schema_definition as {sections?:{questions?:{key:string;type:string;required?:boolean;label:string}[]}[]};
 const allowed=(schema.sections||[]).flatMap(s=>s.questions||[]);
 for(const q of allowed) {
  const raw=formData.get(q.key); if(raw===null) continue; const value=String(raw).trim(); if(!value) continue;
  if(q.type==="number" && (!Number.isFinite(Number(value)) || Number(value)<0)) continue;
  await db.query(`insert into assessment_responses(organization_id,engagement_assessment_id,question_key,response_value,response_type,evidence_status,entered_by,updated_at)
  values($1,$2,$3,$4::jsonb,$5,'advisor_assessed',$6,now())
  on conflict(engagement_assessment_id,question_key) do update set response_value=excluded.response_value,response_type=excluded.response_type,evidence_status=excluded.evidence_status,entered_by=excluded.entered_by,updated_at=now()`,
  [organizationId,assessmentId,q.key,JSON.stringify(value),q.type,userId]);
 }
 if(intent==="submit") {
  const missing=allowed.filter(q=>q.required&&!String(formData.get(q.key)||"").trim());
  if(missing.length) {
   await db.query("update engagement_assessments set assessment_status='in_progress',started_at=COALESCE(started_at,now()),completed_at=null,updated_at=now() where id=$1 and organization_id=$2",[assessmentId,organizationId]);
   redirect("/engagements/"+engagementId+"/assessments/"+assessmentId+"?error=required&missing="+encodeURIComponent(missing.map(q=>q.label).join(" · ")));
  }
  await db.query("update engagement_assessments set assessment_status='submitted',completed_at=now(),updated_at=now() where id=$1 and organization_id=$2",[assessmentId,organizationId]);
  await db.query("insert into engagement_activity(organization_id,engagement_id,user_id,activity_type,description,metadata) values($1,$2,$3,'assessment_submitted',$4,$5::jsonb)",[organizationId,engagementId,userId,"Financial Performance & Opportunity Analysis completed.",JSON.stringify({assessment_id:assessmentId})]);
 } else {
  await db.query("update engagement_assessments set assessment_status='in_progress',started_at=COALESCE(started_at,now()),completed_at=null,updated_at=now() where id=$1 and organization_id=$2",[assessmentId,organizationId]);
  await db.query("insert into engagement_activity(organization_id,engagement_id,user_id,activity_type,description,metadata) values($1,$2,$3,'assessment_saved',$4,$5::jsonb)",[organizationId,engagementId,userId,"Financial analysis progress saved.",JSON.stringify({assessment_id:assessmentId})]);
 }
 revalidatePath("/engagements/"+engagementId); revalidatePath("/engagements/"+engagementId+"/assessments/"+assessmentId);
 redirect("/engagements/"+engagementId+"/assessments/"+assessmentId+"?saved=draft");
}