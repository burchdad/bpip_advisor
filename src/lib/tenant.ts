import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export async function getCurrentOrganization() {
 const {data:session}=await auth.getSession();
 if(!session?.user) throw new Error("Unauthorized");
 const db=neon(process.env.DATABASE_URL!);
 const active=(session.session as {activeOrganizationId?:string|null}).activeOrganizationId??null;
 const rows=await db.query("select o.id,o.name from organization_memberships m join organizations o on o.id=m.organization_id where m.user_id=$1 and m.membership_status='active' and ($2::text is null or o.auth_organization_id=$2) order by m.created_at asc limit 1",[session.user.id,active]);
 if(!rows.length) throw new Error("No active BPIP workspace");
 return {db,userId:session.user.id,organizationId:rows[0].id,organizationName:rows[0].name};
}