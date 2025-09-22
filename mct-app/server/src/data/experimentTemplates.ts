import { ExperimentTemplate } from '../types';

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  {
    id: 'postponement-control',
    name: 'Postponement Control Test',
    target_belief: 'My worry is uncontrollable',
    hypothesis: 'If worry is truly uncontrollable, I won\'t be able to postpone it.',
    protocol: {
      description: 'Test your ability to postpone worry episodes to a designated time slot.',
      steps: [
        'Detect 3+ worry episodes daily',
        'Rate initial urge (0-100)',
        'Postpone to evening slot',
        'Rate urge at slot (0-100)',
        'Track: Did worry return to awareness before slot?'
      ],
      duration: '3 days',
      frequency: '3+ episodes per day'
    },
    metrics: [
      {
        name: 'Postponement Success Rate',
        type: 'percentage',
        description: 'Percentage of worry episodes successfully postponed'
      },
      {
        name: 'Average Urge Reduction',
        type: 'number',
        description: 'Average reduction in worry urge from initial to slot time'
      },
      {
        name: 'Episodes Forgotten',
        type: 'percentage',
        description: 'Percentage of worries that were forgotten entirely'
      }
    ],
    success_criteria: [
      '>60% success = Evidence of control',
      '>20 point urge reduction = Natural decay',
      '>30% forgotten = Not as important as felt'
    ],
    common_outcome: 'I postponed 8/10 episodes successfully. Urge dropped from average 70 to 25.',
    learning_options: [
      'I have more control than I believed',
      'Postponing is possible even with strong urges',
      'Many worries aren\'t important enough to remember'
    ],
    difficulty_level: 'easy',
    recommended_week: 1
  },

  {
    id: 'time-to-refocus',
    name: 'Time-to-Refocus Drill',
    target_belief: 'Once I start worrying, I can\'t stop',
    hypothesis: 'If I can\'t stop, refocus time won\'t improve with practice.',
    protocol: {
      description: 'Measure and improve your ability to refocus attention when worry starts.',
      steps: [
        'Notice worry starting',
        'Start timer',
        'Apply SAR immediately',
        'Stop timer when refocused',
        'Record seconds'
      ],
      duration: '3 days',
      frequency: '5 trials per day'
    },
    metrics: [
      {
        name: 'Day 1 Average Time',
        type: 'number',
        description: 'Average refocus time in seconds on day 1'
      },
      {
        name: 'Day 3 Average Time',
        type: 'number',
        description: 'Average refocus time in seconds on day 3'
      },
      {
        name: 'Improvement Percentage',
        type: 'percentage',
        description: 'Percentage improvement from day 1 to day 3'
      },
      {
        name: 'Shortest Time Achieved',
        type: 'number',
        description: 'Best refocus time achieved in seconds'
      }
    ],
    success_criteria: [
      'Any reduction = Evidence of control',
      '>30% reduction = Strong evidence',
      '<60 seconds achieved = Skill acquired'
    ],
    common_outcome: 'Refocus time decreased from 180s to 45s average',
    learning_options: [
      'I can stop worry faster with practice',
      'Attention is more flexible than I thought',
      'Quick refocusing is a learnable skill'
    ],
    difficulty_level: 'easy',
    recommended_week: 1
  },

  {
    id: 'no-monitoring-window',
    name: 'No-Monitoring Window',
    target_belief: 'If I don\'t monitor, I\'ll miss something dangerous',
    hypothesis: 'Not monitoring will lead to missing real dangers.',
    protocol: {
      description: 'Create monitoring-free windows to test if dangers are actually missed.',
      steps: [
        'Monday: 9-11 AM (no body scanning)',
        'Tuesday: 2-4 PM (no news checking)',
        'Wednesday: 6-8 PM (no mental reviewing)',
        'Track anxiety at start (0-100)',
        'Track anxiety every 30 min',
        'Record actual dangers missed',
        'Record consequences experienced'
      ],
      duration: '3 days',
      frequency: '2-hour windows'
    },
    metrics: [
      {
        name: 'Real Dangers Missed',
        type: 'number',
        description: 'Count of actual dangers that were missed'
      },
      {
        name: 'Negative Consequences',
        type: 'number',
        description: 'Count of negative consequences experienced'
      },
      {
        name: 'Anxiety Habituation',
        type: 'scale',
        description: 'How much did anxiety decrease during windows?'
      },
      {
        name: 'Productivity During Windows',
        type: 'scale',
        description: 'How productive were you during non-monitoring periods?'
      }
    ],
    success_criteria: [
      '0 dangers missed = Monitoring isn\'t protective',
      'Anxiety decreases = Habituation occurs',
      'Higher productivity = Less monitoring helps'
    ],
    common_outcome: '0 dangers missed, anxiety decreased, got more done',
    learning_options: [
      'Monitoring doesn\'t prevent problems',
      'I notice important things without trying',
      'Less monitoring = less anxiety, same safety'
    ],
    difficulty_level: 'moderate',
    recommended_week: 2
  },

  {
    id: 'checking-reduction',
    name: 'Checking Reduction Challenge',
    target_belief: 'I must check or something bad will happen',
    hypothesis: 'Reducing checking will lead to negative consequences.',
    protocol: {
      description: 'Systematically reduce checking behaviors and track actual outcomes.',
      steps: [
        'Week 1: Track baseline checking frequency',
        'Week 2: Reduce checking by 50%',
        'Choose target: Email (20x→10x), Door locks (5x→2x), or Symptoms (15x→7x)',
        'Record urge intensity when resisting',
        'Time how long urges take to pass',
        'Track actual problems from not checking'
      ],
      duration: '2 weeks',
      frequency: 'Daily tracking'
    },
    metrics: [
      {
        name: 'Baseline Frequency',
        type: 'number',
        description: 'Average daily checking frequency in week 1'
      },
      {
        name: 'Reduced Frequency',
        type: 'number',
        description: 'Average daily checking frequency in week 2'
      },
      {
        name: 'Problems Occurred',
        type: 'number',
        description: 'Count of actual problems from reduced checking'
      },
      {
        name: 'Average Urge Duration',
        type: 'number',
        description: 'Average time in minutes for checking urges to pass'
      }
    ],
    success_criteria: [
      'Zero problems = Checking isn\'t protective',
      'Urges pass <10 min = Temporary discomfort only',
      'Function maintained = You can cope with less'
    ],
    common_outcome: 'Reduced email checking 60%, zero problems, urges passed in <10 min',
    learning_options: [
      'Checking doesn\'t prevent problems',
      'Urges to check pass quickly',
      'I can function with less checking'
    ],
    difficulty_level: 'moderate',
    recommended_week: 3
  },

  {
    id: 'reassurance-seeking-fade',
    name: 'Reassurance Seeking Fade',
    target_belief: 'I need reassurance to cope',
    hypothesis: 'Without reassurance, I won\'t be able to function.',
    protocol: {
      description: 'Eliminate reassurance seeking for 72 hours and track functioning.',
      steps: [
        'No reassurance seeking from others',
        'No Googling symptoms/worries',
        'No "checking in" texts',
        'When urge arises: Rate urge (0-100)',
        'Use postponement (24 hours)',
        'Apply DM and SAR',
        'Rate urge 1 hour later'
      ],
      duration: '72 hours',
      frequency: 'Continuous'
    },
    metrics: [
      {
        name: 'Reassurance Urges Resisted',
        type: 'percentage',
        description: 'Percentage of reassurance urges successfully resisted'
      },
      {
        name: 'Average Urge Duration',
        type: 'number',
        description: 'Average time in minutes for reassurance urges to pass'
      },
      {
        name: 'Daily Function Impact',
        type: 'scale',
        description: 'How well did you function each day? (0-10)'
      },
      {
        name: 'Problems From Not Seeking',
        type: 'number',
        description: 'Count of problems that occurred from not seeking reassurance'
      }
    ],
    success_criteria: [
      '>80% urges resisted = You have control',
      'Normal functioning = Reassurance not needed',
      'Zero problems = Reassurance doesn\'t prevent issues'
    ],
    common_outcome: 'Resisted 14/16 urges, functioned normally, anxiety decreased',
    learning_options: [
      'I can cope without reassurance',
      'Reassurance urges pass naturally',
      'Self-reliance feels better than dependence'
    ],
    difficulty_level: 'challenging',
    recommended_week: 3
  },

  {
    id: 'plan-vs-worry',
    name: 'Plan-Then-Act vs Worry-First',
    target_belief: 'Worry helps me prepare better',
    hypothesis: 'Worry leads to better preparation than brief planning.',
    protocol: {
      description: 'Compare worry-based vs planning-based preparation for similar tasks.',
      steps: [
        'Choose 2 similar tasks/decisions',
        'Task A (Worry approach): Worry for 10 minutes, note actions generated, execute',
        'Task B (Planning approach): Plan for 2 minutes max, note actions generated, execute',
        'Rate preparedness (0-100) and distress (0-100) for each',
        'Compare outcomes'
      ],
      duration: '1 week',
      frequency: '2 comparable tasks'
    },
    metrics: [
      {
        name: 'Worry Actions Generated',
        type: 'number',
        description: 'Number of actionable items from worry approach'
      },
      {
        name: 'Planning Actions Generated',
        type: 'number',
        description: 'Number of actionable items from planning approach'
      },
      {
        name: 'Worry Preparedness Rating',
        type: 'scale',
        description: 'How prepared did you feel with worry approach?'
      },
      {
        name: 'Planning Preparedness Rating',
        type: 'scale',
        description: 'How prepared did you feel with planning approach?'
      },
      {
        name: 'Worry Distress Level',
        type: 'scale',
        description: 'Distress level during worry approach'
      },
      {
        name: 'Planning Distress Level',
        type: 'scale',
        description: 'Distress level during planning approach'
      }
    ],
    success_criteria: [
      'Planning generates more actions = More efficient',
      'Equal/higher preparedness = Worry isn\'t necessary',
      'Lower distress with planning = Better experience'
    ],
    common_outcome: 'Planning: 3 actions in 2 min, felt 80% prepared. Worry: 1 action in 10 min, felt 60% prepared',
    learning_options: [
      'Brief planning is more effective than worry',
      'Worry doesn\'t improve preparation',
      'Action beats rumination'
    ],
    difficulty_level: 'moderate',
    recommended_week: 4
  },

  {
    id: 'dm-micro-intervals',
    name: 'DM Micro-Intervals',
    target_belief: 'I can\'t detach from important thoughts',
    hypothesis: 'Important thoughts require immediate engagement.',
    protocol: {
      description: 'Practice detached mindfulness during high-trigger periods.',
      steps: [
        'During known trigger time: Insert 3x 60-second DM practices',
        'Space 20 minutes apart',
        'Rate before/after each: Thought urgency (0-100)',
        'Rate ability to detach (0-100)',
        'Track: Did anything bad happen from detaching?'
      ],
      duration: '1 day',
      frequency: '3 micro-sessions during trigger period'
    },
    metrics: [
      {
        name: 'Successful Detachment Rate',
        type: 'percentage',
        description: 'Percentage of times you successfully detached'
      },
      {
        name: 'Urgency Reduction Average',
        type: 'number',
        description: 'Average reduction in thought urgency after DM'
      },
      {
        name: 'Negative Consequences',
        type: 'number',
        description: 'Count of negative consequences from detaching'
      },
      {
        name: 'Return to Task Time',
        type: 'number',
        description: 'Average time in seconds to return to previous activity'
      }
    ],
    success_criteria: [
      '100% detachment = Possible even with "important" thoughts',
      '>20 point urgency drop = Thoughts aren\'t as urgent as they feel',
      'Zero consequences = Detachment is safe'
    ],
    common_outcome: 'Detached 3/3 times, urgency dropped 30 points, no consequences',
    learning_options: [
      'I can detach even from "important" thoughts',
      'Urgency is a feeling, not a fact',
      'Detachment doesn\'t mean neglect'
    ],
    difficulty_level: 'moderate',
    recommended_week: 5
  },

  {
    id: 'att-in-trigger',
    name: 'ATT-Lite in Trigger',
    target_belief: 'I lose all control when triggered',
    hypothesis: 'Attention control is impossible during emotional activation.',
    protocol: {
      description: 'Apply attention training when emotionally triggered.',
      steps: [
        'When triggered: Rate distress (0-100)',
        'Perform 90-second ATT-Lite',
        'Rate distress again',
        'Rate shift difficulty (0-100)',
        'Complete 5 trials over 3 days'
      ],
      duration: '3 days',
      frequency: '5 trials when triggered'
    },
    metrics: [
      {
        name: 'Completion Rate',
        type: 'percentage',
        description: 'Percentage of triggered moments where ATT was completed'
      },
      {
        name: 'Average Distress Reduction',
        type: 'number',
        description: 'Average reduction in distress rating after ATT'
      },
      {
        name: 'Shift Difficulty Trend',
        type: 'scale',
        description: 'How did difficulty change from trial 1 to 5?'
      },
      {
        name: 'Time to Baseline',
        type: 'number',
        description: 'Average time in minutes to return to emotional baseline'
      }
    ],
    success_criteria: [
      '100% completion = Control exists even when distressed',
      '>10 point distress drop = Skills work in difficult moments',
      'Easier over time = Practice builds capacity'
    ],
    common_outcome: 'Completed 5/5, distress dropped average 20 points, got easier each time',
    learning_options: [
      'I can control attention even when distressed',
      'Skills work in difficult moments',
      'Practice makes triggers manageable'
    ],
    difficulty_level: 'challenging',
    recommended_week: 6
  },

  {
    id: 'allow-thought-windows',
    name: 'Allow-the-Thought Windows',
    target_belief: 'Having worry thoughts is dangerous',
    hypothesis: 'Allowing worry thoughts will lead to losing control.',
    protocol: {
      description: 'Deliberately allow worry thoughts without engagement or suppression.',
      steps: [
        '2-minute windows, 3x daily',
        'Deliberately allow any worry thoughts',
        'Don\'t engage or suppress',
        'Just observe their presence',
        'Rate at end: Did you lose control? (Y/N)',
        'Rate distress level (0-100)',
        'Note what actually happened'
      ],
      duration: '3 days',
      frequency: '3 x 2-minute windows daily'
    },
    metrics: [
      {
        name: 'Control Maintained',
        type: 'percentage',
        description: 'Percentage of windows where control was maintained'
      },
      {
        name: 'Average Distress Level',
        type: 'scale',
        description: 'Average distress during allow-windows'
      },
      {
        name: 'Thought Intensity Change',
        type: 'scale',
        description: 'How did thought intensity change during allowing?'
      },
      {
        name: 'Actual Consequences',
        type: 'number',
        description: 'Count of negative consequences from allowing thoughts'
      }
    ],
    success_criteria: [
      '100% control maintained = Thoughts aren\'t dangerous',
      'Decreasing intensity = Allowing reduces power',
      'Zero consequences = Thoughts are just thoughts'
    ],
    common_outcome: 'Maintained control 100%, thoughts got boring, no consequences',
    learning_options: [
      'Thoughts themselves aren\'t dangerous',
      'Allowing doesn\'t mean engaging',
      'Thoughts lose power when not fought'
    ],
    difficulty_level: 'moderate',
    recommended_week: 5
  },

  {
    id: 'drop-safety-net',
    name: 'Drop One Safety Net',
    target_belief: 'I need [specific safety behavior] to cope',
    hypothesis: 'Without this safety behavior, I won\'t manage.',
    protocol: {
      description: 'Remove one key safety behavior completely for 48 hours.',
      steps: [
        'Choose ONE safety behavior: Phone checking, Carrying medication, Avoiding topics, Mental reviewing',
        'Complete removal (not reduction) for 48 hours',
        'Track hourly: Anxiety (0-100)',
        'Note actual problems',
        'Use SAR when urges arise'
      ],
      duration: '48 hours',
      frequency: 'Continuous removal'
    },
    metrics: [
      {
        name: 'Hours Without Safety Behavior',
        type: 'number',
        description: 'Total hours successfully avoiding the safety behavior'
      },
      {
        name: 'Peak Anxiety Level',
        type: 'scale',
        description: 'Highest anxiety level reached during removal'
      },
      {
        name: 'Time to Anxiety Reduction',
        type: 'number',
        description: 'Hours until anxiety began decreasing'
      },
      {
        name: 'Actual Negative Outcomes',
        type: 'number',
        description: 'Count of real negative outcomes from dropping behavior'
      }
    ],
    success_criteria: [
      '48+ hours achieved = You\'re stronger than believed',
      'Anxiety peaks then drops = Natural habituation',
      'Zero real problems = Safety behavior unnecessary'
    ],
    common_outcome: '48 hours without phone checking, anxiety peaked at 60 then dropped, nothing bad happened',
    learning_options: [
      'Safety behaviors aren\'t necessary',
      'I\'m stronger than I thought',
      'Anxiety passes without safety behaviors'
    ],
    difficulty_level: 'challenging',
    recommended_week: 6
  },

  {
    id: 'content-timer',
    name: 'Content Timer Experiment',
    target_belief: 'I must think things through completely',
    hypothesis: 'Incomplete thinking will lead to problems.',
    protocol: {
      description: 'Limit worry/rumination episodes to 90 seconds and track outcomes.',
      steps: [
        'When worry/rumination starts: Set timer for 90 seconds',
        'Note the topic (brief label only)',
        'When timer rings, STOP',
        'Apply SAR immediately',
        'Track: Did the issue get resolved later?',
        'Did stopping cause problems?',
        'Did it return as urgent?'
      ],
      duration: '5 days',
      frequency: 'Every worry/rumination episode'
    },
    metrics: [
      {
        name: 'Episodes Limited Successfully',
        type: 'percentage',
        description: 'Percentage of episodes successfully limited to 90 seconds'
      },
      {
        name: 'Problems From Stopping',
        type: 'number',
        description: 'Count of actual problems caused by stopping early'
      },
      {
        name: 'Topics Returning as Urgent',
        type: 'number',
        description: 'Count of topics that returned as truly urgent'
      },
      {
        name: 'Resolution Without Rumination',
        type: 'number',
        description: 'Count of issues that resolved naturally without extended thinking'
      }
    ],
    success_criteria: [
      '>80% limited successfully = You can control thinking duration',
      'Zero problems = Complete thinking isn\'t necessary',
      'Most don\'t return = Not as important as felt'
    ],
    common_outcome: 'Limited 12/15 episodes, zero problems, most never returned',
    learning_options: [
      'Complete thinking isn\'t necessary',
      'Most worries resolve without rumination',
      'Time limits don\'t cause problems'
    ],
    difficulty_level: 'moderate',
    recommended_week: 7
  },

  {
    id: 'stress-test-composite',
    name: 'Stress Test Composite',
    target_belief: 'I can\'t use MCT skills in real situations',
    hypothesis: 'Skills only work in calm practice, not real life.',
    protocol: {
      description: 'Apply all MCT skills during a challenging but safe real-life situation.',
      steps: [
        'Choose challenging but safe situation: Social event, Work presentation, Medical appointment, Difficult conversation',
        'Apply ALL skills: Pre-event ATT, DM during waiting, SAR for acute worry',
        'Use postponement for non-urgent concerns',
        'Avoid all safety behaviors',
        'Track skill usage and effectiveness'
      ],
      duration: '1 challenging situation',
      frequency: 'Single comprehensive test'
    },
    metrics: [
      {
        name: 'Skills Used',
        type: 'number',
        description: 'Number of MCT skills successfully applied (out of 5)'
      },
      {
        name: 'ATT Effectiveness',
        type: 'scale',
        description: 'How effective was ATT in this situation?'
      },
      {
        name: 'DM Effectiveness',
        type: 'scale',
        description: 'How effective was DM in this situation?'
      },
      {
        name: 'SAR Effectiveness',
        type: 'scale',
        description: 'How effective was SAR in this situation?'
      },
      {
        name: 'Overall Coping Rating',
        type: 'scale',
        description: 'How well did you cope overall? (0-100)'
      },
      {
        name: 'Comparison to Usual Coping',
        type: 'scale',
        description: 'How did this compare to your usual coping? (0-100)'
      }
    ],
    success_criteria: [
      '4+ skills used = Skills are accessible in real life',
      '>60 overall coping = MCT works under pressure',
      'Better than usual = New strategies superior'
    ],
    common_outcome: 'Used 4/5 skills, coped 75/100 vs usual 40/100',
    learning_options: [
      'MCT works in real life',
      'I can cope without old strategies',
      'New skills are becoming natural'
    ],
    difficulty_level: 'challenging',
    recommended_week: 7
  }
];

export const getExperimentTemplate = (id: string): ExperimentTemplate | undefined => {
  return EXPERIMENT_TEMPLATES.find(template => template.id === id);
};

export const getExperimentsByWeek = (week: number): ExperimentTemplate[] => {
  return EXPERIMENT_TEMPLATES.filter(template => template.recommended_week === week);
};

export const getExperimentsByDifficulty = (level: 'easy' | 'moderate' | 'challenging'): ExperimentTemplate[] => {
  return EXPERIMENT_TEMPLATES.filter(template => template.difficulty_level === level);
};

export default EXPERIMENT_TEMPLATES;