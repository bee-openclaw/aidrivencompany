import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { initDatabase } from '@aidrivencompany/db';
import {
  createCompany,
  createNode,
  createEdge,
  createSimulation,
  createCampaign,
  createProofItem,
  createMetricSnapshot,
  createDecision,
  createActivity,
} from '@aidrivencompany/db';

const DB_DIR = path.join(os.homedir(), '.aidrivencompany');
const DB_PATH = process.env.DB_PATH ?? path.join(DB_DIR, 'dev.db');

fs.mkdirSync(DB_DIR, { recursive: true });

// Delete existing DB to start fresh
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Cleared existing database');
}

const db = initDatabase(DB_PATH);
console.log(`Database initialized at ${DB_PATH}`);

// ── Company 1: SpeeTch AI ────────────────────────────────────────────

const speechAI = createCompany(db, {
  name: 'SpeeTch AI',
  description: 'AI-powered speech coaching platform',
  mission: 'Help everyone become a confident, compelling speaker through AI-powered coaching',
});
console.log(`Created company: ${speechAI.name} (${speechAI.id})`);

// Graph nodes
const ideaNode = createNode(db, {
  companyId: speechAI.id,
  type: 'idea',
  title: 'AI Speech Coach',
  description: 'An AI-powered platform that helps people improve their public speaking skills through real-time feedback, practice sessions, and progress tracking',
  positionX: 400,
  positionY: 100,
});

const icpNode = createNode(db, {
  companyId: speechAI.id,
  type: 'icp',
  title: 'Corporate Professionals',
  description: 'Mid-level managers and team leads who need to improve their presentation skills for board meetings, team updates, and client pitches',
  properties: { ageRange: '28-45', income: '$80k-$150k', painPoint: 'Fear of public speaking holding back career' },
  positionX: 400,
  positionY: 250,
});

const featureRealtime = createNode(db, {
  companyId: speechAI.id,
  type: 'feature',
  title: 'Real-time Feedback',
  description: 'AI analyzes speech patterns, pacing, filler words, and tone in real-time, providing instant visual feedback during practice',
  properties: { priority: 'high', complexity: 'high', mvp: true },
  positionX: 150,
  positionY: 400,
});

const featurePractice = createNode(db, {
  companyId: speechAI.id,
  type: 'feature',
  title: 'Practice Sessions',
  description: 'Simulated audience scenarios with AI-generated questions and reactions. Users can practice presentations in a safe environment',
  properties: { priority: 'high', complexity: 'medium', mvp: true },
  positionX: 400,
  positionY: 400,
});

const featureDashboard = createNode(db, {
  companyId: speechAI.id,
  type: 'feature',
  title: 'Progress Dashboard',
  description: 'Track improvement over time with metrics like filler word reduction, pacing consistency, and confidence score trends',
  properties: { priority: 'medium', complexity: 'medium', mvp: false },
  positionX: 650,
  positionY: 400,
});

const pricingNode = createNode(db, {
  companyId: speechAI.id,
  type: 'pricing',
  title: 'Freemium + Pro',
  description: 'Free tier with 3 practice sessions/month and basic feedback. Pro at $29/mo with unlimited sessions, advanced analytics, and custom scenarios',
  properties: { freeTier: '3 sessions/mo', proPrice: 29, proFeatures: ['unlimited sessions', 'advanced analytics', 'custom scenarios', 'team features'] },
  positionX: 400,
  positionY: 550,
});

const channelLinkedin = createNode(db, {
  companyId: speechAI.id,
  type: 'channel',
  title: 'LinkedIn',
  description: 'Primary distribution channel targeting corporate professionals through thought leadership content, sponsored posts, and InMail campaigns',
  positionX: 150,
  positionY: 700,
});

const channelYoutube = createNode(db, {
  companyId: speechAI.id,
  type: 'channel',
  title: 'YouTube',
  description: 'Demo videos showing before/after improvements, testimonial compilations, and public speaking tips to build organic audience',
  positionX: 400,
  positionY: 700,
});

const campaignNode = createNode(db, {
  companyId: speechAI.id,
  type: 'campaign',
  title: 'Launch Campaign',
  description: 'Multi-channel launch combining LinkedIn thought leadership posts with YouTube demo videos and testimonials',
  properties: { budget: 15000, duration: '3 months', kpi: 'signups' },
  positionX: 275,
  positionY: 850,
});

