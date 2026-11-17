import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getCurrentOrganization } from "@/lib/tenant";
import { createEvidenceSnapshot } from "./actions";

export const instant=false;

const fmt=(value:unknown)=>value?new Date(value as string).toLocaleString("en-US"):"—";

export default async function EngagementIntelligencePage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{run?:string}>}){
  await connection();
  const {id}=await params;
  const {run:activeRunId}=await searchParams;
  const {db,organizationId}=await getCurrentOrganization();
  const engagementRows=await db.query(
    `select e.id,e.engagement_name,b.business_name
     from engagements e join businesses b on b.id=e.business_id and b.organization_id=e.organization_id
     where e.id=$1 and e.organization_id=$2 limit 1`,
    [id,organizationId]
  );
  if(!engagementRows.length)notFound();
  const engagement=engagementRows[0];
  const runs=await db.query(
    `select id,run_type,run_status,source_snapshot,analysis_output,
            source_assessment_count,source_response_count,prompt_version,created_at
     from engagement_intelligence_runs
     where engagement_id=$1 and organization_id=$2
     order by created_at desc limit 20`,
    [id,organizationId]
  );
  const active=(runs as any[]).find(r=>r.id===activeRunId)||(runs as any[])[0];
  const snapshot=active?.source_snapshot||{};
  const quality=snapshot.data_quality||{};
  return <main className="shell"><Sidebar/><section><header><a href="/engagements">Engagements</a> / <a href={"/engagements/"+id}>{engagement.engagement_name}</a> / <b>Advisor intelligence</b><span>● ADVISOR EDITION</span></header>
    <div className="engagement-detail intelligence-page">
      <a className="back-link" href={"/engagements/"+id}>← Back to engagement</a>
      <div className="detail-heading"><div><small>{engagement.business_name} · ADVISOR WORKSPACE</small><h1>Advisor intelligence</h1><p>Build a traceable evidence snapshot before producing an executive diagnosis or recommendations.</p></div><span className="engagement-status status-in_progress">Evidence stage</span></div>
      <div className="intelligence-callout"><b>Analysis integrity gate</b><p>BPIP preserves original assessment responses. This workspace creates a separate, versioned source snapshot. It does not convert owner statements or hypotheses into verified facts, and it does not approve recommendations.</p></div>
      <form action={createEvidenceSnapshot.bind(null,id)}><button className="primary-button" type="submit">Build new evidence snapshot</button></form>
      {active?<>
        <section className="intelligence-panel"><div className="intelligence-panel-head"><div><small>LATEST SOURCE SNAPSHOT</small><h2>{active.run_type.replaceAll("_"," ")}</h2></div><span className="instrument-status instrument-submitted">{active.run_status}</span></div>
          <div className="detail-stats"><div><small>INSTRUMENTS</small><b>{quality.assessment_count??active.source_assessment_count}</b><span>captured</span></div><div><small>RESPONSE RECORDS</small><b>{active.source_response_count}</b><span>including blank fields</span></div><div><small>POPULATED FIELDS</small><b>{quality.populated_response_records??"—"}</b><span>non-empty values</span></div></div>
          <div className="intelligence-gate "><b>{quality.synthetic_data_detected?"Synthetic data detected":"Evidence review required"}</b><p>{quality.interpretation_gate||"Advisor review is required before conclusions are generated."}</p></div>
          <p className="intelligence-meta">Snapshot created {fmt(active.created_at)} · Prompt version: {active.prompt_version||"Not set"}</p>
        </section>
        <section className="intelligence-panel"><div className="intelligence-panel-head"><div><small>INSTRUMENT COVERAGE</small><h2>Captured source material</h2></div></div>
          {(snapshot.assessments||[]).map((a:any)=><div className="intelligence-source-row" key={a.assessment_id}><div><b>{String(a.instrument_number).padStart(2,"0")} · {a.instrument_name}</b><small>{a.status.replaceAll("_"," ")} · {a.populated_response_count} populated / {a.response_count} records</small></div>{a.synthetic_marker_count>0?<span className="instrument-status status-in_progress">{a.synthetic_marker_count} test markers</span>:<span className="instrument-status instrument-submitted">Captured</span>}</div>)}
        </section>
        <details className="intelligence-json intelligence-register"><summary>Browse response-level evidence register ({quality.populated_response_records??0} populated fields)</summary>
          {(snapshot.assessments||[]).map((a:any)=><section key={a.assessment_id} className="evidence-register-instrument">
            <h3>{String(a.instrument_number).padStart(2,"0")} · {a.instrument_name}</h3>
            {(a.responses||[]).filter((r:any)=>r.populated).map((r:any)=>{
              const sections=a.schema_definition?.sections||[];
              const section=sections.find((s:any)=>(s.questions||[]).some((q:any)=>q.key===r.question_key));
              const question=section?.questions?.find((q:any)=>q.key===r.question_key);
              const raw=typeof r.response_value==="string"?r.response_value:JSON.stringify(r.response_value);
              return <article className="evidence-register-row" key={r.question_key}>
                <div className="evidence-register-heading"><b>{question?.label||r.question_key}</b><span>{r.question_key}</span></div>
                {section?<small className="evidence-register-section">{section.title}</small>:null}
                <p>{raw}</p>
                <div className="evidence-register-meta"><span>Evidence: {r.evidence_status||"Unclassified"}</span><span>{r.synthetic_marker_detected?"TEST / SYNTHETIC MARKER DETECTED":"No test marker detected"}</span></div>
              </article>;
            })}
          </section>)}
        </details>
        <details className="intelligence-json"><summary>Inspect source snapshot JSON</summary><pre>{JSON.stringify(snapshot,null,2)}</pre></details>
      </>:<div className="intelligence-empty"><h2>No evidence snapshot yet</h2><p>Create the first snapshot to preserve a versioned copy of the nine assessment instruments and their evidence classifications.</p></div>}
      {runs.length>1?<section className="intelligence-panel"><h2>Previous snapshots</h2>{(runs as any[]).slice(1).map(r=><p key={r.id}><a href={"/engagements/"+id+"/intelligence?run="+r.id}>{fmt(r.created_at)} · {r.run_type.replaceAll("_"," ")} · {r.run_status}</a></p>)}</section>:null}
    </div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}
