"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

const items=[
  {name:"Overview",href:"/",icon:"⌂",group:"WORKSPACE"},
  {name:"Businesses",href:"/businesses",icon:"▦",group:"PORTFOLIO"},
  {name:"Engagements",href:"/engagements",icon:"▤",group:"PORTFOLIO"},
];

export function Sidebar(){
  const path=usePathname();
  return <aside className="app-sidebar">
    <Link href="/" className="brand-lockup" aria-label="BPIP overview">
      <span className="brand-mark">B</span>
      <span className="brand-copy"><b>BPIP</b><small>BUSINESS INTELLIGENCE</small></span>
    </Link>
    <div className="workspace-switcher"><span className="workspace-avatar">A</span><span><b>Advisor workspace</b><small>Private environment</small></span><span className="workspace-chevron">⌄</span></div>
    <nav className="primary-nav" aria-label="Main navigation">
      <small className="nav-group-label">WORKSPACE</small>
      {items.slice(0,1).map(item=><Link className={path===item.href?"nav-item active":"nav-item"} href={item.href} key={item.name}><span className="nav-icon">{item.icon}</span><span>{item.name}</span></Link>)}
      <small className="nav-group-label portfolio-label">PORTFOLIO</small>
      {items.slice(1).map(item=><Link className={path===item.href||path.startsWith(item.href+"/")?"nav-item active":"nav-item"} href={item.href} key={item.name}><span className="nav-icon">{item.icon}</span><span>{item.name}</span></Link>)}
    </nav>
    <div className="sidebar-bottom"><div className="privacy-note"><span>●</span><div><b>Private workspace</b><small>Your advisory data stays protected</small></div></div><SignOutButton/></div>
  </aside>;
}
