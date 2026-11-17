"use client";
import { Children, useMemo, useState, type ReactNode } from "react";

type Step={title:string;description?:string;count:number;answered:number};
export default function AssessmentWizard({sections,children,exitHref,completeLabel="Complete assessment"}:{sections:Step[];children:ReactNode;exitHref:string;completeLabel?:string}){
 const [active,setActive]=useState(0);
 const [visited,setVisited]=useState<number[]>([0]);
 const panels=Children.toArray(children);
 const total=sections.reduce((n,s)=>n+s.count,0);
 const answered=sections.reduce((n,s)=>n+s.answered,0);
 const current=sections[active];
 const progress=total?Math.round(answered/total*100):0;
 const go=(next:number)=>{const safe=Math.max(0,Math.min(sections.length-1,next));setActive(safe);setVisited(v=>v.includes(safe)?v:[...v,safe]);};
 const completion=useMemo(()=>sections.map(s=>s.count?Math.round(s.answered/s.count*100):0),[sections]);
 return <div className="assessment-wizard">
  <div className="wizard-overview">
   <div className="wizard-overview-top"><div><span className="wizard-kicker">ASSESSMENT PROGRESS</span><strong>{answered}<small> / {total} answered</small></strong></div><div className="wizard-percent">{progress}%</div></div>
   <div className="wizard-progress-track"><i style={{width:progress+"%"}}/></div>
   <div className="wizard-progress-caption"><span>{sections.length} guided sections</span><span>{sections.length-active-1} remaining</span></div>
  </div>
  <div className="wizard-layout">
   <aside className="wizard-rail" aria-label="Assessment sections">
    <div className="wizard-rail-title">SECTIONS <span>{String(active+1).padStart(2,"0")} / {String(sections.length).padStart(2,"0")}</span></div>
    <nav>{sections.map((s,i)=><button type="button" key={s.title} onClick={()=>go(i)} className={"wizard-step"+(active===i?" is-active":"")+(completion[i]===100?" is-complete":"")}>
      <span className="wizard-step-number">{completion[i]===100?"✓":String(i+1).padStart(2,"0")}</span><span className="wizard-step-copy"><b>{s.title}</b><small>{s.answered} of {s.count} answered</small></span><span className="wizard-step-meter"><i style={{width:completion[i]+"%"}}/></span>
    </button>)}</nav>
    <div className="wizard-rail-note"><span>✦</span><p>Your entries are retained as you move between sections. Save a draft whenever you need.</p></div>
   </aside>
   <section className="wizard-workspace">
    <div className="wizard-section-heading"><div><span>SECTION {String(active+1).padStart(2,"0")}</span><h2>{current?.title}</h2><p>{current?.description||"Complete the questions in this section before moving on."}</p></div><div className="wizard-section-count">{current?.answered}/{current?.count}<small>answered</small></div></div>
    <div className="wizard-panel">{panels[active]}</div>
   </section>
  </div>
  <div className="wizard-actionbar">
   <a href={exitHref} className="wizard-exit">Exit assessment</a>
   <div className="wizard-action-right"><button type="submit" name="intent" value="draft" className="wizard-save">Save progress</button>
    <button type="button" className="wizard-previous" onClick={()=>go(active-1)} disabled={active===0}>← Previous</button>
    {active<sections.length-1?<button type="button" className="wizard-next" onClick={()=>go(active+1)}>Next section <span>→</span></button>:<button type="submit" name="intent" value="submit" className="wizard-complete">{completeLabel} <span>✓</span></button>}
   </div>
  </div>
 </div>;
}
