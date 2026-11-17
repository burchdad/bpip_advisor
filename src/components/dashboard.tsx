import Link from "next/link";
import { Sidebar } from "./sidebar";
import Snapshot from "./snapshot";
type S={businesses:number;engagements:number;assessments:number;connected:boolean};
export default function Dashboard({stats:s}:{stats:S}){
 return <main className="shell app-shell"><Sidebar/><section className="app-main">
  <header className="topbar"><div><span className="breadcrumb-muted">Workspace</span><span className="breadcrumb-separator">/</span><b>Overview</b></div><div className="topbar-right"><span className="secure-indicator"><i/>Secure advisor workspace</span><span className="edition-label">ADVISOR EDITION</span></div></header>
  <div className="dashboard-content">
   <section className="welcome-hero"><div className="welcome-copy"><span className="eyebrow">BUSINESS PERFORMANCE INTELLIGENCE</span><h1>Clarity for better<br/><em>business decisions.</em></h1><p>One connected workspace to assess performance, uncover value, and guide meaningful improvement.</p><div className="hero-actions"><Link className="button-primary" href="/engagements">View engagements <span>→</span></Link><Link className="button-quiet" href="/businesses">Manage businesses</Link></div></div><div className="hero-visual" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-core"><span>BP</span><small>INSIGHT<br/>TO IMPACT</small></div><i className="orbit-node node-one"/><i className="orbit-node node-two"/><i className="orbit-node node-three"/></div></section>
   <Snapshot stats={s}/>
  </div>
  <footer className="app-footer"><span>BPIP · Advisor Edition</span><span>Confidential workspace</span></footer>
 </section></main>;
}
