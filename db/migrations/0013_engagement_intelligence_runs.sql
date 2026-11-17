create table if not exists engagement_intelligence_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  engagement_id uuid not null references engagements(id) on delete cascade,
  run_type text not null default 'evidence_synthesis'
    check (run_type in ('evidence_synthesis','executive_diagnosis','opportunity_review','executive_report')),
  run_status text not null default 'draft'
    check (run_status in ('draft','generating','generated','failed','advisor_reviewed','approved')),
  source_snapshot jsonb not null default '{}'::jsonb,
  analysis_output jsonb not null default '{}'::jsonb,
  source_assessment_count integer not null default 0 check (source_assessment_count >= 0),
  source_response_count integer not null default 0 check (source_response_count >= 0),
  prompt_version text,
  model_provider text,
  model_id text,
  generation_error text,
  created_by text,
  reviewed_by text,
  reviewed_at timestamptz,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intelligence_runs_engagement
  on engagement_intelligence_runs (organization_id, engagement_id, created_at desc);

create index if not exists idx_intelligence_runs_status
  on engagement_intelligence_runs (organization_id, run_status, created_at desc);
