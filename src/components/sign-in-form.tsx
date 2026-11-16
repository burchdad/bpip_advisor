"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SignInForm(){
 const router=useRouter(),[email,setEmail]=useState(""),[otp,setOtp]=useState(""),[sent,setSent]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{const r=await authClient.emailOtp.sendVerificationOtp({email,type:"sign-in"});if(r.error){setError(r.error.message||"Could not send code.");return;}setSent(true);}
  catch{setError("Could not send a sign-in code.");}finally{setBusy(false);}
 }
 async function verify(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{
   const r=await authClient.signIn.emailOtp({email,otp});if(r.error){setError(r.error.message||"Code could not be verified.");return;}
   const orgs=await authClient.organization.list();if(orgs.error){setError("Signed in, but workspace access could not be loaded.");return;}
   if(orgs.data?.length){const active=await authClient.organization.setActive({organizationId:orgs.data[0].id});if(active.error){setError("Could not select your workspace.");return;}}
   else{const created=await authClient.organization.create({name:"BPIP Advisory",slug:"bpip-advisory"});if(created.error){setError("Workspace setup failed. Contact the administrator.");return;}}
   const boot=await fetch("/api/workspace/bootstrap",{method:"POST"});if(!boot.ok){setError("Your workspace could not be initialized. Contact the administrator.");return;}
   router.replace("/");router.refresh();
  }catch{setError("Sign-in failed. Request a new code.");}finally{setBusy(false);}
 }
 return <form className="auth-form" onSubmit={sent?verify:send}>
  <label htmlFor="email">Email address</label>
  <input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} disabled={sent}/>
  {sent?<><label htmlFor="otp">6-digit sign-in code</label><input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value)}/></>:null}
  {error?<p className="auth-error" role="alert">{error}</p>:null}
  <button type="submit" disabled={busy}>{busy?"Please wait...":sent?"Verify and sign in":"Email me a sign-in code"}</button>
  {sent?<button type="button" onClick={()=>{setSent(false);setOtp("");setError("");}}>Use a different email</button>:null}
  <p className="auth-note">Private advisor access only. Public registration is disabled.</p>
 </form>;
}