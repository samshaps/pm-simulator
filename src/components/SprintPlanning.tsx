'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SprintPlanning.module.css';
import TicketTile from './TicketTile';
import CapacityBar from './CapacityBar';
import MetricBarWithPreview from './MetricBarWithPreview';
import ActiveModifiers from './ActiveModifiers';

interface Ticket {
  id: string;
  title: string;
  effort: number;
  category: string;
  categoryClass: string;
  description: string;
  is_mandatory?: boolean;
  isMandatory?: boolean;
  isCEOAligned?: boolean;
  hackathon_boosted?: boolean;
  isHackathonBoosted?: boolean;
  outcomes?: Record<string, string>;
  primary_impact?: {
    success: [number, number];
    partial: [number, number];
  };
  expectedImpact?: string;
  impactMagnitude?: number;
  impactConfidence?: number;
}

interface CommittedTicket {
  id: string;
  title: string;
  effort: number;
  category: string;
  categoryClass: string;
}

interface MetricsState {
  team_sentiment: number;
  ceo_sentiment: number;
  sales_sentiment: number;
  cto_sentiment: number;
  self_serve_growth: number;
  enterprise_growth: number;
  tech_debt: number;
  nps: number;
  velocity: number;
}

interface CapacityModifier {
  event_id: string;
  delta: number;
  remaining_sprints: number;
  title?: string;
  description?: string;
}

interface GameState {
  game: {
    id: string;
    difficulty: string;
    current_quarter: number;
    current_sprint: number;
    metrics_state: MetricsState;
  };
  sprint: {
    id: string;
    effective_capacity: number;
    backlog: Ticket[];
    committed: any[];
  };
  quarter: {
    ceo_focus: string;
    ceo_focus_shift_narrative?: string | null;
  };
  ceo_focus_shift?: {
    narrative?: string | null;
    from?: string | null;
    to?: string | null;
    kind?: string | null;
  } | null;
  capacity_modifiers?: CapacityModifier[];
  total_capacity_delta?: number;
}

const categoryToClass: Record<string, string> = {
  'self_serve_feature': 'catSelfServe',
  'enterprise_feature': 'catEnterprise',
  'sales_request': 'catSales',
  'tech_debt_reduction': 'catTechDebt',
  'ux_improvement': 'catUx',
  'monetization': 'catMonetization',
  'infrastructure': 'catInfra',
  'moonshot': 'catMoonshot'
};

const ceoFocusToCategory: Record<string, string> = {
  'self_serve': 'self_serve_feature',
  'enterprise': 'enterprise_feature',
  'tech_debt': 'tech_debt_reduction'
};

const loadingMessages = [
  'Syncing with stakeholders...',
  'Updating the JIRA board nobody reads...',
  'Waiting for CI/CD...',
  'Your manager is typing...',
  'Calibrating expectations downward...',
  'Refreshing LinkedIn to see if anyone noticed...',
  'Resolving a merge conflict in the roadmap...',
  'Asking ChatGPT to write your standup notes...',
  'Convincing the designer this is MVP...',
  'Calculating the blast radius...',
  'Checking if anyone read the PRD...',
  'Pretending to understand the architecture diagram...',
  'Running it by legal, just in case...',
  'Sprint planning is easy, they said...',
  'Deploying to production on a Friday...',
  'Explaining to sales why we can\'t just "make it faster"...',
  'Waiting for design to finish "one more iteration"...',
  'Reprioritizing the backlog for the 47th time...',
  'Adding "synergy" to the slide deck...',
  'Scheduling a meeting to discuss the meeting...',
  'Rescheduling the 1:1 you forgot about...',
  'Sending a Slack message that could have been an email...',
  'Searching for the GitHub issue you closed by accident...',
  'Convincing engineering this is "technically possible"...',
  'Telling the CEO "we\'re on track" with a straight face...',
  'Googling "how to write user stories"...',
  'Merging 17 calendar invites into one...',
  'Debugging why staging looks different from prod...',
  'Explaining agile to someone who thinks it means "no planning"...',
  'Updating the status in 5 different tools...',
  'Converting coffee into roadmap updates...',
  'Finding a meeting room that actually has a working HDMI cable...',
  'Pretending the demo won\'t break...',
  'Writing release notes nobody will read...',
  'Reconciling "MVP" with what sales already promised...',
  'Changing "urgent" to "high priority" in the backlog...',
  'Estimating in story points to avoid accountability...',
  'Asking "any blockers?" for the third time this week...',
  'Renaming tickets to sound more important...',
  'Hoping nobody asks about the technical debt...',
  'Translating "the customers want this" into "sales wants this"...'
];

const metricLabelMap: Record<keyof MetricsState, string> = {
  team_sentiment: 'Team Sentiment',
  ceo_sentiment: 'CEO Sentiment',
  sales_sentiment: 'Sales Sentiment',
  cto_sentiment: 'CTO Sentiment',
  self_serve_growth: 'Self-Serve Growth',
  enterprise_growth: 'Enterprise Growth',
  tech_debt: 'Tech Debt',
  nps: 'NPS',
  velocity: 'Velocity'
};

const pickRandomMessages = (messages: string[], count: number) => {
  const pool = [...messages];
  const picked: string[] = [];
  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
};

