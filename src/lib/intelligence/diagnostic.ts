export type EvidenceResponse = {
  question_key:string;
  response_value:unknown;
  evidence_status:string|null;
  populated:boolean;
  synthetic_marker_detected:boolean;
};
export type SnapshotAssessment = {
  assessment_id:string;
  instrument_number:number;
  instrument_name:string;
  status:string;
  schema_definition:any;
  responses:EvidenceResponse[];
};
const textOf=(v:unknown)=>v===null||v===undefined?"":typeof v==="string"?v:JSON.stringify(v);
const isPlaceholder=(v:unknown)=>{
  const s=textOf(v).trim().toLowerCase();
  return !s||["n/a","na","none","unknown","not known","not assessed","insufficient data","not available","tbd","to be determined"].includes(s);
};
const ratingOf=(v:unknown)=>{
  const m=textOf(v).match(/^\s*([1-5])\s*[—-]/);
  return m?Number(m[1]):null;
};
export function buildDeterministicDiagnosis(snapshot:any,sourceRunId:string){
  const assessments=(snapshot.assessments||[]) as SnapshotAssessment[];
  const all=assessments.flatMap(a=>a.responses||[]);
  const byKey=new Map(all.map(r=>[r.question_key,r]));
  const quality=snapshot.data_quality||{};
  const testMode=Boolean(quality.synthetic_data_detected)||all.some(r=>r.synthetic_marker_detected);
  const missingRequired:{instrument:number;instrument_name:string;question_key:string;label:string}[]=[];
  const placeholderAnswers:{instrument:number;instrument_name:string;question_key:string;label:string;value:string}[]=[];
  for(const a of assessments){
    for(const section of a.schema_definition?.sections||[]){
      for(const q of section.questions||[]){
        const response=byKey.get(q.key);
        if(q.required&&(!response?.populated||isPlaceholder(response?.response_value))){
          missingRequired.push({instrument:a.instrument_number,instrument_name:a.instrument_name,question_key:q.key,label:q.label||q.key});
        }else if(response?.populated&&isPlaceholder(response.response_value)){
          placeholderAnswers.push({instrument:a.instrument_number,instrument_name:a.instrument_name,question_key:q.key,label:q.label||q.key,value:textOf(response.response_value)});
        }
      }
    }
  }
  const evidenceCounts:Record<string,number>={};
  for(const r of all.filter(x=>x.populated)){
    const status=r.evidence_status||"unclassified";
    evidenceCounts[status]=(evidenceCounts[status]||0)+1;
  }
  const dimensionKeys=[
    ["financial","Financial Performance"],
    ["operations","Operational Effectiveness"],
    ["organization","Organizational Effectiveness"],
    ["commercial","Commercial Performance"],
    ["technology","Technology & Systems"],
    ["scalability","Scalability & Business Value"]
  ];
  const scorecard=assessments.find(a=>a.instrument_number===2);
  const signals:any[]=[];
  for(const [key,label] of dimensionKeys){
    const rating=byKey.get(key+"_rating");
    const confidence=byKey.get(key+"_confidence");
    const rationale=byKey.get(key+"_findings");
    const score=ratingOf(rating?.response_value);
    if(score!==null&&score<=2){
      signals.push({
        id:"scorecard-"+key,
        type:"advisor_rating_review",
        dimension:label,
        title:"Low advisor rating requires evidence review",
        observation:"The scorecard contains an advisor-entered rating of "+score+"/5. This is a review trigger, not a verified finding or causal diagnosis.",
        rating:score,
        confidence:textOf(confidence?.response_value)||"Not recorded",
        rationale_present:Boolean(rationale?.populated&&!isPlaceholder(rationale.response_value)),
        source:{instrument_number:2,question_keys:[key+"_rating",key+"_confidence",key+"_findings"]},
        priority:"Validate"
      });
    }
  }
  const gaps:any[]=[];
  if(missingRequired.length)gaps.push({id:"required-gaps",title:"Required assessment fields missing or placeholder-only",count:missingRequired.length,items:missingRequired.slice(0,30)});
  if(placeholderAnswers.length)gaps.push({id:"placeholder-answers",title:"Populated fields contain placeholder values",count:placeholderAnswers.length,items:placeholderAnswers.slice(0,30)});
  if((quality.unclassified_response_records||0)>0)gaps.push({id:"unclassified",title:"Evidence classifications missing",count:quality.unclassified_response_records});
  const rationaleGaps=signals.filter(s=>!s.rationale_present);
  if(rationaleGaps.length)gaps.push({id:"score-rationale",title:"Low scorecard ratings lack substantive written rationale",count:rationaleGaps.length,items:rationaleGaps.map(s=>({dimension:s.dimension,source:s.source}))});
  const validationQueue=[
    ...signals.map(s=>({priority:"High",task:"Validate "+s.dimension+" scorecard rating",reason:s.rationale_present?"Review the source records and advisor rationale.":"Obtain the evidence and written rationale behind the rating.",source:s.source})),
    ...(missingRequired.length?[{priority:"High",task:"Complete required assessment evidence",reason:missingRequired.length+" required fields are missing or placeholder-only.",source:{instrument_numbers:[...new Set(missingRequired.map(x=>x.instrument))]}}]:[]),
    ...(placeholderAnswers.length?[{priority:"Medium",task:"Replace placeholder answers with evidence or explicitly mark unavailable",reason:placeholderAnswers.length+" populated fields contain placeholder values.",source:{instrument_numbers:[...new Set(placeholderAnswers.map(x=>x.instrument))]}}]:[])
  ];
  return {
    engine:"BPIP Deterministic Diagnostic Engine",
    engine_version:"diagnostic-v1",
    generated_at:new Date().toISOString(),
    source_run_id:sourceRunId,
    mode:testMode?"TEST_ONLY":"ADVISOR_REVIEW_REQUIRED",
    interpretation_gate:testMode
      ?"BLOCKED FOR BUSINESS CONCLUSIONS — this snapshot contains synthetic/test content. The output below validates BPIP diagnostic mechanics only."
      :"ADVISOR REVIEW REQUIRED — signals are provisional and must be corroborated before they become findings.",
    executive_summary:{
      assessment_count:assessments.length,
      submitted_assessment_count:quality.submitted_assessment_count||0,
      populated_response_count:quality.populated_response_records||0,
      required_gaps:missingRequired.length,
      placeholder_answers:placeholderAnswers.length,
      evidence_classification_counts:evidenceCounts,
      review_signals:signals.length,
      validated_root_causes:0
    },
    review_signals:signals,
    evidence_gaps:gaps,
    cross_dimension_patterns:[],
    validation_queue:validationQueue,
    guardrails:[
      "This engine uses deterministic rules only; no language model generated or inferred conclusions.",
      "A low advisor rating is a prompt for evidence review, not proof of poor performance.",
      "Missing or placeholder values are data-quality gaps, not evidence of weak performance.",
      "No root cause, financial impact, ROI, forecast, or recommendation is established by this output.",
      testMode?"TEST MODE: synthetic/test material prevents use as actual business evidence.":"Advisor must validate every signal against its cited source records before approval."
    ]
  };
}
