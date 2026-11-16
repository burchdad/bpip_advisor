UPDATE assessment_template_versions tv
SET schema_definition = $schema$
{
  "instrument_number": 2,
  "template_name": "Business Performance Scorecard",
  "description": "An advisor-led baseline across six dimensions. Ratings represent the advisor's current assessment; evidence confidence is recorded separately. Missing information is not scored as poor performance.",
  "schema_status": "active",
  "sections": [
    {"id":"financial","title":"1. Financial Performance","description":"Assess profitability, cash generation, financial visibility and economic resilience.","dimension":"Financial Performance","questions":[
      {"key":"financial_rating","label":"Advisor performance rating","type":"select","options":["1 — Critical weakness","2 — Significant improvement needed","3 — Mixed / developing","4 — Effective / healthy","5 — Strong / leading"],"required":true},
      {"key":"financial_confidence","label":"Evidence confidence","type":"select","options":["Verified — supported by reliable records","Partially supported — some records reviewed","Owner-reported — not independently validated","Insufficient data — cannot assess"],"required":true},
      {"key":"financial_findings","label":"Advisor assessment and rationale","type":"textarea","required":true,"prompt":"Explain the rating. Separate observed facts, owner statements and advisor interpretation."},
      {"key":"financial_opportunities","label":"Potential improvement opportunities","type":"textarea","prompt":"Identify likely levers such as margin, pricing, cost structure, working capital or reporting."}
    ]},
    {"id":"operations","title":"2. Operational Effectiveness","description":"Assess process performance, delivery reliability, capacity, productivity and controls.","dimension":"Operational Effectiveness","questions":[
      {"key":"operations_rating","label":"Advisor performance rating","type":"select","options":["1 — Critical weakness","2 — Significant improvement needed","3 — Mixed / developing","4 — Effective / healthy","5 — Strong / leading"],"required":true},
      {"key":"operations_confidence","label":"Evidence confidence","type":"select","options":["Verified — supported by reliable records","Partially supported — some records reviewed","Owner-reported — not independently validated","Insufficient data — cannot assess"],"required":true},
      {"key":"operations_findings","label":"Advisor assessment and rationale","type":"textarea","required":true,"prompt":"Explain the rating using process observations, service levels, throughput, rework, cycle time or other evidence."},
      {"key":"operations_opportunities","label":"Potential improvement opportunities","type":"textarea","prompt":"Identify bottlenecks, standardization, automation, capacity or quality opportunities."}
    ]},
    {"id":"organization","title":"3. Organizational Effectiveness","description":"Assess leadership capacity, accountability, talent, role clarity and organizational resilience.","dimension":"Organizational Effectiveness","questions":[
      {"key":"organization_rating","label":"Advisor performance rating","type":"select","options":["1 — Critical weakness","2 — Significant improvement needed","3 — Mixed / developing","4 — Effective / healthy","5 — Strong / leading"],"required":true},
      {"key":"organization_confidence","label":"Evidence confidence","type":"select","options":["Verified — supported by reliable records","Partially supported — some records reviewed","Owner-reported — not independently validated","Insufficient data — cannot assess"],"required":true},
      {"key":"organization_findings","label":"Advisor assessment and rationale","type":"textarea","required":true,"prompt":"Explain leadership, accountability, role clarity, capability and key-person dependencies."},
      {"key":"organization_opportunities","label":"Potential improvement opportunities","type":"textarea","prompt":"Identify organizational design, management cadence, talent or succession opportunities."}
    ]},
    {"id":"commercial","title":"4. Commercial Performance","description":"Assess customer value, market position, sales effectiveness, retention and revenue quality.","dimension":"Commercial Performance","questions":[
      {"key":"commercial_rating","label":"Advisor performance rating","type":"select","options":["1 — Critical weakness","2 — Significant improvement needed","3 — Mixed / developing","4 — Effective / healthy","5 — Strong / leading"],"required":true},
      {"key":"commercial_confidence","label":"Evidence confidence","type":"select","options":["Verified — supported by reliable records","Partially supported — some records reviewed","Owner-reported — not independently validated","Insufficient data — cannot assess"],"required":true},
      {"key":"commercial_findings","label":"Advisor assessment and rationale","type":"textarea","required":true,"prompt":"Explain demand, pipeline, conversion, pricing, customer concentration, retention and differentiation."},
      {"key":"commercial_opportunities","label":"Potential improvement opportunities","type":"textarea","prompt":"Identify growth, pricing, channel, customer experience or retention opportunities."}
    ]},
    {"id":"technology","title":"5. Technology & Systems","description":"Assess systems fit, data quality, integration, reporting, security and technology leverage.","dimension":"Technology & Systems","questions":[
      {"key":"technology_rating","label":"Advisor performance rating","type":"select","options":["1 — Critical weakness","2 — Significant improvement needed","3 — Mixed / developing","4 — Effective / healthy","5 — Strong / leading"],"required":true},
      {"key":"technology_confidence","label":"Evidence confidence","type":"select","options":["Verified — supported by reliable records","Partially supported — some records reviewed","Owner-reported — not independently validated","Insufficient data — cannot assess"],"required":true},
      {"key":"technology_findings","label":"Advisor assessment and rationale","type":"textarea","required":true,"prompt":"Explain systems coverage, data reliability, process integration, controls and material technology risks."},
      {"key":"technology_opportunities","label":"Potential improvement opportunities","type":"textarea","prompt":"Identify systems rationalization, data, automation, integration or security opportunities."}
    ]},
    {"id":"scalability","title":"6. Scalability & Business Value","description":"Assess ability to grow without proportional cost, owner independence, resilience and strategic value.","dimension":"Scalability & Business Value","questions":[
      {"key":"scalability_rating","label":"Advisor performance rating","type":"select","options":["1 — Critical weakness","2 — Significant improvement needed","3 — Mixed / developing","4 — Effective / healthy","5 — Strong / leading"],"required":true},
      {"key":"scalability_confidence","label":"Evidence confidence","type":"select","options":["Verified — supported by reliable records","Partially supported — some records reviewed","Owner-reported — not independently validated","Insufficient data — cannot assess"],"required":true},
      {"key":"scalability_findings","label":"Advisor assessment and rationale","type":"textarea","required":true,"prompt":"Explain growth constraints, owner dependency, repeatability, resilience and value drivers."},
      {"key":"scalability_opportunities","label":"Potential improvement opportunities","type":"textarea","prompt":"Identify ways to improve scalability, transferability, resilience or long-term business value."}
    ]}
  ]
}
$schema$::jsonb,
scoring_definition = '{"scale_min":1,"scale_max":5,"dimension_weighting":"equal","rollup":"unweighted average of rated dimensions only","missing_data_policy":"unrated dimensions are excluded, never assigned zero","rating_owner":"advisor","confidence_separate":true}'::jsonb,
published_at = COALESCE(tv.published_at, now())
FROM assessment_templates t
WHERE tv.template_id=t.id
  AND t.instrument_number=2
  AND tv.version_number=t.current_version;