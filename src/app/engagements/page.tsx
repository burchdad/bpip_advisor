import { connection } from "next/server";
import { Sidebar } from "@/components/sidebar";
import CreateEngagementForm from "@/components/create-engagement-form";
import { getBusinessesForEngagement,getEngagements } from "@/lib/engagements";

export const instant=false;
export default async function EngagementsPage(){
 await connection();
 const [rows,businesses]=await Promise.all([getEngagements(),getBusinessesForEngagement()]);
 return <main className="shell"><Sidebar/><section><header>Workspace / <b>Engagements</b><span>● ADVISOR EDITION</span></header><div className="engagement-page">
  <div className="business-title"><div><small>CLIENT WORK MANAGEMENT</small><h1>Engagements</h1><p>Manage assessment, advisory and performance-improvement work.</p></div><strong>{rows.length}<small> engagements</small></strong></div>
  <CreateEngagementForm businesses={businesses as {id:string;business_name:string}[]}/>
  {rows.length?<div className="engagement-list">{rows.map((e:any)=><a className="engagement-card" href={"/engagements/"+e.id} key={e.id}>
   <div className="engagement-main"><small>{e.business_name}</small><b>{e.engagement_name}</b><span>{e.engagement_type.replaceAll("_"," ")}</span></div>
   <div className="engagement-progress"><div><b>{e.completed_assessments}/{e.total_assessments}</b><small> instruments complete</small></div><div className="progress-track"><i style={{width:(e.total_assessments?e.completed_assessments/e.total_assessments*100:0)+"%"}}/></div></div>
   <span className={"engagement-status status-"+e.status}>{e.status.replaceAll("_"," ")}</span><span className="engagement-arrow">→</span>
  </a>)}</div>:<div className="business-empty"><b>No engagements yet.</b><p>Create an engagement for a business to begin the nine-instrument assessment process.</p></div>}
 </div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}
