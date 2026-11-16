import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export async function POST() {
 const {data:session}=await auth.getSession();
 if(!session?.user) return Response.json({error:"Unauthorized"},{status:401});
 const db=neon(process.env.DATABASE_URL!);
 const owner=await db.query('select "organizationId" from neon_auth.member where "userId"=$1 and role=$2 limit 1',[session.user.id,"owner"]);
 if(!owner.length) return Response.json({error:"Workspace owner membership required"},{status:403});
 const authOrgId=String(owner[0].organizationId);
 const existing=await db.query("select organization_id from organization_memberships where user_id=$1 and membership_status='active' order by created_at asc limit 1",[session.user.id]);
 if(existing.length) {
  await db.query("update organizations set auth_organization_id=$1,updated_at=now() where id=$2 and (auth_organization_id is null or auth_organization_id=$1)",[authOrgId,existing[0].organization_id]);
  return Response.json({ok:true});
 }
 await db.query("insert into users(id,email,display_name) values($1,$2,$3) on conflict(id) do update set email=excluded.email,display_name=excluded.display_name",[session.user.id,session.user.email,session.user.name||"BPIP Advisor"]);
 const slug="bpip-advisory-"+session.user.id.slice(-8).toLowerCase();
 const org=await db.query("insert into organizations(name,slug,organization_type,subscription_status,auth_organization_id) values($1,$2,'advisory_firm','internal',$3) on conflict(auth_organization_id) where auth_organization_id is not null do update set updated_at=now() returning id",["BPIP Advisory",slug,authOrgId]);
 await db.query("insert into organization_memberships(organization_id,user_id,role,membership_status) values($1,$2,'organization_owner','active') on conflict(organization_id,user_id) do update set role='organization_owner',membership_status='active'",[org[0].id,session.user.id]);
 return Response.json({ok:true});
}