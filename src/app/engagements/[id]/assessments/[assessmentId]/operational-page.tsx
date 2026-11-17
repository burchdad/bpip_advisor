import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import AssessmentWizard from "@/components/assessment-wizard";
import { getCurrentOrganization } from "@/lib/tenant";
import { saveOperationalAssessment } from "./operational-actions";
export const instant=false;
type Question={key:string;label:string;type:string;required?:boolean;prompt?:string;options?:string[];unit?:string};
type Section={id:string;title:string;description?:string;questions:Question[]};
const valueText=(v:unknown)=>typeof v==="string"?v:String(v??"");
export default async function OperationalAssessmentPage({params,searchParams}:{params:Promise<{id:string;assessmentId:string}>;searchParams:Promise<{saved?:string;error?:string;missing?:string}>}) {
 await connection(); const {id,assessmentId}=await params; const query=await searchParams;
 const {db,organizationId}=await getCurrentOrganization();
 const rows=await db.query(`select ea.id,ea.assessment_status,e.engagement_name,b.business_name,tv.schema_definition
 from engagement_assessments ea join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id
 join businesses b on b.id=e.business_id and b.organization_id=e.organization_id
 join assessment_template_versions tv on tv.id=ea.template_version_id
 join assessment_templates t on t.id=tv.template_id
 where ea.id=$1 and e.id=$2 and ea.organization_id=$3 and t.instrument_number=4 limit 1`,[assessmentId,id,organizationId]);
 if(!rows.length) notFound(); const item=rows[0]; const schema=item.schema_definition as {description?:string;sections?:Section[]};
 const responseRows=await db.query("select question_key,response_value from assessment_responses where engagement_assessment_id=$1 and organization_id=$2",[assessmentId,organizationId]);
 const answers=Object.fromEntries(responseRows.map((r:any)=>[r.question_key,valueText(r.response_value)]));
 const sections=schema.sections||[]; const answered=sections.reduce((n,s)=>n+s.questions.filter(q=>answers[q.key]?.trim()).length,0);
 const total=sections.reduce((n,s)=>n+s.questions.length,0);
 return <main className="shell"><Sidebar/><section><header><a href={"/engagements/"+id}>Engagements</a> / <b>Operational & Organizational Effectiveness</b><span>● ADVISOR EDITION</span></header>
 <div className="assessment-page"><a className="back-link" href={"/engagements/"+id}>← Back to engagement</a>
 <div className="assessment-title"><small>{item.business_name} · {item.engagement_name}</small><h1>Operational & Organizational Effectiveness Assessment</h1><p>{schema.description}</p></div>
 {query.saved?<div className="assessment-notice">Your operational assessment progress has been saved.</div>:null}
 {query.error==="required"?<div className="assessment-error"><b>Complete the required fields before submitting.</b><p>{query.missing||"Required information is missing."} Other entries have been saved.</p></div>:null}
 <div className="assessment-progress"><div><b>{answered} of {total}</b><span> fields populated</span></div><div className="progress-track"><i style={{width:(total?answered/total*100:0)+"%"}}/></div></div>
 <div className="assessment-guidance"><b>Assessment principles</b><p>Evaluate how work actually flows, not just how procedures are intended to work. Distinguish direct observation and records from owner or employee statements and advisor hypotheses. Use defined units and periods for metrics. Missing KPIs do not automatically mean poor performance. Consider service quality, employee workload, safety, compliance, key-person dependency and the organization's capacity to absorb change.</p></div>
 <form action={saveOperationalAssessment} className="discovery-form"><input type="hidden" name="engagement_id" value={id}/><input type="hidden" name="assessment_id" value={assessmentId}/>
 <AssessmentWizard sections={sections.map(s=>({title:s.title,description:s.description,count:s.questions.length,keys:s.questions.map(q=>q.key),answeredKeys:s.questions.filter(q=>String(answers[q.key]??"").trim().length>0).map(q=>q.key),answered:s.questions.filter(q=>String(answers[q.key]??"").trim().length>0).length}))} exitHref={"/engagements/"+id} completeLabel="Complete assessment">{sections.map(section=><section className="discovery-section" key={section.id}><div className="discovery-section-heading"><h2>{section.title}</h2><p>{section.description}</p></div>
 {section.questions.map(q=><label className="discovery-question" key={q.key}><span>{q.label}{q.required?<em> *</em>:null}</span>
 {q.type==="select"?<select name={q.key} defaultValue={answers[q.key]||""}><option value="">Select an option</option>{(q.options||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>:q.type==="number"?<input type="number" name={q.key} step="any" min="0" defaultValue={answers[q.key]||""} placeholder="Leave blank if unknown"/>:q.type==="date"?<input type="date" name={q.key} defaultValue={answers[q.key]||""}/>:q.type==="text"?<input type="text" name={q.key} defaultValue={answers[q.key]||""} placeholder={q.prompt||"Enter response..."}/>:<textarea name={q.key} rows={3} defaultValue={answers[q.key]||""} placeholder={q.prompt||"Enter advisor assessment..."}/>}
 {q.unit?<small>Unit: {q.unit}. Leave blank if unknown; document the period and source.</small>:null}{q.prompt?<small>{q.prompt}</small>:null}</label>)}
 </section>)}</AssessmentWizard>
 
 </form></div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}