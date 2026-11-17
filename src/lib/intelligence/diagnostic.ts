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

type PatternSource = { instrument_number:number; question_key:string; label:string; value:string; evidence_status:string; synthetic_marker_detected:boolean };
function buildCrossDimensionPatterns(assessments:SnapshotAssessment[], byKey:Map<string,EvidenceResponse>, testMode:boolean){
  const meta=new Map<string,{instrument_number:number;label:string}>();
  for(const a of assessments) for(const section of a.schema_definition?.sections||[]) for(const q of section.questions||[]) meta.set(q.key,{instrument_number:a.instrument_number,label:q.label||q.key});
  const read=(key:string)=>byKey.get(key);
  const usable=(key:string)=>{const r=read(key);return Boolean(r?.populated&&!isPlaceholder(r.response_value));};
  const value=(key:string)=>textOf(read(key)?.response_value).trim();
  const number=(key:string)=>{if(!usable(key))return null;const n=Number(value(key).replace(/[%,$\s]/g,""));return Number.isFinite(n)?n:null;};
  const source=(keys:string[]):PatternSource[]=>keys.filter(usable).map(key=>{const r=read(key)!;const m=meta.get(key);return {instrument_number:m?.instrument_number||0,question_key:key,label:m?.label||key,value:value(key),evidence_status:r.evidence_status||"unclassified",synthetic_marker_detected:r.synthetic_marker_detected};});
  const confidence=(items:PatternSource[])=>{
    const statuses=items.map(x=>(x.evidence_status||"").toLowerCase());
    if(items.length>=3&&statuses.every(s=>s.includes("verified")))return "High";
    if(items.length>=3&&statuses.every(s=>s.includes("verified")||s.includes("partially")))return "Moderate";
    return "Limited";
  };
  const patterns:any[]=[];
  const add=(id:string,title:string,dimension_links:string[],keys:string[],why:string,missing:string[],task:string,impact:string)=>{
    const sources=source(keys);
    if(sources.length<2||new Set(sources.map(s=>s.instrument_number)).size<2)return;
    patterns.push({id,title,pattern_type:"cross_dimension_candidate",dimension_links,observation:why,interpretation:"This is a relationship worth testing, not proof of causation or a confirmed performance problem.",confidence:confidence(sources),evidence_sources:sources,missing_dependencies:missing,validation_task:task,decision_relevance:impact,status:testMode||sources.some(s=>s.synthetic_marker_detected)?"TEST_ONLY":"ADVISOR_VALIDATION_REQUIRED",source_instruments:[...new Set(sources.map(s=>s.instrument_number))]});
  };
  const weakCadence=/informal|inconsistent|reactive|no regular/i.test(value("ops_kpi_cadence"));
  const weakKpi=/definitions vary|limited reliable|incomplete|delayed/i.test(value("ops_kpi_quality"));
  const weakAttribution=/anecdotal|manual|weak|not yet assessed/i.test(value("com_attribution"));
  const weakFinancial=/owner-reported|insufficient data/i.test(value("financial_data_quality"));
  const visibilityKeys=["ops_kpi_cadence","ops_kpi_quality","com_attribution","financial_data_quality"];
  const visibilityCount=[weakCadence,weakKpi,weakAttribution,weakFinancial].filter(Boolean).length;
  if(visibilityCount>=2){
    const present=visibilityKeys.filter((k,i)=>[weakCadence,weakKpi,weakAttribution,weakFinancial][i]&&usable(k));
    const missing=visibilityKeys.filter(k=>!usable(k)).map(k=>({question_key:k,reason:"Not captured; cannot assess this part of the measurement system."}));
    add("management-performance-visibility","Management reporting and commercial attribution may limit performance visibility",["Operational Effectiveness","Commercial Performance","Financial Performance"],present,"Multiple assessment selections point to gaps in KPI cadence, metric reliability, channel attribution, or financial data quality. This may make it harder to connect activity to business outcomes.",missing,"Confirm KPI definitions, owners, review cadence, CRM/marketing attribution, and financial reconciliation; trace one commercial metric from source activity through recognized revenue.","Decision-makers may be operating with incomplete or inconsistent performance signals.");
  }
  const weakRoles=/ambiguity|overlap|owner-dependent|informal/i.test(value("org_role_clarity"));
  const weakDocs=/individual knowledge|partially documented|no meaningful/i.test(value("ops_process_documentation"));
  const keyPerson=usable("org_key_person_risk");
  if((weakRoles&&usable("ops_process_documentation"))||(weakDocs&&keyPerson)){
    const keys=["org_role_clarity","ops_process_documentation","org_key_person_risk","ops_kpi_cadence"];
    add("organizational-execution-dependency","Role clarity and process standardization may be reinforcing execution dependency",["Organizational Effectiveness","Operational Effectiveness"],keys,"The available selections or narrative indicate possible overlap between role clarity, documented processes, key-person dependency, and management cadence. Validate whether these conditions affect execution or continuity.",keys.filter(k=>!usable(k)).map(k=>({question_key:k,reason:"Additional evidence needed to test the organizational dependency."})),"Map decision rights and process ownership for one critical workflow; compare documented procedure with actual practice and test continuity when the primary owner is unavailable.","Could affect repeatability, delegation, continuity, and the ability to scale.");
  }
  const utilization=number("ops_capacity_utilization");
  const reliability=number("ops_schedule_reliability");
  const rework=number("ops_rework_rate");
  if(utilization!==null&&utilization>=85&&((reliability!==null&&reliability<90)||(rework!==null&&rework>5))){
    const keys=["ops_capacity_utilization","ops_schedule_reliability","ops_rework_rate","ops_bottlenecks","financial_payroll_pct"];
    add("capacity-quality-margin-pressure","High utilization may be interacting with delivery reliability or rework",["Operational Effectiveness","Financial Performance"],keys,"Measured utilization is high and at least one service reliability or rework measure is outside the configured review threshold. This may indicate a capacity-quality trade-off; confirm periods, definitions, and operational context.",keys.filter(k=>!usable(k)).map(k=>({question_key:k,reason:"Needed to establish the full capacity, quality, and cost relationship."})),"Validate the utilization denominator and period; segment output, overtime, on-time delivery, and rework by team/process; quantify incremental labor and rework costs before estimating impact.","Could affect throughput, service quality, labor cost, and capacity to accept additional demand.");
  }
  const topCustomer=number("financial_top_customer_pct");
  const topFive=number("financial_top_five_pct");
  const recurring=number("financial_recurring_revenue_pct")??number("com_recurring_share");
  const concentration=topCustomer!==null?topCustomer:topFive;
  if(concentration!==null&&concentration>=25&&recurring!==null&&recurring<40){
    const keys=["financial_top_customer_pct","financial_top_five_pct","financial_recurring_revenue_pct","com_recurring_share","com_retention_churn"];
    add("revenue-concentration-durability","Customer concentration and low recurring revenue may compound revenue volatility",["Financial Performance","Commercial Performance"],keys,"A concentration measure is elevated while the recurring-revenue share is relatively low. This combination may increase dependence on a small number of transactions or customers; validate cohort, contract, and period definitions.",keys.filter(k=>!usable(k)).map(k=>({question_key:k,reason:"Needed to test customer-level concentration, renewal behavior, and revenue durability."})),"Reconcile customer-level revenue for the same period; calculate top-one/top-five shares, recurring revenue, renewal rates, and gross margin by customer; stress-test the loss of the largest account.","Could affect revenue predictability, cash planning, and enterprise resilience.");
  }
  return patterns;
}

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
  const crossDimensionPatterns=buildCrossDimensionPatterns(assessments,byKey,testMode);\n  const gaps:any[]=[];
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
    cross_dimension_patterns:crossDimensionPatterns,
    validation_queue:validationQueue,
    guardrails:[
      "This engine uses deterministic rules only; no language model generated or inferred conclusions.",
      "A low advisor rating is a prompt for evidence review, not proof of poor performance.",
      "Missing or placeholder values are data-quality gaps, not evidence of weak performance.",
      "Cross-dimensional patterns are candidate relationships for advisor validation, not causal findings.",\n      "No root cause, financial impact, ROI, forecast, or recommendation is established by this output.",
      testMode?"TEST MODE: synthetic/test material prevents use as actual business evidence.":"Advisor must validate every signal against its cited source records before approval."
    ]
  };
}
