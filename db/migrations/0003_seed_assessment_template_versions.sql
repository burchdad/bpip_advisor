INSERT INTO assessment_template_versions (template_id,version_number,schema_definition,scoring_definition,published_at)
SELECT t.id,t.current_version,
 jsonb_build_object('instrument_number',t.instrument_number,'template_name',t.template_name,'description',t.template_description,'sections','[]'::jsonb,'schema_status','structure_pending'),
 '{}'::jsonb,now()
FROM assessment_templates t
WHERE t.active=true
ON CONFLICT (template_id,version_number) DO NOTHING;