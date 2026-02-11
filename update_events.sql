-- ============================================================================
-- Event Updates: Fix Ambiguous Events
-- ============================================================================
-- This script replaces two ambiguous events with clearer alternatives:
-- 1. "Surprise All-Hands" → Split into positive and negative versions
-- 2. "CEO Attended Conference" → Split into four specific tech trend variants
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Remove ambiguous "Surprise All-Hands" event
-- ============================================================================
DELETE FROM event_catalog WHERE (payload->>'id') = 'evt_r_009';

-- ============================================================================
-- 2. Add two clear all-hands events (positive and negative)
-- ============================================================================

-- Positive version: CEO praises team (triggers when CEO sentiment > 60)
INSERT INTO event_catalog (payload) VALUES ('{
  "id": "evt_r_009a",
  "title": "CEO Praise at All-Hands",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.03,
  "description": "The CEO called an unexpected all-hands to publicly recognize the team''s recent work. Morale spiked as people felt genuinely appreciated for their contributions.",
  "metric_effects": {
    "team_sentiment": 8,
    "ceo_sentiment": 3
  },
  "ceo_focus_shift": null,
  "forced_ticket_category": null,
  "quarter_restriction": null,
  "trigger_condition_override": "ceo_sentiment > 60"
}'::jsonb);

-- Negative version: Awkward fireside chat (triggers when CEO sentiment < 40)
INSERT INTO event_catalog (payload) VALUES ('{
  "id": "evt_r_009b",
  "title": "Awkward Fireside Chat",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.03,
  "description": "The CEO surprised everyone with an all-hands featuring their college roommate doing a ''fireside chat'' about growth hacking tactics from 2015. Team morale declined as an hour was lost to irrelevant platitudes.",
  "metric_effects": {
    "team_sentiment": -6,
    "ceo_sentiment": 2
  },
  "ceo_focus_shift": null,
  "forced_ticket_category": null,
  "quarter_restriction": null,
  "trigger_condition_override": "ceo_sentiment < 40"
}'::jsonb);

-- ============================================================================
-- 3. Remove ambiguous "CEO Attended Conference" event
-- ============================================================================
DELETE FROM event_catalog WHERE (payload->>'id') = 'evt_r_001';

-- ============================================================================
-- 4. Add four specific conference outcome events
-- ============================================================================

-- Variant A: CEO becomes obsessed with blockchain/Web3
INSERT INTO event_catalog (payload) VALUES ('{
  "id": "evt_r_001a",
  "title": "CEO Returns From Conference (Blockchain Phase)",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.02,
  "description": "The CEO attended a tech conference and became convinced that distributed ledger technology is the future. Strategic focus has shifted to whatever ''Web3'' means this quarter.",
  "metric_effects": {
    "ceo_sentiment": -3,
    "team_sentiment": -4
  },
  "ceo_focus_shift": "random",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'::jsonb);

-- Variant B: CEO confused about current architecture but certain it needs to change
INSERT INTO event_catalog (payload) VALUES ('{
  "id": "evt_r_001b",
  "title": "CEO Returns From Conference (Architecture Confusion Phase)",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.02,
  "description": "The CEO attended a three-day summit and is now certain the company needs to move to microservices. Or possibly to a monolith. They weren''t entirely sure which architecture we currently have, but are confident we should be doing the other one.",
  "metric_effects": {
    "tech_debt": 10,
    "ceo_sentiment": 3,
    "team_sentiment": -4
  },
  "ceo_focus_shift": "tech_debt",
  "forced_ticket_category": "tech_debt_reduction",
  "quarter_restriction": null
}'::jsonb);

-- Variant C: CEO wants AI in everything
INSERT INTO event_catalog (payload) VALUES ('{
  "id": "evt_r_001c",
  "title": "CEO Returns From Conference (AI Everything Phase)",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.02,
  "description": "The CEO returned from a conference completely energized about artificial intelligence. Every feature must now have ''AI'' in the title regardless of whether machine learning is involved.",
  "metric_effects": {
    "ceo_sentiment": 5,
    "team_sentiment": -3
  },
  "ceo_focus_shift": "self_serve",
  "forced_ticket_category": "self_serve_feature",
  "quarter_restriction": null
}'::jsonb);

-- Variant D: CEO obsessed with serverless
INSERT INTO event_catalog (payload) VALUES ('{
  "id": "evt_r_001d",
  "title": "CEO Returns From Conference (Serverless Phase)",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.02,
  "description": "The CEO spent three days listening to keynotes about serverless architecture and cloud-native design. Infrastructure is now the strategic priority and the CTO is experiencing mixed emotions.",
  "metric_effects": {
    "ceo_sentiment": 3,
    "cto_sentiment": 2,
    "tech_debt": 5
  },
  "ceo_focus_shift": "tech_debt",
  "forced_ticket_category": "infrastructure",
  "quarter_restriction": null
}'::jsonb);

COMMIT;

-- ============================================================================
-- Summary of Changes
-- ============================================================================
-- Removed: 2 events (evt_r_009, evt_r_001)
-- Added: 6 events (evt_r_009a, evt_r_009b, evt_r_001a-d)
-- Net change: +4 events
--
-- Key improvements:
-- 1. All-hands events now have clear positive/negative outcomes based on CEO mood
-- 2. Conference events specify exactly which tech trend the CEO latches onto
-- 3. Each event has explicit metric effects and focus shifts
-- 4. No more ambiguous "either improved or deteriorated" language
-- ============================================================================
