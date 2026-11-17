import type { ReactNode } from "react";
type Question={key:string;label:string;type:string;required?:boolean;prompt?:string;options?:string[];unit?:string};
export default function AssessmentQuestion({q,value,placeholder="Enter response..."}:{q:Question;value:string;placeholder?:string}){
 const options=q.options||[];
 const numericScale=options.length>0&&options.every(o=>/^[1-5]\s*[—-]/.test(o));
 const evidenceScale=options.length>0&&options.some(o=>o.startsWith("Verified"))&&options.some(o=>o.startsWith("Insufficient"));
 const choiceScale=numericScale||evidenceScale;
 const control:ReactNode=q.type==="select"?(choiceScale?
  <fieldset className={"assessment-choice-group"+(numericScale?" is-rating":" is-evidence")} aria-label={q.label}>
   {options.map((o,i)=><label className={"assessment-choice"+(value===o?" is-selected":"")} key={o}>
    <input type="radio" name={q.key} value={o} defaultChecked={value===o}/>
    <span className="assessment-choice-card">{numericScale?<><b>{i+1}</b><small>{o.replace(/^[1-5]\s*[—-]\s*/,"")}</small></>:<><b>{o.split(" — ")[0]}</b><small>{o.includes(" — ")?o.split(" — ").slice(1).join(" — "):o}</small></>}</span>
   </label>)}
   <label className={"assessment-choice assessment-choice-clear"+(!value?" is-selected":"")}><input type="radio" name={q.key} value="" defaultChecked={!value}/><span className="assessment-choice-card"><b>Not assessed</b><small>Leave unanswered</small></span></label>
  </fieldset>:
  <select name={q.key} defaultValue={value}><option value="">Select an option</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
 ):q.type==="number"?<div className="assessment-number-wrap">{q.unit?<span className={"assessment-number-unit "+(q.unit==="USD"?"is-prefix":"is-suffix")}>{q.unit==="USD"?"$":q.unit==="percent"?"%":q.unit}</span>:null}<input type="number" name={q.key} step="any" defaultValue={value} placeholder="Leave blank if unknown"/></div>
 :q.type==="date"?<input type="date" name={q.key} defaultValue={value}/>
 :q.type==="text"?<input type="text" name={q.key} defaultValue={value} placeholder={q.prompt||placeholder}/>
 :<textarea name={q.key} rows={3} defaultValue={value} placeholder={q.prompt||placeholder}/>;
 return <div className={"discovery-question"+(choiceScale?" has-choice-scale":"")} key={q.key}>
  <span>{q.label}{q.required?<em> *</em>:null}</span>{control}
  {q.unit&&q.type!=="number"?<small>Unit: {q.unit}. Include the relevant period and source.</small>:null}
  {q.prompt?<small>{q.prompt}</small>:null}
 </div>;
}
