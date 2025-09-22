export interface ATTPhase {
  name: string;
  duration: number; // in seconds
  instructions: Array<{
    time: number; // seconds from start of phase
    text: string;
  }>;
}

export interface ATTScript {
  name: string;
  totalDuration: number; // in seconds
  phases: ATTPhase[];
}

// Standard Track (12-15 minutes) - 900 seconds total
export const standardATTScript: ATTScript = {
  name: "Standard ATT",
  totalDuration: 900, // 15 minutes
  phases: [
    {
      name: "Introduction",
      duration: 30,
      instructions: [
        {
          time: 0,
          text: "This is Attention Training Technique. This is not relaxation or mindfulness. This is training for your attention. Sit comfortably with eyes closed or softly focused. We'll work with sounds in your environment."
        }
      ]
    },
    {
      name: "Selective Attention",
      duration: 180, // 3 minutes
      instructions: [
        {
          time: 0,
          text: "Focus your attention on the most distant sound you can hear. Give it your full attention."
        },
        {
          time: 30,
          text: "Now switch your attention to a closer sound, perhaps in this room. Focus completely on this sound."
        },
        {
          time: 60,
          text: "Now focus on a sound very close to you, perhaps your own breathing. Give it full attention."
        },
        {
          time: 90,
          text: "Switch back to the distant sound."
        },
        {
          time: 120,
          text: "Now to the room sound."
        },
        {
          time: 150,
          text: "And to the close sound."
        }
      ]
    },
    {
      name: "Rapid Attention Switching",
      duration: 240, // 4 minutes
      instructions: [
        {
          time: 0,
          text: "Now you'll rapidly switch attention between different sounds. Don't analyze, just shift. Focus on any sound."
        },
        {
          time: 5,
          text: "Now switch."
        },
        {
          time: 10,
          text: "Switch again."
        },
        {
          time: 15,
          text: "Another sound."
        },
        {
          time: 20,
          text: "Switch."
        },
        {
          time: 25,
          text: "Keep switching every few seconds."
        },
        {
          time: 30,
          text: "Don't stay with any sound."
        },
        {
          time: 35,
          text: "Just keep moving your attention."
        },
        {
          time: 40,
          text: "Switch."
        },
        {
          time: 45,
          text: "Switch."
        },
        {
          time: 50,
          text: "Switch."
        },
        {
          time: 60,
          text: "Switch."
        },
        {
          time: 65,
          text: "Switch."
        },
        {
          time: 70,
          text: "Switch."
        },
        {
          time: 80,
          text: "Switch."
        },
        {
          time: 85,
          text: "Switch."
        },
        {
          time: 90,
          text: "Switch."
        },
        {
          time: 100,
          text: "Switch."
        },
        {
          time: 105,
          text: "Switch."
        },
        {
          time: 110,
          text: "Switch."
        },
        {
          time: 120,
          text: "Switch."
        },
        {
          time: 125,
          text: "Switch."
        },
        {
          time: 130,
          text: "Switch."
        },
        {
          time: 140,
          text: "Switch."
        },
        {
          time: 145,
          text: "Switch."
        },
        {
          time: 150,
          text: "Switch."
        },
        {
          time: 160,
          text: "Switch."
        },
        {
          time: 165,
          text: "Switch."
        },
        {
          time: 170,
          text: "Switch."
        },
        {
          time: 180,
          text: "Switch."
        },
        {
          time: 185,
          text: "Switch."
        },
        {
          time: 190,
          text: "Switch."
        },
        {
          time: 200,
          text: "Switch."
        },
        {
          time: 205,
          text: "Switch."
        },
        {
          time: 210,
          text: "Switch."
        },
        {
          time: 220,
          text: "Switch."
        },
        {
          time: 225,
          text: "Switch."
        },
        {
          time: 230,
          text: "Switch."
        }
      ]
    },
    {
      name: "Divided Attention",
      duration: 240, // 4 minutes
      instructions: [
        {
          time: 0,
          text: "Now try to expand your attention to be aware of multiple sounds simultaneously. Be aware of two sounds at the same time."
        },
        {
          time: 30,
          text: "Hold both in awareness."
        },
        {
          time: 60,
          text: "Add a third sound. Try to maintain awareness of all three."
        },
        {
          time: 90,
          text: "Now expand further. Be aware of as many sounds as possible simultaneously."
        },
        {
          time: 120,
          text: "The entire sound environment. All sounds together. Maintain this broad awareness."
        },
        {
          time: 180,
          text: "Now narrow to three sounds."
        },
        {
          time: 210,
          text: "Now two."
        },
        {
          time: 225,
          text: "Now one."
        }
      ]
    },
    {
      name: "Flexible Control",
      duration: 180, // 3 minutes
      instructions: [
        {
          time: 0,
          text: "Now practice flexible control. Narrow your attention to one specific sound."
        },
        {
          time: 20,
          text: "Expand to the whole soundscape."
        },
        {
          time: 40,
          text: "Narrow to a different single sound."
        },
        {
          time: 60,
          text: "Expand again to all sounds."
        },
        {
          time: 80,
          text: "Switch rapidly between three sounds."
        },
        {
          time: 110,
          text: "Now hold all three simultaneously."
        },
        {
          time: 140,
          text: "Return to single focus."
        },
        {
          time: 160,
          text: "And finally, let your attention rest neutrally, aware but not focused."
        }
      ]
    },
    {
      name: "Closing",
      duration: 30,
      instructions: [
        {
          time: 0,
          text: "In a moment, open your eyes and return your attention to the room. Remember, you just trained your attention. This control is always available to you. Opening your eyes now."
        }
      ]
    }
  ]
};

