# PM Simulator — Tone Samples

One sample of each content type for tone review. Target voice: dry, ironic, briefly steeped in corporate jargon. The humor of someone who has survived too many sprint retros and now processes reality through a thin layer of detachment.

---

## 1. Ticket (with all 5 outcome narratives)

```json
{
  "id": "ss_014",
  "title": "Self-Serve Trial Extension Flow",
  "description": "Let users extend their own trials instead of emailing support. Should reduce churn at the conversion boundary. Engineering estimates 'two days, maybe three,' which in engineering time means a sprint.",
  "category": "self_serve_feature",
  "effort": 5,
  "primary_metric": "self_serve_growth",
  "primary_impact": { "success": [6, 10], "partial": [3, 5] },
  "secondary_metric": null,
  "secondary_impact": null,
  "tradeoff_metric": "tech_debt",
  "tradeoff_impact": { "success": [2, 4], "partial": [1, 2] },
  "outcomes": {
    "clear_success": "Trial extensions are live. Conversion rate ticked up 8% in the first week. Support tickets dropped. Nobody in leadership mentioned it, but the metrics dashboard updated itself, which is the product equivalent of a standing ovation.",
    "partial_success": "The extension flow works, mostly. Users on the annual plan get a weird error and the 'extend' button doesn't render on Safari. It's helping, just not as much as the projection deck suggested.",
    "unexpected_impact": "Trial extensions launched quietly. Conversions didn't move much, but enterprise prospects started citing 'product flexibility' in sales calls. Nobody can explain the causal chain. Nobody's trying to.",
    "soft_failure": "The flow is live but the UX is confusing enough that users are still emailing support to ask how to use it. Net effect on support ticket volume: approximately zero. The team is calling this a 'learning.'",
    "catastrophe": "A bug in the extension logic granted 847 users unlimited free trials. Finance found out before engineering did. The incident Slack channel has more participants than the last all-hands."
  }
}
```

---

## 2. Random Event

```json
{
  "id": "evt_r_003",
  "title": "CEO Attended a Conference",
  "trigger_type": "random",
  "trigger_chance_per_sprint": 0.08,
  "description": "The CEO spent three days at SaaS Connect and came back with a new vocabulary word ('product-led growth') and a conviction that the self-serve motion is 'critically underleveraged.' Previous enthusiasm for enterprise dominance has been archived without acknowledgment.",
  "metric_effects": { "ceo_sentiment": "reset_toward_50" },
  "ceo_focus_shift": "random",
  "forced_ticket_category": null
}
```

---

## 3. Threshold Event

```json
{
  "id": "evt_t_001",
  "title": "Engineering Revolt",
  "trigger_type": "threshold",
  "trigger_condition": "team_sentiment < 15",
  "description": "Three senior engineers requested a meeting with the CTO 'to discuss team health.' The meeting lasted two hours. A shared Google Doc titled 'Concerns' is circulating with 47 comments and a suggested edit that just says 'same.' Expect reduced velocity while the team processes their feelings and updates their LinkedIn profiles.",
  "metric_effects": {
    "sprint_capacity_modifier": -0.50,
    "sprint_capacity_modifier_duration": 1,
    "tech_debt": 5
  },
  "ceo_focus_shift": null,
  "forced_ticket_category": null
}
```

---

## 4. Sprint Retro Template

```json
{
  "id": "retro_mixed_01",
  "archetype": "mixed_bag",
  "conditions": {
    "has_success": true,
    "has_failure": true,
    "is_overbooked": false
  },
  "template": "A sprint of contradictions. {best_ticket_title} landed well — {best_ticket_outcome_summary}. Meanwhile, {worst_ticket_title} {worst_ticket_outcome_summary}. Net effect: the dashboard moved in multiple directions simultaneously, which is another way of saying nobody's sure if this was a good sprint or not. {metric_warning_sentence}"
}
```

Variable slots:

```json
{
  "metric_warning_sentences": {
    "tech_debt_rising": "Tech debt crept up again. The codebase is slowly becoming an archaeological site.",
    "tech_debt_stable": "Tech debt held steady, which is the best you can hope for in a universe governed by entropy.",
    "tech_debt_improved": "Tech debt actually decreased. Somewhere, a CTO smiled and didn't know why.",
    "team_morale_dropping": "Team morale is slipping. Standup energy has shifted from 'efficient' to 'perfunctory.'",
    "self_serve_stagnant": "Self-serve numbers haven't moved in a while. The dashboard is starting to look like a still life.",
    "sales_unhappy": "Sales has begun prefacing Slack messages with 'Just checking in on...' which is never just checking in."
  }
}
```

---

## 5. Quarterly Review Narrative

```json
{
  "id": "qr_solid_02",
  "rating": "solid",
  "raw_score_range": [55, 74],
  "template": "Solid quarter. {ceo_focus_metric} trended in the right direction, and stakeholder relationships show signs of maturity. Growth metrics are moving, though the rate could be described as 'measured' by optimists and 'slow' by the board. No major incidents, which in this environment counts as a quiet achievement. Areas to watch: {weakest_metric} has been flat for long enough that people are starting to notice. Keep the trajectory — Q{next_quarter} will be about converting momentum into something the board can screenshot."
}
```

One more — the bottom tier:

```json
{
  "id": "qr_below_02",
  "rating": "below_expectations",
  "raw_score_range": [0, 34],
  "template": "A challenging quarter. Execution was inconsistent, and the gap between intent and outcomes widened as the quarter progressed. {ceo_focus_metric} did not move the way leadership expected, and {worst_event_or_metric} created headwinds that compounded. Stakeholder confidence has eroded to a degree that will require deliberate repair. To be direct: the trajectory needs to change in Q{next_quarter}. This is not a quarter that will be referenced in future promotion discussions."
}
```

