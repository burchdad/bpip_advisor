UPDATE assessment_template_versions tv
SET schema_definition = $schema$
{
  "instrument_number": 1,
  "template_name": "Owner Discovery Questionnaire",
  "description": "A guided, advisor-led discovery interview to understand the business, its objectives, performance, constraints and readiness for change.",
  "schema_status": "active",
  "sections": [
    {"id":"business_context","title":"1. Business context","description":"Establish the business model, history and current operating footprint.","questions":[
      {"key":"business_overview","label":"Describe the business in your own words.","type":"textarea","required":true,"prompt":"What does the business do, who does it serve, and what makes it different?"},
      {"key":"history_milestones","label":"How did the business get to where it is today?","type":"textarea","prompt":"Capture founding story, major turning points, acquisitions, pivots and recent changes."},
      {"key":"products_services","label":"What are the primary products or services?","type":"textarea","prompt":"Identify major offerings and approximate contribution to revenue where known."},
      {"key":"customer_segments","label":"Who are the primary customers or customer groups?","type":"textarea","prompt":"Describe customer types, industries, geographies and concentration concerns."},
      {"key":"business_model","label":"How does the business generate revenue?","type":"textarea","prompt":"Describe pricing, sales channels, recurring versus one-time revenue and delivery model."}
    ]},
    {"id":"ownership_goals","title":"2. Ownership, leadership & objectives","description":"Understand the owner's goals, decision structure and definition of success.","questions":[
      {"key":"ownership_structure","label":"Describe ownership and leadership structure.","type":"textarea","prompt":"Who owns the business, who leads it day to day, and how are major decisions made?"},
      {"key":"owner_role","label":"What is your current role in the business?","type":"textarea","prompt":"Where does the owner spend time? What decisions or relationships depend heavily on them?"},
      {"key":"success_definition","label":"What would make this engagement successful for you?","type":"textarea","required":true,"prompt":"Capture desired outcomes in the owner's own language."},
      {"key":"three_year_vision","label":"Where would you like the business to be in three years?","type":"textarea","prompt":"Revenue, profitability, size, market position, owner involvement, exit or other goals."},
      {"key":"priority_objectives","label":"What are the three most important business objectives right now?","type":"textarea","prompt":"Rank the objectives if the owner can."}
    ]},
    {"id":"performance","title":"3. Financial & business performance","description":"Capture management's view of financial health without treating estimates as verified results.","questions":[
      {"key":"revenue_range","label":"Approximate annual revenue","type":"select","options":["Under $250,000","$250,000–$499,999","$500,000–$999,999","$1M–$2.49M","$2.5M–$4.99M","$5M–$9.99M","$10M–$24.99M","$25M–$49.99M","$50M+","Prefer not to say","Unknown"],"prompt":"Owner estimate only until supported by financial records."},
      {"key":"profitability_view","label":"How would you describe current profitability?","type":"select","options":["Strong and consistent","Profitable but inconsistent","Near break-even","Currently unprofitable","Unsure / not measured"],"prompt":"Ask how the owner defines profitability and what period they have in mind."},
      {"key":"cash_flow_view","label":"How would you describe cash flow?","type":"select","options":["Predictable and healthy","Generally healthy with occasional pressure","Frequently tight","Critical / immediate concern","Not sure"],"prompt":"Distinguish cash availability from accounting profit."},
      {"key":"financial_visibility","label":"How confident are you in the accuracy and timeliness of financial information?","type":"select","options":["High — current and regularly reviewed","Moderate — available but delayed or incomplete","Low — inconsistent or difficult to obtain","Very low — limited reliable reporting"],"prompt":"Ask which reports are reviewed and how often."},
      {"key":"performance_trends","label":"What has improved or deteriorated over the last 12–24 months?","type":"textarea","prompt":"Revenue, margins, cash, costs, customer retention, productivity or other indicators."}
    ]},
    {"id":"operations_people","title":"4. Operations, organization & people","description":"Identify perceived constraints in delivery, capacity, process and leadership.","questions":[
      {"key":"operating_constraints","label":"Where do work, service delivery or internal processes get stuck?","type":"textarea","prompt":"Ask for specific examples, frequency, consequences and affected teams."},
      {"key":"capacity_utilization","label":"How well is current team and operating capacity being used?","type":"textarea","prompt":"Underutilized capacity, bottlenecks, overtime, rework, delays or dependence on key individuals."},
      {"key":"key_person_dependencies","label":"Which roles or individuals are critical single points of failure?","type":"textarea","prompt":"Include owner dependency, undocumented knowledge and succession coverage."},
      {"key":"organization_culture","label":"How would you describe morale, accountability and communication?","type":"textarea","prompt":"Capture strengths and friction without treating a single opinion as an established fact."}
    ]},
    {"id":"commercial","title":"5. Customers, sales & market position","description":"Understand demand generation, sales conversion, customer experience and market exposure.","questions":[
      {"key":"lead_generation","label":"How does the business attract and win new customers?","type":"textarea","prompt":"Channels, referral dependence, sales process, conversion visibility and acquisition cost if known."},
      {"key":"customer_retention","label":"What drives repeat business, retention or customer loss?","type":"textarea","prompt":"Customer feedback, churn, repeat purchase, concentration and service issues."},
      {"key":"pricing_margin","label":"How are prices set and reviewed?","type":"textarea","prompt":"Discounting, margin visibility, price changes and confidence in value proposition."},
      {"key":"competitive_position","label":"Who are the main competitors and why do customers choose this business?","type":"textarea","prompt":"Capture perceived differentiation and evidence needed to validate it."}
    ]},
    {"id":"systems_risk","title":"6. Technology, controls & risk","description":"Assess systems support, data reliability and material exposures.","questions":[
      {"key":"systems_tools","label":"Which systems and tools are essential to running the business?","type":"textarea","prompt":"Accounting, CRM, ERP, scheduling, inventory, communications, reporting and integrations."},
      {"key":"data_reporting","label":"What business information is difficult to access or trust?","type":"textarea","prompt":"Manual reporting, duplicate entry, spreadsheet dependence, missing metrics or inconsistent definitions."},
      {"key":"key_risks","label":"What risks keep you up at night?","type":"textarea","prompt":"Operational, financial, customer, supplier, regulatory, cyber, people, reputation or continuity risks."}
    ]},
    {"id":"change_readiness","title":"7. Constraints, opportunities & readiness","description":"Understand what can realistically be changed and what needs to be protected.","questions":[
      {"key":"perceived_opportunities","label":"Where do you believe the greatest improvement opportunities exist?","type":"textarea","prompt":"Record the owner's hypotheses separately from validated findings."},
      {"key":"change_barriers","label":"What has prevented improvement in the past?","type":"textarea","prompt":"Capital, time, skills, leadership alignment, systems, competing priorities or previous initiatives."},
      {"key":"investment_capacity","label":"What level of investment or disruption is realistically possible?","type":"textarea","prompt":"People, time, budget, operational downtime and appetite for external support."},
      {"key":"urgency","label":"How urgent is the need for meaningful change?","type":"select","options":["Immediate — within 30 days","Near term — within 90 days","Medium term — within 6–12 months","Exploratory — no immediate deadline"],"prompt":"Ask what happens if no action is taken."},
      {"key":"additional_context","label":"What else should we understand before beginning the assessment?","type":"textarea","prompt":"Anything not covered above, including sensitivities, non-negotiables or important context."}
    ]}
  ]
}
$schema$::jsonb,
scoring_definition = '{}'::jsonb,
published_at = COALESCE(tv.published_at, now())
FROM assessment_templates t
WHERE tv.template_id=t.id
  AND t.instrument_number=1
  AND tv.version_number=t.current_version;