const proofNode = createNode(db, {
  companyId: speechAI.id,
  type: 'proof',
  title: 'Beta Testimonial',
  description: '"SpeeTch AI helped me nail my board presentation. My CEO said it was the best quarterly review she\'d ever seen." — Sarah M., Product Manager',
  properties: { author: 'Sarah M.', role: 'Product Manager', company: 'TechCorp' },
  positionX: 650,
  positionY: 850,
});

const metricMAU = createNode(db, {
  companyId: speechAI.id,
  type: 'metric',
  title: 'Monthly Active Users',
  description: 'Number of unique users who complete at least one practice session per month',
  properties: { current: 1250, target: 5000, unit: 'users' },
  positionX: 150,
  positionY: 550,
});

const metricConversion = createNode(db, {
  companyId: speechAI.id,
  type: 'metric',
  title: 'Conversion Rate',
  description: 'Percentage of free users who convert to Pro subscription within 30 days',
  properties: { current: 3.2, target: 5.0, unit: '%' },
  positionX: 650,
  positionY: 550,
});

const riskNode = createNode(db, {
  companyId: speechAI.id,
  type: 'risk',
  title: 'Competition',
  description: 'Established players like Poised and Yoodli already have market presence and funding. Need to differentiate on AI quality and corporate features',
  properties: { competitors: ['Poised', 'Yoodli', 'Orai'], severity: 'medium', mitigation: 'Superior AI + enterprise features' },
  positionX: 800,
  positionY: 250,
});

const goalNode = createNode(db, {
  companyId: speechAI.id,
  type: 'goal',
  title: 'Product-Market Fit',
  description: 'Achieve 40% or higher on the "very disappointed" question in Sean Ellis PMF survey within 6 months of launch',
  properties: { currentScore: 28, targetScore: 40, deadline: '2026-09-30' },
  positionX: 800,
  positionY: 100,
});

console.log('Created 14 graph nodes for SpeeTch AI');

// Graph edges
const edgePairs: Array<{ source: string; target: string; type: string }> = [
  { source: ideaNode.id, target: icpNode.id, type: 'targets' },
  { source: icpNode.id, target: featureRealtime.id, type: 'requires' },
  { source: icpNode.id, target: featurePractice.id, type: 'requires' },
  { source: icpNode.id, target: featureDashboard.id, type: 'requires' },
  { source: featureRealtime.id, target: pricingNode.id, type: 'impacts' },
  { source: featurePractice.id, target: pricingNode.id, type: 'impacts' },
  { source: featureDashboard.id, target: pricingNode.id, type: 'impacts' },
  { source: icpNode.id, target: channelLinkedin.id, type: 'targets' },
  { source: icpNode.id, target: channelYoutube.id, type: 'targets' },
  { source: channelLinkedin.id, target: campaignNode.id, type: 'belongs_to' },
  { source: channelYoutube.id, target: campaignNode.id, type: 'belongs_to' },
  { source: campaignNode.id, target: proofNode.id, type: 'measures' },
  { source: pricingNode.id, target: metricConversion.id, type: 'measures' },
  { source: ideaNode.id, target: metricMAU.id, type: 'measures' },
  { source: riskNode.id, target: ideaNode.id, type: 'impacts' },
  { source: ideaNode.id, target: goalNode.id, type: 'depends_on' },
  { source: metricMAU.id, target: goalNode.id, type: 'measures' },
  { source: metricConversion.id, target: goalNode.id, type: 'measures' },
];

for (const edge of edgePairs) {
  createEdge(db, { companyId: speechAI.id, sourceNodeId: edge.source, targetNodeId: edge.target, type: edge.type });
}
console.log(`Created ${edgePairs.length} graph edges for SpeeTch AI`);

