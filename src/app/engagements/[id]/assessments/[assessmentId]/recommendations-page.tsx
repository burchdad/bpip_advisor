import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import AssessmentWizard from "@/components/assessment-wizard";
import { getCurrentOrganization } from "@/lib/tenant";
import { saveStrategicRoadmap } from "./recommendations-actions";
export const instant=false;
type Question={key:string;label:string;type:string;required?:boolean;prompt?:string;options?:string[]};
type Section={id:string;title:string;description?:string;questions:Question[]};
const valueText=(v:unknown)=>typeof v==="string"?v:String(v??"");
const rating=(v:string)=>{const m=v.match(/^([1-5])/);return m?Number(m[1]):null;};
const weights:{[k:string]:number}={impact:.25,evidence:.15,effort:.15,time:.10,risk:.10,fit:.15,readiness:.10};
function priority(a:Record<string,string>,n:number){const p="op"+n+"_";const raw={impact:rating(a[p+"impact"]||""),evidence:rating(a[p+"evidence"]||""),effort:rating(a[p+"effort"]||""),time:rating(a[p+"time"]||""),risk:rating(a[p+"risk"]||""),fit:rating(a[p+"fit"]||""),readiness:rating(a[p+"readiness"]||"")};const vals=Object.entries(raw).filter(([,v])=>v!==null) as [string,number][];if(vals.length!==7)return null;return Math.round(vals.reduce((s,[k,v])=>s+weights[k]*(["effort","time","risk"].includes(k)?6-v:v),0)/5*100);}
export default async function StrategicRecommendationsPage({params,searchParams}:{params:Promise<{id:string;assessmentId:string}>;searchParams:Promise<{saved?:string;error?:string;missing?:string}>}){
 await connection();const {id,assessmentId}=await params;const query=await searchParams;const {db,organizationId}=await getCurrentOrganization();
 const rows=await db.query("select ea.id,e.engagement_name,b.business_name,tv.schema_definition from engagement_assessments ea join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id join businesses b on b.id=e.business_id and b.organization_id=e.organization_id join assessment_template_versions tv on tv.id=ea.template_version_id join assessment_templates t on t.id=tv.template_id where ea.id=$1 and e.id=$2 and ea.organization_id=$3 and t.instrument_number=8 limit 1",[assessmentId,id,organizationId]);
 if(!rows.length)notFound();const item=rows[0];const schema=item.schema_definition as {description?:string;sections?:Section[]};
 const responseRows=await db.query("select question_key,response_value from assessment_responses where engagement_assessment_id=$1 and organization_id=$2",[assessmentId,organizationId]);
 const answers:Record<string,string>=Object.fromEntries(responseRows.map((r:any)=>[r.question_key,valueText(r.response_value)]));
 const sourceRows=await db.query("select ea.id from engagement_assessments ea join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id join assessment_template_versions tv on tv.id=ea.template_version_id join assessment_templates t on t.id=tv.template_id where e.id=$1 and ea.organization_id=$2 and t.instrument_number=7 limit 1",[id,organizationId]);
 let source:Record<string,string>={};
 if(sourceRows.length){const sr=await db.query("select question_key,response_value from assessment_responses where engagement_assessment_id=$1 and organization_id=$2",[sourceRows[0].id,organizationId]);source=Object.fromEntries(sr.map((r:any)=>[r.question_key,valueText(r.response_value)]));}
 const opportunities=Array.from({length:5},(_,i)=>{const n=i+1,p="op"+n+"_";return {n,name:source[p+"name"]||"",score:priority(source,n)};}).filter(x=>x.name).sort((a,b)=>(b.score??-1)-(a.score??-1));
 const sections=schema.sections||[];const answered=sections.reduce((n,s)=>n+s.questions.filter(q=>answers[q.key]?.trim()).length,0);const total=sections.reduce((n,s)=>n+s.questions.length,0);
 return <main className="shell"><Sidebar/><section><header><a href={"/engagements/"+id}>Engagements</a> / <b>Strategic Recommendations & 90-Day Roadmap</b><span>● ADVISOR EDITION</span></header><div className="assessment-page">
 <a className="back-link" href={"/engagements/"+id}>← Back to engagement</a><div className="assessment-title"><small>{item.business_name} · {item.engagement_name}</small><h1>Strategic Recommendations & 90-Day Roadmap</h1><p>{schema.description}</p></div>
 {query.saved?<div className="assessment-notice">Your strategic recommendations and roadmap have been saved.</div>:null}
 {query.error==="required"?<div className="assessment-error"><b>Complete the required fields before submitting.</b><p>{query.missing||"Required information is missing."} Other entries have been saved.</p></div>:null}
 <div className="assessment-progress"><div><b>{answered} of {total}</b><span> fields populated</span></div><div className="progress-track"><i style={{width:(total?answered/total*100:0)+"%"}}/></div></div>
 {opportunities.length?<div className="assessment-guidance"><b>Prioritized opportunities from Instrument 7</b><p>Use these as inputs—not automatic recommendations. Confirm the diagnosis, feasibility, owner alignment, dependencies and capacity before committing to an initiative.</p>{opportunities.map(o=><div key={o.n}><b>{o.name}</b> · {o.score===null?"Not fully scored":o.score+"/100"}</div>)}</div>:<div className="assessment-guidance"><b>Upstream dependency</b><p>Instrument 7 has not yet supplied saved opportunity names. You can continue drafting recommendations, but complete the prioritization model before finalizing the sequence.</p></div>}
 <div className="assessment-guidance"><b>Recommendation and roadmap standards</b><p>Every recommendation should trace to a diagnosed cause and evidence. Separate expected outcomes from approved targets and realized benefits. Assign accountable owners, resources, decision gates and measures. Management owns execution; the advisor recommends and monitors; the business owner retains decision authority. Consider customer and employee impact and implementation capacity.</p></div>
 <form action={saveStrategicRoadmap} className="discovery-form"><input type="hidden" name="engagement_id" value={id}/><input type="hidden" name="assessment_id" value={assessmentId}/>
 <AssessmentWizard sections={sections.map(s=>({title:s.title,description:s.description,count:s.questions.length,answered:s.questions.filter(q=>String(answers[q.key]??"").trim().length>0).length}))} exitHref={"/engagements/"+id} completeLabel="Complete assessment">{sections.map(section=><section className="discovery-section" key={section.id}><div className="discovery-section-heading"><h2>{section.title}</h2><p>{section.description}</p></div>{section.questions.map(q=><label className="discovery-question" key={q.key}><span>{q.label}{q.required?<em> *</em>:null}</span>
 {q.type==="select"?<select name={q.key} defaultValue={answers[q.key]||""}><option value="">Select an option</option>{(q.options||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>:q.type==="text"?<input type="text" name={q.key} defaultValue={answers[q.key]||""} placeholder={q.prompt||"Enter response..."}/>:<textarea name={q.key} rows={3} defaultValue={answers[q.key]||""} placeholder={q.prompt||"Enter recommendation or plan..."}/>}
 </label>)}</section>)}</AssessmentWizard>
 </form></div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}
