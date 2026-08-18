import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Helper for lazy Gemini client creation
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Generate meeting agenda from document text & meeting parameters
  app.post('/api/generate-agenda', async (req, res) => {
    try {
      const { documentText, config } = req.body;

      if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
        return res.status(400).json({ error: 'Document text is required.' });
      }

      const totalMinutes = Number(config?.totalDurationMinutes) || 45;
      const meetingType = config?.meetingType || 'Decision-Making';
      const customObjective = config?.customObjective || '';
      const participantsHint = config?.participantsHint || '';
      const bufferMinutes = Number(config?.bufferMinutes) || 5;
      const detailLevel = config?.detailLevel || 'balanced';

      const prompt = `You are an executive Chief of Staff and Master Meeting Facilitator.
Analyze the following source document (which may be project notes, product specs, RFC, strategy document, meeting briefing, or markdown/docx export) and craft an exceptionally clear, actionable, structured Meeting Agenda.

CRITICAL REQUIREMENTS:
1. TOTAL MEETING TIME: Exactly ${totalMinutes} minutes. The sum of all agenda sections' durationMinutes MUST sum up to exactly ${totalMinutes} minutes. Allocate realistic time per section based on complexity. Include a concise opening (${Math.min(5, Math.max(2, Math.floor(totalMinutes * 0.08)))}m) and closing/buffer (${Math.max(3, bufferMinutes)}m).
2. MEETING TYPE / GOAL: ${meetingType} ${customObjective ? `(Specific Objective: ${customObjective})` : ''}.
3. PARTICIPANTS / STAKEHOLDERS: Extract all named stakeholders, team roles, or functional departments identified from the document ${participantsHint ? `(User specified participants: ${participantsHint})` : ''}. For each stakeholder, state their clear role, responsibilities in this meeting, and what specific input/approval is needed from them.
4. AGENDA SECTIONS: Break the document down into logical discussion sections.
   For each section:
   - Provide a concise executive topic summary synthesizing what the document says about this topic.
   - List key discussion points / critical questions to address.
   - Identify the tangible expected outcome or decision gate.
   - Assign the lead stakeholder / speaker.
5. ACTION ITEMS & NEXT STEPS: Extract high-leverage action items, tasks, and follow-ups with suggested owners, clear priority (High/Medium/Low), realistic deadlines, and context.
6. PRE-READS & KEY RISKS: Highlight what participants must read before the meeting and any key blockers, risks, or contention points in the document.
7. DETAIL LEVEL: ${detailLevel}.

SOURCE DOCUMENT CONTENT:
"""
${documentText.slice(0, 70000)}
"""`;

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert executive meeting architect. Always generate comprehensive, practical, well-structured agendas strictly formatted according to the JSON schema. Ensure section minutes exactly sum up to the requested total duration.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Crisp, professional meeting title' },
              meetingGoal: { type: Type.STRING, description: 'Clear 1-2 sentence meeting objective/goal' },
              totalDurationMinutes: { type: Type.INTEGER, description: 'Total meeting minutes requested' },
              meetingType: {
                type: Type.STRING,
                description: 'Meeting type e.g. Decision-Making, Strategic Planning, Project Sync & Status, Brainstorming, Review & Retro',
              },
              targetAudience: { type: Type.STRING, description: 'Target audience and required attendees summary' },
              preReadHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 key takeaway points or pre-read highlights attendees should review prior to the call',
              },
              keyRisksOrBlockers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Critical risks, open debates, or dependencies highlighted in the doc',
              },
              stakeholders: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    nameOrRole: { type: Type.STRING, description: 'Stakeholder name or functional role' },
                    departmentOrTeam: { type: Type.STRING, description: 'Department or org team' },
                    responsibility: { type: Type.STRING, description: 'Their key role in the meeting' },
                    keyInterestOrInput: { type: Type.STRING, description: 'Specific input, approval, or update required from them' },
                  },
                  required: ['nameOrRole', 'responsibility'],
                },
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING, description: 'Descriptive section title' },
                    category: {
                      type: Type.STRING,
                      description: 'Category: Context & Kickoff, Discussion, Deep Dive, Decision Gate, Action Planning, Wrap-up & Buffer',
                    },
                    durationMinutes: { type: Type.INTEGER, description: 'Allocated minutes for this topic' },
                    summary: { type: Type.STRING, description: 'Executive topic summary from doc' },
                    keyDiscussionPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Questions, prompts, or debate items to cover'
                    },
                    expectedOutcome: { type: Type.STRING, description: 'Measurable outcome or decision made in this section' },
                    leadStakeholder: { type: Type.STRING, description: 'Who leads this section' },
                    speakerNotes: { type: Type.STRING, description: 'Facilitator tip or timing note' }
                  },
                  required: ['title', 'category', 'durationMinutes', 'summary', 'keyDiscussionPoints', 'expectedOutcome'],
                },
              },
              actionItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    task: { type: Type.STRING, description: 'Concrete action task' },
                    owner: { type: Type.STRING, description: 'Assigned owner or role' },
                    priority: { type: Type.STRING, description: 'High, Medium, or Low' },
                    suggestedDeadline: { type: Type.STRING, description: 'Target date or timeframe' },
                    context: { type: Type.STRING, description: 'Brief context or rationale' }
                  },
                  required: ['task', 'owner', 'priority'],
                },
              },
              closingQuestionOrPrompt: {
                type: Type.STRING,
                description: 'A powerful alignment or wrap-up question for the team at the end of the meeting'
              }
            },
            required: ['title', 'meetingGoal', 'totalDurationMinutes', 'stakeholders', 'sections', 'actionItems'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No output received from Gemini model.');
      }

      const agenda = JSON.parse(responseText);

      // Ensure IDs and duration sanity
      let currentTotal = 0;
      agenda.sections = (agenda.sections || []).map((sec: any, idx: number) => {
        const dur = Math.max(1, Math.round(Number(sec.durationMinutes) || 5));
        currentTotal += dur;
        return {
          ...sec,
          id: sec.id || `sec-${idx + 1}-${Date.now()}`,
          durationMinutes: dur,
        };
      });

      // If total duration drifted from requested total, normalize smoothly
      if (currentTotal !== totalMinutes && agenda.sections.length > 0) {
        const ratio = totalMinutes / currentTotal;
        let runningSum = 0;
        agenda.sections.forEach((sec: any, i: number) => {
          if (i === agenda.sections.length - 1) {
            sec.durationMinutes = Math.max(1, totalMinutes - runningSum);
          } else {
            const scaled = Math.max(1, Math.round(sec.durationMinutes * ratio));
            sec.durationMinutes = scaled;
            runningSum += scaled;
          }
        });
      }
      agenda.totalDurationMinutes = totalMinutes;

      agenda.stakeholders = (agenda.stakeholders || []).map((s: any, idx: number) => ({
        ...s,
        id: s.id || `stk-${idx + 1}`,
      }));

      agenda.actionItems = (agenda.actionItems || []).map((a: any, idx: number) => ({
        ...a,
        id: a.id || `act-${idx + 1}`,
        completed: false,
      }));

      res.json({ agenda });
    } catch (err: any) {
      console.error('Error generating agenda:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate meeting agenda with AI.',
      });
    }
  });

  // Re-timing / AI refinement endpoint
  app.post('/api/rebalance-agenda', async (req, res) => {
    try {
      const { currentAgenda, newTotalMinutes, focusSectionId } = req.body;

      if (!currentAgenda || !newTotalMinutes) {
        return res.status(400).json({ error: 'Missing agenda or new duration.' });
      }

      const totalMinutes = Number(newTotalMinutes);
      const prompt = `Adjust and re-time the following meeting agenda to fit exactly ${totalMinutes} minutes total.
Current meeting goal: "${currentAgenda.meetingGoal}"
Meeting title: "${currentAgenda.title}"
${focusSectionId ? `Prioritize deeper time allocation for section ID: ${focusSectionId}` : ''}

Original Agenda Sections:
${JSON.stringify(currentAgenda.sections, null, 2)}

Provide revised sections with adjusted durationMinutes that sum to exactly ${totalMinutes} minutes, adjusting the summaries or discussion points if necessary to suit the time constraint (e.g. compress or expand depth).`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    keyDiscussionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    expectedOutcome: { type: Type.STRING },
                    leadStakeholder: { type: Type.STRING },
                    speakerNotes: { type: Type.STRING },
                  },
                  required: ['title', 'category', 'durationMinutes', 'summary', 'keyDiscussionPoints', 'expectedOutcome'],
                },
              },
            },
            required: ['sections'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const revisedSections = parsed.sections || currentAgenda.sections;

      // Adjust to ensure exact sum
      let sum = 0;
      revisedSections.forEach((s: any) => {
        s.durationMinutes = Math.max(1, Math.round(Number(s.durationMinutes) || 5));
        sum += s.durationMinutes;
      });

      if (sum !== totalMinutes && revisedSections.length > 0) {
        const diff = totalMinutes - sum;
        revisedSections[revisedSections.length - 1].durationMinutes = Math.max(1, revisedSections[revisedSections.length - 1].durationMinutes + diff);
      }

      res.json({
        sections: revisedSections,
        totalDurationMinutes: totalMinutes,
      });
    } catch (err: any) {
      console.error('Error rebalancing agenda:', err);
      res.status(500).json({ error: err.message || 'Failed to rebalance agenda.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meeting Agenda Crafter server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
