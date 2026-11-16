type Stats={businesses:number;engagements:number;assessments:number;connected:boolean};
export default function Snapshot({stats:s}:{stats:Stats}){
 const m=[["Businesses",s.businesses],["Active engagements",s.engagements],["Assessments in progress",s.assessments],["Core instruments","09"]];
 const d=["Financial performance","Operational effectiveness","Organizational effectiveness","Commercial performance","Technology and systems","Scalability and business value"];
 return <><div className="heading"><b>Workspace snapshot</b><small className={s.connected?"ok":"warn"}>● {s.connected?"DATABASE CONNECTED":"DATABASE CONNECTION ISSUE"}</small></div><div className="cards">{m.map(([a,b])=><div className="card" key={String(a)}><small>{a}</small><strong>{b}</strong></div>)}</div><div className="panels"><div className="panel"><b>Engagement activity</b><p>Your engagement pipeline starts here.</p><small>Create a business profile, then open an engagement to begin owner discovery.</small></div><div className="panel"><b>Assessment methodology</b>{d.map((x,i)=><div className="dim" key={x}><i>0{i+1}</i>{x}</div>)}</div></div></>;
}
