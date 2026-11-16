"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SignInForm() {
 const router=useRouter();
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{
   const result=await authClient.signIn.email({email,password});
   if(result.error){setError(result.error.message||"Invalid email or password.");return;}
   router.replace("/");router.refresh();
  }catch{setError("Unable to sign in. Please try again.");}
  finally{setBusy(false);}
 }
 return <form className="auth-form" onSubmit={submit}>
  <label htmlFor="email">Email address</label>
  <input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/>
  <label htmlFor="password">Password</label>
  <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>
  {error?<p className="auth-error" role="alert">{error}</p>:null}
  <button type="submit" disabled={busy}>{busy?"Signing in...":"Sign in"}</button>
  <p className="auth-note">Access is provisioned by your workspace administrator.</p>
 </form>;
}