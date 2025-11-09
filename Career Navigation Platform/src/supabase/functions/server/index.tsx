import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { realisticSimulations } from './realistic-simulations.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ==================== AUTH ====================

// Login
app.post('/make-server-a1779b8e/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Login error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      accessToken: data.session.access_token,
      user: data.user,
    });
  } catch (error) {
    console.log(`Login error: ${error}`);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Sign up
app.post('/make-server-a1779b8e/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'student',
      createdAt: new Date().toISOString(),
      completedSimulations: [],
      assessmentCompleted: false,
      recommendedTracks: [],
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get user profile
app.get('/make-server-a1779b8e/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// ==================== ASSESSMENT ====================

// Submit assessment
app.post('/make-server-a1779b8e/assessment/submit', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { answers } = await c.req.json();

    // Simple scoring algorithm
    const tracks = [
      { id: 'frontend', name: 'Frontend Development', score: 0, icon: 'Code' },
      { id: 'backend', name: 'Backend Development', score: 0, icon: 'Server' },
      { id: 'data', name: 'Data Analytics', score: 0, icon: 'BarChart3' },
      { id: 'design', name: 'UX/UI Design', score: 0, icon: 'Palette' },
      { id: 'marketing', name: 'Digital Marketing', score: 0, icon: 'TrendingUp' },
      { id: 'product', name: 'Product Management', score: 0, icon: 'Target' },
    ];

    // Score based on answers
    answers.forEach((answer: any) => {
      if (answer.questionId === 'q1') { // Interests in technical problem solving
        if (answer.value >= 4) {
          tracks[0].score += answer.value;
          tracks[1].score += answer.value;
        }
      }
      if (answer.questionId === 'q2') { // Creativity
        if (answer.value >= 4) {
          tracks[3].score += answer.value * 1.5;
          tracks[4].score += answer.value;
        }
      }
      if (answer.questionId === 'q3') { // Data analysis
        if (answer.value >= 4) {
          tracks[2].score += answer.value * 1.5;
        }
      }
      if (answer.questionId === 'q4') { // People skills
        if (answer.value >= 4) {
          tracks[4].score += answer.value;
          tracks[5].score += answer.value * 1.5;
        }
      }
      if (answer.questionId === 'q5') { // Visual design
        if (answer.value >= 4) {
          tracks[3].score += answer.value * 2;
        }
      }
    });

    // Get top 2 tracks
    tracks.sort((a, b) => b.score - a.score);
    const topTracks = tracks.slice(0, 2);

    // Generate AI-like recommendations
    const recommendations = {
      tracks: topTracks,
      explanation: `Based on your responses, you show strong aptitude for ${topTracks[0].name} and ${topTracks[1].name}. Your interests align well with these career paths.`,
      suggestedCourses: [
        { title: 'Introduction to ' + topTracks[0].name, platform: 'Coursera' },
        { title: topTracks[1].name + ' Fundamentals', platform: 'Udemy' },
      ],
      suggestedSimulations: await getSimulationsByTrack(topTracks[0].id),
      plan: generateSevenDayPlan(topTracks[0].name),
    };

    // Update user profile
    const profile = await kv.get(`user:${user.id}`);
    await kv.set(`user:${user.id}`, {
      ...profile,
      assessmentCompleted: true,
      recommendedTracks: topTracks.map(t => t.id),
      assessmentResults: recommendations,
    });

    return c.json({ recommendations });
  } catch (error) {
    console.log(`Assessment submit error: ${error}`);
    return c.json({ error: 'Failed to submit assessment' }, 500);
  }
});

// ==================== SIMULATIONS ====================

// Get all simulations
app.get('/make-server-a1779b8e/simulations', async (c) => {
  try {
    const simulations = await kv.getByPrefix('simulation:');
    
    // If no simulations exist, create default ones
    if (!simulations || simulations.length === 0) {
      await initializeDefaultSimulations();
      const newSimulations = await kv.getByPrefix('simulation:');
      return c.json({ simulations: newSimulations });
    }

    return c.json({ simulations });
  } catch (error) {
    console.log(`Get simulations error: ${error}`);
    return c.json({ error: 'Failed to get simulations' }, 500);
  }
});

// Get simulation by ID
app.get('/make-server-a1779b8e/simulations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const simulation = await kv.get(`simulation:${id}`);
    
    if (!simulation) {
      return c.json({ error: 'Simulation not found' }, 404);
    }

    return c.json({ simulation });
  } catch (error) {
    console.log(`Get simulation error: ${error}`);
    return c.json({ error: 'Failed to get simulation' }, 500);
  }
});

