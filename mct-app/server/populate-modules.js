const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'mct.db'));

// First, create the table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS program_modules (
    module_id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    learning_objectives TEXT NOT NULL,
    key_concepts TEXT NOT NULL,
    exercises TEXT NOT NULL,
    content TEXT NOT NULL,
    is_locked INTEGER DEFAULT 1,
    completion_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  console.log('Table created or already exists');

  // Check if data already exists
  db.get('SELECT COUNT(*) as count FROM program_modules', (err, row) => {
    if (err) {
      console.error('Error checking data:', err);
      return;
    }

    if (row.count > 0) {
      console.log('Modules already exist in database');
      db.close();
      return;
    }

    // Insert modules data
    const modules = [
      {
        week_number: 0,
        title: "Welcome & Assessment",
        description: "Introduction to MCT and baseline assessment",
        learning_objectives: JSON.stringify([
          "Understand the MCT approach",
          "Complete initial assessment",
          "Set personal goals"
        ]),
        key_concepts: JSON.stringify([
          "Metacognitive therapy",
          "Process vs content",
          "CAS identification"
        ]),
        exercises: JSON.stringify([
          "Initial ATT practice",
          "CAS monitoring introduction"
        ]),
        content: JSON.stringify({
          videos: ["Introduction to MCT"],
          readings: ["MCT Principles Guide"],
          activities: ["Baseline assessment", "Goal setting"]
        }),
        is_locked: 0
      },
      {
        week_number: 1,
        title: "Understanding Your Mind",
        description: "Introduction to metacognition and the CAS",
        learning_objectives: JSON.stringify([
          "Identify worry and rumination patterns",
          "Understand the CAS concept",
          "Begin monitoring metacognitive activity"
        ]),
        key_concepts: JSON.stringify([
          "CAS (Cognitive Attentional Syndrome)",
          "Worry vs rumination",
          "Threat monitoring"
        ]),
        exercises: JSON.stringify([
          "Daily CAS monitoring",
          "First ATT session",
          "Worry postponement introduction"
        ]),
        content: JSON.stringify({
          videos: ["The CAS Explained", "Your Metacognitive Mind"],
          readings: ["Chapter 1: Understanding Metacognition"],
          activities: ["CAS diary", "ATT practice"]
        }),
        is_locked: 0
      },
      {
        week_number: 2,
        title: "Attention Training",
        description: "Master the Attention Training Technique",
        learning_objectives: JSON.stringify([
          "Practice full ATT protocol",
          "Develop attentional flexibility",
          "Track attention control improvements"
        ]),
        key_concepts: JSON.stringify([
          "Selective attention",
          "Attention switching",
          "Divided attention"
        ]),
        exercises: JSON.stringify([
          "Daily ATT practice",
          "Attention flexibility exercises",
          "Focus challenges"
        ]),
        content: JSON.stringify({
          videos: ["ATT Full Protocol", "Mastering Attention Control"],
          readings: ["The Science of Attention"],
          activities: ["ATT sessions", "Attention games"]
        }),
        is_locked: 1
      },
      {
        week_number: 3,
        title: "Detached Mindfulness",
        description: "Learn to observe thoughts without engagement",
        learning_objectives: JSON.stringify([
          "Understand detached mindfulness",
          "Practice the LAPR method",
          "Apply DM to worry thoughts"
        ]),
        key_concepts: JSON.stringify([
          "Detached mindfulness",
          "LAPR method",
          "Metacognitive awareness"
        ]),
        exercises: JSON.stringify([
          "DM practice 3x daily",
          "Thought observation",
          "Metaphor exercises"
        ]),
        content: JSON.stringify({
          videos: ["Introduction to DM", "LAPR Method Tutorial"],
          readings: ["Detached Mindfulness Guide"],
          activities: ["DM practices", "Metaphor selection"]
        }),
        is_locked: 1
      },
      {
        week_number: 4,
        title: "Challenging Beliefs",
        description: "Examine and modify metacognitive beliefs",
        learning_objectives: JSON.stringify([
          "Identify metacognitive beliefs",
          "Design behavioral experiments",
          "Test belief validity"
        ]),
        key_concepts: JSON.stringify([
          "Uncontrollability beliefs",
          "Danger beliefs",
          "Positive beliefs about worry"
        ]),
        exercises: JSON.stringify([
          "Belief rating",
          "Experiment design",
          "Belief challenging"
        ]),
        content: JSON.stringify({
          videos: ["Metacognitive Beliefs", "Designing Experiments"],
          readings: ["Understanding Your Beliefs"],
          activities: ["Belief assessment", "First experiment"]
        }),
        is_locked: 1
      },
      {
        week_number: 5,
        title: "Postponement Mastery",
        description: "Master worry postponement techniques",
        learning_objectives: JSON.stringify([
          "Establish worry periods",
          "Practice postponement",
          "Reduce worry frequency"
        ]),
        key_concepts: JSON.stringify([
          "Worry postponement",
          "Scheduled worry time",
          "Attention refocusing"
        ]),
        exercises: JSON.stringify([
          "Daily postponement",
          "Worry slot management",
          "Refocus practice"
        ]),
        content: JSON.stringify({
          videos: ["Postponement Strategy", "Managing Worry Time"],
          readings: ["Postponement Guide"],
          activities: ["Set worry periods", "Track postponements"]
        }),
        is_locked: 1
      },
      {
        week_number: 6,
        title: "Advanced Techniques",
        description: "Combine techniques for maximum effect",
        learning_objectives: JSON.stringify([
          "Integrate all techniques",
          "Handle difficult situations",
          "Build resilience"
        ]),
        key_concepts: JSON.stringify([
          "Technique integration",
          "Situational application",
          "Resilience building"
        ]),
        exercises: JSON.stringify([
          "Combined practice",
          "SAR planning",
          "Challenge scenarios"
        ]),
        content: JSON.stringify({
          videos: ["Advanced MCT", "Integration Strategies"],
          readings: ["Advanced Techniques"],
          activities: ["Complex experiments", "SAR development"]
        }),
        is_locked: 1
      },
      {
        week_number: 7,
        title: "Real-World Application",
        description: "Apply MCT to daily life challenges",
        learning_objectives: JSON.stringify([
          "Apply MCT to real situations",
          "Develop personal strategies",
          "Build confidence"
        ]),
        key_concepts: JSON.stringify([
          "Real-world application",
          "Personal adaptation",
          "Confidence building"
        ]),
        exercises: JSON.stringify([
          "Real-life practice",
          "Strategy development",
          "Success tracking"
        ]),
        content: JSON.stringify({
          videos: ["Real-World MCT", "Success Stories"],
          readings: ["Application Guide"],
          activities: ["Field experiments", "Strategy refinement"]
        }),
        is_locked: 1
      },
      {
        week_number: 8,
        title: "Maintenance & Relapse Prevention",
        description: "Maintain gains and prevent relapse",
        learning_objectives: JSON.stringify([
          "Create maintenance plan",
          "Identify warning signs",
          "Build long-term habits"
        ]),
        key_concepts: JSON.stringify([
          "Relapse prevention",
          "Maintenance strategies",
          "Long-term wellness"
        ]),
        exercises: JSON.stringify([
          "Maintenance planning",
          "Regular practice schedule",
          "Progress review"
        ]),
        content: JSON.stringify({
          videos: ["Maintaining Progress", "Relapse Prevention"],
          readings: ["Long-term Success Guide"],
          activities: ["Create maintenance plan", "Set reminders"]
        }),
        is_locked: 1
      }
    ];

    // Insert all modules
    const stmt = db.prepare(`
      INSERT INTO program_modules (
        week_number, title, description, learning_objectives,
        key_concepts, exercises, content, is_locked
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    modules.forEach(module => {
      stmt.run(
        module.week_number,
        module.title,
        module.description,
        module.learning_objectives,
        module.key_concepts,
        module.exercises,
        module.content,
        module.is_locked,
        (err) => {
          if (err) {
            console.error(`Error inserting week ${module.week_number}:`, err);
          } else {
            console.log(`Inserted week ${module.week_number}: ${module.title}`);
          }
        }
      );
    });

    stmt.finalize(() => {
      console.log('All modules inserted successfully');
      db.close();
    });
  });
});