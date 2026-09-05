-- Breakfast Paradox: enforce exactly one archetype result per response.
--
-- Without this, a retried/duplicated insert (e.g. a flaky network retry
-- around the same submission) could theoretically leave one
-- survey_responses row with two archetype_results rows, quietly
-- inflating population/dashboard counts. The existing
-- (survey_version, primary_archetype) index helps querying but does
-- nothing to prevent that.

create unique index if not exists archetype_results_response_id_key
  on archetype_results (response_id);
