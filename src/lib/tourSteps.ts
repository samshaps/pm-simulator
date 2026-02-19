export interface TourStep {
  id: string;
  title: string;
  body: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const SPRINT_PLANNING_STEPS: TourStep[] = [
  {
    id: 'backlog',
    title: 'Your Backlog',
    body: 'Each card is a ticket: a unit of work with a point cost and a category. Click one to commit it to the sprint.',
    placement: 'right'
  },
  {
    id: 'committed',
    title: 'Committed Work',
    body: "Tickets you've committed appear here. You can remove them before starting the sprint.",
    placement: 'left'
  },
  {
    id: 'capacity-bar',
    title: 'Sprint Capacity',
    body: 'The green zone is your safe capacity. The cross-hatched zone is stretch—risky but possible. Staying in the green avoids overbooking penalties.',
    placement: 'bottom'
  },
  {
    id: 'metrics',
    title: 'Performance Metrics',
    body: "These are your key health indicators. The shaded preview range shows the potential swing from the tickets you've committed.",
    placement: 'left'
  }
];

export const SPRINT_RETRO_STEPS: TourStep[] = [
  {
    id: 'retro-events',
    title: 'Sprint Events',
    body: 'Unexpected events can fire each sprint—helping or hurting your metrics. They show up here alongside key insights from the sprint.',
    placement: 'right'
  },
  {
    id: 'retro-outcomes',
    title: 'Ticket Resolution',
    body: 'Each ticket resolves as a success, partial, or failure. The impact narrative explains what happened and why.',
    placement: 'left'
  },
  {
    id: 'retro-metrics',
    title: 'Metric Changes',
    body: 'Final metric deltas for the sprint are revealed here. Watch for anything drifting into the red.',
    placement: 'left'
  }
];

export const TOTAL_TOUR_STEPS = SPRINT_PLANNING_STEPS.length + SPRINT_RETRO_STEPS.length; // 7

export const POWERUP_TIP_STEP: TourStep = {
  id: 'active-modifiers',
  title: 'Powerups & Events',
  body: "Starting this sprint, random events can fire and create modifiers—capacity boosts, extra risks, CEO surprises. They'll appear right here when active.",
  placement: 'bottom'
};