// Simulations
const sim1 = createSimulation(db, {
  companyId: speechAI.id,
  title: 'What if we switch to usage-based pricing?',
  description: 'Instead of flat $29/mo, charge $0.50 per practice session. This could lower the barrier to entry but might reduce predictable revenue.',
  triggerNodeId: pricingNode.id,
  triggerChange: { model: 'usage-based', pricePerSession: 0.5, removeFlatRate: true },
  status: 'completed',
  impactReport: [
    {
      nodeId: metricConversion.id,
      nodeTitle: 'Conversion Rate',
      nodeType: 'metric',
      impactType: 'direct',
      severity: 'high',
      description: 'Usage-based pricing could increase initial signups but may reduce overall conversion to paid tiers.',
      recommendation: 'Model revenue impact with current usage patterns before committing.',
    },
    {
      nodeId: campaignNode.id,
      nodeTitle: 'Launch Campaign',
      nodeType: 'campaign',
      impactType: 'indirect',
      severity: 'medium',
      description: 'Campaign messaging would need to be updated to emphasize pay-per-use value proposition.',
      recommendation: 'Prepare alternative campaign copy and A/B test messaging.',
    },
    {
      nodeId: icpNode.id,
      nodeTitle: 'Corporate Professionals',
      nodeType: 'icp',
      impactType: 'indirect',
      severity: 'medium',
      description: 'Corporate buyers may prefer predictable subscription costs for budget approval. Usage-based could create friction.',
      recommendation: 'Consider hybrid model: usage-based for individuals, subscription for teams.',
    },
  ],
});

const sim2 = createSimulation(db, {
  companyId: speechAI.id,
  title: 'What if we add WhatsApp as a channel?',
  description: 'Add WhatsApp Business as a distribution channel for reminders, mini-lessons, and quick practice prompts.',
  triggerNodeId: channelLinkedin.id,
  triggerChange: { addChannel: 'whatsapp', purpose: 'engagement and retention' },
  status: 'completed',
  impactReport: [
    {
      nodeId: campaignNode.id,
      nodeTitle: 'Launch Campaign',
      nodeType: 'campaign',
      impactType: 'direct',
      severity: 'low',
      description: 'WhatsApp channel would complement existing LinkedIn/YouTube strategy for nurturing leads.',
      recommendation: 'Start with WhatsApp for post-signup engagement, not acquisition.',
    },
    {
      nodeId: icpNode.id,
      nodeTitle: 'Corporate Professionals',
      nodeType: 'icp',
      impactType: 'indirect',
      severity: 'low',
      description: 'Corporate professionals may prefer WhatsApp for quick tips over email.',
      recommendation: 'Survey existing users about preferred communication channels.',
    },
  ],
});

console.log(`Created 2 simulations for SpeeTch AI`);

// Campaigns
createCampaign(db, {
  companyId: speechAI.id,
  nodeId: campaignNode.id,
  channel: 'linkedin',
  name: 'Thought Leadership Series',
  audience: { targeting: 'Mid-level managers', industries: ['tech', 'finance', 'consulting'], titles: ['Product Manager', 'Team Lead', 'Director'] },
  content: { format: 'carousel posts', frequency: '3x/week', topics: ['public speaking tips', 'meeting confidence', 'presentation frameworks'] },
  budget: 5000,
  spent: 1200,
  status: 'active',
  metrics: { impressions: 45000, clicks: 2100, signups: 89 },
});

createCampaign(db, {
  companyId: speechAI.id,
  nodeId: campaignNode.id,
  channel: 'youtube',
  name: 'Demo & Testimonial Videos',
  audience: { targeting: 'Public speaking interested', demographics: 'professionals 25-50' },
  content: { format: 'short-form video', frequency: '2x/week', types: ['before/after', 'testimonials', 'tips'] },
  budget: 10000,
  spent: 3500,
  status: 'active',
  metrics: { views: 125000, subscribers: 3400, signups: 210 },
});

console.log('Created 2 campaigns for SpeeTch AI');

// Proof items
createProofItem(db, {
  companyId: speechAI.id,
  nodeId: proofNode.id,
  type: 'testimonial',
  source: 'Sarah M., Product Manager at TechCorp',
  content: 'SpeeTch AI helped me nail my board presentation. My CEO said it was the best quarterly review she\'d ever seen. The real-time feedback on my pacing was a game-changer.',
  impactScore: 9.2,
});

createProofItem(db, {
  companyId: speechAI.id,
  nodeId: proofNode.id,
  type: 'testimonial',
  source: 'James K., Engineering Lead at DataFlow',
  content: 'I used to dread all-hands meetings. After 2 weeks with SpeeTch AI, I actually volunteered to present our quarterly roadmap. The practice sessions with simulated Q&A were incredibly helpful.',
  impactScore: 8.5,
});

