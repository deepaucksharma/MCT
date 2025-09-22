export interface ResourceLink {
  title: string;
  url: string;
  type: 'video' | 'audio' | 'article' | 'website' | 'podcast';
  duration?: string;
  description?: string;
}

export interface ResourceCategory {
  title: string;
  description: string;
  resources: ResourceLink[];
}

export const mctResources = {
  // Orientation & Strategic Positioning
  orientation: {
    dtxIntroduction: [
      { title: "Introduction to Digital Therapeutics", url: "https://www.youtube.com/watch?v=GnXEqycQD9Y", type: "video" as const },
      { title: "DTx for Mental Health", url: "https://www.youtube.com/watch?v=EOq-zGP0NME", type: "video" as const },
      { title: "Clinical Implementation of DTx", url: "https://www.youtube.com/watch?v=lmiPMGyv-sU", type: "video" as const },
      { title: "DTx Product Adoption", url: "https://www.youtube.com/watch?v=TsNcP7cneaU", type: "video" as const },
      { title: "DTx Alliance Resources", url: "https://dtxalliance.org", type: "website" as const }
    ],
    mctOverview: [
      { title: "Metacognitive Therapy Explained", url: "https://www.youtube.com/watch?v=gvLB1mwZpAQ", type: "video" as const, duration: "15 min" },
      { title: "MCT vs Traditional CBT", url: "https://www.youtube.com/watch?v=3Axoap4DsQA", type: "video" as const, duration: "12 min" },
      { title: "MCT Practitioner Stories", url: "https://www.milkcratetheatre.com/mctpodcastseries", type: "podcast" as const }
    ]
  },

  // Clinical Model & S-REF
  clinicalModel: {
    srefModel: [
      { title: "S-REF Model Overview", url: "https://www.youtube.com/watch?v=i-4Sku5dYX8", type: "video" as const, duration: "20 min" },
      { title: "Understanding CAS", url: "https://www.youtube.com/watch?v=Ttpydn8udvI", type: "video" as const, duration: "18 min" },
      { title: "CAS and Comorbidity Research", url: "https://pubmed.ncbi.nlm.nih.gov/27746757/", type: "article" as const },
      { title: "Current MCT Clinical Trials", url: "https://clinicaltrials.gov/study/NCT06971692", type: "website" as const }
    ],
    metaBeliefs: [
      { title: "Meta-beliefs & Process Model", url: "https://www.youtube.com/watch?v=vRrrJnRA58Q", type: "video" as const, duration: "25 min" },
      { title: "Metacognitive Beliefs Assessment", url: "https://www.youtube.com/watch?v=Ym1IvWPXl4Q", type: "video" as const, duration: "15 min" }
    ],
    clinicalDemos: [
      { title: "MCT Session Demo", url: "https://www.youtube.com/watch?v=q0DWXsG5Hik", type: "video" as const, duration: "45 min" },
      { title: "MCT Practice Examples", url: "https://www.youtube.com/watch?v=obxvEgut5UU", type: "video" as const, duration: "30 min" }
    ]
  },

  // ATT Resources
  attResources: {
    guidedSessions: [
      { title: "ATT Full Session Playlist", url: "https://www.youtube.com/playlist?list=PLLsl5yHvf5N1mmSAK0RfdssydXNhaCOsh", type: "video" as const },
      { title: "12-Minute ATT Session", url: "https://www.youtube.com/watch?v=UbODyGHflv0", type: "video" as const, duration: "12 min" },
      { title: "Attention Control - 4 Sounds", url: "https://www.youtube.com/watch?v=9_eAVpwgE8M", type: "video" as const, duration: "10 min" },
      { title: "Norwegian ATT Guide", url: "https://www.youtube.com/watch?v=kbTkwMJExCc", type: "video" as const, duration: "15 min" },
      { title: "MindCare Media ATT Channel", url: "https://www.youtube.com/channel/UCqIGO_r2PNIsaI072LMIXEw", type: "video" as const }
    ],
    theory: [
      { title: "Mechanisms of Mindfulness", url: "https://cambridge.org/core/journals/the-british-journal-of-psychiatry", type: "article" as const },
      { title: "Attention Training Research", url: "https://pubmed.ncbi.nlm.nih.gov/27746757/", type: "article" as const }
    ]
  },

  // DM Resources
  dmResources: {
    practice: [
      { title: "Decentering Techniques", url: "https://www.youtube.com/c/MetacognitiveTherapyInstitute", type: "video" as const },
      { title: "DM Micro-practices", url: "https://www.youtube.com/@metacognitivetherapycentra7478", type: "video" as const },
      { title: "60-Second DM Exercise", url: "https://www.youtube.com/watch?v=dM2zQsY6Hng", type: "video" as const, duration: "1 min" }
    ],
    integration: [
      { title: "DM in Daily Life", url: "https://www.youtube.com/watch?v=3Axoap4DsQA", type: "video" as const, duration: "8 min" },
      { title: "Process vs Content Focus", url: "https://www.youtube.com/watch?v=Ttpydn8udvI", type: "video" as const, duration: "10 min" }
    ]
  },

  // Behavioral Experiments
  experiments: [
    { title: "Behavioral Experiments in MCT", url: "https://www.youtube.com/watch?v=RLJxMH8H-js", type: "video" as const, duration: "20 min" },
    { title: "Testing Metacognitive Beliefs", url: "https://www.youtube.com/watch?v=vRrrJnRA58Q", type: "video" as const, duration: "15 min" },
    { title: "Experiment Design Templates", url: "https://www.youtube.com/c/CBTforAll", type: "video" as const },
    { title: "CBT/MCT Experiments Playlist", url: "https://www.youtube.com/playlist?list=PL4Qw4-tlRJe-sZ_U4Fzi66UXMGvkPTf7P", type: "video" as const }
  ],

  // Measurement & Outcomes
  measurement: [
    { title: "Patient Reported Outcomes", url: "https://pcori.org", type: "website" as const },
    { title: "Clinical Dashboard Demo", url: "https://www.youtube.com/watch?v=l_jZTh05pts", type: "video" as const, duration: "10 min" },
    { title: "DTx Outcome Tracking", url: "https://www.youtube.com/watch?v=SvRJRoM652s", type: "video" as const, duration: "15 min" }
  ],

  // Professional Resources
  professional: {
    training: [
      { title: "Metacognitive Therapy Institute", url: "https://www.youtube.com/c/MetacognitiveTherapyInstitute", type: "video" as const },
      { title: "Adrian Wells Lectures", url: "https://www.youtube.com/watch?v=vRrrJnRA58Q", type: "video" as const },
      { title: "MCT Certification Info", url: "https://www.mct-institute.com", type: "website" as const }
    ],
    research: [
      { title: "MCT Clinical Research", url: "https://pubmed.ncbi.nlm.nih.gov/27746757/", type: "article" as const },
      { title: "Behavioural and Cognitive Psychotherapy", url: "https://cambridge.org/core/journals/behavioural-and-cognitive-psychotherapy", type: "article" as const },
      { title: "British Journal of Psychiatry", url: "https://cambridge.org/core/journals/the-british-journal-of-psychiatry", type: "article" as const }
    ],
    podcasts: [
      { title: "Psychology Podcast", url: "https://scottbarrykaufman.com/podcast/", type: "podcast" as const },
      { title: "MCT Practitioner Stories", url: "https://www.milkcratetheatre.com/mctpodcastseries", type: "podcast" as const }
    ]
  },

  // Week-specific resources
  weeklyResources: {
    week0: {
      title: "Welcome to MCT",
      resources: [
        { title: "Introduction to MCT", url: "https://www.youtube.com/watch?v=gvLB1mwZpAQ", type: "video" as const, duration: "15 min" },
        { title: "Understanding CAS", url: "https://www.youtube.com/watch?v=Ttpydn8udvI", type: "video" as const, duration: "18 min" },
        { title: "Process vs Content", url: "https://www.youtube.com/watch?v=3Axoap4DsQA", type: "video" as const, duration: "12 min" }
      ]
    },
    week1: {
      title: "Mapping Your CAS & Starting ATT",
      resources: [
        { title: "CAS Identification", url: "https://www.youtube.com/watch?v=i-4Sku5dYX8", type: "video" as const, duration: "20 min" },
        { title: "First ATT Session", url: "https://www.youtube.com/watch?v=UbODyGHflv0", type: "video" as const, duration: "12 min" },
        { title: "Postponement Introduction", url: "https://www.youtube.com/watch?v=obxvEgut5UU", type: "video" as const, duration: "10 min" }
      ]
    },
    week2: {
      title: "Detached Mindfulness",
      resources: [
        { title: "DM Fundamentals", url: "https://www.youtube.com/watch?v=dM2zQsY6Hng", type: "video" as const, duration: "8 min" },
        { title: "Decentering Practice", url: "https://www.youtube.com/c/MetacognitiveTherapyInstitute", type: "video" as const },
        { title: "DM Integration", url: "https://www.youtube.com/watch?v=3Axoap4DsQA", type: "video" as const, duration: "10 min" }
      ]
    },
    week3: {
      title: "Challenging Uncontrollability",
      resources: [
        { title: "Uncontrollability Beliefs", url: "https://www.youtube.com/watch?v=vRrrJnRA58Q", type: "video" as const, duration: "25 min" },
        { title: "Control Experiments", url: "https://www.youtube.com/watch?v=RLJxMH8H-js", type: "video" as const, duration: "20 min" }
      ]
    },
    week4: {
      title: "Challenging Danger Beliefs",
      resources: [
        { title: "Danger Metacognitions", url: "https://www.youtube.com/watch?v=Ym1IvWPXl4Q", type: "video" as const, duration: "15 min" },
        { title: "Safety Behaviors", url: "https://www.youtube.com/watch?v=q0DWXsG5Hik", type: "video" as const, duration: "20 min" }
      ]
    },
    week5: {
      title: "Positive Beliefs About Worry",
      resources: [
        { title: "Positive Metacognitions", url: "https://www.youtube.com/watch?v=vRrrJnRA58Q", type: "video" as const, duration: "25 min" },
        { title: "Belief Modification", url: "https://www.youtube.com/watch?v=obxvEgut5UU", type: "video" as const, duration: "30 min" }
      ]
    },
    week6: {
      title: "Advanced Techniques",
      resources: [
        { title: "Advanced ATT Variations", url: "https://www.youtube.com/watch?v=kbTkwMJExCc", type: "video" as const, duration: "15 min" },
        { title: "SAR Implementation", url: "https://www.youtube.com/watch?v=9_eAVpwgE8M", type: "video" as const, duration: "10 min" }
      ]
    },
    week7: {
      title: "Integration & Practice",
      resources: [
        { title: "Full MCT Session", url: "https://www.youtube.com/watch?v=q0DWXsG5Hik", type: "video" as const, duration: "45 min" },
        { title: "Daily Integration", url: "https://www.youtube.com/watch?v=3Axoap4DsQA", type: "video" as const, duration: "12 min" }
      ]
    },
    week8: {
      title: "Relapse Prevention",
      resources: [
        { title: "Maintaining Gains", url: "https://www.youtube.com/watch?v=obxvEgut5UU", type: "video" as const, duration: "20 min" },
        { title: "Long-term Practice", url: "https://www.youtube.com/watch?v=Ym1IvWPXl4Q", type: "video" as const, duration: "15 min" }
      ]
    }
  }
};

// Helper function to get resources for a specific week
export function getWeekResources(weekNumber: number) {
  const weekKey = `week${weekNumber}` as keyof typeof mctResources.weeklyResources;
  return mctResources.weeklyResources[weekKey] || null;
}

// Helper function to get all professional resources
export function getProfessionalResources(): ResourceCategory[] {
  return [
    {
      title: "Training & Certification",
      description: "Professional MCT training resources",
      resources: mctResources.professional.training
    },
    {
      title: "Research & Publications",
      description: "Academic research and clinical studies",
      resources: mctResources.professional.research
    },
    {
      title: "Podcasts & Discussions",
      description: "Audio content and practitioner interviews",
      resources: mctResources.professional.podcasts
    }
  ];
}