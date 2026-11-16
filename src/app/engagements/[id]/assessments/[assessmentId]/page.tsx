import { connection } from "next/server";

export const instant = false;
import { notFound } from "next/navigation";
import { getCurrentOrganization } from "@/lib/tenant";
import OwnerDiscoveryPage from "./owner-discovery-page";
import BusinessScorecardPage from "./scorecard-page";
import FinancialAnalysisPage from "./financial-page";
import OperationalAssessmentPage from "./operational-page";
import CommercialAssessmentPage from "./commercial-page";
import RootCauseAssessmentPage from "./root-cause-page";
import OpportunityPrioritizationPage from "./prioritization-page";
import StrategicRecommendationsPage from "./recommendations-page";

export default async function AssessmentRouter({params,searchParams}:{params:Promise<{id:string;assessmentId:string}>;searchParams:Promise<{saved?:string;error?:string;missing?:string}>}) {
 await connection();
 const {id,assessmentId}=await params;
 const {db,organizationId}=await getCurrentOrganization();
 const rows=await db.query(
  `select t.instrument_number from engagement_assessments ea
   join engagements e on e.id=ea.engagement_id and e.organization_id=ea.organization_id
   join assessment_template_versions tv on tv.id=ea.template_version_id
   join assessment_templates t on t.id=tv.template_id
   where ea.id=$1 and e.id=$2 and ea.organization_id=$3 limit 1`,
  [assessmentId,id,organizationId]
 );
 if(!rows.length) notFound();
 if(Number(rows[0].instrument_number)===2) return <BusinessScorecardPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===3) return <FinancialAnalysisPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===4) return <OperationalAssessmentPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===5) return <CommercialAssessmentPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===6) return <RootCauseAssessmentPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===7) return <OpportunityPrioritizationPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===8) return <StrategicRecommendationsPage params={params} searchParams={searchParams}/>;
 if(Number(rows[0].instrument_number)===1) return <OwnerDiscoveryPage params={params} searchParams={searchParams}/>;
 notFound();
}