"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SignInForm(){
 const router=useRouter();
 const [email,setEmail]=useState("");
 const [otp,setOtp]=useState("");
 const [sent,setSent]=useState(false);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{const r=await authClient.emailOtp.sendVerificationOtp({email,type:"sign-in"});if(r.error){setError(r.error.message||"Could not send code.");return;}setSent(true);}
  catch{setError("Could not send a sign-in code. Try again.");}
  finally{setBusy(false);}
 }
 async function verify(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{const r=await authClient.signIn.emailOtp({email,otp});if(r.error){setError(r.error.message||"That code could not be verified.");return;}router.replace("/");router.refresh();}
  catch{setError("Sign-in failed. Request a new code.");}
  finally{setBusy(false);}
 }
 return <form className="auth-form" onSubmit={sent?verify:send}>
  <label htmlFor="email">Email address</label>
  <input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} disabled={sent}/>
  {sent?<><label htmlFor="otp">6-digit sign-in code</label><input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value)}/></>:null}
  {error?<p className="auth-error" role="alert">{error}</p>:null}
  <button type="submit" disabled={busy}>{busy?"Please wait...":sent?"Verify and sign in":"Email me a sign-in code"}</button>
  {sent?<button type="button" onClick={()=>{setSent(false);setOtp("");setError("");}}>Use a different email</button>:null}
  <p className="auth-note">Private advisor access only. New accounts are not open for public registration.</p>
 </form>;
}