---
name: pm-simulator-context
description: Quickly onboard to the pm-simulator codebase by reading key documentation, understanding architecture, data models, and current project state. Use this skill IMMEDIATELY whenever the user mentions "pm-simulator" or asks to work on this project, before doing any other work. This ensures you have the full context needed to make informed decisions. Trigger on any mention of pm-simulator, even casual references like "the simulator" or "this project" when working in the pm-simulator directory.
---

# PM Simulator Context Loader

This skill helps Claude rapidly get up to speed on the pm-simulator project by systematically reading documentation and understanding the codebase structure.

## When to Use This Skill

**ALWAYS use this skill when:**
- User mentions "pm-simulator" in any context
- User asks you to work on files in the pm-simulator directory
- Starting a new conversation about this project
- You need to understand the product before making changes
- User asks "what does this project do?" or "help me understand this code"

**Use this skill FIRST**, before attempting any code changes or answering questions about the project.

## Tech Stack Overview

Before diving into docs, know that pm-simulator is built with:
- **Frontend**: Next.js (React) with TypeScript
- **Backend**: Supabase (PostgreSQL database)
- **Structure**: `src/app/` (Next.js App Router), `src/components/`, `src/lib/`

## Onboarding Process

Follow this sequence to build comprehensive context:

### Step 1: Core Architecture (REQUIRED)

Read these files in order to understand the product and technical foundation:

1. **Architecture & Milestones** - Read `docs/pm-simulator-architecture-milestones.md`
   - Understand the product vision and key features
   - Learn the architectural decisions made
   - See the development milestones and progress

2. **Data Model** - Read `docs/pm-simulator-data-model.md`
   - Understand the database schema and relationships
   - Learn how data flows through the application
   - Identify key entities and their properties

3. **Testing Instructions** - Skim `TESTING_INSTRUCTIONS.txt`
   - Understand how to test changes
   - Learn the testing workflow

### Step 2: Recent Changes & Current State

Read these files to understand what's been happening recently:

1. **Recent Fixes** - Skim these to see what issues were addressed:
   - `CAPACITY_FIXES_IMPLEMENTED.md`
   - `EVENT_FIXES_SUMMARY.md`
   - `FEEDBACK_ANALYSIS.md`

2. **Simulation Results** - If relevant to the task, check:
   - `simulation-results-retuned.md` (latest)
   - Shows how the simulator is performing

### Step 3: Code Structure Scan

After reading docs, quickly scan the codebase structure:

```bash
# Check main app structure
ls -la src/app/

# Check components
ls -la src/components/

# Check utility libraries
ls -la src/lib/

# Check database structure
ls -la supabase/
```

This gives you a mental map of where things live.

### Step 4: Style & Tone (if creating user-facing content)

If you'll be writing user-facing text, notifications, or UI copy:
- Read `docs/pm-simulator-tone-samples.md` to match the project's voice

## What to Extract

As you read, mentally note:

1. **Product Purpose**: What problem does pm-simulator solve? Who is it for?
2. **Key Features**: What are the main capabilities?
3. **Architecture Decisions**: Why was it built this way?
4. **Data Model**: What are the main entities and relationships?
5. **Recent Changes**: What was recently fixed or improved?
6. **Open Issues**: Are there known problems mentioned in docs?

## Communicating Context to the User

After reading the docs, provide a brief summary (keep it concise - 2-3 sentences):

```
I've reviewed the pm-simulator documentation. This is a [brief description of product].
Key context: [1-2 sentence architecture/data model summary].
Ready to help with [user's task].
```

The user knows what they're building - they just want confirmation you understand it too. Don't over-explain.

## When NOT to Re-run This Skill

You don't need to re-read everything if:
- You've already loaded context in this conversation
- User is asking a quick question that doesn't require deep architectural knowledge
- You're making a small, isolated change to a file you already understand

Use your judgment - when in doubt, at least skim the core docs again.

## Efficiency Tips

**Parallel Reading**: If you can read multiple files in parallel, do so:
- Architecture + Data Model + Testing can be read simultaneously
- Recent fixes can be skimmed in parallel

**Selective Depth**:
- Always read architecture and data model carefully
- Skim fix summaries unless they're directly relevant to the current task
- Skip tone samples unless you're writing user-facing content

## Edge Cases

**If documentation is missing or outdated**:
- Note what's missing to the user
- Make reasonable inferences from code structure
- Ask user for clarification on ambiguous points

**If user urgently needs a quick fix**:
- At minimum, read the architecture doc (30 seconds)
- Make the fix carefully
- Circle back to read full context afterward

## Success Criteria

You've successfully loaded context when you can answer:
- What is pm-simulator and who uses it?
- What's the tech stack?
- What are the main database entities?
- What were the most recent changes?
- Where would I find [specific feature] in the codebase?

If you can't answer these, re-read the core documentation.
