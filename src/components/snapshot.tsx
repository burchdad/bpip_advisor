import Link from "next/link";
type Stats={businesses:number;engagements:number;assessments:number;connected:boolean};
export default function Snapshot({stats:s}:{stats:Stats}){
 const metrics=[
  {label:"Businesses",value:s.businesses,detail:"In your portfolio",icon:"▦"},
  {label:"Engagements",value:s.engagements,detail:"Across your portfolio",icon:"▤"},
  {label:"Assessments in progress",value:s.assessments,detail:"Currently underway",icon:"◎"},
  {label:"Assessment framework",value:"09",detail:"Connected instruments",icon:"✳"},
 ];
 const dimensions=["Financial performance","Operational effectiveness","Organizational effectiveness","Commercial performance","Technology & systems","Scalability & business value"];
 return <div className="workspace-snapshot">
  <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Workspace snapshot</h2></div><span className={s.connected?"connection-pill connected":"connection-pill disconnected"}><i/>{s.connected?"All systems operational":"Connection issue"}</span></div>
  <div className="metric-grid">{metrics.map(m=><article className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><i>{m.icon}</i></div><strong>{m.value}</strong><small>{m.detail}</small></article>)}</div>
  <div className="dashboard-panels">
   <section className="dashboard-panel pipeline-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR NEXT STEP</span><h3>Build your advisory pipeline</h3></div><span className="panel-symbol">↗</span></div><p>Start with a business profile, create an engagement, and move through the nine-instrument assessment workflow.</p><div className="pipeline-steps"><div><i>01</i><span><b>Add a business</b><small>Set up a company profile</small></span></div><div><i>02</i><span><b>Create an engagement</b><small>Define the scope of the work</small></span></div><div><i>03</i><span><b>Assess and advise</b><small>Build an evidence-led view</small></span></div></div><div className="panel-actions"><Link href="/businesses">Go to businesses →</Link><Link href="/engagements">Open engagements →</Link></div></section>
   <section className="dashboard-panel methodology-panel"><div className="panel-heading"><div><span className="eyebrow">THE BPIP FRAMEWORK</span><h3>Six dimensions of performance</h3></div><span className="framework-count">06</span></div><p>A connected view of the business—not isolated metrics.</p><div className="dimension-grid">{dimensions.map((d,i)=><div className="dimension-item" key={d}><i>{String(i+1).padStart(2,"0")}</i><span>{d}</span></div>)}</div><div className="framework-footer"><span>9 instruments</span><span>6 dimensions</span><span>1 integrated view</span></div></section>
  </div>
 </div>;
}