// Save simulation progress
app.post('/make-server-a1779b8e/simulations/:id/progress', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const { stepIndex, answers, completed } = await c.req.json();

    const progressKey = `progress:${user.id}:${id}`;
    
    // Calculate score if completed
    let result = null;
    if (completed) {
      const simulation = await kv.get(`simulation:${id}`);
      result = calculateScore(simulation, answers);
    }

    await kv.set(progressKey, {
      userId: user.id,
      simulationId: id,
      stepIndex,
      answers,
      completed,
      result,
      lastUpdated: new Date().toISOString(),
    });

    // If completed, add to user's results
    if (completed) {
      const profile = await kv.get(`user:${user.id}`);
      const simulationResults = profile.simulationResults || [];
      
      // Add new result
      simulationResults.push({
        simulationId: id,
        passed: result.passed,
        score: result.score,
        maxScore: result.maxScore,
        completedAt: new Date().toISOString(),
      });

      await kv.set(`user:${user.id}`, {
        ...profile,
        simulationResults,
      });
    }

    return c.json({ success: true, result });
  } catch (error) {
    console.log(`Save progress error: ${error}`);
    return c.json({ error: 'Failed to save progress' }, 500);
  }
});

// Get simulation progress
app.get('/make-server-a1779b8e/simulations/:id/progress', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const progress = await kv.get(`progress:${user.id}:${id}`);

    return c.json({ progress });
  } catch (error) {
    console.log(`Get progress error: ${error}`);
    return c.json({ error: 'Failed to get progress' }, 500);
  }
});

// ==================== ADMIN ====================

// Create simulation (admin only)
app.post('/make-server-a1779b8e/admin/simulations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const simulation = await c.req.json();
    const id = `sim_${Date.now()}`;
    
    await kv.set(`simulation:${id}`, {
      ...simulation,
      id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ simulation: { ...simulation, id } });
  } catch (error) {
    console.log(`Create simulation error: ${error}`);
    return c.json({ error: 'Failed to create simulation' }, 500);
  }
});

// Get analytics (admin only)
app.get('/make-server-a1779b8e/admin/analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const simulations = await kv.getByPrefix('simulation:');
    const progress = await kv.getByPrefix('progress:');

    const analytics = {
      totalUsers: users.length,
      totalSimulations: simulations.length,
      completedAssessments: users.filter((u: any) => u.assessmentCompleted).length,
      totalCompletions: progress.filter((p: any) => p.completed).length,
    };

    return c.json({ analytics });
  } catch (error) {
    console.log(`Get analytics error: ${error}`);
    return c.json({ error: 'Failed to get analytics' }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

async function getSimulationsByTrack(trackId: string) {
  const allSimulations = await kv.getByPrefix('simulation:');
  return allSimulations
    .filter((sim: any) => sim.track === trackId)
    .slice(0, 3)
    .map((sim: any) => ({
      id: sim.id,
      title: sim.title,
      duration: sim.duration,
    }));
}

function generateSevenDayPlan(trackName: string) {
  return [
    { day: 1, task: `Learn the basics of ${trackName}` },
    { day: 2, task: 'Complete your first simulation' },
    { day: 3, task: 'Review fundamentals and take notes' },
    { day: 4, task: 'Start a second simulation' },
    { day: 5, task: 'Practice core skills' },
    { day: 6, task: 'Complete final simulation' },
    { day: 7, task: 'Review progress and plan next steps' },
  ];
}

async function initializeDefaultSimulations() {
  // Use realistic simulations
  for (const sim of realisticSimulations) {
    await kv.set(`simulation:${sim.id}`, {
      ...sim,
      createdAt: new Date().toISOString(),
    });
  }
}

// Calculate score for simulation
function calculateScore(simulation: any, answers: any[]) {
  let score = 0;
  let maxScore = 0;

  simulation.steps.forEach((step: any, index: number) => {
    if (step.question) {
      maxScore += step.points || 10;
      const userAnswer = answers.find((a: any) => a.stepIndex === index);

      if (userAnswer && step.correctAnswer) {
        if (step.type === 'quiz') {
          if (userAnswer.answer === step.correctAnswer) {
            score += step.points || 10;
          }
        } else if (step.type === 'multipleChoice') {
          const correct = step.correctAnswer.sort().join(',');
          const user = (userAnswer.answer || []).sort().join(',');
          if (correct === user) {
            score += step.points || 10;
          }
        } else if (step.type === 'code') {
          // Simple code check - check if answer contains required keywords
          const required = step.requiredKeywords || [];
          const answerLower = (userAnswer.answer || '').toLowerCase();
          const hasAllKeywords = required.every((kw: string) => 
            answerLower.includes(kw.toLowerCase())
          );
          if (hasAllKeywords) {
            score += step.points || 10;
          }
        } else if (step.type === 'text') {
          // For text answers, give full points if not empty
          if (userAnswer.answer && userAnswer.answer.trim().length >= 100) {
            score += step.points || 10;
          }
        }
      }
    }
  });

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = percentage >= 70; // 70% to pass

  return {
    score,
    maxScore,
    percentage: Math.round(percentage),
    passed,
  };
}

// Initialize default data on server start
async function initializeServer() {
  console.log('Initializing Naviq server...');
  
  // Initialize simulations
  await initializeDefaultSimulations();
  
  console.log('Server initialized successfully');
}

// Start server
initializeServer().then(() => {
  Deno.serve(app.fetch);
}).catch((error) => {
  console.error('Failed to initialize server:', error);
});