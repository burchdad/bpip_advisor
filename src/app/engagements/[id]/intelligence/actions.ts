"use server";

import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/tenant";

const valueText=(value:unknown)=>{
  if(value===null||value===undefined)return "";
  if(typeof value==="string")return value;
  return JSON.stringify(value);
};

export async function createEvidenceSnapshot(engagementId:string){
  const {db,organizationId,userId}=await getCurrentOrganization();
  const engagements=await db.query(
    "select id from engagements where id=$1 and organization_id=$2 limit 1",
    [engagementId,organizationId]
  );
  if(!engagements.length) redirect("/engagements");

  const assessments=await db.query(
    `select ea.id,ea.assessment_status,ea.started_at,ea.completed_at,
            t.instrument_number,t.template_name,tv.schema_definition
     from engagement_assessments ea
     join assessment_template_versions tv on tv.id=ea.template_version_id
     join assessment_templates t on t.id=tv.template_id
     where ea.engagement_id=$1 and ea.organization_id=$2
     order by t.instrument_number`,
    [engagementId,organizationId]
  );

  const snapshotAssessments=[];
  let totalResponses=0;
  let populatedResponses=0;
  let syntheticResponses=0;
  let unclassifiedResponses=0;

  for(const assessment of assessments as any[]){
    const responses=await db.query(
      `select question_key,response_value,response_type,evidence_status,entered_by,updated_at
       from assessment_responses
       where engagement_assessment_id=$1 and organization_id=$2
       order by question_key`,
      [assessment.id,organizationId]
    );
    const entries=(responses as any[]).map(response=>{
      const text=valueText(response.response_value);
      const populated=text.trim().length>0;
      const synthetic=/test only|synthetic|hypothetical|qa test/i.test(text);
      totalResponses++;
      if(populated)populatedResponses++;
      if(synthetic)syntheticResponses++;
      if(!response.evidence_status||response.evidence_status==="not classified")unclassifiedResponses++;
      return {
        question_key:response.question_key,
        response_value:response.response_value,
        response_type:response.response_type,
        evidence_status:response.evidence_status,
        entered_by:response.entered_by,
        updated_at:response.updated_at,
        populated,
        synthetic_marker_detected:synthetic
      };
    });
    snapshotAssessments.push({
      assessment_id:assessment.id,
      instrument_number:assessment.instrument_number,
      instrument_name:assessment.template_name,
      status:assessment.assessment_status,
      started_at:assessment.started_at,
      completed_at:assessment.completed_at,
      schema_definition:assessment.schema_definition,
      response_count:entries.length,
      populated_response_count:entries.filter(x=>x.populated).length,
      synthetic_marker_count:entries.filter(x=>x.synthetic_marker_detected).length,
      responses:entries
    });
  }

  const snapshot={
    snapshot_version:"1.0",
    captured_at:new Date().toISOString(),
    engagement_id:engagementId,
    assessments:snapshotAssessments,
    data_quality:{
      assessment_count:assessments.length,
      submitted_assessment_count:(assessments as any[]).filter(a=>["submitted","approved"].includes(a.assessment_status)).length,
      total_response_records:totalResponses,
      populated_response_records:populatedResponses,
      empty_response_records:totalResponses-populatedResponses,
      synthetic_marker_response_records:syntheticResponses,
      unclassified_response_records:unclassifiedResponses,
      synthetic_data_detected:syntheticResponses>0,
      interpretation_gate:syntheticResponses>0
        ?"BLOCKED — synthetic/test markers detected; do not treat this engagement as verified business evidence."
        :"ADVISOR REVIEW REQUIRED — source evidence has not been independently validated by this snapshot."
    }
  };

  const inserted=await db.query(
    `insert into engagement_intelligence_runs
      (organization_id,engagement_id,run_type,run_status,source_snapshot,analysis_output,
       source_assessment_count,source_response_count,prompt_version,created_by)
     values ($1,$2,'evidence_synthesis','draft',$3::jsonb,'{}'::jsonb,$4,$5,'evidence-snapshot-v1',$6)
     returning id`,
    [organizationId,engagementId,JSON.stringify(snapshot),assessments.length,totalResponses,userId]
  );
  redirect(`/engagements/${engagementId}/intelligence?run=${inserted[0].id}`);
}

import { buildDeterministicDiagnosis } from "@/lib/intelligence/diagnostic";

export async function generateDeterministicDiagnosis(engagementId:string,sourceRunId:string){
  const {db,organizationId,userId}=await getCurrentOrganization();
  const sourceRows=await db.query(
    `select id,source_snapshot,source_assessment_count,source_response_count
     from engagement_intelligence_runs
     where id=$1 and engagement_id=$2 and organization_id=$3 and run_type='evidence_synthesis'
     limit 1`,
    [sourceRunId,engagementId,organizationId]
  );
  if(!sourceRows.length)redirect("/engagements/"+engagementId+"/intelligence");
  const source=sourceRows[0] as any;
  const output=buildDeterministicDiagnosis(source.source_snapshot,sourceRunId);
  const inserted=await db.query(
    `insert into engagement_intelligence_runs
      (organization_id,engagement_id,run_type,run_status,source_snapshot,analysis_output,
       source_assessment_count,source_response_count,prompt_version,model_provider,model_id,created_by)
     values ($1,$2,'executive_diagnosis','generated',$3::jsonb,$4::jsonb,$5,$6,'diagnostic-v1','deterministic','rules-engine-v1',$7)
     returning id`,
    [organizationId,engagementId,JSON.stringify(source.source_snapshot),JSON.stringify(output),source.source_assessment_count,source.source_response_count,userId]
  );
  redirect("/engagements/"+engagementId+"/intelligence?run="+inserted[0].id);
}
