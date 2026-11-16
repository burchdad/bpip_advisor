import { neon } from "@neondatabase/serverless";
export async function getStats(){
 try{
 const db=neon(process.env.DATABASE_URL!);
 const [b,e,a]=await Promise.all([
 db.query("select count(*)::int n from businesses where business_status <> 'archived'"),
 db.query("select count(*)::int n from engagements where status <> 'complete'"),
 db.query("select count(*)::int n from engagement_assessments where assessment_status in ('in_progress','submitted')")]);
 return {businesses:b[0].n,engagements:e[0].n,assessments:a[0].n,connected:true};
 }catch{return {businesses:0,engagements:0,assessments:0,connected:false};}
}
