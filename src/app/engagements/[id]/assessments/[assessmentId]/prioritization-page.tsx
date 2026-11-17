import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import AssessmentWizard from "@/components/assessment-wizard";
import AssessmentQuestion from "@/components/assessment-question";
import { getCurrentOrganization } from "@/lib/tenant";
import { saveOpportunityPrioritization } from "./prioritization-actions";
export const instant=false;
type Question={key:string;label:string;type:string;required?:boolean;prompt?:string;options?:string[]};
type Section={id:string;title:string;description?:string;questions:Question[]};
const valueText=(v:unknown)=>typeof v==="string"?v:String(v??"");
const rating=(v:string)=>{const m=v.match(/^([1-5])/);return m?Number(m[1]):null;};
const weights:{[k:string]:number}={impact:.25,evidence:.15,effort:.15,time:.10,risk:.10,fit:.15,readiness:.10};
function score(a:Record<string,string>,n:number){const p="op"+n+"_";const raw={impact:rating(a[p+"impact"]||""),evidence:rating(a[p+"evidence"]||""),effort:rating(a[p+"effort"]||""),time:rating(a[p+"time"]||""),risk:rating(a[p+"risk"]||""),fit:rating(a[p+"fit"]||""),readiness:rating(a[p+"readiness"]||"")};const vals=Object.entries(raw).filter(([,v])=>v!==null) as [string,number][];if(vals.length!==7)return null;const total=vals.reduce((s,[k,v])=>s+weights[k]*(["effort","time","risk"].includes(k)?6-v:v),0);return Math.round(total/5*100); }
function money(v:string,currency:string){if(!v||!Number.isFinite(Number(v)))return "—";return new Intl.NumberFormat("en-US",{style:"currency",currency:/^[A-Z]{3}$/.test(currency)?currency:"USD",maximumFractionDigits:0}).format(Number(v));}
export default async function OpportunityPrioritizationPage({params,searchParams}:{params:Promise<{id:string;assessmentId:string}>;searchParams:Promise<{saved?:string;error?:string;missing?:string}>}) {
 await connection();const {id,assessmentId}=await params;const query=await searchParams;const {db,organizationId}=await getCurrentOrganization();
 const rows=await db.query("select ea.id,e.engagement_name,b.business_name,tv.schema_definition from engagement_assessments ea join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id join businesses b on b.id=e.business_id and b.organization_id=e.organization_id join assessment_template_versions tv on tv.id=ea.template_version_id join assessment_templates t on t.id=tv.template_id where ea.id=$1 and e.id=$2 and ea.organization_id=$3 and t.instrument_number=7 limit 1",[assessmentId,id,organizationId]);
 if(!rows.length)notFound();const item=rows[0];const schema=item.schema_definition as {description?:string;sections?:Section[]};
 const responseRows=await db.query("select question_key,response_value from assessment_responses where engagement_assessment_id=$1 and organization_id=$2",[assessmentId,organizationId]);
 const answers:Record<string,string>=Object.fromEntries(responseRows.map((r:any)=>[r.question_key,valueText(r.response_value)]));
 const sections=schema.sections||[];const answered=sections.reduce((n,s)=>n+s.questions.filter(q=>answers[q.key]?.trim()).length,0);const total=sections.reduce((n,s)=>n+s.questions.length,0);
 const currency=(answers.pri_currency||"USD").toUpperCase();
 const ranked=Array.from({length:5},(_,i)=>{const n=i+1;const p="op"+n+"_";return {n,name:answers[p+"name"]||"",score:score(answers,n),base:answers[p+"base"]||"",cost:answers[p+"recurring_cost"]||"",one:answers[p+"one_time_cost"]||"",basis:answers[p+"benefit_basis"]||"",conservative:answers[p+"conservative"]||"",upside:answers[p+"upside"]||"",realization:answers[p+"realization"]||""};}).filter(x=>x.name.trim()).sort((a,b)=>(b.score??-1)-(a.score??-1));
 return <main className="shell"><Sidebar/><section><header><a href={"/engagements/"+id}>Engagements</a> / <b>Opportunity Prioritization & Scenario Model</b><span>● ADVISOR EDITION</span></header>
 <div className="assessment-page"><a className="back-link" href={"/engagements/"+id}>← Back to engagement</a>
 <div className="assessment-title"><small>{item.business_name} · {item.engagement_name}</small><h1>Opportunity Prioritization & Scenario Model</h1><p>{schema.description}</p></div>
 {query.saved?<div className="assessment-notice">Your prioritization model has been saved. Scores and scenarios below reflect saved inputs.</div>:null}
 {query.error==="required"?<div className="assessment-error"><b>Complete the required fields before submitting.</b><p>{query.missing||"Required information is missing."} Other entries have been saved.</p></div>:null}
 <div className="assessment-progress"><div><b>{answered} of {total}</b><span> fields populated</span></div><div className="progress-track"><i style={{width:(total?answered/total*100:0)+"%"}}/></div></div>
 <div className="assessment-guidance"><b>Transparent priority scoring</b><p>Each opportunity is scored only when all seven ratings are supplied. The 0–100 score weights impact 25%, evidence confidence 15%, effort 15%, time-to-value 10%, implementation risk 10%, strategic fit 15% and readiness 10%. Effort, time and risk are reverse-scored, so lower difficulty/risk produces a higher score. Scores are advisor decision aids—not forecasts. Unknown ratings are not treated as zero.</p><p>Scenario values are optional annual gross benefit assumptions in the currency selected below. Keep each opportunity on one benefit basis. Subtract recurring annual cost to show indicative annual net benefit; one-time cost is separate. Do not add together different benefit bases or overlapping opportunities.</p></div>
 {ranked.length>0?<div className="assessment-guidance"><b>Saved opportunity ranking</b><div className="opportunity-ranking">{ranked.map(x=><div className="opportunity-rank-row" key={x.n}><div><b>{x.name}</b><small>Opportunity {x.n} · {x.basis||"Benefit basis not set"}</small></div><strong>{x.score===null?"Not fully scored":x.score+"/100"}</strong><span>Base net annual: {x.base&&x.cost?money(String(Number(x.base)-Number(x.cost)),currency):"Not modeled"}</span>{x.one&&x.base&&x.cost&&Number(x.base)>Number(x.cost)?<small>Indicative base payback: {(Number(x.one)/(Number(x.base)-Number(x.cost))*12).toFixed(1)} months after benefits begin</small>:null}</div>)}</div></div>:null}
 <form action={saveOpportunityPrioritization} className="discovery-form"><input type="hidden" name="engagement_id" value={id}/><input type="hidden" name="assessment_id" value={assessmentId}/>
 <AssessmentWizard sections={sections.map(s=>({title:s.title,description:s.description,count:s.questions.length,keys:s.questions.map(q=>q.key),answeredKeys:s.questions.filter(q=>String(answers[q.key]??"").trim().length>0).map(q=>q.key),answered:s.questions.filter(q=>String(answers[q.key]??"").trim().length>0).length}))} exitHref={"/engagements/"+id} completeLabel="Complete assessment">{sections.map(section=><section className={"discovery-section "+(section.id.startsWith("opportunity_")?"opportunity-editor":"")} key={section.id}><div className="discovery-section-heading"><h2>{section.title}</h2><p>{section.description}</p></div>
 {section.questions.map(q=><AssessmentQuestion key={q.key} q={q} value={answers[q.key]||""} placeholder="Enter response..."/>)} </section>)}</AssessmentWizard>
 </form></div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}