export default function SprintPlanning() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);
  const [committedTickets, setCommittedTickets] = useState<CommittedTicket[]>([]);
  const [previousDeltas, setPreviousDeltas] = useState<Record<string, number> | null>(null);
  const [loadingSequence, setLoadingSequence] = useState<string[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [showCeoShift, setShowCeoShift] = useState(true);
  const [ceoShiftOverride, setCeoShiftOverride] = useState<GameState['ceo_focus_shift']>(null);
  const [eventPopupEvents, setEventPopupEvents] = useState<Array<{ title: string; description: string }>>([]);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'effort-asc' | 'effort-desc' | 'category' | 'impact-desc' | 'none'>('effort-asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hoveredTicketId, setHoveredTicketId] = useState<string | null>(null);
  const [metricPreviews, setMetricPreviews] = useState<Record<string, { min: number; max: number; isPositive: boolean }>>({});
  const [committedPreviews, setCommittedPreviews] = useState<Record<string, Record<string, { min: number; max: number; isPositive: boolean }>>>({});

  useEffect(() => {
    // Fetch active sprint data
    fetch('/api/sprint/active')
      .then(res => res.json())
      .then(data => {
        setGameState(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load sprint data:', err);
        setIsLoading(false);
      });

    // Check for metric deltas from previous sprint's retro
    const storedRetro = sessionStorage.getItem('lastRetro');
    if (storedRetro) {
      const retro = JSON.parse(storedRetro);
      if (retro.retro?.metric_deltas) {
        setPreviousDeltas(retro.retro.metric_deltas);
        // Clear it so it doesn't show on subsequent sprints
        sessionStorage.removeItem('lastRetro');
      }
      if (Array.isArray(retro.retro?.events) && retro.retro.events.length > 0) {
        setEventPopupEvents(
          retro.retro.events.map((event: any) => ({
            title: event.title,
            description: event.description
          }))
        );
        setShowEventPopup(true);
      }
      if (retro.ceo_focus_shift) {
        setCeoShiftOverride(retro.ceo_focus_shift);
      }
    }

    // Handle browser back button - prevent it and redirect to home
    const handlePopState = () => {
      // Push state again to prevent actual back navigation
      window.history.pushState(null, '', window.location.pathname);
      // Then navigate to home
      window.location.href = '/';
    };

    // Push initial state to trap back button
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);


  useEffect(() => {
    if (!isCommitting) return;
    const sequence = pickRandomMessages(loadingMessages, 4);
    setLoadingSequence(sequence);
    setLoadingIndex(0);
    const interval = window.setInterval(() => {
      setLoadingIndex((index) => (index + 1) % sequence.length);
    }, 1500);
    return () => window.clearInterval(interval);
  }, [isCommitting]);

  useEffect(() => {
    if (!gameState) return;
    if (gameState.game.current_sprint === 1) {
      setShowCeoShift(true);
    }

    // Auto-add mandatory tickets to sprint
    const mandatoryTickets = gameState.sprint.backlog.filter(t => t.is_mandatory);
    if (mandatoryTickets.length > 0) {
      const mandatoryCommitted = mandatoryTickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        effort: ticket.effort,
        category: ticket.category,
        categoryClass: categoryToClass[ticket.category] || 'catDefault'
      }));
      setCommittedTickets(mandatoryCommitted);
    }
  }, [gameState]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.customSelect}`)) {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading || !gameState) {
    return null; // Don't show default loading - home page loading overlay handles it
  }

  const metrics = gameState.game.metrics_state;

  const sprintCapacity = Math.floor(gameState.sprint.effective_capacity);
  const stretchCapacity = Math.floor(sprintCapacity * 1.25);

  // Estimate "lost" capacity due to low morale
  // Base capacity assumes ~50 team sentiment as baseline
  const baseSentiment = 50;
  const sentimentDiff = Math.max(0, baseSentiment - metrics.team_sentiment);
  const lostCapacityEstimate = Math.floor((sentimentDiff / 50) * sprintCapacity * 0.3); // Up to 30% capacity loss
  const displayCapacity = sprintCapacity + lostCapacityEstimate;

  const usedCapacity = committedTickets.reduce((sum, t) => sum + t.effort, 0);
  const capacityPercent = (usedCapacity / stretchCapacity) * 100;
  const capacityLimitPercent = (sprintCapacity / stretchCapacity) * 100;
  const lostCapacityPercent = (lostCapacityEstimate / stretchCapacity) * 100;
  const ceoFocusCategory = ceoFocusToCategory[gameState.quarter.ceo_focus] || '';

  // Check if ticket is CEO-aligned
  const isTicketCEOAligned = (ticketCategory: string) => {
    // Sales requests align with enterprise focus
    if (gameState.quarter.ceo_focus === 'enterprise' && ticketCategory === 'sales_request') {
      return true;
    }
    if (gameState.quarter.ceo_focus === 'tech_debt' && ticketCategory === 'infrastructure') {
      return true;
    }
    return ticketCategory === ceoFocusCategory;
  };

  // Calculate impact magnitude and confidence from primary_impact data
  const calculateImpact = (ticket: any): { magnitude: number; confidence: number; emoji: string } => {
    if (!ticket.primary_impact) {
      return { magnitude: 0, confidence: 0, emoji: '' };
    }

    const successRange = ticket.primary_impact.success || [0, 0];
    const partialRange = ticket.primary_impact.partial || [0, 0];

    // Calculate average expected impact (weighted: 60% success, 40% partial)
    const successAvg = (Math.abs(successRange[0]) + Math.abs(successRange[1])) / 2;
    const partialAvg = (Math.abs(partialRange[0]) + Math.abs(partialRange[1])) / 2;
    const weightedAvg = successAvg * 0.6 + partialAvg * 0.4;

    // Map to magnitude tiers: 0-4 = low (🔥), 5-8 = medium (🔥🔥), 9+ = high (🔥🔥🔥)
    let magnitude = 1;
    let emoji = '🔥';
    if (weightedAvg >= 9) {
      magnitude = 3;
      emoji = '🔥🔥🔥';
    } else if (weightedAvg >= 5) {
      magnitude = 2;
      emoji = '🔥🔥';
    }

    // Calculate confidence based on range width (tighter range = higher confidence)
    const successWidth = Math.abs(successRange[1] - successRange[0]);
    const partialWidth = Math.abs(partialRange[1] - partialRange[0]);
    const avgWidth = (successWidth + partialWidth) / 2;

    // Map width to confidence: 0-3 = high (1.0), 4-6 = medium (0.7), 7+ = low (0.5)
    let confidence = 1.0;
    if (avgWidth >= 7) {
      confidence = 0.5;
    } else if (avgWidth >= 4) {
      confidence = 0.7;
    }

    return { magnitude, confidence, emoji };
  };

  let backlogTickets: Ticket[] = gameState.sprint.backlog.map(ticket => {
    const impact = calculateImpact(ticket);
    return {
      ...ticket,
      categoryClass: categoryToClass[ticket.category] || 'catDefault',
      isMandatory: ticket.is_mandatory,
      isCEOAligned: isTicketCEOAligned(ticket.category),
      isHackathonBoosted: ticket.hackathon_boosted,
      expectedImpact: impact.emoji,
      impactMagnitude: impact.magnitude,
      impactConfidence: impact.confidence
    };
  });

  // Apply category filter
  if (filterCategory !== 'all') {
    backlogTickets = backlogTickets.filter(ticket => ticket.category === filterCategory);
  }

  // Apply sorting
  if (sortBy === 'effort-asc') {
    backlogTickets = [...backlogTickets].sort((a, b) => a.effort - b.effort);
  } else if (sortBy === 'effort-desc') {
    backlogTickets = [...backlogTickets].sort((a, b) => b.effort - a.effort);
  } else if (sortBy === 'category') {
    backlogTickets = [...backlogTickets].sort((a, b) => a.category.localeCompare(b.category));
  } else if (sortBy === 'impact-desc') {
    backlogTickets = [...backlogTickets].sort((a, b) => {
      const aMag = a.impactMagnitude || 0;
      const bMag = b.impactMagnitude || 0;
      return bMag - aMag;
    });
  }

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(gameState.sprint.backlog.map(t => t.category)));

  // Format category display name
  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ');
  };

  // Get display value for filter
  const getFilterDisplayValue = () => {
    if (filterCategory === 'all') return '✓ All Categories';
    return formatCategoryName(filterCategory);
  };

  // Get display value for sort
  const getSortDisplayValue = () => {
    const sortLabels: Record<string, string> = {
      'effort-asc': 'Points (Low to High)',
      'effort-desc': 'Points (High to Low)',
      'category': 'Category',
      'impact-desc': 'Impact (High to Low)',
      'none': 'Random'
    };
    return sortLabels[sortBy] || 'Points (Low to High)';
  };

  // Calculate metric preview for a single ticket
  const calculateTicketPreview = (ticket: Ticket): Record<string, { min: number; max: number; isPositive: boolean }> => {
    if (!ticket.primary_impact) return {};

    const previews: Record<string, { min: number; max: number; isPositive: boolean }> = {};

    // Get success and partial ranges from ticket data
    const successRange = ticket.primary_impact.success || [0, 0];
    const partialRange = ticket.primary_impact.partial || [0, 0];

    // Calculate best case (clear success)
    const bestCase = Math.max(successRange[0], successRange[1]);

    // Calculate worst case (catastrophe/failure)
    // Based on src/lib/game/simulate.ts failure logic:
    // - soft_failure: -6 to -2 on primary metric
    // - catastrophe: -18 to -10 on primary metric
    // We use -12 as a reasonable worst-case estimate (average of catastrophe range)
    const worstCase = -12;

    // Determine if net positive based on expected weighted outcome
    // Assuming ~70% success, ~20% partial, ~10% failure probability
    const partialImpact = Math.min(partialRange[0], partialRange[1]);
    const expectedImpact = (bestCase * 0.7) + (partialImpact * 0.2) + (worstCase * 0.1);
    const isPositive = expectedImpact > 0;

    // Map to specific metrics based on category
    if (ticket.category === 'self_serve_feature') {
      previews.self_serve_growth = {
        min: worstCase,
        max: bestCase,
        isPositive
      };
      previews.team_sentiment = {
        min: Math.min(worstCase * 0.5, -3), // Failures hurt team morale
        max: bestCase * 0.3,
        isPositive: bestCase * 0.3 > Math.abs(worstCase * 0.5)
      };
    } else if (ticket.category === 'enterprise_feature' || ticket.category === 'sales_request') {
      previews.enterprise_growth = {
        min: worstCase,
        max: bestCase,
        isPositive
      };
      previews.ceo_sentiment = {
        min: worstCase * 0.4, // CEO cares about failures
        max: bestCase * 0.5,
        isPositive: bestCase * 0.5 > Math.abs(worstCase * 0.4)
      };
    } else if (ticket.category === 'tech_debt_reduction' || ticket.category === 'infrastructure') {
      // For tech debt: success reduces it, failure increases it
      previews.tech_debt = {
        min: -bestCase, // Best case: tech debt goes down
        max: Math.abs(worstCase * 0.3), // Worst case: tech debt goes up
        isPositive: false // Lower tech debt is better
      };
      previews.cto_sentiment = {
        min: worstCase * 0.3,
        max: bestCase,
        isPositive
      };
    }

    return previews;
  };

  // Convert metric key to display name
  const metricKeyToDisplayName = (key: string): string => {
    const mapping: Record<string, string> = {
      'team_sentiment': 'Team Sentiment',
      'ceo_sentiment': 'CEO Sentiment',
      'sales_sentiment': 'Sales Sentiment',
      'cto_sentiment': 'CTO Sentiment',
      'self_serve_growth': 'Self-Serve Growth',
      'enterprise_growth': 'Enterprise Growth',
      'tech_debt': 'Tech Debt',
      'nps': 'NPS',
      'velocity': 'Velocity'
    };
    return mapping[key] || key;
  };

  // Combine committed and hover previews
  const getCombinedPreviews = (): Record<string, { min: number; max: number; isPositive: boolean }> => {
    const combined: Record<string, { min: number; max: number; isPositive: boolean }> = {};

    // Start with base metrics
    const baseMetrics = { ...metrics };

    // Add all committed ticket impacts
    Object.values(committedPreviews).forEach(ticketPreviews => {
      Object.entries(ticketPreviews).forEach(([metricKey, preview]) => {
        if (!combined[metricKey]) {
          combined[metricKey] = { min: 0, max: 0, isPositive: preview.isPositive };
        }
        combined[metricKey].min += preview.min;
        combined[metricKey].max += preview.max;
      });
    });

    // Add hover preview on top
    Object.entries(metricPreviews).forEach(([metricKey, preview]) => {
      if (!combined[metricKey]) {
        combined[metricKey] = { min: 0, max: 0, isPositive: preview.isPositive };
      }
      combined[metricKey].min += preview.min;
      combined[metricKey].max += preview.max;
    });

    // Convert deltas to absolute values and map to display names
    const result: Record<string, { min: number; max: number; isPositive: boolean }> = {};
    Object.keys(combined).forEach(metricKey => {
      const baseValue = baseMetrics[metricKey as keyof MetricsState] || 0;
      const displayName = metricKeyToDisplayName(metricKey);

      const calculatedMin = baseValue + combined[metricKey].min;
      const calculatedMax = baseValue + combined[metricKey].max;

      // Cross-hatch should overlay the current purple bar
      // Start from current value and extend to show potential range
      // This creates a visual that says "you're here, could go from here to there"
      const rangeMin = Math.min(calculatedMin, calculatedMax);
      const rangeMax = Math.max(calculatedMin, calculatedMax);

      const finalMin = Math.max(0, Math.min(100, Math.min(baseValue, rangeMin)));
      const finalMax = Math.max(0, Math.min(100, Math.max(baseValue, rangeMax)));

      result[displayName] = {
        // Start at current value OR the lowest possible outcome, whichever is lower
        min: finalMin,
        // Extend to the highest possible outcome
        max: finalMax,
        isPositive: combined[metricKey].isPositive
      };

      // DEBUG: Log calculation for each metric
      console.log(`📊 ${displayName}:`, {
        baseValue,
        combinedMin: combined[metricKey].min,
        combinedMax: combined[metricKey].max,
        calculatedMin,
        calculatedMax,
        rangeMin,
        rangeMax,
        finalMin,
        finalMax
      });
    });

    return result;
  };

  // Calculate metric previews when hovering over a ticket
  const handleTicketHover = (ticketId: string) => {
    setHoveredTicketId(ticketId);
    const ticket = backlogTickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.primary_impact) return;

    const previews = calculateTicketPreview(ticket);
    setMetricPreviews(previews);
  };

  const handleTicketHoverEnd = () => {
    setHoveredTicketId(null);
    setMetricPreviews({});
  };

  const mockBacklogTickets: Ticket[] = [
    {
      id: '1',
      title: 'Revamp Dashboard Analytics',
      effort: 6,
      category: 'Self-Serve Feature',
      categoryClass: 'catSelfServe',
      description: 'Rebuild the analytics dashboard with better funnels and cohort views. Should boost self-serve signups. Will increase tech debt — quick-and-dirty is the only way to hit the timeline.'
    },
    {
      id: '2',
      title: 'SSO for Acme Corp',
      effort: 7,
      category: 'Enterprise',
      categoryClass: 'catEnterprise',
      description: 'Implement SAML-based SSO for Acme Corp\'s 2,000-seat deployment. Sales has been promising this for six weeks. Platform team can\'t touch self-serve while this ships.',
      isCEOAligned: true
    },
    {
      id: '3',
      title: 'Fix Auth Service Memory Leak',
      effort: 4,
      category: 'Tech Debt',
      categoryClass: 'catTechDebt',
      description: 'Auth service memory usage doubles every 48 hours. Currently mitigated by restarting it nightly. No direct growth impact. CTO will notice if you don\'t.'
    },
    {
      id: '4',
      title: 'Redesign Settings Page',
      effort: 4,
      category: 'UX Improvement',
      categoryClass: 'catUx',
      description: 'The settings page has 47 options on a single scroll. Users can\'t find anything. Restructure into logical sections. Low risk, minimal tradeoff. Nobody will thank you.'
    },
    {
      id: '5',
      title: 'Custom Export for GlobalTech',
      effort: 6,
      category: 'Sales Request',
      categoryClass: 'catSales',
      description: 'GlobalTech needs a custom CSV export with 14 specific columns by end of month. Will add tech debt and make the team question your priorities. Sales will love you briefly.',
      isCEOAligned: true
    },
    {
      id: '6',
      title: 'Add Usage-Based Billing',
      effort: 5,
      category: 'Monetization',
      categoryClass: 'catMonetization',
      description: 'Introduce metered billing for API usage. Could unlock new revenue. Users will not be delighted. NPS will feel it.'
    },
    {
      id: '7',
      title: 'Migrate to New CDN',
      effort: 5,
      category: 'Infrastructure',
      categoryClass: 'catInfra',
      description: 'Current CDN contract expires next quarter. Migration reduces latency and costs. Invisible to users. Invisible to leadership. The team finds it boring.'
    },
    {
      id: '8',
      title: 'AI-Powered Search',
      effort: 9,
      category: 'Moonshot',
      categoryClass: 'catMoonshot',
      description: 'Replace keyword search with semantic AI search across all content. Could be transformative. Could also be a hallucination factory. Massive effort, high failure risk, potential tech debt bomb. But imagine the demo.'
    }
  ];

  const handleCommitTicket = (ticket: Ticket) => {
    if (committedTickets.find(t => t.id === ticket.id)) return;

    // Add ticket to committed list
    setCommittedTickets([...committedTickets, {
      id: ticket.id,
      title: ticket.title,
      effort: ticket.effort,
      category: ticket.category,
      categoryClass: ticket.categoryClass
    }]);

    // Calculate and lock in the preview for this ticket
    const ticketPreview = calculateTicketPreview(ticket);
    console.log('🎫 Ticket added:', ticket.title, 'Preview:', ticketPreview);
    setCommittedPreviews(prev => {
      const updated = { ...prev, [ticket.id]: ticketPreview };
      console.log('📦 Updated committedPreviews:', updated);
      return updated;
    });
  };

  const handleRemoveTicket = (ticketId: string) => {
    // Check if ticket is mandatory
    const ticket = backlogTickets.find(t => t.id === ticketId);
    if (ticket?.isMandatory) {
      alert('This ticket is MANDATORY and cannot be removed from the sprint. Stakeholder demand is non-negotiable.');
      return;
    }

    // Remove ticket from committed list
    setCommittedTickets(committedTickets.filter(t => t.id !== ticketId));

    // Remove its preview from committed previews
    setCommittedPreviews(prev => {
      const updated = { ...prev };
      delete updated[ticketId];
      return updated;
    });
  };

  const handleStartSprint = async () => {
    if (committedTickets.length === 0) {
      alert('Please commit at least one ticket to start the sprint.');
      return;
    }

    if (usedCapacity > stretchCapacity) {
      alert(`${usedCapacity} points? Really? That's ${usedCapacity - stretchCapacity} points over max capacity. Even your over-optimistic estimates have limits. The API will reject this, but nice try.`);
      return;
    }

    const commitStartedAt = Date.now();
    setIsCommitting(true);
    try {
      const response = await fetch('/api/sprint/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketIds: committedTickets.map(t => t.id)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const deathSpiral = Boolean(data.death_spiral);
        // Store retro data for the retro page
        const isQuarterEnd = deathSpiral || gameState.game.current_sprint === 3;
        sessionStorage.setItem('lastRetro', JSON.stringify({
          game: data.game,
          completedSprint: {
            sprint_number: gameState.game.current_sprint,
            quarter: gameState.game.current_quarter
          },
          retro: data.retro,
          isQuarterEnd,
          quarterSummary: data.quarter_summary,
          yearEndReview: data.year_end_review,
          ceo_focus_shift: data.ceo_focus_shift ?? null,
          death_spiral: deathSpiral,
          capacity_collapse: data.capacity_collapse ?? null
        }));
        const elapsed = Date.now() - commitStartedAt;
        if (elapsed < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
        }
        // Navigate to appropriate next screen
        router.replace(deathSpiral ? '/quarterly-review' : '/sprint-retro');
      } else {
        const error = await response.json();
        alert(`Failed to commit sprint: ${error.error || 'Unknown error'}`);
        setIsCommitting(false);
      }
    } catch (error) {
      console.error('Error committing sprint:', error);
      alert('Failed to commit sprint. Please try again.');
      setIsCommitting(false);
    }
  };

  const getCapacityClass = () => {
    if (usedCapacity > stretchCapacity) return styles.danger;
    if (usedCapacity > sprintCapacity) return styles.overbooked;
    return '';
  };

  const getSentimentFace = (value: number) => {
    if (value >= 70) return '😊';
    if (value >= 50) return '😐';
    if (value >= 30) return '😟';
    return '😠';
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 70) return 'Happy';
    if (value >= 50) return 'Neutral';
    if (value >= 30) return 'Unhappy';
    return 'Angry';
  };

  const getGrowthIndicator = (delta: number | undefined) => {
    if (delta === undefined || delta === 0) {
      return { label: '→', className: styles.trendFlat };
    }
    if (delta > 0) {
      return { label: '↗', className: styles.trendUp };
    }
    return { label: '↘', className: styles.trendMounting };
  };

  const getTechDebtIndicator = (delta: number | undefined) => {
    // Tech debt is inverted: decrease is good (↘), increase is bad (↗)
    if (delta === undefined || delta === 0) {
      return { label: '→', className: styles.trendFlat };
    }
    if (delta > 0) {
      return { label: '↗', className: styles.trendMounting };
    }
    return { label: '↘', className: styles.trendUp };
  };

  const formatCeoFocus = (focus: string) => {
    const labels: Record<string, string> = {
      'self_serve': 'Self-Serve Growth',
      'enterprise': 'Enterprise Growth',
      'tech_debt': 'Tech Debt Reduction'
    };
    return labels[focus] || focus;
  };

  // Always use the actual current quarter's CEO focus for consistency
  const currentCeoFocus = gameState.quarter.ceo_focus;
  const ceoFocusShift = ceoShiftOverride ?? gameState.ceo_focus_shift ?? null;
  const ceoFocusShiftNarrative =
    ceoFocusShift?.narrative ??
    gameState.quarter.ceo_focus_shift_narrative ??
    null;
  const isNewQuarter =
    gameState.game.current_sprint === 1 && gameState.game.current_quarter > 1;
  const activeLoadingMessage =
    loadingSequence[loadingIndex] || loadingMessages[0];
  const selfServeIndicator = getGrowthIndicator(previousDeltas?.self_serve_growth);
  const enterpriseIndicator = getGrowthIndicator(previousDeltas?.enterprise_growth);
  const techDebtIndicator = getTechDebtIndicator(previousDeltas?.tech_debt);

  return (
    <div className={styles.pageContainer}>
      {isCommitting && (
        <div className={styles.loadingOverlay} aria-live="polite">
          <div className={styles.loadingCard}>
            <div key={loadingIndex} className={styles.loadingMessage}>
              {activeLoadingMessage}
            </div>
            <div className={styles.loadingProgress}>
              <div className={styles.loadingProgressBar}></div>
            </div>
          </div>
        </div>
      )}
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>PM</div>
            <span className={styles.logoText}>PM Simulator</span>
          </div>
          <div className={styles.quarterBadge}>Q{gameState.game.current_quarter} — Sprint {gameState.game.current_sprint} of 3</div>
        </div>

        <div className={styles.topBarRight}>
          <div className={styles.avatar}>S</div>
        </div>
      </div>


      {/* Active Modifiers */}
      {(() => {
        const modifiers = [];

        // Add CEO focus as a modifier
        modifiers.push({
          id: 'ceo-focus',
          icon: '⚡',
          label: `CEO Focus: ${formatCeoFocus(currentCeoFocus)}`,
          description: '2x impact'
        });

        // Add capacity modifiers as debuffs
        if (gameState.capacity_modifiers && gameState.capacity_modifiers.length > 0) {
          gameState.capacity_modifiers.forEach((modifier, idx) => {
            modifiers.push({
              id: `capacity-${modifier.event_id}-${idx}`,
              icon: modifier.delta > 0 ? '⚡' : '🐢',
              label: modifier.title || 'Event Effect',
              description: `${modifier.delta > 0 ? '+' : ''}${modifier.delta} pts capacity`
            });
          });
        }

        return modifiers.length > 0 ? (
          <div style={{ padding: '12px 24px 0' }}>
            <ActiveModifiers modifiers={modifiers} />
          </div>
        ) : null;
      })()}

      {isNewQuarter && ceoFocusShiftNarrative && showCeoShift && (
        <div className={styles.ceoNarrativeBanner} onClick={() => setShowCeoShift(false)}>
          <span className={styles.ceoNarrativeText}>{ceoFocusShiftNarrative}</span>
          <span className={styles.ceoNarrativeDismiss}>&times;</span>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Panel: Backlog */}
        <div className={styles.backlogPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Backlog</span>
            <span className={styles.panelCount}>{backlogTickets.length} tickets</span>
          </div>
          <div className={styles.panelSubtitle}>Available work. Choose wisely. Or don't.</div>

          {/* Filter and Sort Controls */}
          <div className={styles.filterSortControls}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filter:</label>
              <div className={styles.customSelect}>
                <button
                  className={styles.selectButton}
                  onClick={() => {
                    setIsFilterOpen(!isFilterOpen);
                    setIsSortOpen(false);
                  }}
                >
                  <span>{getFilterDisplayValue()}</span>
                  <span className={styles.selectArrow}>▼</span>
                </button>
                {isFilterOpen && (
                  <div className={styles.selectDropdown}>
                    <div
                      className={`${styles.selectOption} ${filterCategory === 'all' ? styles.selectOptionActive : ''}`}
                      onClick={() => {
                        setFilterCategory('all');
                        setIsFilterOpen(false);
                      }}
                    >
                      ✓ All Categories
                    </div>
                    {uniqueCategories.map(cat => (
                      <div
                        key={cat}
                        className={`${styles.selectOption} ${filterCategory === cat ? styles.selectOptionActive : ''}`}
                        onClick={() => {
                          setFilterCategory(cat);
                          setIsFilterOpen(false);
                        }}
                      >
                        {formatCategoryName(cat)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sortGroup}>
              <label className={styles.sortLabel}>Sort by:</label>
              <div className={styles.customSelect}>
                <button
                  className={styles.selectButton}
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsFilterOpen(false);
                  }}
                >
                  <span>{getSortDisplayValue()}</span>
                  <span className={styles.selectArrow}>▼</span>
                </button>
                {isSortOpen && (
                  <div className={styles.selectDropdown}>
                    <div
                      className={`${styles.selectOption} ${sortBy === 'effort-asc' ? styles.selectOptionActive : ''}`}
                      onClick={() => {
                        setSortBy('effort-asc');
                        setIsSortOpen(false);
                      }}
                    >
                      Points (Low to High)
                    </div>
                    <div
                      className={`${styles.selectOption} ${sortBy === 'effort-desc' ? styles.selectOptionActive : ''}`}
                      onClick={() => {
                        setSortBy('effort-desc');
                        setIsSortOpen(false);
                      }}
                    >
                      Points (High to Low)
                    </div>
                    <div
                      className={`${styles.selectOption} ${sortBy === 'impact-desc' ? styles.selectOptionActive : ''}`}
                      onClick={() => {
                        setSortBy('impact-desc');
                        setIsSortOpen(false);
                      }}
                    >
                      Impact (High to Low)
                    </div>
                    <div
                      className={`${styles.selectOption} ${sortBy === 'category' ? styles.selectOptionActive : ''}`}
                      onClick={() => {
                        setSortBy('category');
                        setIsSortOpen(false);
                      }}
                    >
                      Category
                    </div>
                    <div
                      className={`${styles.selectOption} ${sortBy === 'none' ? styles.selectOptionActive : ''}`}
                      onClick={() => {
                        setSortBy('none');
                        setIsSortOpen(false);
                      }}
                    >
                      Random
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.ticketGrid}>
            {backlogTickets.map(ticket => {
              const isCommitted = committedTickets.some(t => t.id === ticket.id);
              return (
                <TicketTile
                  key={ticket.id}
                  id={ticket.id}
                  title={ticket.title}
                  effort={ticket.effort}
                  category={ticket.category}
                  impactLevel={ticket.impactMagnitude || 1}
                  isCEOAligned={ticket.isCEOAligned}
                  isMandatory={ticket.isMandatory}
                  isHackathonBoosted={ticket.isHackathonBoosted}
                  isCommitted={isCommitted}
                  onClick={() => !isCommitted && handleCommitTicket(ticket)}
                  onHover={() => handleTicketHover(ticket.id)}
                  onHoverEnd={handleTicketHoverEnd}
                />
              );
            })}
          </div>
        </div>

        {/* Right Panel: Sprint */}
        <div className={styles.sprintPanel}>
          {/* Capacity Section */}
          <div className={styles.capacitySection}>
            <CapacityBar
              usedCapacity={usedCapacity}
              normalCapacity={sprintCapacity}
              stretchCapacity={stretchCapacity}
              showStretchBadge={usedCapacity > sprintCapacity && usedCapacity <= stretchCapacity}
              showOvercapacityWarning={usedCapacity > stretchCapacity}
            />
          </div>

          {/* Committed Section */}
          <div className={styles.committedSection}>
            <div className={styles.committedHeader}>
              <span className={styles.committedTitle}>Committed</span>
              <span className={styles.committedCount}>
                {committedTickets.length} tickets — {Math.max(0, sprintCapacity - usedCapacity)} pts remaining
              </span>
            </div>

            {committedTickets.length > 0 && (
              <div className={styles.committedGrid}>
                {committedTickets.map(ticket => {
                  const fullTicket = backlogTickets.find(t => t.id === ticket.id);
                  return (
                    <TicketTile
                      key={ticket.id}
                      id={ticket.id}
                      title={ticket.title}
                      effort={ticket.effort}
                      category={ticket.category}
                      impactLevel={fullTicket?.impactMagnitude || 1}
                      isCEOAligned={fullTicket?.isCEOAligned}
                      isMandatory={fullTicket?.isMandatory}
                      isHackathonBoosted={fullTicket?.isHackathonBoosted}
                      showRemoveButton={true}
                      onRemove={() => handleRemoveTicket(ticket.id)}
                    />
                  );
                })}
              </div>
            )}

            {/* Drop Zone */}
            {committedTickets.length === 0 && (
              <div className={styles.dropZone}>
                <div className={styles.dropZoneIcon}>↴</div>
                <div className={styles.dropZoneText}>Click tickets on the left to commit them</div>
              </div>
            )}
          </div>

          {/* Performance Metrics Panel */}
          <div className={styles.performancePanel}>
            <div className={styles.performancePanelHeader}>
              <span className={styles.performancePanelTitle}>Performance</span>
            </div>

            <div className={styles.metricsGrid}>
              {(() => {
                const combinedPreviews = getCombinedPreviews();

                // DEBUG: Log preview values
                console.log('🔍 Preview Debug:', {
                  teamSentiment: {
                    current: metrics.team_sentiment,
                    min: combinedPreviews['Team Sentiment']?.min,
                    max: combinedPreviews['Team Sentiment']?.max
                  },
                  selfServe: {
                    current: metrics.self_serve_growth,
                    min: combinedPreviews['Self-Serve Growth']?.min,
                    max: combinedPreviews['Self-Serve Growth']?.max
                  },
                  enterprise: {
                    current: metrics.enterprise_growth,
                    min: combinedPreviews['Enterprise Growth']?.min,
                    max: combinedPreviews['Enterprise Growth']?.max
                  }
                });

                return (
                  <>
                    {/* Q1: Show only 3 metrics (Team Sentiment, Self-Serve Growth, Enterprise Growth) */}
                    {/* Q2+: Show all 6 metrics */}
                    <MetricBarWithPreview
                      name="Team Sentiment"
                      currentValue={metrics.team_sentiment}
                      previewMin={combinedPreviews['Team Sentiment']?.min}
                      previewMax={combinedPreviews['Team Sentiment']?.max}
                      isPositiveImpact={combinedPreviews['Team Sentiment']?.isPositive}
                      showDangerZone={true}
                    />
                    <MetricBarWithPreview
                      name="Self-Serve Growth"
                      currentValue={metrics.self_serve_growth}
                      previewMin={combinedPreviews['Self-Serve Growth']?.min}
                      previewMax={combinedPreviews['Self-Serve Growth']?.max}
                      isPositiveImpact={combinedPreviews['Self-Serve Growth']?.isPositive}
                      showDangerZone={true}
                    />
                    <MetricBarWithPreview
                      name="Enterprise Growth"
                      currentValue={metrics.enterprise_growth}
                      previewMin={combinedPreviews['Enterprise Growth']?.min}
                      previewMax={combinedPreviews['Enterprise Growth']?.max}
                      isPositiveImpact={combinedPreviews['Enterprise Growth']?.isPositive}
                      showDangerZone={true}
                    />

                    {/* Show additional metrics in Q2+ */}
                    {gameState.game.current_quarter >= 2 && (
                      <>
                        <MetricBarWithPreview
                          name="CTO Sentiment"
                          currentValue={metrics.cto_sentiment}
                          previewMin={combinedPreviews['CTO Sentiment']?.min}
                          previewMax={combinedPreviews['CTO Sentiment']?.max}
                          isPositiveImpact={combinedPreviews['CTO Sentiment']?.isPositive}
                          showDangerZone={true}
                        />
                        <MetricBarWithPreview
                          name="Tech Debt"
                          currentValue={metrics.tech_debt}
                          previewMin={combinedPreviews['Tech Debt']?.min}
                          previewMax={combinedPreviews['Tech Debt']?.max}
                          isPositiveImpact={combinedPreviews['Tech Debt']?.isPositive}
                          showDangerZone={true}
                        />
                        <MetricBarWithPreview
                          name="CEO Sentiment"
                          currentValue={metrics.ceo_sentiment}
                          previewMin={combinedPreviews['CEO Sentiment']?.min}
                          previewMax={combinedPreviews['CEO Sentiment']?.max}
                          isPositiveImpact={combinedPreviews['CEO Sentiment']?.isPositive}
                          showDangerZone={true}
                        />
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          {metrics.sales_sentiment < 40 && 'Sales is unhappy. '}
          {metrics.ceo_sentiment < 50 && 'CEO is watching. '}
          {metrics.tech_debt > 60 && 'Tech debt is mounting. '}
          {metrics.team_sentiment < 40 && 'Team morale is low. '}
          Only {sprintCapacity} points. Choose wisely.
        </div>
        <div className={styles.bottomBarRight}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => {
            setCommittedTickets([]);
            setCommittedPreviews({});
          }}>Reset Sprint</button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleStartSprint}
            disabled={isCommitting || committedTickets.length === 0 || usedCapacity > stretchCapacity}
            style={{
              opacity: (isCommitting || committedTickets.length === 0 || usedCapacity > stretchCapacity) ? 0.4 : 1,
              cursor: (isCommitting || committedTickets.length === 0 || usedCapacity > stretchCapacity) ? 'not-allowed' : 'pointer'
            }}
          >
            {isCommitting ? 'Committing...' : usedCapacity > stretchCapacity ? 'Overcapacity!' : committedTickets.length === 0 ? 'Add Tickets to Start' : 'Start Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
