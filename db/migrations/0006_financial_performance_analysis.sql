UPDATE assessment_template_versions tv
SET schema_definition = $schema$
{
  "instrument_number": 3,
  "template_name": "Financial Performance & Opportunity Analysis",
  "description": "An advisor-led financial diagnostic that establishes a documented baseline, tests financial performance and identifies measurable improvement opportunities. Financial values retain their source, period and evidence status.",
  "schema_status": "active",
  "sections": [
    {"id":"financial_basis","title":"1. Reporting basis & evidence","description":"Establish the period, accounting basis and reliability of the information before interpreting results.","questions":[
      {"key":"financial_period_start","label":"Financial period start date","type":"date","required":true},
      {"key":"financial_period_end","label":"Financial period end date","type":"date","required":true},
      {"key":"financial_accounting_basis","label":"Accounting basis","type":"select","options":["Cash basis","Accrual basis","Modified cash / hybrid","Not known"],"required":true},
      {"key":"financial_records_reviewed","label":"Records reviewed and source systems","type":"textarea","prompt":"List P&L, balance sheet, cash flow statements, general ledger, bank statements, tax returns, accounting system exports and dates reviewed."},
      {"key":"financial_data_quality","label":"Overall financial data quality","type":"select","options":["Verified — reconciled to reliable source records","Partially supported — selected records reviewed","Owner-reported — not independently validated","Insufficient data — cannot establish baseline"],"required":true},
      {"key":"financial_data_gaps","label":"Missing records, limitations and reconciliation issues","type":"textarea","prompt":"Record missing periods, inconsistent definitions, unreconciled balances, estimates or other limitations."}
    ]},
    {"id":"profitability","title":"2. Revenue & profitability baseline","description":"Capture reported results for the selected period. Enter values only when supported or clearly label estimates in the evidence notes.","questions":[
      {"key":"financial_revenue","label":"Total revenue for period (USD)","type":"number","unit":"USD"},
      {"key":"financial_direct_costs","label":"Direct costs / cost of goods sold (USD)","type":"number","unit":"USD"},
      {"key":"financial_gross_profit","label":"Gross profit (USD), if reported","type":"number","unit":"USD"},
      {"key":"financial_payroll","label":"Total payroll and employee-related costs (USD)","type":"number","unit":"USD"},
      {"key":"financial_operating_expenses","label":"Other operating expenses (USD)","type":"number","unit":"USD"},
      {"key":"financial_ebitda","label":"Reported EBITDA (USD), if available","type":"number","unit":"USD"},
      {"key":"financial_net_income","label":"Reported net income (USD), if available","type":"number","unit":"USD"},
      {"key":"financial_owner_compensation","label":"Owner compensation and benefits included in expenses (USD)","type":"number","unit":"USD"},
      {"key":"financial_profitability_notes","label":"Profitability interpretation and normalization notes","type":"textarea","prompt":"Explain reported versus adjusted results, owner compensation normalization, non-recurring items, related-party costs, seasonality and any limitations. Do not present unverified adjustments as fact."}
    ]},
    {"id":"cash_working_capital","title":"3. Cash flow & working capital","description":"Separate accounting profitability from cash generation and liquidity.","questions":[
      {"key":"financial_cash_balance","label":"Cash and cash equivalents at period end (USD)","type":"number","unit":"USD"},
      {"key":"financial_operating_cash_flow","label":"Net operating cash flow for period (USD)","type":"number","unit":"USD"},
      {"key":"financial_accounts_receivable","label":"Accounts receivable at period end (USD)","type":"number","unit":"USD"},
      {"key":"financial_inventory","label":"Inventory at period end (USD), if applicable","type":"number","unit":"USD"},
      {"key":"financial_accounts_payable","label":"Accounts payable at period end (USD)","type":"number","unit":"USD"},
      {"key":"financial_current_debt","label":"Current debt and near-term maturities (USD)","type":"number","unit":"USD"},
      {"key":"financial_cash_conversion","label":"Cash conversion / collection cycle observations","type":"textarea","prompt":"Discuss receivable aging, collection timing, inventory turns, supplier terms, deposits, deferred revenue and seasonality."},
      {"key":"financial_liquidity_risks","label":"Liquidity risks and cash-flow pressure points","type":"textarea","prompt":"Identify timing mismatches, covenant concerns, concentration of payments, seasonal troughs or reliance on owner funding."}
    ]},
    {"id":"revenue_quality","title":"4. Revenue quality & customer economics","description":"Assess durability, concentration and predictability of revenue.","questions":[
      {"key":"financial_recurring_revenue_pct","label":"Recurring / contracted revenue (% of total), if known","type":"number","unit":"percent"},
      {"key":"financial_top_customer_pct","label":"Largest customer (% of revenue), if known","type":"number","unit":"percent"},
      {"key":"financial_top_five_pct","label":"Top five customers (% of revenue), if known","type":"number","unit":"percent"},
      {"key":"financial_revenue_growth","label":"Revenue growth versus comparable prior period (%), if known","type":"number","unit":"percent"},
      {"key":"financial_revenue_quality_notes","label":"Revenue durability, concentration and margin observations","type":"textarea","prompt":"Discuss recurring versus transactional revenue, customer retention, contract terms, backlog, seasonality, pricing, discounts and customer profitability."}
    ]},
    {"id":"cost_structure","title":"5. Cost structure & operating leverage","description":"Understand fixed and variable cost behavior and the economics of scaling.","questions":[
      {"key":"financial_fixed_costs","label":"Estimated fixed operating costs for period (USD), if known","type":"number","unit":"USD"},
      {"key":"financial_variable_costs","label":"Estimated variable operating costs for period (USD), if known","type":"number","unit":"USD"},
      {"key":"financial_payroll_pct","label":"Payroll as a percentage of revenue (%), if known","type":"number","unit":"percent"},
      {"key":"financial_cost_structure_notes","label":"Cost drivers, capacity utilization and operating leverage","type":"textarea","prompt":"Identify major cost categories, step-costs, underused capacity, vendor commitments, overtime, rework and opportunities to scale without proportional cost."}
    ]},
    {"id":"advisor_analysis","title":"6. Advisor findings & improvement opportunities","description":"Translate the baseline into evidence-based conclusions without overstating precision.","questions":[
      {"key":"financial_key_findings","label":"Key financial findings","type":"textarea","required":true,"prompt":"Separate verified facts, owner-reported information and advisor interpretation. Explain trends and material drivers."},
      {"key":"financial_root_causes","label":"Likely drivers / root causes requiring validation","type":"textarea","prompt":"Identify the underlying causes of margin, cash, cost or revenue issues. Mark hypotheses that need further testing."},
      {"key":"financial_opportunities","label":"Financial improvement opportunities","type":"textarea","required":true,"prompt":"Describe opportunity, financial mechanism, expected direction of impact, assumptions and data needed to quantify."},
      {"key":"financial_risks","label":"Financial risks and downside exposure","type":"textarea","prompt":"Identify material risks, potential cash impacts, dependencies and urgency."},
      {"key":"financial_next_steps","label":"Additional analysis or evidence required","type":"textarea","prompt":"List reconciliations, schedules, customer/product margin analysis, cash forecast or other work needed before quantifying recommendations."},
      {"key":"financial_advisor_confidence","label":"Advisor confidence in this analysis","type":"select","options":["High — sufficient reliable evidence for current conclusions","Moderate — useful baseline with material gaps","Low — preliminary hypotheses only","Insufficient — defer conclusions pending evidence"],"required":true}
    ]}
  ],
  "calculation_policy": "Do not calculate derived financial ratios or adjusted earnings from incomplete or mixed-basis inputs. Any future calculations must be deterministic, disclose formulas, periods, units and source values, and preserve evidence status. Blank values are unknown, not zero."
}
$schema$::jsonb,
scoring_definition = '{"calculation_policy":"No inferred or silent adjustments. Preserve period, currency, source and evidence status.","missing_data_policy":"Blank is unknown, never zero.","rating_owner":"advisor","financial_values":"source-attributed"}'::jsonb,
published_at = COALESCE(tv.published_at, now())
FROM assessment_templates t
WHERE tv.template_id=t.id AND t.instrument_number=3 AND tv.version_number=t.current_version;