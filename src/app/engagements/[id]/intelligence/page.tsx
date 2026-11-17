import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getCurrentOrganization } from "@/lib/tenant";
import { createEvidenceSnapshot, generateDeterministicDiagnosis, saveAdvisorSignalReview, saveAdvisorPatternReview, generateExecutiveSynthesis, approveExecutiveSynthesis } from "./actions";

export const instant=false;
export const maxDuration=60;

const fmt=(value:unknown)=>value?new Date(value as string).toLocaleString("en-US"):"—";

export default async function EngagementIntelligencePage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{run?:string;synthesis?:string;approval?:string}>}){
  await connection();
  const {id}=await params;
  const {run:activeRunId,synthesis:synthesisNotice,approval:approvalNotice}=await searchParams;
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
            source_assessment_count,source_response_count,prompt_version,model_provider,model_id,generation_error,created_at
     from engagement_intelligence_runs
     where engagement_id=$1 and organization_id=$2
     order by created_at desc limit 20`,
    [id,organizationId]
  );
  const active=(runs as any[]).find(r=>r.id===activeRunId)||(runs as any[])[0];
  const snapshot=active?.source_snapshot||{};
  const quality=snapshot.data_quality||{};
  const diagnosticOutput=active?.run_type==="executive_diagnosis"?active.analysis_output||{}:{};
  const reviewSignals=diagnosticOutput.review_signals||[];
  const reviewPatterns=diagnosticOutput.cross_dimension_patterns||[];
  const signalReviews=diagnosticOutput.advisor_review?.signals||[];
  const patternReviews=diagnosticOutput.advisor_review?.patterns||[];
  const synthesisReady=reviewSignals.every((s:any)=>signalReviews.some((r:any)=>r.signal_id===s.id))&&reviewPatterns.every((p:any)=>patternReviews.some((r:any)=>r.pattern_id===p.id));
  return <main className="shell"><Sidebar/><section><header><a href="/engagements">Engagements</a> / <a href={"/engagements/"+id}>{engagement.engagement_name}</a> / <b>Advisor intelligence</b><span>● ADVISOR EDITION</span></header>
    <div className="engagement-detail intelligence-page">
      <a className="back-link" href={"/engagements/"+id}>← Back to engagement</a>
      <div className="detail-heading"><div><small>{engagement.business_name} · ADVISOR WORKSPACE</small><h1>Advisor intelligence</h1><p>Build a traceable evidence snapshot before producing an executive diagnosis or recommendations.</p></div><span className="engagement-status status-in_progress">Evidence stage</span></div>
      <div className="intelligence-callout"><b>Analysis integrity gate</b><p>BPIP preserves original assessment responses. This workspace creates a separate, versioned source snapshot. It does not convert owner statements or hypotheses into verified facts, and it does not approve recommendations.</p></div>
      {approvalNotice?<div className="intelligence-gate"><b>{approvalNotice==="approved"?"Executive synthesis approved":approvalNotice==="required"?"Advisor sign-off required":approvalNotice==="integrity"?"Approval blocked by evidence validation":approvalNotice==="locked"?"Approval unavailable":"Approval status"}</b><p>{approvalNotice==="approved"?"The approved version is locked and available in the engagement report.":approvalNotice==="required"?"Confirm the review checklist and provide a meaningful sign-off note of at least 20 characters.":approvalNotice==="integrity"?"The system could not verify every claim against the source snapshot. The synthesis remains unapproved.":approvalNotice==="locked"?"Only a generated, unapproved synthesis can be approved. Approved versions cannot be overwritten.":"Review the approval status below."}</p></div>:null}\n      {synthesisNotice?<div className="intelligence-gate"><b>{synthesisNotice==="blocked"?"AI synthesis blocked":synthesisNotice==="review"?"Advisor review incomplete":synthesisNotice==="consent"?"Client authorization required":synthesisNotice==="unconfigured"?"AI service not configured":synthesisNotice==="failed"?"AI synthesis failed":synthesisNotice==="noevidence"?"No eligible evidence":"AI synthesis status"}</b><p>{synthesisNotice==="blocked"?"This engagement contains synthetic or test material. It cannot be sent for executive synthesis.":synthesisNotice==="review"?"Review every diagnostic signal and cross-dimensional pattern before generating a synthesis.":synthesisNotice==="consent"?"Confirm client authorization before sending assessment responses to the AI service.":synthesisNotice==="unconfigured"?"The production AI Gateway identity was not available. No client data was sent.":synthesisNotice==="failed"?"The AI request did not complete. Review the failed run record and gateway configuration before retrying.":synthesisNotice==="noevidence"?"No populated source evidence was eligible for synthesis.":"Review the synthesis status below."}</p></div>:null}
      <form action={createEvidenceSnapshot.bind(null,id)}><button className="primary-button" type="submit">Build new evidence snapshot</button></form>
      {active?.run_type==="evidence_synthesis"?<form action={generateDeterministicDiagnosis.bind(null,id,active.id)} className="intelligence-action-form"><button className="primary-button" type="submit">Generate deterministic diagnostic preview</button><small>Rule-based analysis · no AI-generated conclusions · creates a separate versioned run</small></form>:null}
      {active?.run_type==="executive_report"?<section className="intelligence-panel executive-synthesis-panel">
        <div className="intelligence-panel-head"><div><small>AI-ASSISTED · CITATION-VALIDATED · DRAFT</small><h2>Executive synthesis</h2></div><span className="instrument-status instrument-submitted">{active.run_status}</span></div>
        <div className="intelligence-gate"><b>Advisor approval required</b><p>AI drafted this narrative from the saved evidence and advisor-reviewed diagnostic. It is not an independently verified finding, approved recommendation, or final client report.</p></div>
        <p className="intelligence-meta">Generated {fmt(active.created_at)} · Provider: {active.model_provider||"—"} · Model: {active.model_id||active.analysis_output?.model||"—"} · Prompt: {active.prompt_version||"—"}</p>
        {active.run_status==="failed"?<p className="intelligence-meta">Generation error: {active.generation_error||"No additional error detail was recorded."}</p>:null}
        {active.analysis_output?.executive_summary?<article className="executive-summary-card"><small>EXECUTIVE SUMMARY</small><p>{active.analysis_output.executive_summary.text}</p><div className="synthesis-citations">{active.analysis_output.executive_summary.sources?.map((s:any)=><span key={s.instrument_number+":"+s.question_key}>I{s.instrument_number} · {s.label} · {s.evidence_status}</span>)}</div></article>:null}
        {(["key_observations","cross_dimensional_synthesis","strategic_implications","priority_questions"] as const).map((key)=>{const titles:any={key_observations:"Key observations",cross_dimensional_synthesis:"Cross-dimensional synthesis",strategic_implications:"Strategic implications",priority_questions:"Priority questions"};const items=active.analysis_output?.[key]||[];return <section className="synthesis-section" key={key}><h3>{titles[key]}</h3>{items.length?items.map((item:any,i:number)=><article className="diagnostic-item" key={i}><b>{item.title||item.question}</b><p>{item.statement||item.question}</p>{item.why_it_matters?<p><b>Why it matters:</b> {item.why_it_matters}</p>:null}{item.validation_needed?<p><b>Validation needed:</b> {item.validation_needed}</p>:null}{item.conditions_or_assumptions?<p><b>Conditions / assumptions:</b> {item.conditions_or_assumptions}</p>:null}{item.confidence?<small>Model-assessed confidence: {item.confidence} · not a substitute for evidence quality</small>:null}<div className="synthesis-citations">{(item.sources||[]).map((s:any)=><span key={s.instrument_number+":"+s.question_key}>I{s.instrument_number} · {s.label} · {s.evidence_status}</span>)}</div></article>):<p className="intelligence-meta">No evidence-supported items were produced for this section.</p>}</section>})}
        <h3>Limitations and open evidence issues</h3><ul>{(active.analysis_output?.limitations||[]).map((item:string,i:number)=><li key={i}>{item}</li>)}</ul>
        <div className="intelligence-callout"><b>Citation validation</b><p>{active.analysis_output?.citation_validation?.available_source_count||0} source records were available. Displayed claims must cite existing source question keys. Unsupported or unverified claims are excluded.</p></div>
        {active.run_status==="generated"?<form action={approveExecutiveSynthesis.bind(null,id,active.id)} className="intelligence-action-form advisor-approval-form"><h3>Advisor review & final approval</h3><p>Approval locks this synthesis as the approved advisor version. The system rechecks every displayed claim citation against the captured evidence snapshot. This does not mean that source statements have been independently audited or that management has accepted implementation recommendations.</p><label className="ai-consent-label"><input type="checkbox" name="advisor_signoff" value="yes" required/> I have reviewed the synthesis, source citations, evidence classifications, limitations, and assumptions, and approve this version for inclusion in the engagement report.</label><label>Advisor sign-off note<textarea name="approval_note" rows={3} minLength={20} required placeholder="Document the scope of your review, any qualifications, and why this version is approved." /></label><button className="primary-button" type="submit">Approve executive synthesis</button></form>:active.run_status==="approved"?<div className="advisor-review-saved"><b>Approved advisor version · locked</b><p>{active.analysis_output?.advisor_approval?.signoff_note}</p><small>Approved {fmt(active.analysis_output?.advisor_approval?.approved_at||active.approved_at)} · Advisor: {active.approved_by||active.analysis_output?.advisor_approval?.approved_by||"Recorded"}</small><p><a href={"/engagements/"+id+"/report"}>Open engagement report →</a></p></div>:null}
        <p><a href={"/engagements/"+id+"/intelligence?run="+(active.analysis_output?.source_diagnosis_run_id||"")}>Return to advisor diagnostic review →</a></p>
      </section>:null}
      {active?.run_type==="executive_diagnosis"?<section className="intelligence-panel diagnostic-panel">
        <div className="intelligence-panel-head"><div><small>DETERMINISTIC DIAGNOSTIC · {active.analysis_output?.engine_version||"versioned"}</small><h2>Diagnostic preview</h2></div><span className="instrument-status instrument-submitted">{active.run_status}</span></div>
        <div className="intelligence-gate"><b>{active.analysis_output?.mode==="TEST_ONLY"?"TEST MODE — NOT BUSINESS FINDINGS":"Advisor review required"}</b><p>{active.analysis_output?.interpretation_gate}</p></div>
        <div className="detail-stats">
          <div><small>REVIEW SIGNALS</small><b>{active.analysis_output?.executive_summary?.review_signals??0}</b><span>not confirmed findings</span></div>
          <div><small>REQUIRED GAPS</small><b>{active.analysis_output?.executive_summary?.required_gaps??0}</b><span>missing / placeholder</span></div>
          <div><small>ROOT CAUSES</small><b>0</b><span>none established</span></div>
        </div>
        <p className="intelligence-meta">Generated {fmt(active.created_at)} · Engine: {active.analysis_output?.engine||"Deterministic rules"}</p>
        <h3>Review signals</h3>
        {(active.analysis_output?.review_signals||[]).length?(active.analysis_output.review_signals||[]).map((s:any)=>{
          const review=(active.analysis_output?.advisor_review?.signals||[]).find((r:any)=>r.signal_id===s.id);
          return <article className="diagnostic-item" key={s.id}><div className="evidence-register-heading"><b>{s.title}</b><span>{review?review.disposition.replaceAll("_"," "):s.priority}</span></div><small>{s.dimension}</small><p>{s.observation}</p><p><b>Rating:</b> {s.rating}/5 · <b>Evidence confidence:</b> {s.confidence}</p><p><b>Rationale recorded:</b> {s.rationale_present?"Yes":"No"}</p><small>Source: Instrument {s.source?.instrument_number} · {s.source?.question_keys?.join(", ")}</small>
            {review?<div className="advisor-review-saved"><b>Advisor review recorded</b><p>{review.note}</p><small>Reviewed {fmt(review.reviewed_at)}</small></div>:active.analysis_output?.mode==="TEST_ONLY"?<p className="intelligence-meta">Advisor disposition is disabled for synthetic test data.</p>:<form action={saveAdvisorSignalReview.bind(null,id,active.id,s.id)} className="advisor-review-form"><label>Advisor disposition<select name="disposition" required defaultValue="needs_validation"><option value="needs_validation">Needs further validation</option><option value="supported_for_further_review">Supported for further review</option><option value="not_supported">Not supported by available evidence</option></select></label><label>Review note<textarea name="note" required rows={2} placeholder="Document what was reviewed, what evidence is still needed, or why this signal is not supported." /></label><button className="secondary-button" type="submit">Save advisor review</button></form>}
          </article>;
        }):<p>No deterministic review signals were triggered by the current rules.</p>}
        <h3>Cross-dimensional patterns</h3>
        <p className="intelligence-meta">Candidate relationships detected across assessment dimensions. These are not causal findings; validate the cited evidence before using them in an executive conclusion.</p>
        {(active.analysis_output?.cross_dimension_patterns||[]).length?(active.analysis_output.cross_dimension_patterns||[]).map((pattern:any)=><article className="diagnostic-item cross-pattern-card" key={pattern.id}>
          <div className="evidence-register-heading"><b>{pattern.title}</b><span>{pattern.status==="TEST_ONLY"?"TEST ONLY":pattern.confidence+" confidence"}</span></div>
          <small>{(pattern.dimension_links||[]).join(" · ")}</small>
          <p>{pattern.observation}</p>
          <p><b>Interpretation:</b> {pattern.interpretation}</p>
          <p><b>Decision relevance:</b> {pattern.decision_relevance}</p>
          <div className="cross-pattern-evidence"><b>Source evidence</b>{(pattern.evidence_sources||[]).map((source:any)=><div key={source.question_key}><small>Instrument {source.instrument_number} · {source.label} · {source.evidence_status}</small><p>{source.value}</p></div>)}</div>
          {(pattern.missing_dependencies||[]).length?<div className="cross-pattern-missing"><b>Missing dependencies</b><ul>{pattern.missing_dependencies.map((missing:any,i:number)=><li key={i}>{missing.question_key}: {missing.reason}</li>)}</ul></div>:null}
          <div className="cross-pattern-validation"><b>Advisor validation task</b><p>{pattern.validation_task}</p></div>
          {(()=>{const review=(active.analysis_output?.advisor_review?.patterns||[]).find((r:any)=>r.pattern_id===pattern.id);return review?<div className="advisor-review-saved"><b>Advisor pattern review recorded · {review.disposition.replaceAll("_"," ")}</b><p>{review.note}</p><small>Reviewed {fmt(review.reviewed_at)}</small></div>:active.analysis_output?.mode==="TEST_ONLY"?<p className="intelligence-meta">Advisor disposition is disabled for synthetic test data.</p>:<form action={saveAdvisorPatternReview.bind(null,id,active.id,pattern.id)} className="advisor-review-form"><label>Advisor disposition<select name="disposition" required defaultValue="needs_validation"><option value="needs_validation">Needs further validation</option><option value="supported_for_further_review">Supported for further review</option><option value="not_supported">Not supported by available evidence</option></select></label><label>Review note<textarea name="note" required rows={2} placeholder="Record what evidence supports or weakens this relationship, and what should be tested next." /></label><button className="secondary-button" type="submit">Save pattern review</button></form>})()}
        </article>):<p>No cross-dimensional patterns met the current evidence rules. This is not evidence that no relationships exist; required measures may be unavailable.</p>}
        <h3>Evidence gaps</h3>
        {(active.analysis_output?.evidence_gaps||[]).length?(active.analysis_output.evidence_gaps||[]).map((g:any)=><article className="diagnostic-item" key={g.id}><b>{g.title}</b><p>{g.count} item(s) require attention.</p>{g.items?.slice(0,8).map((item:any,i:number)=><small key={i}>• {item.instrument_name||item.dimension||"Evidence"} — {item.label||item.task||item.question_key||"Review required"}</small>)}</article>):<p>No missing-required or placeholder-only fields were identified by this pass.</p>}
        <h3>Validation queue</h3>
        {(active.analysis_output?.validation_queue||[]).map((item:any,i:number)=><article className="diagnostic-item" key={i}><b>{item.priority} · {item.task}</b><p>{item.reason}</p></article>)}
        {active.analysis_output?.mode==="TEST_ONLY"?<p className="intelligence-meta">AI synthesis is disabled for synthetic/test data. This engagement is suitable only for testing BPIP mechanics.</p>:synthesisReady?<form action={generateExecutiveSynthesis.bind(null,id,active.id)} className="intelligence-action-form ai-synthesis-consent"><h3>Generate AI-assisted executive synthesis</h3><p>Creates a draft narrative from the saved assessment evidence, deterministic diagnostic, and advisor review notes. The AI service receives the populated assessment responses and reviewed diagnostic context. Do not proceed unless the client has authorized this processing.</p><label className="ai-consent-label"><input type="checkbox" name="client_ai_authorized" value="yes" required/> I confirm the client has authorized sending this engagement's assessment data to the AI service for this draft synthesis.</label><button className="primary-button" type="submit">Generate executive synthesis</button><small>Uses Vercel AI Gateway · GPT-5.4 Mini · source citations are validated before display · advisor approval remains required</small></form>:<p className="intelligence-meta">Complete advisor review of every diagnostic signal and cross-dimensional pattern before generating the executive synthesis.</p>}
        <h3>Guardrails</h3><ul>{(active.analysis_output?.guardrails||[]).map((g:string,i:number)=><li key={i}>{g}</li>)}</ul>
        <p><a href={"/engagements/"+id+"/intelligence?run="+(active.analysis_output?.source_run_id||"")}>Open source evidence snapshot →</a></p>
      </section>:null}
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
