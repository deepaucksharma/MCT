import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../utils/database';

interface FidelityViolation {
  id?: number;
  timestamp: string;
  violation_type: 'content_analysis' | 'reassurance_seeking' | 'content_input' | 'process_deviation';
  route: string;
  request_data: string;
  user_ip?: string;
  user_agent?: string;
  severity: 'low' | 'medium' | 'high';
  blocked: boolean;
}

// Content analysis keywords that indicate user is trying to analyze worry content
const CONTENT_ANALYSIS_KEYWORDS = [
  'what if', 'probably', 'might happen', 'could be', 'realistic',
  'likely', 'chance of', 'possibility', 'scenario', 'outcome',
  'analyze', 'think through', 'figure out', 'solve', 'plan for',
  'worried about', 'anxious about', 'concerned about', 'fear of',
  'scared of', 'health', 'illness', 'disease', 'symptoms',
  'relationship', 'work', 'money', 'future', 'past'
];

// Reassurance-seeking patterns
const REASSURANCE_PATTERNS = [
  'is this normal', 'should i worry', 'am i being', 'is it okay',
  'what do you think', 'does this mean', 'is this bad', 'help me understand',
  'reassure', 'tell me', 'confirm', 'validate'
];

// Process-focused keywords that are allowed
const PROCESS_FOCUSED_KEYWORDS = [
  'minutes', 'count', 'frequency', 'times', 'rating', 'scale',
  'postpone', 'notice', 'observe', 'refocus', 'attention', 'practice'
];

