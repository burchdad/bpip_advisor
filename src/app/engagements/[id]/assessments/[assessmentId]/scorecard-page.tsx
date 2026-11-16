import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getCurrentOrganization } from "@/lib/tenant";
import { saveBusinessScorecard } from "./actions";

export const instant=false;
type Question={key:string;label:string;type:string;required?:boolean;prompt?:string;options?:string[]};
type Section={id:string;title:string;description?:string;dimension?:string;questions:Question[]};
const answerText=(v:unknown)=>typeof v==="string"?v:String(v??"");
export default async function BusinessScorecardPage({params,searchParams}:{params:Promise<{id:string;assessmentId:string}>;searchParams:Promise<{saved?:string;error?:string;missing?:string}>}) {
 await connection();
 const {id,assessmentId}=await params;
 const query=await searchParams;
 const {db,organizationId}=await getCurrentOrganization();
 const rows=await db.query(
  `select ea.id,ea.assessment_status,e.engagement_name,e.business_id,b.business_name,tv.schema_definition
   from engagement_assessments ea join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id
   join businesses b on b.id=e.business_id and b.organization_id=e.organization_id
   join assessment_template_versions tv on tv.id=ea.template_version_id
   join assessment_templates t on t.id=tv.template_id
   where ea.id=$1 and e.id=$2 and ea.organization_id=$3 and t.instrument_number=2 limit 1`,
  [assessmentId,id,organizationId]
 );
 if(!rows.length) notFound();
 const item=rows[0];
 const schema=item.schema_definition as {description?:string;sections?:Section[]};
 const responseRows=await db.query("select question_key,response_value from assessment_responses where engagement_assessment_id=$1 and organization_id=$2",[assessmentId,organizationId]);
 const answers=Object.fromEntries(responseRows.map((r:any)=>[r.question_key,answerText(r.response_value)]));
 const discovery=await db.query(
  `select ar.question_key,ar.response_value,ar.evidence_status
   from engagement_assessments ea join assessment_template_versions tv on tv.id=ea.template_version_id
   join assessment_templates t on t.id=tv.template_id
   join assessment_responses ar on ar.engagement_assessment_id=ea.id and ar.organization_id=ea.organization_id
   where ea.engagement_id=$1 and ea.organization_id=$2 and t.instrument_number=1
   order by ar.updated_at desc`,
  [id,organizationId]
 );
 const discoveryMap=Object.fromEntries(discovery.map((r:any)=>[r.question_key,{value:answerText(r.response_value),status:r.evidence_status}]));
 const contextKeys=[["business_overview","Business overview"],["success_definition","Owner's definition of success"],["priority_objectives","Current priorities"],["revenue_range","Owner-reported annual revenue"],["profitability_view","Owner's profitability view"],["cash_flow_view","Owner's cash-flow view"],["operating_constraints","Owner-identified operating constraints"],["perceived_opportunities","Owner-perceived opportunities"],["key_risks","Owner-identified risks"]];
 const sections=schema.sections||[];
 const total=sections.length;
 const ratings=sections.map(s=>Number(String(answers[s.id+"_rating"]||"").match(/^[1-5]/)?.[0])).filter(n=>Number.isFinite(n));
 const average=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:null;
 return <main className="shell"><Sidebar/><section><header><a href={"/engagements/"+id}>Engagements</a> / <b>Business Performance Scorecard</b><span>● ADVISOR EDITION</span></header>
 <div className="assessment-page">
  <a className="back-link" href={"/engagements/"+id}>← Back to engagement</a>
  <div className="assessment-title"><small>{item.business_name} · {item.engagement_name}</small><h1>Business Performance Scorecard</h1><p>{schema.description}</p></div>
  {query.saved?<div className="assessment-notice">Your scorecard progress has been saved.</div>:null}{query.error==="required"?<div className="assessment-error"><b>Complete the required advisor assessment fields.</b><p>{query.missing||"One or more required fields are missing."} Your other entries have been saved.</p></div>:null}
  <div className="assessment-progress"><div><b>{ratings.length} of 6</b><span> dimensions rated · {average===null?"No composite yet":"provisional average "+average.toFixed(1)+" / 5"}</span></div><div className="progress-track"><i style={{width:(ratings.length/6*100)+"%"}}/></div></div>
  <div className="assessment-guidance"><b>Scoring rules</b><p>Rate each dimension from 1–5 based on the current assessment. Record evidence confidence separately. An unrated dimension means insufficient assessment—not poor performance. The provisional average is an unweighted diagnostic indicator, not a valuation, audit opinion or verified financial result.</p></div>
  <section className="discovery-section"><div className="discovery-section-heading"><h2>Owner Discovery context</h2><p>These are the owner's previously captured statements, shown to inform your assessment. They are not independently verified.</p></div>
   <div className="scorecard-context">{contextKeys.map(([key,label])=>discoveryMap[key]?.value?<div key={key}><b>{label}</b><p>{discoveryMap[key].value}</p><small>Owner-reported · not independently verified</small></div>:null)}</div>
  </section>
  <form action={saveBusinessScorecard} className="discovery-form">
   <input type="hidden" name="engagement_id" value={id}/><input type="hidden" name="assessment_id" value={assessmentId}/>
   {sections.map(section=><section className="discovery-section" key={section.id}><div className="discovery-section-heading"><h2>{section.title}</h2><p>{section.description}</p></div>
    {section.questions.map(q=><label className="discovery-question" key={q.key}><span>{q.label}{q.required?<em> *</em>:null}</span>{q.type==="select"?<select name={q.key} defaultValue={answers[q.key]||""}><option value="">Select an assessment</option>{(q.options||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>:<textarea name={q.key} rows={3} defaultValue={answers[q.key]||""} placeholder={q.prompt||"Enter advisor assessment..."}/>}{q.prompt?<small>{q.prompt}</small>:null}</label>)}
   </section>)}
   <div className="discovery-actions"><a href={"/engagements/"+id}>Exit scorecard</a><button type="submit" name="intent" value="draft" className="secondary-action">Save progress</button><button type="submit" name="intent" value="submit">Complete scorecard</button></div>
  </form>
 </div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}