createProofItem(db, {
  companyId: speechAI.id,
  nodeId: proofNode.id,
  type: 'case_study',
  source: 'Acme Corp Training Department',
  content: 'Deployed SpeeTch AI across 50 managers. Average presentation confidence scores improved 34% in 6 weeks. Meeting efficiency improved as presenters became more concise.',
  impactScore: 9.8,
});

console.log('Created 3 proof items for SpeeTch AI');

// Metric snapshots
createMetricSnapshot(db, { companyId: speechAI.id, nodeId: metricMAU.id, name: 'Monthly Active Users', value: 1250, target: 5000, unit: 'users' });
createMetricSnapshot(db, { companyId: speechAI.id, nodeId: metricConversion.id, name: 'Conversion Rate', value: 3.2, target: 5.0, unit: '%' });
createMetricSnapshot(db, { companyId: speechAI.id, name: 'NPS Score', value: 62, target: 70, unit: 'score' });
createMetricSnapshot(db, { companyId: speechAI.id, name: 'Avg Sessions per User', value: 4.3, target: 8, unit: 'sessions/mo' });
createMetricSnapshot(db, { companyId: speechAI.id, name: 'Churn Rate', value: 6.8, target: 3, unit: '%' });

console.log('Created 5 metric snapshots for SpeeTch AI');

// Decisions
createDecision(db, {
  companyId: speechAI.id,
  nodeId: pricingNode.id,
  title: 'Pricing Model Selection',
  options: [
    { label: 'Flat Subscription', description: '$29/mo flat rate for Pro tier with unlimited access' },
    { label: 'Usage-Based', description: '$0.50 per practice session, no monthly commitment' },
    { label: 'Hybrid', description: '$19/mo base + $0.25 per session beyond 10/month' },
  ],
  chosenOption: 'Flat Subscription',
  rationale: 'Corporate buyers prefer predictable costs for budget approval. Flat subscription also encourages more usage, improving outcomes and reducing churn.',
  simulationId: sim1.id,
});

createDecision(db, {
  companyId: speechAI.id,
  nodeId: channelLinkedin.id,
  title: 'Primary Distribution Channel',
  options: [
    { label: 'LinkedIn-first', description: 'Focus budget on LinkedIn thought leadership and ads' },
    { label: 'YouTube-first', description: 'Focus on YouTube content and SEO' },
    { label: 'Balanced', description: 'Split budget 50/50 between LinkedIn and YouTube' },
  ],
  chosenOption: 'LinkedIn-first',
  rationale: 'Our ICP (corporate professionals) spends more active time on LinkedIn. YouTube is better for awareness but LinkedIn drives higher-intent signups.',
});

createDecision(db, {
  companyId: speechAI.id,
  nodeId: featureRealtime.id,
  title: 'MVP Feature Scope',
  options: [
    { label: 'Full Real-time', description: 'Ship with complete real-time analysis including tone, pacing, filler words, and body language' },
    { label: 'Audio Only', description: 'Start with audio-only analysis (pacing, filler words, volume) and add video later' },
    { label: 'Post-Session', description: 'No real-time feedback, only post-session analysis reports' },
  ],
  rationale: 'Audio-only MVP allows faster shipping while still delivering core value. Video analysis can be added in v2 based on user feedback.',
});

console.log('Created 3 decisions for SpeeTch AI');

// Activity log
const activities = [
  { actorType: 'user', actorId: 'founder', action: 'created', entityType: 'company', entityId: speechAI.id, metadata: { name: 'SpeeTch AI' } },
  { actorType: 'user', actorId: 'founder', action: 'created', entityType: 'node', entityId: ideaNode.id, metadata: { title: 'AI Speech Coach', type: 'idea' } },
  { actorType: 'system', actorId: 'graph-engine', action: 'connected', entityType: 'edge', entityId: '', metadata: { from: 'AI Speech Coach', to: 'Corporate Professionals' } },
  { actorType: 'agent', actorId: 'simulation-engine', action: 'completed', entityType: 'simulation', entityId: sim1.id, metadata: { title: 'Usage-based pricing simulation', impactedNodes: 3 } },
  { actorType: 'user', actorId: 'founder', action: 'decided', entityType: 'decision', entityId: '', metadata: { title: 'Pricing Model Selection', chosen: 'Flat Subscription' } },
  { actorType: 'agent', actorId: 'campaign-agent', action: 'launched', entityType: 'campaign', entityId: '', metadata: { name: 'Thought Leadership Series', channel: 'linkedin' } },
  { actorType: 'system', actorId: 'metrics-collector', action: 'recorded', entityType: 'metric', entityId: '', metadata: { name: 'Monthly Active Users', value: 1250 } },
  { actorType: 'user', actorId: 'founder', action: 'added', entityType: 'proof', entityId: '', metadata: { type: 'testimonial', source: 'Sarah M.' } },
];

