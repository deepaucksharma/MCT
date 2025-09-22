export interface WeeklyContentData {
  weekNumber: number;
  title: string;
  learningObjectives: string[];
  content: string;
  keyPoints: string[];
  tryThisNow: {
    instruction: string;
    duration: string;
  };
  pitfalls: {
    pitfall: string;
    redirect: string;
  }[];
  experiment?: {
    title: string;
    beliefTarget: string;
    protocol: string[];
    prediction: string;
    measurement: string;
  };
  acceptanceCriteria: string[];
}

export const weeklyContent: WeeklyContentData[] = [
  {
    weekNumber: 0,
    title: "Welcome to Metacognitive Therapy",
    learningObjectives: [
      "Understand the difference between CAS and normal thinking",
      "Identify personal CAS patterns without content focus",
      "Commit to process-focused approach"
    ],
    content: `You're here because worry, rumination, or anxiety is taking up too much space in your life. MCT offers a different approach - we won't analyze what you worry about or try to solve your problems. Instead, we'll change HOW you relate to your thoughts.

**The Cognitive Attentional Syndrome (CAS)**

When we're distressed, we often fall into the CAS, which consists of:

1. **Excessive thinking**: Worry (about the future) and rumination (about the past)
2. **Threat monitoring**: Constantly scanning for danger
3. **Unhelpful coping**: Checking, seeking reassurance, avoiding

These aren't character flaws - they're patterns your mind has learned. The good news? They can be unlearned.

**Why Process Matters More Than Content**

Traditional approaches focus on thought content: "Is this worry realistic?" MCT focuses on process: "How long did I worry?" This shift is crucial because:

- Content changes, but the process stays the same
- Fighting content creates more content
- Process changes lead to lasting relief

**Your Journey Ahead**

Over 8-10 weeks, you'll learn:
- Attention Training Technique (ATT) to build voluntary control
- Detached Mindfulness (DM) to observe without engaging
- Postponement to break worry cycles
- Experiments to test your beliefs about thinking`,
    keyPoints: [
      "CAS consists of excessive thinking, threat monitoring, and unhelpful coping",
      "Process matters more than content",
      "MCT changes HOW you relate to thoughts, not their content",
      "These patterns can be unlearned through practice"
    ],
    tryThisNow: {
      instruction: "Notice any thought in your mind right now. Instead of examining it, simply say: 'A thought is here.' Don't analyze it. Just label and return to reading. That's the beginning of detachment.",
      duration: "30 seconds"
    },
    pitfalls: [
      {
        pitfall: "User wants to discuss worry content",
        redirect: "Notice you're pulled to content. Return to process: How long? How often?"
      },
      {
        pitfall: "User seeks reassurance about the program",
        redirect: "Seeking reassurance maintains the problem. Trust the process."
      },
      {
        pitfall: "User questions if this will 'work'",
        redirect: "Focus on practicing skills, not outcomes. Change comes from doing."
      }
    ],
    acceptanceCriteria: [
      "User can identify CAS vs normal thinking (2-item quiz: 80% accuracy)",
      "User commits to process focus (explicit agreement required)",
      "User completes initial CAS observation (at least 1 episode logged)"
    ]
  },
  {
    weekNumber: 1,
    title: "Mapping Your CAS & Starting ATT",
    learningObjectives: [
      "Create personal CAS map without content details",
      "Complete ≥3 ATT sessions with ratings",
      "Successfully postpone ≥1 worry episode daily"
    ],
    content: `This week, you'll map your unique CAS patterns and begin breaking them with two powerful tools: ATT and postponement.

**Mapping Your CAS (Without Content)**

Your CAS has three components. Let's identify yours:

**Perseverative Thinking**
- Worry: Time spent on "What if..." thoughts about the future
- Rumination: Time spent on "Why..." thoughts about the past
- Track: Minutes per day (not topics)

**Threat Monitoring**
- Body scanning: Checking physical sensations
- Environmental scanning: Checking news, emails, situations
- Mental scanning: Reviewing thoughts for problems
- Track: Number of checks per day

**Unhelpful Coping**
- Reassurance seeking: Asking others or Google
- Avoidance: Situations, thoughts, feelings
- Suppression: Trying not to think
- Track: Frequency per day

**Introducing ATT: Your Attention Gym**

ATT isn't relaxation - it's strength training for your attention. Like physical exercise, it might feel effortful at first. That's normal and necessary.

**The Protocol**:
1. **Selective Attention** (3 min): Focus on one sound, then another
2. **Attention Switching** (4 min): Rapidly shift between sounds
3. **Divided Attention** (4 min): Hold multiple sounds simultaneously
4. **Flexible Control** (3 min): Zoom in and out of awareness

**Key point**: Intrusive thoughts during ATT are expected. Don't fight them. Gently return focus to sounds.

**Postponement: Breaking the Worry Cycle**

When worry starts:
1. **Label it**: "This is worry" (not "This is important")
2. **Schedule it**: "I'll think about this at 6:30 PM"
3. **Refocus**: Use environment anchors immediately
4. **At scheduled time**: Often the urge has passed`,
    keyPoints: [
      "CAS has three trackable components: perseverative thinking, threat monitoring, unhelpful coping",
      "ATT is attention training, not relaxation",
      "Intrusive thoughts during ATT are normal and expected",
      "Postponement breaks the worry cycle through scheduling"
    ],
    tryThisNow: {
      instruction: "Set a timer for 60 seconds. Count how many different sounds you can identify in your environment. When your mind drifts (it will), gently return to counting sounds. This is attention control practice.",
      duration: "60 seconds"
    },
    pitfalls: [
      {
        pitfall: "I can't do ATT, my mind is too busy",
        redirect: "Difficulty is evidence you need practice, not that you can't do it"
      },
      {
        pitfall: "Postponement feels like avoidance",
        redirect: "Avoidance is trying not to have thoughts. Postponement is choosing when to have them"
      },
      {
        pitfall: "I need to think things through",
        redirect: "Has thinking things through ever stopped worry? Try postponement for one week"
      }
    ],
    experiment: {
      title: "Postponement Control Test",
      beliefTarget: "I can't control when I worry",
      protocol: [
        "Detect 3 worry episodes per day for 3 days",
        "Rate initial urge to continue (0-100)",
        "Postpone to scheduled slot",
        "Rate urge at slot time (0-100)",
        "Track: How many times did urge decrease?"
      ],
      prediction: "I will/won't be able to postpone successfully",
      measurement: "Success rate %, average urge reduction"
    },
    acceptanceCriteria: [
      "≥70% of users complete personal CAS map",
      "≥60% complete 3+ ATT sessions in week 1",
      "≥50% successfully postpone at least 3 episodes",
      "100% who complete ATT provide control ratings"
    ]
  },
  {
    weekNumber: 2,
    title: "Detached Mindfulness & SAR",
    learningObjectives: [
      "Practice DM 2-3 times daily with confidence ratings",
      "Create and implement 3 personalized SAR plans",
      "Reduce one checking behavior by 50% using SAR"
    ],
    content: `You've started ATT and postponement. Now we add Detached Mindfulness (DM) and Situational Attentional Refocusing (SAR) to build a complete attention toolkit.

**Detached Mindfulness: The Art of Not Engaging**

DM means being aware of thoughts without engaging with them. You neither push them away nor get involved. Think of it as watching traffic pass without getting in any car.

**The DM Stance (LAPR)**:
1. **Label**: "A worry thought is here"
2. **Allow**: Don't push it away
3. **Position**: Watch it like TV in another room
4. **Refocus**: Return attention to present task

**Key distinction**: DM isn't mindfulness meditation. We're not accepting or sitting with difficult feelings. We're practicing non-engagement with mental events.

**Three DM Metaphors** (choose what works):
1. **Clouds passing**: Thoughts drift by like clouds
2. **Radio in background**: Playing but not listening
3. **Train passing**: Watching carriages without boarding

**Practice Structure**:
- Morning: 60-second DM with coffee/breakfast
- Midday: 60-second DM before lunch
- Evening: 60-second DM during transition home

**SAR: Your Emergency Refocus Plan**

SAR provides immediate redirection when you notice CAS activation. These are pre-planned If-Then rules:

**If** [trigger/CAS starts] **Then** [specific external focus action]

**Examples**:
- If I notice body scanning → Then count 5 blue objects
- If worry starts → Then name 3 sounds and 3 textures
- If rumination begins → Then count backwards from 100 by 7s

**Creating Your SAR Plans**:
1. Identify your top 3 CAS triggers
2. Choose concrete external actions
3. Keep actions under 30 seconds
4. Practice even when not triggered`,
    keyPoints: [
      "DM is non-engagement, not acceptance or mindfulness meditation",
      "Use LAPR stance: Label, Allow, Position, Refocus",
      "SAR provides immediate redirection using If-Then rules",
      "Practice SAR even when not triggered to build automaticity"
    ],
    tryThisNow: {
      instruction: "For 90 seconds, let any thoughts come and go. Don't engage, analyze, or suppress. Just observe them like subtitles on a screen while you focus on your breath. Rate your confidence in detaching (0-100).",
      duration: "90 seconds"
    },
    pitfalls: [
      {
        pitfall: "DM feels like suppression",
        redirect: "Suppression is pushing away. DM is allowing presence without engagement"
      },
      {
        pitfall: "I forget to use SAR",
        redirect: "Set 3 phone alarms as SAR practice reminders"
      },
      {
        pitfall: "Thoughts feel too important to detach from",
        redirect: "Important thoughts will return. Practice detachment regardless of content"
      }
    ],
    experiment: {
      title: "Checking Reduction with SAR",
      beliefTarget: "I must check or something bad will happen",
      protocol: [
        "Choose one checking behavior (e.g., email, locks, symptoms)",
        "Current frequency: X times/day",
        "Reduce to 50% for 48 hours using SAR when urge arises",
        "Track: Anxiety level at 15, 30, 60 minutes post-SAR",
        "Note: Did anything bad happen?"
      ],
      prediction: "Anxiety will/won't return to baseline within 60 minutes",
      measurement: "Time to anxiety baseline, checking frequency, outcomes"
    },
    acceptanceCriteria: [
      "≥80% save at least 2 SAR plans",
      "≥60% complete 6+ DM practices in week",
      "≥40% report increased detachment confidence",
      "≥50% successfully reduce targeted checking behavior"
    ]
  },
  {
    weekNumber: 3,
    title: "Challenging Beliefs About Worry's Usefulness",
    learningObjectives: [
      "Identify at least one positive belief about worry/rumination",
      "Complete utility comparison experiment",
      "Achieve ≥10 point reduction in positive belief rating"
    ],
    content: `You may believe worry helps you prepare, shows you care, or prevents bad outcomes. This week, we'll test these beliefs through experience, not logic.

**Common Positive Beliefs About Worry**

Do any of these sound familiar?
- "Worry helps me prepare for problems"
- "If I don't worry, I'm being careless"
- "Worry motivates me to act"
- "Thinking things through prevents mistakes"
- "Rumination helps me understand myself"

**The Problem with Positive Beliefs**

These beliefs keep you locked in CAS because they make worry feel necessary. But consider:
- Has worry ever solved a problem that planning couldn't?
- Does caring require rumination?
- Can you prepare without the emotional storm?

**Key Distinction: Worry vs Problem-Solving**

**Worry** (CAS):
- Repetitive "What if..." chains
- No concrete actions
- Increases distress
- No endpoint
- Abstract scenarios

**Problem-Solving** (Adaptive):
- Specific problem identification
- Concrete action steps
- Time-limited
- Solution-focused
- Reality-based

**Testing Utility Beliefs**

This week, you'll run an experiment comparing outcomes when you worry versus when you plan briefly and act. No logic or debate - just data.

**The Planning Alternative**:
1. Identify concern (30 seconds)
2. List 2-3 concrete actions (90 seconds)
3. Schedule actions (30 seconds)
4. Refocus using SAR

Total time: 2-3 minutes versus hours of worry

**Reframing Motivation**

"But worry motivates me!"

Does it? Or does it paralyze? True motivation comes from values and goals, not fear. This week, practice acting from intention, not anxiety.`,
    keyPoints: [
      "Positive beliefs about worry keep you locked in CAS",
      "Worry and problem-solving are fundamentally different processes",
      "Test beliefs through experience, not logical debate",
      "True motivation comes from values, not fear"
    ],
    tryThisNow: {
      instruction: "Think of something you're worried about (10 seconds). Now: 1. Write 2 concrete actions (60 seconds) 2. Schedule them (30 seconds) 3. Rate your preparedness (0-100) 4. Stop thinking about it (use DM). How prepared do you feel without the worry?",
      duration: "2 minutes"
    },
    pitfalls: [
      {
        pitfall: "But my worries are realistic",
        redirect: "We're not debating reality. We're testing if worry helps"
      },
      {
        pitfall: "I can't plan without worrying first",
        redirect: "That's the belief we're testing. Try the experiment"
      },
      {
        pitfall: "This feels irresponsible",
        redirect: "Is endless worry responsible? Test it and see"
      }
    ],
    experiment: {
      title: "Worry vs Planning Comparison",
      beliefTarget: "Worry helps me prepare better than planning",
      protocol: [
        "Day 1-2: Worry Approach - When concern arises, worry for 5 minutes",
        "Rate: Preparedness (0-100), Distress (0-100)",
        "Note actions taken",
        "Day 3-4: Planning Approach - When concern arises, plan for 2 minutes maximum",
        "Rate: Preparedness (0-100), Distress (0-100)",
        "Note actions taken"
      ],
      prediction: "Worry will/won't prepare me better than planning",
      measurement: "Action count, preparedness ratings, time spent"
    },
    acceptanceCriteria: [
      "≥70% identify at least one positive belief",
      "≥50% complete full experiment protocol",
      "≥40% report planning equally/more effective",
      "100% of completers re-rate beliefs"
    ]
  },
  {
    weekNumber: 4,
    title: "Proving You Have Control",
    learningObjectives: [
      "Generate evidence of attentional control through extended postponement",
      "Challenge danger beliefs through 'no-monitoring' windows",
      "Achieve ≥15 point reduction in uncontrollability ratings"
    ],
    content: `"My worry is uncontrollable" and "Not monitoring is dangerous" are the beliefs that trap you in CAS. This week, you'll prove them wrong through action, not argument.

**The Uncontrollability Illusion**

When worry feels uncontrollable, you're confusing two things:
1. **Intrusive thoughts** (involuntary - everyone has them)
2. **Extended worry** (voluntary - you choose to continue)

You can't control thoughts arriving. You CAN control engaging with them.

**Evidence of Control You Already Have**:
- You've postponed worry (that's control)
- You've done ATT (that's shifting attention)
- You've practiced DM (that's disengagement)

**Danger Beliefs: The Monitoring Trap**

"If I don't check, I'll miss something dangerous"

But monitoring:
- Increases anxiety (finding what you look for)
- Prevents learning (never discovering you're safe)
- Maintains hypervigilance (exhausting your system)

**Breaking the Monitoring Cycle**

This week's challenge: Create "monitoring-free" windows where you deliberately don't check:
- No body scanning for 60 minutes
- No news checking for half a day
- No mental reviewing for 2 hours

**Attention Control Drills**

Daily mini-experiments proving control:
1. **Attention Switching Drill**: When worry starts, switch to naming colors for 30 seconds
2. **Postponement Extension**: Increase postponement to 24 hours for low-urgency worries
3. **DM Intervals**: Insert 3 DM breaks during known trigger times

**The 90-Second Rule**

Most emotional surges last 90 seconds if not maintained by thinking. This week, when anxiety rises:
1. Note the time
2. Apply SAR
3. Check at 90 seconds
4. Notice: Still catastrophic? Usually not.`,
    keyPoints: [
      "Distinguish between involuntary thoughts and voluntary worry",
      "Monitoring increases anxiety and prevents safety learning",
      "Create monitoring-free windows to challenge danger beliefs",
      "Most emotional surges last 90 seconds without thinking fuel"
    ],
    tryThisNow: {
      instruction: "1. Start worrying deliberately for 30 seconds 2. STOP and switch to ATT sounds for 60 seconds 3. Return to worry for 30 seconds 4. STOP and count backwards from 100 5. Rate: How much control did you just demonstrate? (0-100)",
      duration: "3 minutes"
    },
    pitfalls: [
      {
        pitfall: "But I really can't control it",
        redirect: "You just postponed - that's control. Build on that evidence"
      },
      {
        pitfall: "Not monitoring feels dangerous",
        redirect: "Has monitoring ever prevented a real danger? Test it"
      },
      {
        pitfall: "My anxiety proves lack of control",
        redirect: "Anxiety is feeling. Control is behavior. Focus on what you do"
      }
    ],
    experiment: {
      title: "Extended Postponement & No-Monitoring Windows",
      beliefTarget: "My worry is uncontrollable and monitoring prevents danger",
      protocol: [
        "Part A - Uncontrollability Test: Postpone 5 worries for 24 hours",
        "Track: How many never returned for processing?",
        "Rate control confidence before/after",
        "Part B - Danger Test: No body scanning 9-11 AM daily",
        "No news checking Monday afternoon",
        "No mental reviewing Tuesday evening",
        "Track: What dangers were actually missed?"
      ],
      prediction: "I won't be able to postpone and will miss dangers",
      measurement: "Postponement success rate, missed dangers count, belief ratings"
    },
    acceptanceCriteria: [
      "≥60% complete extended postponement",
      "≥50% complete no-monitoring windows",
      "≥40% report no actual dangers missed",
      "Mean reduction ≥15 points in uncontrollability"
    ]
  },
  {
    weekNumber: 5,
    title: "Dropping the Safety Net",
    learningObjectives: [
      "Identify top 2 safety behaviors maintaining CAS",
      "Implement 50% reduction for 72 hours minimum",
      "Document anxiety habituation curve"
    ],
    content: `Safety behaviors feel helpful but keep you stuck. Like training wheels, they prevent you from discovering you can balance without them.

**Common Safety Behaviors**

Which do you use?

**Information Seeking**:
- Googling symptoms
- Researching worst cases
- Checking news repeatedly

**Reassurance Seeking**:
- Asking others repeatedly
- Seeking guarantee outcomes
- Confirming you're okay

**Checking Behaviors**:
- Doors, locks, appliances
- Body sensations
- Email/texts repeatedly

**Mental Rituals**:
- Reviewing conversations
- Mental problem-solving
- Positive thinking attempts

**Avoidance**:
- Situations
- Thoughts/topics
- Decisions

**Why Safety Behaviors Backfire**

1. **Prevent Learning**: Never discover you're safe without them
2. **Increase Vigilance**: Make you hyperfocus on threats
3. **Maintain Beliefs**: Reinforce that danger is real
4. **Exhaust Resources**: Drain mental energy

**The Habituation Principle**

Anxiety naturally decreases if you don't maintain it through safety behaviors. This week, you'll prove this by tracking your anxiety curve when you drop behaviors.

**Graded Reduction Protocol**

Don't drop everything at once. Choose 2 behaviors:

**Week 5 Schedule**:
- Days 1-2: Reduce by 25%
- Days 3-4: Reduce by 50%
- Days 5-7: Reduce by 75%

Track anxiety (0-100) at:
- Trigger moment
- 15 minutes later
- 30 minutes later
- 60 minutes later

**Replacement Strategy**

Instead of safety behaviors, use:
1. **DM**: "The urge is here, I don't need to act"
2. **SAR**: Immediate external refocus
3. **Postponement**: "I can check/ask tomorrow if still needed"`,
    keyPoints: [
      "Safety behaviors prevent learning you're safe without them",
      "Anxiety naturally habituates without maintenance behaviors",
      "Use graded reduction rather than stopping everything at once",
      "Replace safety behaviors with DM, SAR, and postponement"
    ],
    tryThisNow: {
      instruction: "Next time you feel the urge to check something: 1. Rate anxiety (0-100) 2. Don't check 3. Use SAR 4. Rate anxiety every 15 minutes 5. Notice the natural decline",
      duration: "Next opportunity"
    },
    pitfalls: [
      {
        pitfall: "But checking keeps me safe",
        redirect: "Has NOT checking ever caused actual harm? Test it"
      },
      {
        pitfall: "I need reassurance to function",
        redirect: "Reassurance is temporary. Skills are permanent"
      },
      {
        pitfall: "My situation is different",
        redirect: "Every anxious person feels unique. The process is universal"
      }
    ],
    experiment: {
      title: "Safety Behavior Fade",
      beliefTarget: "Without [behavior], something bad will happen",
      protocol: [
        "Select top 2 safety behaviors",
        "Baseline: Current frequency per day",
        "Reduction schedule (25/50/75%)",
        "Track anxiety curves for each resist",
        "Document actual outcomes"
      ],
      prediction: "Bad things will happen without safety behaviors",
      measurement: "Behavior frequency, anxiety curves, actual vs predicted outcomes"
    },
    acceptanceCriteria: [
      "≥70% identify 2+ safety behaviors",
      "≥50% achieve 50% reduction for 72 hours",
      "≥60% document anxiety habituation",
      "0% report actual negative outcomes"
    ]
  },
  {
    weekNumber: 6,
    title: "Attention Mastery in the Storm",
    learningObjectives: [
      "Apply ATT-lite during active triggers",
      "Decrease time-to-refocus by ≥20% from baseline",
      "Master trigger-specific SAR protocols"
    ],
    content: `You've built skills in calm moments. Now we apply them when it matters most - during triggers. This week is about flexible, rapid attention control under pressure.

**The Trigger Challenge**

Triggers hijack attention through:
- **Narrowing**: Zoom onto threat
- **Sticking**: Can't shift away
- **Internal focus**: Lost in thoughts

Your training reverses this:
- **Flexibility**: Zoom in/out at will
- **Mobility**: Shift rapidly
- **External focus**: Anchored outside

**ATT-Lite for Triggers**

Full ATT is 12-15 minutes. ATT-Lite is 90 seconds for immediate use:

1. **Quick Scan** (20s): Notice 3 sounds
2. **Rapid Switch** (30s): Jump between them quickly
3. **Brief Division** (20s): Hold all 3 together
4. **Wide Field** (20s): Expand to full soundscape

Use when:
- Worry suddenly spikes
- Before stressful situations
- During trigger exposure

**Spotlight ↔ Floodlight Drills**

Practice shifting attention scope:

**Spotlight** (narrow):
- Single word on page
- One instrument in song
- Specific body part

**Floodlight** (wide):
- Whole paragraph
- Full orchestra
- Entire body

Toggle between modes every 10 seconds. This builds flexibility.

**Time-to-Refocus Training**

Your goal: Reduce refocus time when triggered.

**Protocol**:
1. Notice trigger activation
2. Start mental timer
3. Apply SAR
4. Stop timer when refocused
5. Log time in seconds

**Target progression**:
- Week 1-2: Baseline (often 300+ seconds)
- Week 6: <60 seconds
- Maintenance: <30 seconds

**Trigger Inoculation**

Brief, controlled exposure with immediate refocus:
1. Think of trigger for 5 seconds
2. Apply ATT-Lite
3. Rate shift difficulty (0-100)
4. Repeat 3x daily`,
    keyPoints: [
      "Triggers hijack attention through narrowing, sticking, and internal focus",
      "ATT-Lite provides 90-second rapid attention control",
      "Practice spotlight/floodlight drills to build flexibility",
      "Track time-to-refocus to measure progress"
    ],
    tryThisNow: {
      instruction: "1. Think of mild worry trigger (5 seconds) 2. Do ATT-Lite sequence (90 seconds) 3. Rate: How quickly could you shift? (0-100) 4. Notice: You just controlled attention under trigger",
      duration: "2 minutes"
    },
    pitfalls: [
      {
        pitfall: "Triggers are too strong",
        redirect: "Start with mild triggers. Build like physical exercise"
      },
      {
        pitfall: "I lose all skills when triggered",
        redirect: "That's why we practice. Skills become automatic"
      },
      {
        pitfall: "This feels like exposure therapy",
        redirect: "Exposure changes fear. We're changing attention"
      }
    ],
    experiment: {
      title: "Trigger Response Time",
      beliefTarget: "I can't control attention when triggered",
      protocol: [
        "List top 5 triggers by intensity",
        "Start with #3 (moderate)",
        "Trigger → SAR → Time recorded",
        "5 trials per day, 3 days",
        "Compare Day 1 vs Day 3 times"
      ],
      prediction: "Refocus time will/won't decrease with practice",
      measurement: "Seconds to refocus, trend over trials"
    },
    acceptanceCriteria: [
      "≥60% demonstrate reduced refocus time",
      "≥50% successfully use ATT-Lite in triggers",
      "Mean reduction ≥20% in time-to-refocus",
      "≥40% report increased trigger confidence"
    ]
  },
  {
    weekNumber: 7,
    title: "Making MCT Your Default Mode",
    learningObjectives: [
      "Codify personal MCT rules ('When X, I do Y')",
      "Complete high-salience stress test experiment",
      "Strengthen adaptive metacognitive beliefs"
    ],
    content: `You've learned all core skills. This week, we consolidate them into automatic responses and test them under pressure. By week's end, MCT will be your default, not your effort.

**From Skills to Rules**

Transform practices into personal operating system:

**Instead of**: "I should try to use DM"
**Create**: "When worry starts, I immediately label and detach"

**Your Personal MCT Rules**:
1. When I notice worry → I postpone to 6:30 PM
2. When anxiety rises → I do ATT-Lite
3. When monitoring starts → I use SAR
4. When seeking reassurance → I wait 24 hours
5. Daily non-negotiable → Evening ATT

Write your 5 rules. Post them visibly.

**Strengthening New Beliefs**

You've weakened old beliefs. Now strengthen adaptive ones:

**Old**: "Worry is uncontrollable"
**New**: "I can redirect attention at will"

**Old**: "I must monitor for danger"
**New**: "I notice more when relaxed"

**Old**: "Worry helps me prepare"
**New**: "Brief planning is sufficient"

Rate your confidence in new beliefs (0-100). They should be rising.

**The Stress Test**

This week, deliberately enter a previously avoided situation using your skills:
- Something you'd normally worry about extensively
- A situation you'd typically avoid
- A trigger you'd usually manage with safety behaviors

This isn't exposure therapy - it's skills application under pressure.

**Integration Practices**

**Morning Integration** (2 min):
- Review your 5 rules
- Set daily implementation intention
- Quick DM practice

**Evening Integration** (3 min):
- Note rule applications today
- Celebrate successes (process, not outcome)
- Plan tomorrow's practice

**Preparing for Lapses**

Lapses are normal. Plan for them:

**If CAS returns**:
1. Don't panic - it's temporary
2. Return to basics: ATT + Postponement
3. Run mini-experiment to re-prove control
4. Remember: You've done this before`,
    keyPoints: [
      "Transform skills into automatic personal rules",
      "Strengthen new adaptive metacognitive beliefs",
      "Test skills under pressure, not exposure therapy",
      "Prepare for normal lapses with recovery protocol"
    ],
    tryThisNow: {
      instruction: "Next time you're triggered: 1. Apply your rules automatically 2. Don't think - just execute 3. Rate afterward: How automatic was it? (0-100)",
      duration: "Next trigger"
    },
    pitfalls: [
      {
        pitfall: "I still have worries",
        redirect: "Goal isn't no worries. It's relating differently"
      },
      {
        pitfall: "I'm not perfect at this",
        redirect: "Perfect is the enemy of good. Progress matters"
      },
      {
        pitfall: "Old patterns return sometimes",
        redirect: "Of course. New patterns need repetition"
      }
    ],
    experiment: {
      title: "High-Stakes Skills Application",
      beliefTarget: "Testing all beliefs simultaneously",
      protocol: [
        "Choose challenging but safe situation",
        "Enter without safety behaviors",
        "Apply MCT rules as needed",
        "Stay until anxiety naturally reduces",
        "Document skill usage and outcomes"
      ],
      prediction: "Skills will/won't work under high pressure",
      measurement: "Which skills used? How automatically? Outcome vs prediction?"
    },
    acceptanceCriteria: [
      "≥80% create personal rules list",
      "≥60% complete stress test successfully",
      "≥50% report increased automaticity",
      "New belief ratings ≥15 points higher than old"
    ]
  },
  {
    weekNumber: 8,
    title: "Your Blueprint for Lasting Change",
    learningObjectives: [
      "Create comprehensive relapse prevention plan",
      "Select sustainable maintenance routine",
      "Identify early warning signs and rapid responses"
    ],
    content: `This isn't the end - it's the beginning of your new relationship with thoughts. This week, we create your personalized blueprint for maintaining and extending gains.

**Recognizing Your Transformation**

Compare Week 1 to now:
- Worry minutes: Then vs Now
- Belief ratings: Then vs Now
- Skill confidence: Then vs Now
- CAS frequency: Then vs Now

Document these changes. They're your evidence.

**Early Warning Signs**

CAS rarely returns suddenly. Watch for:

**Behavioral Signs**:
- Postponement slipping
- ATT skipping
- Checking increasing
- Reassurance creeping back

**Cognitive Signs**:
- "Just this once" thinking
- Content focus returning
- Beliefs creeping back
- Skills feeling effortful again

**Mental Signs**:
- Attention feeling sticky
- Refocus taking longer
- DM feeling harder
- Worry chains extending

**Your Rapid Response Protocol**

When you notice warning signs:

**24-Hour Reset**:
1. Full ATT session immediately
2. Postpone everything postponable
3. DM every 2 hours
4. No safety behaviors for 24 hours
5. Re-rate beliefs to check drift

**3-Day Intensive**:
If 24-hour reset insufficient:
- Return to Week 4 protocol
- Daily experiments
- Double ATT (morning and evening)
- Strict postponement

**Maintenance Menu**

Choose your sustainable practice:

**Minimum Effective Dose**:
- ATT: 3x/week
- DM: Daily morning practice
- Postponement: As needed
- SAR: Keep 3 plans active

**Recommended Maintenance**:
- ATT: 5x/week
- DM: 3x daily
- Weekly belief check
- Monthly experiment

**Your Personal Blueprint**

Complete these sections:

1. **My CAS Triggers** (top 3)
2. **My Early Warning Signs** (top 3)
3. **My Go-To Skills** (rank by effectiveness)
4. **My Maintenance Commitment** (specific schedule)
5. **My Emergency Protocol** (when/what)
6. **My Success Evidence** (key changes)
7. **My Support Resources** (who/what/where)

**Planning for Life Events**

High-risk periods need extra vigilance:
- Major transitions
- Health challenges
- Relationship changes
- Work stress
- Anniversaries/reminders

Plan: "When [life event], I will [specific MCT actions]"`,
    keyPoints: [
      "Document your transformation as evidence of change",
      "Watch for behavioral, cognitive, and mental warning signs",
      "Use 24-hour reset or 3-day intensive for lapses",
      "Create personalized maintenance schedule and blueprint"
    ],
    tryThisNow: {
      instruction: "Run a 'planned lapse' experiment: 1. Skip ATT for 2 days 2. Notice what changes 3. Implement rapid response 4. Observe recovery speed. This builds confidence in your recovery ability.",
      duration: "This week"
    },
    pitfalls: [
      {
        pitfall: "I'm cured, don't need maintenance",
        redirect: "Athletes maintain fitness. You maintain mental flexibility"
      },
      {
        pitfall: "If I lapse, I've failed",
        redirect: "Lapses are data, not disasters. Use your protocol"
      },
      {
        pitfall: "I should be perfect now",
        redirect: "Perfect is unsustainable. Good enough is perfect"
      }
    ],
    experiment: {
      title: "Maintenance Stress Test",
      beliefTarget: "Confidence in ability to recover from lapses",
      protocol: [
        "Reduce practice to minimum for 3 days",
        "Note any changes in CAS/beliefs",
        "Return to full practice",
        "Document recovery time"
      ],
      prediction: "I will/won't be able to recover quickly",
      measurement: "Days to return to baseline, skills needed"
    },
    acceptanceCriteria: [
      "100% of completers create blueprint",
      "≥80% identify early warning signs",
      "≥70% commit to specific maintenance",
      "≥60% report confidence in self-management"
    ]
  }
];

export const getWeekContent = (weekNumber: number): WeeklyContentData | undefined => {
  for (let i = 0; i < weeklyContent.length; i++) {
    if (weeklyContent[i].weekNumber === weekNumber) {
      return weeklyContent[i];
    }
  }
  return undefined;
};

export const getAllWeeks = (): WeeklyContentData[] => {
  return weeklyContent;
};

export const getUnlockedWeeks = (currentWeek: number): WeeklyContentData[] => {
  const unlockedWeeks: WeeklyContentData[] = [];
  for (let i = 0; i < weeklyContent.length; i++) {
    if (weeklyContent[i].weekNumber <= currentWeek) {
      unlockedWeeks.push(weeklyContent[i]);
    }
  }
  return unlockedWeeks;
};