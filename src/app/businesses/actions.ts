"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/tenant";

export async function createBusiness(formData:FormData) {
 const name=String(formData.get("business_name")||"").trim();
 if(!name) throw new Error("Business name is required.");
 const raw=String(formData.get("employee_count")||"").trim();
 const employees=raw===""?null:Number(raw);
 if(employees!==null&&(!Number.isInteger(employees)||employees<0)) throw new Error("Employee count must be a non-negative whole number.");
 const {db,organizationId}=await getCurrentOrganization();
 await db.query("insert into businesses(organization_id,business_name,legal_name,industry,business_type,annual_revenue_range,employee_count,ownership_type,headquarters_location,website,business_description) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",[
 organizationId,name,String(formData.get("legal_name")||"").trim()||null,String(formData.get("industry")||"").trim()||null,String(formData.get("business_type")||"").trim()||null,String(formData.get("annual_revenue_range")||"").trim()||null,employees,String(formData.get("ownership_type")||"").trim()||null,String(formData.get("headquarters_location")||"").trim()||null,String(formData.get("website")||"").trim()||null,String(formData.get("business_description")||"").trim()||null]);
 revalidatePath("/businesses");
 redirect("/businesses");
}