for (const act of activities) {
  createActivity(db, { companyId: speechAI.id, ...act } as Parameters<typeof createActivity>[1]);
}
console.log(`Created ${activities.length} activity log entries for SpeeTch AI`);

// ── Company 2: QuickMVP ─────────────────────────────────────────────

const quickMVP = createCompany(db, {
  name: 'QuickMVP',
  description: 'No-code MVP builder for non-technical founders',
  mission: 'Help non-technical founders validate ideas in days, not months',
});
console.log(`\nCreated company: ${quickMVP.name} (${quickMVP.id})`);

const qIdeaNode = createNode(db, {
  companyId: quickMVP.id,
  type: 'idea',
  title: 'No-Code MVP Builder',
  description: 'A platform that lets non-technical founders build and launch MVPs using AI-generated code and drag-and-drop components',
  positionX: 400,
  positionY: 100,
});

const qIcpNode = createNode(db, {
  companyId: quickMVP.id,
  type: 'icp',
  title: 'Non-Technical Founders',
  description: 'First-time founders with business ideas but no coding skills, typically aged 25-40',
  positionX: 400,
  positionY: 250,
});

const qFeatureNode = createNode(db, {
  companyId: quickMVP.id,
  type: 'feature',
  title: 'AI Page Generator',
  description: 'Describe your landing page in plain English and AI generates a fully responsive page',
  positionX: 200,
  positionY: 400,
});

const qPricingNode = createNode(db, {
  companyId: quickMVP.id,
  type: 'pricing',
  title: 'Pay Per Project',
  description: '$49 per MVP project, includes hosting for 30 days',
  positionX: 600,
  positionY: 400,
});

const qChannelNode = createNode(db, {
  companyId: quickMVP.id,
  type: 'channel',
  title: 'Twitter/X',
  description: 'Build in public on Twitter, engage with #buildinpublic and #nocode communities',
  positionX: 400,
  positionY: 550,
});

const qGoalNode = createNode(db, {
  companyId: quickMVP.id,
  type: 'goal',
  title: '100 Paying Users',
  description: 'Reach 100 paying users within 90 days of launch',
  positionX: 400,
  positionY: 700,
});

console.log('Created 6 graph nodes for QuickMVP');

const qEdges = [
  { source: qIdeaNode.id, target: qIcpNode.id, type: 'targets' },
  { source: qIcpNode.id, target: qFeatureNode.id, type: 'requires' },
  { source: qFeatureNode.id, target: qPricingNode.id, type: 'impacts' },
  { source: qIcpNode.id, target: qChannelNode.id, type: 'targets' },
  { source: qIdeaNode.id, target: qGoalNode.id, type: 'depends_on' },
];

for (const edge of qEdges) {
  createEdge(db, { companyId: quickMVP.id, sourceNodeId: edge.source, targetNodeId: edge.target, type: edge.type });
}
console.log(`Created ${qEdges.length} graph edges for QuickMVP`);

createMetricSnapshot(db, { companyId: quickMVP.id, name: 'Projects Created', value: 47, target: 200, unit: 'projects' });
createMetricSnapshot(db, { companyId: quickMVP.id, name: 'Paying Users', value: 12, target: 100, unit: 'users' });

createActivity(db, { companyId: quickMVP.id, actorType: 'user', actorId: 'founder', action: 'created', entityType: 'company', entityId: quickMVP.id, metadata: { name: 'QuickMVP' } });

console.log('Created metrics and activity for QuickMVP');

// Done
db.close();
console.log('\nSeed complete! Database is ready.');
console.log(`  Companies: 2 (SpeeTch AI, QuickMVP)`);
console.log(`  SpeeTch AI: 14 nodes, ${edgePairs.length} edges, 2 simulations, 2 campaigns, 3 proof items, 5 metrics, 3 decisions`);
console.log(`  QuickMVP: 6 nodes, ${qEdges.length} edges, 2 metrics`);
