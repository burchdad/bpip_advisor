import { Sidebar } from "./sidebar";
import Snapshot from "./snapshot";
type S={businesses:number;engagements:number;assessments:number;connected:boolean};
export default function Dashboard({stats:s}:{stats:S}){return <main className="shell"><Sidebar/><section><header>Workspace / <b>Overview</b><span>● ADVISOR EDITION</span></header><article><small>BUSINESS PERFORMANCE INTELLIGENCE</small><h1>See the whole business.<br/><em>Find what moves value.</em></h1><p>Discovery, investigation, opportunity analysis, strategic recommendations, and measurable improvement in one system.</p></article><Snapshot stats={s}/><footer>BPIP · Advisor Edition · v0.1 Alpha</footer></section></main>}