---

## 6. Product Pulse Narrative

```json
{
  "id": "pulse_mixed_01",
  "combination": {
    "churn": "positive",
    "support_load": "mixed",
    "customer_sentiment": "positive"
  },
  "narrative": "Retention is healthy — users who stay past month two are sticking around, and expansion revenue ticked up. Support volume is manageable but ticket complexity is increasing, which is the kind of signal that sounds fine until it isn't. Customer sentiment reads well. Survey responses include the phrase 'just works' with unusual frequency, which is either the highest compliment or a sign that nobody's paying close attention."
}
```

---

## 7. Year-End Review Narrative

```json
{
  "id": "yr_meets_02",
  "rating": "meets_expectations",
  "final_score_range": [45, 69],
  "template": "{player_role} demonstrated consistent effort and a willingness to engage with competing priorities across all four quarters. Growth metrics finished in a reasonable place, though the path there involved more volatility than leadership would have preferred. Stakeholder management was adequate — no critical relationships were damaged, and none were transformed. Tech debt remains an area of ongoing attention. In calibration, peers with comparable portfolios showed similar results, placing this performance within the expected band. Recommended development area: strategic prioritization under ambiguity. Overall rating: Meets Expectations, which is exactly what it sounds like."
}
```

And the top tier:

```json
{
  "id": "yr_exceeds_01",
  "rating": "exceeds_expectations",
  "final_score_range": [85, 100],
  "template": "An exceptional year by any reasonable measure, and several unreasonable ones. {strongest_metric} showed sustained growth that leadership has already referenced in board materials. Stakeholder trust was earned and maintained even through {hardest_quarter_or_event}. The product is in a measurably better position than it was twelve months ago, which sounds obvious but rarely survives contact with organizational reality. Calibration confirms: this is a top-tier outcome. Enjoy it. Next year's expectations will be set accordingly."
}
```

---

## 8. CEO Focus Shift Flavor Text

```json
[
  {
    "id": "ceo_shift_01",
    "trigger": "board_meeting",
    "text": "The CEO had coffee with a board member who asked 'pointed questions about the enterprise pipeline.' Previous enthusiasm for self-serve has been quietly reprioritized. Nobody's updated the strategy doc yet, but the Slack emoji usage has shifted."
  },
  {
    "id": "ceo_shift_02",
    "trigger": "linkedin_scroll",
    "text": "The CEO read a LinkedIn post by a founder they respect about 'the hidden cost of tech debt' and has developed a sudden interest in infrastructure investment. This will last between two weeks and forever."
  },
  {
    "id": "ceo_shift_03",
    "trigger": "competitor_news",
    "text": "A competitor announced a feature that sounds suspiciously similar to something on your roadmap six months ago. The CEO would like to 'revisit our self-serve strategy' at the earliest convenience, which means now."
  }
]
```

---

## 9. Metric Threshold Alerts

```json
[
  {
    "id": "alert_debt_critical",
    "metric": "tech_debt",
    "threshold": "mounting_to_critical",
    "direction": "worsening",
    "text": "Deploys are taking twice as long as last quarter. An engineer described the CI pipeline as 'aspirational.' The phrase 'technical bankruptcy' appeared in a Slack thread and nobody corrected it."
  },
  {
    "id": "alert_team_unhappy",
    "metric": "team_sentiment",
    "threshold": "neutral_to_unhappy",
    "direction": "worsening",
    "text": "The team retro was fifteen minutes of silence followed by someone saying 'I think we're all just tired.' The Confluence page for 'Team Norms' was last edited eight months ago. Someone has anonymously submitted a Glassdoor review."
  },
  {
    "id": "alert_sales_happy",
    "metric": "sales_sentiment",
    "threshold": "neutral_to_happy",
    "direction": "improving",
    "text": "The head of Sales mentioned you by name in a revenue call. Positively. This hasn't happened before and may not happen again, but for now, enjoy the reflected warmth of someone else's quota attainment."
  }
]
```

---

## 10. Quarter Opening Text

```json
[
  {
    "id": "q1_open_01",
    "quarter": 1,
    "text": "Q1. Fresh year, clean slate, cautiously optimistic OKRs that will age like milk. You're the new PM on the team. People are friendly in the way that means they haven't formed opinions yet. The CEO kicked off the quarter with an all-hands about '{ceo_focus_readable},' accompanied by a slide deck with the word 'leverage' on it four times. Your backlog is empty. It won't be for long."
  },
  {
    "id": "q2_open_01",
    "quarter": 2,
    "text": "Q2. The honeymoon quarter if Q1 went well. The reckoning quarter if it didn't. The CEO opened with a town hall about 'operational excellence,' which could mean anything but definitely means someone showed them a dashboard they didn't like. Your Q1 review is in. {q1_review_reference}. The backlog regenerates. The work continues."
  },
  {
    "id": "q3_open_01",
    "quarter": 3,
    "text": "Q3. The quiet quarter. Summer Fridays are technically not policy but practically are. Half the engineering team is on PTO at any given time, which your capacity reflects. The board wants a 'strong second half,' which is pressure disguised as encouragement. The CEO's focus has shifted to '{ceo_focus_readable}' for reasons that were explained in a Slack message you should probably reread."
  },
  {
    "id": "q4_open_01",
    "quarter": 4,
    "text": "Q4. The final quarter. Everything you do from here will be weighed, interpreted, and calibrated by people who weren't in the room when you made the decisions. Year-end reviews loom. The CEO wants '{ceo_focus_readable}' and the urgency is no longer theoretical. Make it count, or don't — the bell curve will have its say regardless."
  }
]
```
