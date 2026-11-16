import { connection } from "next/server";
import { getBusinesses } from "@/lib/businesses";
import CreateBusinessForm from "@/components/create-business-form";
import { Sidebar } from "@/components/sidebar";

export const instant=false;
export default async function BusinessesPage(){
 await connection();
 const rows=await getBusinesses();
 return <main className="shell"><Sidebar/><section><header>Workspace / <b>Businesses</b><span>● ADVISOR EDITION</span></header><div className="business-page"><div className="business-title"><div><small>PORTFOLIO MANAGEMENT</small><h1>Businesses</h1><p>Manage the companies in your advisory portfolio.</p></div><strong>{rows.length}<small> businesses</small></strong></div><CreateBusinessForm/>{rows.length?<div className="business-list">{rows.map((b:any)=><div className="business-row" key={b.id}><div><b>{b.business_name}</b><small>{[b.industry,b.headquarters_location].filter(Boolean).join(" · ")||"Business profile"}</small></div><div><b>{b.annual_revenue_range||"Revenue not recorded"}</b><small>{b.employee_count===null?"Employee count unknown":String(b.employee_count)+" employees"}</small></div><span className="status">{b.business_status}</span></div>)}</div>:<div className="business-empty"><b>Your portfolio is ready for its first business.</b><p>Add a company to start an engagement and complete its performance assessment.</p></div>}</div><footer>BPIP · Advisor Edition · Confidential workspace</footer></section></main>;
}