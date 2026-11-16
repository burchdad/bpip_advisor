import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getEngagement } from "@/lib/engagements";

export const instant=false;
const statusLabel=(s:string)=>s.replaceAll("_"," ");
export default async function EngagementDetailPage({params}:{params:Promise<{id:string}>}){
 await connection();
 const {id}=await params;
 const data=await getEngagement(id);
 if(!data) notFound();
 const {engagement:e,assessments}=data;
 const completed=assessments.filter((a:any)=>["submitted","approved"].includes(a.assessment_status)).length;
 return <main className="shell"><Sidebar/><section><header><a href="/engagements">Engagements</a> / <b>{e.engagement_name}</b><span>● ADVISOR EDITION</span></header><div className="engagement-detail">
  <a className="back-link" href="/engagements">← All engagements</a>
  <div className="detail-heading"><div><small>{e.business_name} · {e.industry||"Industry not specified"}</small><h1>{e.engagement_name}</h1><p>{e.scope_description||"No scope description has been added yet."}</p></div><span className={"engagement-status status-"+e.status}>{statusLabel(e.status)}</span></div>
  <div className="detail-stats"><div><small>ASSESSMENT PROGRESS</small><b>{completed} / {assessments.length}</b><span>instruments completed</span></div><div><small>START DATE</small><b>{e.start_date?new Date(e.start_date).toLocaleDateString("en-US",{timeZone:"UTC"}):"Not set"}</b><span>engagement start</span></div><div><small>TARGET COMPLETION</small><b>{e.target_completion_date?new Date(e.target_completion_date).toLocaleDateString("en-US",{timeZone:"UTC"}):"Not set"}</b><span>target date</span></div></div>
  <div className="instrument-heading"><div><small>ASSESSMENT WORKFLOW</small><h2>Nine assessment instruments</h2><p>Advisor-led workflow · Findings must be supported by evidence.</p></div><b>{Math.round(assessments.length?completed/assessments.length*100:0)}%</b></div>
  <div className="instrument-list">{assessments.map((a:any)=><div className="instrument-row" key={a.id}><div className="instrument-number">{String(a.instrument_number).padStart(2,"0")}</div><div className="instrument-name"><b>{a.template_name}</b><small>{a.template_category||"Assessment"}</small></div><span className={"instrument-status instrument-"+a.assessment_status}>{statusLabel(a.assessment_status)}</span>{a.instrument_number===1?<a className="instrument-open" href={"/engagements/"+id+"/assessments/"+a.id}>Open instrument →</a>:a.instrument_number===2||a.instrument_number===3||a.instrument_number===4||a.instrument_number===5||a.instrument_number===6||a.instrument_number===7||a.instrument_number===8?<a className="instrument-open" href={"/engagements/"+id+"/assessments/"+a.id}>Open instrument →</a>:<button className="instrument-open" disabled>Coming in next phase</button>}</div>)}</div>
  <p className="workflow-note">The engagement and its nine instrument records are initialized. Interactive questionnaires, evidence capture and scoring will be enabled in the next build phase.</p>
 </div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}