export class FidelityGuard {
  private static async logViolation(violation: FidelityViolation) {
    try {
      const db = await getDatabase();
      await db.run(
        `INSERT INTO fidelity_violations (
          timestamp, violation_type, route, request_data,
          user_ip, user_agent, severity, blocked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          violation.timestamp,
          violation.violation_type,
          violation.route,
          violation.request_data,
          violation.user_ip,
          violation.user_agent,
          violation.severity,
          violation.blocked ? 1 : 0
        ]
      );
      console.log(`Fidelity violation logged: ${violation.violation_type} on ${violation.route}`);
    } catch (error) {
      console.error('Failed to log fidelity violation:', error);
    }
  }

  private static analyzeTextForContent(text: string): { hasContent: boolean; score: number; triggers: string[] } {
    if (!text || typeof text !== 'string') {
      return { hasContent: false, score: 0, triggers: [] };
    }

    const lowerText = text.toLowerCase();
    const triggers: string[] = [];
    let contentScore = 0;

    // Check for content analysis patterns
    CONTENT_ANALYSIS_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        triggers.push(keyword);
        contentScore += 2;
      }
    });

    // Check for reassurance-seeking patterns
    REASSURANCE_PATTERNS.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        triggers.push(pattern);
        contentScore += 3;
      }
    });

    // Reduce score for process-focused content
    PROCESS_FOCUSED_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        contentScore -= 1;
      }
    });

    // Long descriptive text likely contains content
    if (text.length > 200) {
      contentScore += Math.floor(text.length / 100);
      triggers.push('lengthy_description');
    }

    // Multiple sentences likely contain narrative content
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 2) {
      contentScore += sentences.length;
      triggers.push('narrative_content');
    }

    return {
      hasContent: contentScore > 3,
      score: Math.max(0, contentScore),
      triggers
    };
  }

  private static getSeverity(score: number): 'low' | 'medium' | 'high' {
    if (score >= 10) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  public static blockContentAnalysis() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestData = JSON.stringify(req.body);
        const analysis = FidelityGuard.analyzeTextForContent(requestData);

        if (analysis.hasContent) {
          const violation: FidelityViolation = {
            timestamp: new Date().toISOString(),
            violation_type: 'content_analysis',
            route: req.path,
            request_data: requestData,
            user_ip: req.ip,
            user_agent: req.get('User-Agent'),
            severity: FidelityGuard.getSeverity(analysis.score),
            blocked: true
          };

          await FidelityGuard.logViolation(violation);

          return res.status(400).json({
            error: 'Content analysis not permitted',
            message: 'I notice you\'re sharing the content of your thoughts. In MCT, we focus on HOW you\'re relating to these thoughts, not WHAT they\'re about.',
            fidelity_violation: true,
            process_focus_prompt: 'Instead, let\'s focus on: How many minutes did you spend on this thought? Can you postpone it to your designated worry time?',
            triggers: analysis.triggers
          });
        }

        next();
      } catch (error) {
        console.error('FidelityGuard error:', error);
        next();
      }
    };
  }

  public static blockReassuranceSeeking() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestData = JSON.stringify(req.body);
        const lowerData = requestData.toLowerCase();

        const reassuranceScore = REASSURANCE_PATTERNS.reduce((score, pattern) => {
          return lowerData.includes(pattern) ? score + 1 : score;
        }, 0);

        if (reassuranceScore > 0) {
          const violation: FidelityViolation = {
            timestamp: new Date().toISOString(),
            violation_type: 'reassurance_seeking',
            route: req.path,
            request_data: requestData,
            user_ip: req.ip,
            user_agent: req.get('User-Agent'),
            severity: reassuranceScore > 2 ? 'high' : 'medium',
            blocked: true
          };

          await FidelityGuard.logViolation(violation);

          return res.status(400).json({
            error: 'Reassurance seeking detected',
            message: 'Seeking reassurance maintains the problem. Let\'s focus on postponing this worry and practicing your ATT.',
            fidelity_violation: true,
            process_focus_prompt: 'Try this instead: Notice the urge for reassurance, rate it 0-100, then postpone to your worry slot.'
          });
        }

        next();
      } catch (error) {
        console.error('FidelityGuard error:', error);
        next();
      }
    };
  }

  public static validateProcessFocus() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Validate that notes field only contains process-focused content
        if (req.body.notes) {
          const analysis = FidelityGuard.analyzeTextForContent(req.body.notes);

          if (analysis.hasContent) {
            const violation: FidelityViolation = {
              timestamp: new Date().toISOString(),
              violation_type: 'content_input',
              route: req.path,
              request_data: JSON.stringify(req.body),
              user_ip: req.ip,
              user_agent: req.get('User-Agent'),
              severity: FidelityGuard.getSeverity(analysis.score),
              blocked: true
            };

            await FidelityGuard.logViolation(violation);

            return res.status(400).json({
              error: 'Content detected in notes field',
              message: 'Please focus on the process (how you related to thoughts) rather than content (what the thoughts were about).',
              fidelity_violation: true,
              process_examples: [
                'Noticed worry at 3pm, postponed successfully',
                'Used ATT when rumination started',
                'Refocused attention 3 times during episode'
              ]
            });
          }
        }

        next();
      } catch (error) {
        console.error('FidelityGuard error:', error);
        next();
      }
    };
  }

  public static crisisDetection() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestData = JSON.stringify(req.body).toLowerCase();

        const crisisKeywords = [
          'suicide', 'kill myself', 'end it all', 'can\'t go on',
          'hurt myself', 'self harm', 'worthless', 'hopeless',
          'emergency', 'crisis', 'desperate'
        ];

        const hasCrisisContent = crisisKeywords.some(keyword =>
          requestData.includes(keyword)
        );

        if (hasCrisisContent) {
          const violation: FidelityViolation = {
            timestamp: new Date().toISOString(),
            violation_type: 'process_deviation',
            route: req.path,
            request_data: 'CRISIS_DETECTED',
            user_ip: req.ip,
            user_agent: req.get('User-Agent'),
            severity: 'high',
            blocked: true
          };

          await FidelityGuard.logViolation(violation);

          return res.status(200).json({
            crisis_detected: true,
            message: 'This requires immediate professional support.',
            resources: {
              emergency: '988 (Suicide & Crisis Lifeline)',
              text: 'Text HOME to 741741 (Crisis Text Line)',
              chat: 'suicidepreventionlifeline.org'
            },
            immediate_action: 'Please contact emergency services or go to your nearest emergency room if you are in immediate danger.'
          });
        }

        next();
      } catch (error) {
        console.error('FidelityGuard error:', error);
        next();
      }
    };
  }

  public static logFidelityMetrics() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Log process-focused interactions as positive fidelity events
        const violation: FidelityViolation = {
          timestamp: new Date().toISOString(),
          violation_type: 'process_deviation',
          route: req.path,
          request_data: 'PROCESS_FOCUSED',
          user_ip: req.ip,
          user_agent: req.get('User-Agent'),
          severity: 'low',
          blocked: false
        };

        await FidelityGuard.logViolation(violation);
        next();
      } catch (error) {
        console.error('FidelityGuard error:', error);
        next();
      }
    };
  }
}

export default FidelityGuard;