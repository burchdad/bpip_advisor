UPDATE assessment_template_versions tv
SET schema_definition = $schema$
{
 "instrument_number":4,
 "template_name":"Operational & Organizational Effectiveness Assessment",
 "description":"An advisor-led assessment of how work is performed, capacity is deployed, quality is controlled, leadership is organized and the business executes priorities. Findings distinguish observed evidence, owner/employee input and advisor hypotheses.",
 "schema_status":"active",
 "sections":[
  {"id":"operating_model","title":"1. Operating model & process architecture","description":"Understand how the business delivers its products or services from demand through completion.","questions":[
   {"key":"ops_core_processes","label":"Core business processes and end-to-end workflows","type":"textarea","required":true,"prompt":"Map the critical workflows from customer request/order through delivery, billing and support. Identify process owners and handoffs."},
   {"key":"ops_process_documentation","label":"Process documentation and standardization","type":"select","options":["Documented, current and consistently followed","Partially documented or inconsistently followed","Primarily dependent on individual knowledge","No meaningful process documentation","Not yet assessed"],"required":true},
   {"key":"ops_process_variability","label":"Where does process variation or unnecessary complexity occur?","type":"textarea","prompt":"Capture workarounds, duplicate steps, unclear approvals, unnecessary handoffs and differences between teams or locations."},
   {"key":"ops_customer_journey","label":"Customer experience across delivery","type":"textarea","prompt":"Describe customer touchpoints, wait times, communication, service consistency and recurring friction."},
   {"key":"ops_operating_model_notes","label":"Operating model observations and evidence","type":"textarea","prompt":"Record walkthroughs, observations, process maps, interviews and systems evidence reviewed."}
  ]},
  {"id":"workflow_performance","title":"2. Workflow, throughput & cycle time","description":"Assess the flow of work, constraints, backlogs and delivery predictability.","questions":[
   {"key":"ops_volume_measure","label":"Primary throughput measure and unit","type":"text","prompt":"Examples: jobs completed per week, units produced per shift, cases handled per day, projects delivered per month."},
   {"key":"ops_throughput_current","label":"Current throughput (quantity per period)","type":"number","unit":"quantity","prompt":"Enter only if a defined period and source are recorded in the evidence notes."},
   {"key":"ops_throughput_period","label":"Throughput measurement period","type":"select","options":["Per day","Per week","Per month","Per quarter","Per year","Other / not standardized"]},
   {"key":"ops_cycle_time","label":"Typical end-to-end cycle time","type":"text","prompt":"State the unit and process boundary, such as 4 business days from accepted order to delivery."},
   {"key":"ops_backlog","label":"Current backlog / work in process","type":"text","prompt":"Quantity, age profile, priority mix and how backlog is measured."},
   {"key":"ops_bottlenecks","label":"Primary bottlenecks, delays and handoff failures","type":"textarea","required":true,"prompt":"Identify where work queues, waits for approval, materials, information, staffing or customer decisions."},
   {"key":"ops_schedule_reliability","label":"On-time delivery / schedule reliability (%)","type":"number","unit":"percent","prompt":"Use a defined period and denominator; leave blank if not reliably measured."}
  ]},
  {"id":"capacity_productivity","title":"3. Capacity, utilization & productivity","description":"Evaluate whether people, equipment, facilities and time are aligned with demand.","questions":[
   {"key":"ops_capacity_model","label":"How is practical capacity determined?","type":"textarea","prompt":"Describe staffing assumptions, shift patterns, equipment constraints, available hours and demand peaks."},
   {"key":"ops_capacity_utilization","label":"Estimated capacity utilization (%)","type":"number","unit":"percent","prompt":"Document how capacity and actual output are defined. Leave blank if not measured."},
   {"key":"ops_labor_productivity","label":"Primary labor productivity measure","type":"text","prompt":"Examples: jobs per labor hour, units per employee, revenue per billable hour. Include the period and source."},
   {"key":"ops_overtime","label":"Overtime, idle time and workload imbalance","type":"textarea","prompt":"Capture overtime, underutilization, uneven workloads, seasonal staffing and reliance on contractors."},
   {"key":"ops_asset_utilization","label":"Equipment, facility and technology utilization","type":"textarea","prompt":"Identify constraints, downtime, maintenance patterns, asset availability and underused resources."},
   {"key":"ops_capacity_constraints","label":"Capacity constraints and scalable capacity options","type":"textarea","required":true,"prompt":"Distinguish true capacity limits from scheduling, process, skill, demand or management constraints."}
  ]},
  {"id":"quality_controls","title":"4. Quality, service levels & operational controls","description":"Understand reliability, defects, rework, safety and control effectiveness.","questions":[
   {"key":"ops_quality_metrics","label":"Quality and service metrics currently monitored","type":"textarea","prompt":"Examples: defects, returns, callbacks, first-pass yield, SLA attainment, complaints, warranty claims and customer satisfaction."},
   {"key":"ops_rework_rate","label":"Rework / error rate (%) if measured","type":"number","unit":"percent","prompt":"Specify numerator, denominator and reporting period."},
   {"key":"ops_quality_failure_modes","label":"Recurring defects, service failures and root causes","type":"textarea","prompt":"Describe frequency, impact, detection point, customer impact and known causes."},
   {"key":"ops_controls","label":"Operational controls and compliance routines","type":"textarea","prompt":"Approvals, reconciliations, checklists, safety practices, maintenance, quality gates and exception handling."},
   {"key":"ops_incidents","label":"Material incidents, near misses or service disruptions","type":"textarea","prompt":"Record dates, frequency, severity, response and corrective actions where appropriate."}
  ]},
  {"id":"organization","title":"5. Organization, roles & accountability","description":"Assess whether responsibilities, decision rights and capabilities support reliable execution.","questions":[
   {"key":"org_structure","label":"Current organizational structure and reporting lines","type":"textarea","required":true,"prompt":"Describe leadership layers, teams, locations, reporting relationships and any informal structures."},
   {"key":"org_role_clarity","label":"Role clarity and decision rights","type":"select","options":["Clear roles and decision rights across the business","Mostly clear with some overlap or gaps","Frequent ambiguity, duplication or escalation","Highly owner-dependent / informal","Not yet assessed"],"required":true},
   {"key":"org_accountability","label":"Performance accountability and ownership","type":"textarea","prompt":"Who owns outcomes, how are commitments tracked, and how are missed targets addressed?" },
   {"key":"org_management_span","label":"Management capacity and span of control","type":"textarea","prompt":"Assess manager workload, number of direct reports, coaching capacity and escalation burden."},
   {"key":"org_skill_gaps","label":"Critical skills, capability gaps and training needs","type":"textarea","prompt":"Identify critical competencies, hiring or development needs, cross-training and succession coverage."},
   {"key":"org_key_person_risk","label":"Key-person dependencies and continuity exposure","type":"textarea","prompt":"Identify work that stops or degrades if specific people are unavailable. Record mitigations."},
   {"key":"org_culture_communication","label":"Communication, engagement and working culture","type":"textarea","prompt":"Capture employee input, communication cadence, collaboration and resistance points. Attribute interview evidence appropriately."}
  ]},
  {"id":"management_execution","title":"6. Management systems & execution discipline","description":"Review how leaders set direction, monitor performance and drive improvement.","questions":[
   {"key":"ops_kpi_cadence","label":"Management KPI and review cadence","type":"select","options":["Weekly operating reviews with accountable owners","Monthly structured performance reviews","Informal / inconsistent reviews","Primarily reactive issue management","No regular performance cadence"],"required":true},
   {"key":"ops_kpi_quality","label":"Are operational KPIs defined and trusted?","type":"select","options":["Defined, owned, timely and trusted","Defined but incomplete or delayed","Metrics exist but definitions vary","Limited reliable operational data","Not yet assessed"],"required":true},
   {"key":"ops_issue_management","label":"Issue escalation and corrective-action process","type":"textarea","prompt":"How are problems logged, prioritized, assigned, resolved and checked for recurrence?" },
   {"key":"ops_change_management","label":"How are operational changes implemented?","type":"textarea","prompt":"Describe ownership, communication, training, testing, adoption and post-change review."},
   {"key":"ops_continuous_improvement","label":"Continuous improvement capability","type":"textarea","prompt":"Examples of improvement routines, employee ideas, root-cause reviews and benefits tracking."}
  ]},
  {"id":"advisor_diagnosis","title":"7. Advisor findings & improvement opportunities","description":"Synthesize operational and organizational findings into actionable, evidence-aware conclusions.","questions":[
   {"key":"ops_strengths","label":"Operational and organizational strengths to preserve","type":"textarea","required":true,"prompt":"Identify practices, capabilities and assets that create advantage or should not be disrupted."},
   {"key":"ops_findings","label":"Key advisor findings","type":"textarea","required":true,"prompt":"Separate directly observed facts, records reviewed, owner/employee statements and advisor interpretation."},
   {"key":"ops_root_causes","label":"Likely root causes and hypotheses to validate","type":"textarea","prompt":"Distinguish symptoms from underlying process, capacity, leadership, capability, systems or governance causes."},
   {"key":"ops_opportunities","label":"Improvement opportunities","type":"textarea","required":true,"prompt":"Describe the operational mechanism, expected benefit, affected teams, prerequisites and evidence needed to quantify."},
   {"key":"ops_people_change_impact","label":"Employee, customer and change-management implications","type":"textarea","prompt":"Identify workload shifts, training, role changes, service disruption, stakeholder concerns and adoption requirements."},
   {"key":"ops_risks_dependencies","label":"Risks, dependencies and further evidence required","type":"textarea","prompt":"Capture safety, compliance, service continuity, labor, supplier, technology and implementation risks."},
   {"key":"ops_advisor_confidence","label":"Advisor confidence in this assessment","type":"select","options":["High — sufficient direct evidence and corroboration","Moderate — useful findings with material gaps","Low — preliminary hypotheses / limited access","Insufficient — defer conclusions pending evidence"],"required":true}
  ]}
 ],
 "assessment_policy":"Do not infer poor performance from missing metrics. Numeric operational measures require defined units, periods and denominators. Separate observed facts, source records, owner/employee statements and advisor hypotheses. Consider customer and employee impacts, safety, compliance, dependencies and implementation capacity."
}
$schema$::jsonb,
scoring_definition = '{"rating_owner":"advisor","missing_data_policy":"Unknown or unmeasured is not a zero or a failure.","evidence_policy":"Attribute observations, records, owner statements, employee input and advisor hypotheses separately."}'::jsonb,
published_at = COALESCE(tv.published_at, now())
FROM assessment_templates t
WHERE tv.template_id=t.id AND t.instrument_number=4 AND tv.version_number=t.current_version;