// Short Track (7-8 minutes) - 480 seconds total
export const shortATTScript: ATTScript = {
  name: "Short ATT",
  totalDuration: 480, // 8 minutes
  phases: [
    {
      name: "Introduction",
      duration: 30,
      instructions: [
        {
          time: 0,
          text: "This is Attention Training Technique. This is not relaxation or mindfulness. This is training for your attention. Sit comfortably with eyes closed or softly focused. We'll work with sounds in your environment."
        }
      ]
    },
    {
      name: "Selective Attention",
      duration: 120, // 2 minutes
      instructions: [
        {
          time: 0,
          text: "Focus your attention on the most distant sound you can hear. Give it your full attention."
        },
        {
          time: 30,
          text: "Now switch your attention to a closer sound, perhaps in this room. Focus completely on this sound."
        },
        {
          time: 60,
          text: "Now focus on a sound very close to you, perhaps your own breathing. Give it full attention."
        },
        {
          time: 90,
          text: "Switch back to the distant sound."
        }
      ]
    },
    {
      name: "Rapid Attention Switching",
      duration: 120, // 2 minutes
      instructions: [
        {
          time: 0,
          text: "Now you'll rapidly switch attention between different sounds. Don't analyze, just shift. Focus on any sound."
        },
        {
          time: 5,
          text: "Now switch."
        },
        {
          time: 10,
          text: "Switch again."
        },
        {
          time: 15,
          text: "Another sound."
        },
        {
          time: 20,
          text: "Switch."
        },
        {
          time: 25,
          text: "Keep switching every few seconds."
        },
        {
          time: 30,
          text: "Don't stay with any sound."
        },
        {
          time: 35,
          text: "Just keep moving your attention."
        },
        {
          time: 40,
          text: "Switch."
        },
        {
          time: 45,
          text: "Switch."
        },
        {
          time: 50,
          text: "Switch."
        },
        {
          time: 60,
          text: "Switch."
        },
        {
          time: 65,
          text: "Switch."
        },
        {
          time: 70,
          text: "Switch."
        },
        {
          time: 80,
          text: "Switch."
        },
        {
          time: 85,
          text: "Switch."
        },
        {
          time: 90,
          text: "Switch."
        },
        {
          time: 100,
          text: "Switch."
        },
        {
          time: 105,
          text: "Switch."
        },
        {
          time: 110,
          text: "Switch."
        }
      ]
    },
    {
      name: "Divided Attention",
      duration: 120, // 2 minutes
      instructions: [
        {
          time: 0,
          text: "Now try to expand your attention to be aware of multiple sounds simultaneously. Be aware of two sounds at the same time."
        },
        {
          time: 30,
          text: "Hold both in awareness. Add a third sound. Try to maintain awareness of all three."
        },
        {
          time: 60,
          text: "Now expand further. Be aware of as many sounds as possible simultaneously. The entire sound environment."
        },
        {
          time: 90,
          text: "Now narrow to three sounds."
        },
        {
          time: 105,
          text: "Now two."
        },
        {
          time: 115,
          text: "Now one."
        }
      ]
    },
    {
      name: "Flexible Control",
      duration: 60, // 1 minute
      instructions: [
        {
          time: 0,
          text: "Now practice flexible control. Narrow your attention to one specific sound."
        },
        {
          time: 15,
          text: "Expand to the whole soundscape."
        },
        {
          time: 30,
          text: "Switch rapidly between three sounds."
        },
        {
          time: 45,
          text: "And finally, let your attention rest neutrally, aware but not focused."
        }
      ]
    },
    {
      name: "Closing",
      duration: 30,
      instructions: [
        {
          time: 0,
          text: "In a moment, open your eyes and return your attention to the room. Remember, you just trained your attention. This control is always available to you. Opening your eyes now."
        }
      ]
    }
  ]
};

// Emergency ATT-Lite (90 seconds)
export const emergencyATTScript: ATTScript = {
  name: "Emergency ATT-Lite",
  totalDuration: 90,
  phases: [
    {
      name: "Identify Sounds",
      duration: 20,
      instructions: [
        {
          time: 0,
          text: "Quickly identify three distinct sounds around you. Don't analyze them, just notice them."
        }
      ]
    },
    {
      name: "Rapid Switching",
      duration: 30,
      instructions: [
        {
          time: 0,
          text: "Now rapidly switch your attention between these three sounds."
        },
        {
          time: 5,
          text: "Switch."
        },
        {
          time: 10,
          text: "Switch."
        },
        {
          time: 15,
          text: "Switch."
        },
        {
          time: 20,
          text: "Switch."
        },
        {
          time: 25,
          text: "Switch."
        }
      ]
    },
    {
      name: "Hold All Three",
      duration: 20,
      instructions: [
        {
          time: 0,
          text: "Now hold all three sounds in your awareness simultaneously."
        }
      ]
    },
    {
      name: "Expand to Full Soundscape",
      duration: 20,
      instructions: [
        {
          time: 0,
          text: "Expand your attention to the full soundscape around you. All sounds together."
        }
      ]
    }
  ]
};

export const attScripts = {
  standard: standardATTScript,
  short: shortATTScript,
  emergency: emergencyATTScript
};

export type ATTScriptType = keyof typeof attScripts;