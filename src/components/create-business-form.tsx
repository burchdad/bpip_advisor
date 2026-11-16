import { createBusiness } from "@/app/businesses/actions";
export default function CreateBusinessForm(){return <details className="new-business"><summary>+ Add a business</summary><form action={createBusiness} className="business-form">
 <label>Business name *<input name="business_name" required maxLength={200} placeholder="e.g. Acme Manufacturing"/></label>
 <label>Legal name<input name="legal_name" maxLength={200}/></label>
 <label>Industry<input name="industry" placeholder="e.g. Manufacturing"/></label>
 <label>Business type<select name="business_type"><option value="">Select type</option><option>Professional services</option><option>Manufacturing</option><option>Retail</option><option>Construction</option><option>Distribution</option><option>Healthcare</option><option>Technology</option><option>Other</option></select></label>
 <label>Annual revenue range<select name="annual_revenue_range"><option value="">Not yet known</option><option>Under $1M</option><option>$1M–$5M</option><option>$5M–$10M</option><option>$10M–$30M</option><option>$30M–$100M</option><option>$100M+</option></select></label>
 <label>Employee count<input name="employee_count" type="number" min="0" step="1" placeholder="Optional"/></label>
 <label>Ownership type<select name="ownership_type"><option value="">Select ownership</option><option>Founder-owned</option><option>Family-owned</option><option>Privately held</option><option>Private equity-backed</option><option>Employee-owned</option><option>Other</option></select></label>
 <label>Headquarters<input name="headquarters_location" placeholder="City, State"/></label>
 <label>Website<input name="website" type="url" placeholder="https://"/></label>
 <label className="wide">Business description<textarea name="business_description" rows={3} placeholder="Brief description of the business and its core offerings."/></label>
 <div className="wide form-actions"><button type="submit">Save business</button><small>Business records are private to your advisory workspace.</small></div>
 </form></details>}