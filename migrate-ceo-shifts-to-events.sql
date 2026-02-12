-- Migration: Convert CEO Focus Shifts to Random Events
-- This migration converts CEO focus shift narratives into standalone random events
-- that appear in the "Events This Sprint" list instead of a separate section.

-- First, update all existing events to remove ceo_focus_shift triggers
-- (Set them to null where they currently have values)
UPDATE event_catalog
SET payload = jsonb_set(payload, '{ceo_focus_shift}', 'null'::jsonb)
WHERE payload->>'group' = 'random_events'
  AND payload->>'ceo_focus_shift' IS NOT NULL
  AND payload->>'ceo_focus_shift' != 'null';

UPDATE event_catalog
SET payload = jsonb_set(payload, '{ceo_focus_shift}', 'null'::jsonb)
WHERE payload->>'group' = 'threshold_events'
  AND payload->>'ceo_focus_shift' IS NOT NULL
  AND payload->>'ceo_focus_shift' != 'null';

-- Insert new CEO Focus Shift random events
INSERT INTO event_catalog (id, payload) VALUES
('evt_r_036', '{
  "id": "evt_r_036",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "The board asked pointed questions about enterprise pipeline and willingness to fund a dedicated segment. The CEO has refocused on landing larger contracts.",
  "metric_effects": {},
  "ceo_focus_shift": "enterprise",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_037', '{
  "id": "evt_r_037",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "A keynote speaker spent thirty minutes explaining why infrastructure investment is strategically important. The CEO is now convinced this applies here.",
  "metric_effects": {},
  "ceo_focus_shift": "tech_debt",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_038', '{
  "id": "evt_r_038",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "A competitor''s self-serve metrics are growing faster. The CEO has decided this is the only metric that matters.",
  "metric_effects": {},
  "ceo_focus_shift": "self_serve",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_039', '{
  "id": "evt_r_039",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "Someone with a large following posted about technical debt and the CEO spent two hours reading replies. Strategy has shifted accordingly.",
  "metric_effects": {},
  "ceo_focus_shift": "tech_debt",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_040', '{
  "id": "evt_r_040",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "The largest customer demanded a feature that only benefits enterprise deployments. The CEO decided to optimize the entire roadmap around retention.",
  "metric_effects": {},
  "ceo_focus_shift": "enterprise",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_041', '{
  "id": "evt_r_041",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "The quarterly analysis showed that self-serve users have the highest NPS. The CEO now believes this segment is the path to scale.",
  "metric_effects": {},
  "ceo_focus_shift": "self_serve",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_042', '{
  "id": "evt_r_042",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "For reasons that cannot be adequately explained, the CEO has become obsessed with reducing technical debt. Pray it is temporary.",
  "metric_effects": {},
  "ceo_focus_shift": "tech_debt",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_043', '{
  "id": "evt_r_043",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "Board members questioned whether the business model could scale without a self-serve product. The CEO has pivoted completely.",
  "metric_effects": {},
  "ceo_focus_shift": "self_serve",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_044', '{
  "id": "evt_r_044",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "A enterprise customer mentioned they could not recommend the product to peers due to stability concerns. Technical debt is now a revenue risk.",
  "metric_effects": {},
  "ceo_focus_shift": "tech_debt",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_045', '{
  "id": "evt_r_045",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "A successful founder described their path to profitability through self-serve adoption. The CEO believes this is the exact blueprint to follow.",
  "metric_effects": {},
  "ceo_focus_shift": "self_serve",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_046', '{
  "id": "evt_r_046",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "An acquihire announcement has the CEO convinced that enterprise focus leads to exits. The company''s strategy has shifted accordingly.",
  "metric_effects": {},
  "ceo_focus_shift": "enterprise",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_047', '{
  "id": "evt_r_047",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "Enterprise customers have three times the lifetime value. This data point now drives all strategic decisions.",
  "metric_effects": {},
  "ceo_focus_shift": "enterprise",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_048', '{
  "id": "evt_r_048",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "The CEO saw their child using the free tier and now believes consumer-friendly design is the secret to dominance. Priorities have been rearranged.",
  "metric_effects": {},
  "ceo_focus_shift": "self_serve",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_049', '{
  "id": "evt_r_049",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "A competitor raised a large Series B focusing on enterprise. The CEO has responded by shifting all resources toward competing in that segment.",
  "metric_effects": {},
  "ceo_focus_shift": "enterprise",
  "forced_ticket_category": null,
  "quarter_restriction": null
}'),
('evt_r_050', '{
  "id": "evt_r_050",
  "title": "CEO Focus Shift",
  "group": "random_events",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.12,
  "description": "No clear reason exists for the strategic pivot that just occurred. Assume the CEO read something on the internet and move forward.",
  "metric_effects": {},
  "ceo_focus_shift": "random",
  "forced_ticket_category": null,
  "quarter_restriction": null
}')
ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload;

-- Optional: Delete the old ceo_focus_shifts group (they're no longer used by the application)
-- Uncomment the line below if you want to remove them completely
-- DELETE FROM event_catalog WHERE payload->>'group' = 'ceo_focus_shifts';
