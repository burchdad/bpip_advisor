"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";
const items=[["Overview","/","◫"],["Businesses","/businesses","▦"],["Engagements","/engagements","▤"],["Assessments","","◎"],["Opportunities","","✦"],["Reports","","▧"],["Performance","","◷"]];
export function Sidebar(){const path=usePathname();return <aside><div className="logo">BPIP</div><small>BUSINESS INTELLIGENCE</small><hr/><label>WORKSPACE</label>{items.map(([name,href,icon])=>href?<Link className={path===href||path.startsWith(href+"/")?"nav active":"nav"} href={href} key={name}>{icon}　{name}</Link>:<div className="nav nav-disabled" key={name} title="Coming soon">{icon}　{name}</div>)}<div className="secure">◆ Private advisor workspace<SignOutButton/></div></aside>}