import { getCurrentOrganization } from "@/lib/tenant";
export async function getBusinesses() {
 const {db,organizationId}=await getCurrentOrganization();
 return db.query("select id,business_name,industry,business_type,annual_revenue_range,employee_count,headquarters_location,business_status,created_at from businesses where organization_id=$1 and business_status<>'archived' order by created_at desc",[organizationId]);
}