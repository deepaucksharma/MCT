// SAR (Situational Attentional Refocusing) Action Library
// Based on Module 4 specifications - 30+ options across 5 categories
// Focus on quick (<30 second) external attention anchors

export interface SARAction {
  id: string;
  category: 'visual' | 'auditory' | 'tactile' | 'cognitive' | 'movement';
  name: string;
  description: string;
  duration: number; // in seconds
  instructions: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export const SAR_ACTION_LIBRARY: SARAction[] = [
  // VISUAL ACTIONS (8 actions)
  {
    id: 'visual-colors-5',
    category: 'visual',
    name: 'Count 5 Colors',
    description: 'Identify and count 5 objects of a specific color',
    duration: 20,
    instructions: 'Choose a color and find 5 objects of that color around you. Name each object as you find it.',
    difficulty: 'easy'
  },
  {
    id: 'visual-shapes-rectangular',
    category: 'visual',
    name: 'Find 3 Rectangles',
    description: 'Locate 3 rectangular shapes in your environment',
    duration: 15,
    instructions: 'Look around and identify 3 rectangular objects. Name what each object is.',
    difficulty: 'easy'
  },
  {
    id: 'visual-gradient-light-dark',
    category: 'visual',
    name: 'Light to Dark Gradient',
    description: 'Find objects from lightest to darkest shade',
    duration: 25,
    instructions: 'Choose a color and find 5 objects in that color, arranging them mentally from lightest to darkest.',
    difficulty: 'moderate'
  },
  {
    id: 'visual-movement-tracking',
    category: 'visual',
    name: 'Track Moving Objects',
    description: 'Follow moving objects with your eyes',
    duration: 30,
    instructions: 'Find any moving object (person, car, leaves, etc.) and track its movement for 30 seconds.',
    difficulty: 'easy'
  },
  {
    id: 'visual-details-scan',
    category: 'visual',
    name: 'Detail Scan',
    description: 'Examine fine details of a nearby object',
    duration: 20,
    instructions: 'Pick one object and examine it closely - texture, color variations, wear patterns, etc.',
    difficulty: 'moderate'
  },
  {
    id: 'visual-peripheral-awareness',
    category: 'visual',
    name: 'Peripheral Awareness',
    description: 'Notice what\'s in your peripheral vision',
    duration: 15,
    instructions: 'Look straight ahead and become aware of everything in your peripheral vision without moving your eyes.',
    difficulty: 'moderate'
  },
  {
    id: 'visual-alphabet-hunt',
    category: 'visual',
    name: 'Alphabet Object Hunt',
    description: 'Find objects starting with consecutive letters',
    duration: 30,
    instructions: 'Find objects that start with A, then B, then C, continuing as far as you can.',
    difficulty: 'challenging'
  },
  {
    id: 'visual-symmetry-search',
    category: 'visual',
    name: 'Symmetry Search',
    description: 'Identify symmetrical objects or patterns',
    duration: 20,
    instructions: 'Find 3 objects or patterns that show symmetry. Trace the line of symmetry mentally.',
    difficulty: 'moderate'
  },

  // AUDITORY ACTIONS (8 actions)
  {
    id: 'auditory-three-sounds',
    category: 'auditory',
    name: 'Identify 3 Sounds',
    description: 'Name three distinct sounds you can hear',
    duration: 15,
    instructions: 'Listen carefully and identify 3 different sounds. Name each one as you notice it.',
    difficulty: 'easy'
  },
  {
    id: 'auditory-furthest-sound',
    category: 'auditory',
    name: 'Focus on Furthest Sound',
    description: 'Concentrate on the most distant sound',
    duration: 20,
    instructions: 'Identify the furthest sound you can hear and focus your attention on it completely.',
    difficulty: 'easy'
  },
  {
    id: 'auditory-rhythm-count',
    category: 'auditory',
    name: 'Count Rhythm Patterns',
    description: 'Count beats or patterns in background sounds',
    duration: 25,
    instructions: 'Find a rhythmic sound (music, machinery, footsteps) and count the beats or pattern repetitions.',
    difficulty: 'moderate'
  },
  {
    id: 'auditory-sound-mapping',
    category: 'auditory',
    name: 'Create Sound Map',
    description: 'Map the location of different sounds around you',
    duration: 30,
    instructions: 'Identify sounds and their locations - front, back, left, right, above, below. Create a mental map.',
    difficulty: 'moderate'
  },
  {
    id: 'auditory-volume-levels',
    category: 'auditory',
    name: 'Volume Level Sorting',
    description: 'Rank sounds from quietest to loudest',
    duration: 20,
    instructions: 'Identify 4-5 sounds and mentally arrange them from quietest to loudest.',
    difficulty: 'moderate'
  },
  {
    id: 'auditory-frequency-high-low',
    category: 'auditory',
    name: 'High-Low Frequency Hunt',
    description: 'Find the highest and lowest pitched sounds',
    duration: 15,
    instructions: 'Listen for the highest pitched sound, then the lowest pitched sound you can hear.',
    difficulty: 'easy'
  },
  {
    id: 'auditory-silence-gaps',
    category: 'auditory',
    name: 'Find Silence Gaps',
    description: 'Notice moments of relative quiet',
    duration: 25,
    instructions: 'Listen for brief moments of quiet or silence between other sounds.',
    difficulty: 'challenging'
  },
  {
    id: 'auditory-echo-reverb',
    category: 'auditory',
    name: 'Echo and Reverb Detection',
    description: 'Notice how sounds bounce and fade',
    duration: 20,
    instructions: 'Listen for echoes, reverb, or how sounds fade. Notice the acoustic properties of your space.',
    difficulty: 'challenging'
  },

  // TACTILE ACTIONS (8 actions)
  {
    id: 'tactile-three-textures',
    category: 'tactile',
    name: 'Feel 3 Textures',
    description: 'Touch and compare 3 different textures',
    duration: 15,
    instructions: 'Find 3 objects with different textures (smooth, rough, soft, hard) and feel each one.',
    difficulty: 'easy'
  },
  {
    id: 'tactile-temperature-variations',
    category: 'tactile',
    name: 'Temperature Variations',
    description: 'Notice temperature differences on your skin',
    duration: 20,
    instructions: 'Feel air temperature on different parts of your body, or touch objects with different temperatures.',
    difficulty: 'easy'
  },
  {
    id: 'tactile-pressure-points',
    category: 'tactile',
    name: 'Pressure Point Awareness',
    description: 'Notice where your body touches surfaces',
    duration: 15,
    instructions: 'Feel where your body makes contact with surfaces - chair, floor, clothing. Notice the pressure.',
    difficulty: 'easy'
  },
  {
    id: 'tactile-hand-trace',
    category: 'tactile',
    name: 'Hand Trace Patterns',
    description: 'Trace patterns or shapes with your finger',
    duration: 20,
    instructions: 'Use your finger to trace your hand outline, or draw shapes on your palm or a surface.',
    difficulty: 'easy'
  },
  {
    id: 'tactile-fabric-examination',
    category: 'tactile',
    name: 'Fabric Examination',
    description: 'Explore the texture of different fabrics',
    duration: 25,
    instructions: 'Feel the texture of your clothing or nearby fabric. Notice thread patterns, thickness, smoothness.',
    difficulty: 'moderate'
  },
  {
    id: 'tactile-muscle-tension-release',
    category: 'tactile',
    name: 'Tension and Release',
    description: 'Tense and release different muscle groups',
    duration: 30,
    instructions: 'Tense your shoulders for 5 seconds, then release. Repeat with hands, then legs.',
    difficulty: 'moderate'
  },
  {
    id: 'tactile-object-weight',
    category: 'tactile',
    name: 'Object Weight Comparison',
    description: 'Compare the weight of different objects',
    duration: 20,
    instructions: 'Pick up 3 different objects and compare their weight. Arrange them from lightest to heaviest.',
    difficulty: 'moderate'
  },
  {
    id: 'tactile-air-movement',
    category: 'tactile',
    name: 'Air Movement Detection',
    description: 'Feel air currents and breezes',
    duration: 15,
    instructions: 'Notice any air movement - from vents, fans, or open windows. Feel it on your skin.',
    difficulty: 'challenging'
  },

  // COGNITIVE ACTIONS (8 actions)
  {
    id: 'cognitive-countdown-7s',
    category: 'cognitive',
    name: 'Count Down by 7s',
    description: 'Count backwards from 100 by 7s',
    duration: 30,
    instructions: 'Start at 100 and count backwards by 7s: 100, 93, 86, 79... Continue as far as you can.',
    difficulty: 'challenging'
  },
  {
    id: 'cognitive-category-naming',
    category: 'cognitive',
    name: 'Category A-Z',
    description: 'Name items in a category from A to Z',
    duration: 30,
    instructions: 'Choose a category (fruits, animals, countries) and name one item for each letter A-Z.',
    difficulty: 'moderate'
  },
  {
    id: 'cognitive-words-backward',
    category: 'cognitive',
    name: 'Spell Words Backwards',
    description: 'Spell common words backwards',
    duration: 25,
    instructions: 'Think of 5 common words and spell each one backwards letter by letter.',
    difficulty: 'moderate'
  },
  {
    id: 'cognitive-mental-math',
    category: 'cognitive',
    name: 'Mental Math Sequences',
    description: 'Perform simple math calculations',
    duration: 20,
    instructions: 'Start with any number and add 13, then subtract 7, then multiply by 2. Continue the pattern.',
    difficulty: 'challenging'
  },
  {
    id: 'cognitive-odd-even-sort',
    category: 'cognitive',
    name: 'Odd-Even Number Sort',
    description: 'Categorize numbers as odd or even',
    duration: 15,
    instructions: 'Think of random numbers and quickly categorize them as odd or even: 17-odd, 24-even, etc.',
    difficulty: 'easy'
  },
  {
    id: 'cognitive-rhyming-words',
    category: 'cognitive',
    name: 'Rhyming Word Chain',
    description: 'Create chains of rhyming words',
    duration: 20,
    instructions: 'Start with any word and create a chain of words that rhyme with it.',
    difficulty: 'moderate'
  },
  {
    id: 'cognitive-prime-numbers',
    category: 'cognitive',
    name: 'Prime Number Sequence',
    description: 'Recall prime numbers in sequence',
    duration: 25,
    instructions: 'List prime numbers starting from 2: 2, 3, 5, 7, 11, 13... Continue as far as you can.',
    difficulty: 'challenging'
  },
  {
    id: 'cognitive-acronym-creation',
    category: 'cognitive',
    name: 'Create Acronyms',
    description: 'Make acronyms from random letters',
    duration: 20,
    instructions: 'Pick 4-5 random letters and create a meaningful acronym or phrase using those letters.',
    difficulty: 'moderate'
  },

  // MOVEMENT ACTIONS (8 actions)
  {
    id: 'movement-step-counting',
    category: 'movement',
    name: 'Walk and Count Steps',
    description: 'Walk while counting steps to 50',
    duration: 30,
    instructions: 'Walk (in place if needed) while counting each step. Count to 50 steps.',
    difficulty: 'easy'
  },
  {
    id: 'movement-balance-challenge',
    category: 'movement',
    name: 'One-Foot Balance',
    description: 'Balance on one foot for 30 seconds',
    duration: 30,
    instructions: 'Stand on one foot and maintain balance for 30 seconds. Switch feet if needed.',
    difficulty: 'moderate'
  },
  {
    id: 'movement-finger-exercises',
    category: 'movement',
    name: 'Finger Exercise Pattern',
    description: 'Perform specific finger movement patterns',
    duration: 20,
    instructions: 'Touch thumb to each finger in sequence: thumb-index-middle-ring-pinky, then reverse.',
    difficulty: 'easy'
  },
  {
    id: 'movement-shoulder-rolls',
    category: 'movement',
    name: 'Shoulder Roll Sequence',
    description: 'Perform structured shoulder rolls',
    duration: 15,
    instructions: 'Roll shoulders forward 5 times, backward 5 times, then alternate forward-backward.',
    difficulty: 'easy'
  },
  {
    id: 'movement-neck-stretch',
    category: 'movement',
    name: 'Neck Stretch Sequence',
    description: 'Gentle neck stretches in all directions',
    duration: 25,
    instructions: 'Slowly look left, right, up, down. Hold each position for 3 seconds.',
    difficulty: 'easy'
  },
  {
    id: 'movement-heel-toe-walk',
    category: 'movement',
    name: 'Heel-to-Toe Walking',
    description: 'Walk placing heel directly in front of toe',
    duration: 20,
    instructions: 'Walk in a straight line placing your heel directly in front of the toe of your other foot.',
    difficulty: 'moderate'
  },
  {
    id: 'movement-arm-circles',
    category: 'movement',
    name: 'Arm Circle Patterns',
    description: 'Perform controlled arm circles',
    duration: 20,
    instructions: 'Make small circles with arms, then large circles. 5 forward, 5 backward.',
    difficulty: 'easy'
  },
  {
    id: 'movement-calf-raises',
    category: 'movement',
    name: 'Calf Raise Sequence',
    description: 'Rise up on toes and lower slowly',
    duration: 25,
    instructions: 'Rise up on your toes, hold for 2 seconds, lower slowly. Repeat 10 times.',
    difficulty: 'moderate'
  }
];

// Emergency SAR actions for immediate use (10 seconds or less)
export const EMERGENCY_SAR_ACTIONS: SARAction[] = [
  {
    id: 'emergency-stop-acronym',
    category: 'cognitive',
    name: 'STOP Technique',
    description: 'Stop, Take breath, Observe, Proceed',
    duration: 10,
    instructions: 'STOP what you\'re doing, Take a breath, Observe your environment, Proceed with awareness.',
    difficulty: 'easy'
  },
  {
    id: 'emergency-5-4-3-2-1',
    category: 'visual',
    name: '5-4-3-2-1 Grounding',
    description: '5 sights, 4 sounds, 3 touches, 2 smells, 1 taste',
    duration: 10,
    instructions: 'Quickly name 5 things you see, 4 sounds you hear, 3 things you can touch.',
    difficulty: 'easy'
  },
  {
    id: 'emergency-hand-trace',
    category: 'tactile',
    name: 'Quick Hand Trace',
    description: 'Trace hand outline with finger',
    duration: 10,
    instructions: 'Use your finger to quickly trace the outline of your other hand.',
    difficulty: 'easy'
  }
];

// Helper functions
export function getActionsByCategory(category: SARAction['category']): SARAction[] {
  return SAR_ACTION_LIBRARY.filter(action => action.category === category);
}

export function getActionsByDifficulty(difficulty: SARAction['difficulty']): SARAction[] {
  return SAR_ACTION_LIBRARY.filter(action => action.difficulty === difficulty);
}

export function getActionsByDuration(maxDuration: number): SARAction[] {
  return SAR_ACTION_LIBRARY.filter(action => action.duration <= maxDuration);
}

export function getRandomAction(): SARAction {
  const randomIndex = Math.floor(Math.random() * SAR_ACTION_LIBRARY.length);
  return SAR_ACTION_LIBRARY[randomIndex];
}

export function getRandomActionByCategory(category: SARAction['category']): SARAction {
  const categoryActions = getActionsByCategory(category);
  const randomIndex = Math.floor(Math.random() * categoryActions.length);
  return categoryActions[randomIndex];
}