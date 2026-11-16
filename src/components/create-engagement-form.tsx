import { createEngagement } from "@/app/engagements/actions";
type Business={id:string;business_name:string};
export default function CreateEngagementForm({businesses}:{businesses:Business[]}) {
 return <details className="new-engagement"><summary>+ Create engagement</summary>
  {businesses.length===0?<p className="engagement-hint">Add an active business before creating an engagement.</p>:
  <form action={createEngagement} className="engagement-form">
   <label>Business *<select name="business_id" required defaultValue=""><option value="" disabled>Select a business</option>{businesses.map(b=><option value={b.id} key={b.id}>{b.business_name}</option>)}</select></label>
   <label>Engagement name *<input name="engagement_name" required maxLength={200} placeholder="e.g. Initial Business Performance Assessment"/></label>
   <label>Engagement type<select name="engagement_type" defaultValue="business_performance_assessment"><option value="business_performance_assessment">Business performance assessment</option><option value="ongoing_advisory">Ongoing advisory</option><option value="transformation">Performance improvement / transformation</option><option value="investment_diligence">Investment / acquisition diligence</option></select></label>
   <label>Start date<input type="date" name="start_date"/></label>
   <label>Target completion<input type="date" name="target_completion_date"/></label>
   <label className="wide">Initial scope<textarea name="scope_description" rows={3} placeholder="What questions should this engagement answer? What is included or excluded?"/></label>
   <div className="wide form-actions"><button type="submit">Create engagement</button><small>Creates the engagement and initializes all nine assessment instruments.</small></div>
  </form>}
 </details>;
}
