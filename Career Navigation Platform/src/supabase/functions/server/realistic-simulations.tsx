// Realistic internship simulations with different question types

export const realisticSimulations = [
  {
    id: 'google_swe_intern',
    title: 'Google Software Engineering Internship',
    description: 'Work on Google Search optimization features - solve real engineering challenges',
    company: 'Google',
    track: 'frontend',
    duration: '4-5 hours',
    difficulty: 'Advanced',
    steps: [
      {
        title: 'Onboarding: Understanding the Codebase',
        description: 'You join the Google Search team. Your first task is to understand the existing search autocomplete feature.',
        type: 'quiz',
        question: 'Which data structure is most efficient for implementing autocomplete?',
        options: [
          'Array',
          'Trie (Prefix Tree)',
          'Hash Table',
          'Binary Search Tree'
        ],
        correctAnswer: 'Trie (Prefix Tree)',
        points: 10,
      },
      {
        title: 'Code Review: Debouncing Implementation',
        description: 'Review this code for search input debouncing. The team wants to reduce API calls when users type.',
        type: 'code',
        question: 'Implement a debounce function that delays execution until after wait milliseconds have elapsed.',
        placeholder: `function debounce(func, wait) {\n  // Your implementation here\n}`,
        requiredKeywords: ['setTimeout', 'clearTimeout', 'return'],
        correctAnswer: `function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}`,
        points: 20,
      },
      {
        title: 'Performance Optimization Quiz',
        description: 'The search page is loading slowly. Which optimizations should you implement?',
        type: 'multipleChoice',
        question: 'Select ALL valid performance optimizations for a search interface:',
        options: [
          'Lazy loading of search results',
          'Caching frequent searches',
          'Code splitting',
          'Loading all data at once',
          'Using Web Workers for heavy computations'
        ],
        correctAnswer: ['Lazy loading of search results', 'Caching frequent searches', 'Code splitting', 'Using Web Workers for heavy computations'],
        points: 15,
      },
      {
        title: 'Accessibility Requirements',
        description: 'Your manager asks you to ensure the search feature is accessible.',
        type: 'quiz',
        question: 'Which ARIA attribute should be used for the search suggestions dropdown?',
        options: [
          'aria-label',
          'aria-live',
          'aria-autocomplete',
          'aria-hidden'
        ],
        correctAnswer: 'aria-autocomplete',
        points: 10,
      },
      {
        title: 'Final Task: Implementation Plan',
        description: 'Write a brief implementation plan for adding voice search to Google Search.',
        type: 'text',
        question: 'Describe your approach to implementing voice search (minimum 100 characters):',
        points: 15,
      },
    ],
  },
  {
    id: 'meta_data_intern',
    title: 'Meta Data Science Internship',
    description: 'Analyze Instagram engagement metrics and build predictive models',
    company: 'Meta',
    track: 'data',
    duration: '5-6 hours',
    difficulty: 'Advanced',
    steps: [
      {
        title: 'Dataset Analysis',
        description: 'You receive Instagram engagement data with 1M+ posts. First, identify data quality issues.',
        type: 'multipleChoice',
        question: 'Select all potential data quality issues you should check:',
        options: [
          'Missing values in engagement metrics',
          'Duplicate posts',
          'Outliers in follower counts',
          'Data from deleted accounts',
          'Inconsistent timestamp formats'
        ],
        correctAnswer: ['Missing values in engagement metrics', 'Duplicate posts', 'Outliers in follower counts', 'Inconsistent timestamp formats'],
        points: 15,
      },
      {
        title: 'SQL Query Challenge',
        description: 'Write a SQL query to find the top 10 most engaging posts by engagement rate.',
        type: 'code',
        question: 'Write SQL to calculate engagement rate (likes + comments) / followers and get top 10:',
        placeholder: `SELECT \n  post_id,\n  -- your query here\nFROM posts\n-- complete this query`,
        requiredKeywords: ['SELECT', 'FROM', 'ORDER BY', 'LIMIT', 'DESC'],
        points: 20,
      },
      {
        title: 'Statistical Analysis',
        description: 'Your manager asks about correlation between posting time and engagement.',
        type: 'quiz',
        question: 'Which statistical test would you use to analyze this relationship?',
        options: [
          'T-test',
          'ANOVA',
          'Correlation coefficient (Pearson/Spearman)',
          'Chi-square test'
        ],
        correctAnswer: 'Correlation coefficient (Pearson/Spearman)',
        points: 10,
      },
      {
        title: 'Model Selection',
        description: 'You need to predict post engagement. Which models are appropriate?',
        type: 'multipleChoice',
        question: 'Select suitable models for predicting engagement (regression problem):',
        options: [
          'Linear Regression',
          'Random Forest Regressor',
          'K-Means Clustering',
          'Gradient Boosting',
          'Logistic Regression'
        ],
        correctAnswer: ['Linear Regression', 'Random Forest Regressor', 'Gradient Boosting'],
        points: 15,
      },
      {
        title: 'Business Recommendation',
        description: 'Based on your analysis, write recommendations for content creators.',
        type: 'text',
        question: 'Provide data-driven recommendations to improve Instagram engagement:',
        points: 10,
      },
    ],
  },
  {
    id: 'airbnb_design_intern',
    title: 'Airbnb UX Design Internship',
    description: 'Redesign the host onboarding experience to increase listing completions',
    company: 'Airbnb',
    track: 'design',
    duration: '4-5 hours',
    difficulty: 'Intermediate',
    steps: [
      {
        title: 'User Research Analysis',
        description: 'You review user research showing 40% of hosts abandon listing creation. What should you investigate?',
        type: 'multipleChoice',
        question: 'Select the most important factors to investigate:',
        options: [
          'Form length and complexity',
          'Mobile vs desktop experience',
          'Photo upload process',
          'Background color preferences',
          'Pricing guidance clarity'
        ],
        correctAnswer: ['Form length and complexity', 'Mobile vs desktop experience', 'Photo upload process', 'Pricing guidance clarity'],
        points: 15,
      },
      {
        title: 'Design Principles',
        description: 'Which design principle is most important for onboarding flows?',
        type: 'quiz',
        question: 'Select the key principle for reducing onboarding friction:',
        options: [
          'Progressive disclosure',
          'Skeuomorphism',
          'Maximalism',
          'Complex animations'
        ],
        correctAnswer: 'Progressive disclosure',
        points: 10,
      },
      {
        title: 'Information Architecture',
        description: 'The current flow has 15 screens. How would you reorganize it?',
        type: 'text',
        question: 'Describe how you would restructure the onboarding flow (be specific):',
        points: 20,
      },
      {
        title: 'Visual Hierarchy',
        description: 'You design a screen with property photos, title, pricing, and description.',
        type: 'quiz',
        question: 'What should have the highest visual priority?',
        options: [
          'Property photos',
          'Property title',
          'Pricing information',
          'Description text'
        ],
        correctAnswer: 'Property photos',
        points: 10,
      },
      {
        title: 'Accessibility & Inclusivity',
        description: 'Your design must be accessible. Which considerations are essential?',
        type: 'multipleChoice',
        question: 'Select all accessibility requirements:',
        options: [
          'Color contrast ratio of 4.5:1',
          'Keyboard navigation support',
          'Screen reader compatibility',
          'Animated background videos',
          'Alt text for all images'
        ],
        correctAnswer: ['Color contrast ratio of 4.5:1', 'Keyboard navigation support', 'Screen reader compatibility', 'Alt text for all images'],
        points: 15,
      },
    ],
  },
  {
    id: 'stripe_backend_intern',
    title: 'Stripe Backend Engineering Internship',
    description: 'Build secure payment processing microservices with high availability',
    company: 'Stripe',
    track: 'backend',
    duration: '5-6 hours',
    difficulty: 'Advanced',
    steps: [
      {
        title: 'API Design',
        description: 'Design a RESTful API endpoint for processing refunds.',
        type: 'quiz',
        question: 'Which HTTP method should be used for processing a refund?',
        options: [
          'GET',
          'POST',
          'PUT',
          'DELETE'
        ],
        correctAnswer: 'POST',
        points: 10,
      },
      {
        title: 'Database Schema',
        description: 'Design a database schema for storing payment transactions.',
        type: 'code',
        question: 'Write SQL to create a transactions table with proper constraints:',
        placeholder: `CREATE TABLE transactions (\n  -- your schema here\n);`,
        requiredKeywords: ['CREATE TABLE', 'PRIMARY KEY', 'NOT NULL', 'timestamp'],
        points: 20,
      },
      {
        title: 'Error Handling',
        description: 'A payment fails. Which HTTP status codes are appropriate?',
        type: 'multipleChoice',
        question: 'Select appropriate error status codes for payment failures:',
        options: [
          '400 Bad Request (invalid card)',
          '402 Payment Required',
          '500 Internal Server Error',
          '200 OK',
          '503 Service Unavailable (gateway down)'
        ],
        correctAnswer: ['400 Bad Request (invalid card)', '402 Payment Required', '503 Service Unavailable (gateway down)'],
        points: 15,
      },
      {
        title: 'Idempotency Implementation',
        description: 'Implement idempotency to prevent duplicate payments.',
        type: 'code',
        question: 'Write pseudocode for idempotent payment processing:',
        placeholder: `function processPayment(paymentId, idempotencyKey) {\n  // your implementation\n}`,
        requiredKeywords: ['idempotencyKey', 'check', 'cache', 'return'],
        points: 20,
      },
      {
        title: 'Scaling Strategy',
        description: 'Stripe processes millions of transactions per day. How would you scale?',
        type: 'text',
        question: 'Describe your approach to scaling payment processing infrastructure:',
        points: 15,
      },
    ],
  },
  {
    id: 'hubspot_marketing_intern',
    title: 'HubSpot Growth Marketing Internship',
    description: 'Launch a B2B SaaS marketing campaign to acquire 1000 new users',
    company: 'HubSpot',
    track: 'marketing',
    duration: '3-4 hours',
    difficulty: 'Intermediate',
    steps: [
      {
        title: 'Target Audience Definition',
        description: 'You need to define the ideal customer profile (ICP) for HubSpot CRM.',
        type: 'multipleChoice',
        question: 'Select characteristics of B2B SaaS ICP:',
        options: [
          'Company size (10-500 employees)',
          'Industry (Tech, Marketing)',
          'Individual consumers',
          'Budget authority',
          'Pain points with current tools'
        ],
        correctAnswer: ['Company size (10-500 employees)', 'Industry (Tech, Marketing)', 'Budget authority', 'Pain points with current tools'],
        points: 15,
      },
      {
        title: 'Channel Strategy',
        description: 'Which marketing channels would you prioritize for B2B SaaS?',
        type: 'quiz',
        question: 'Most effective channel for B2B SaaS lead generation:',
        options: [
          'TikTok influencers',
          'Content marketing + SEO',
          'TV commercials',
          'Radio ads'
        ],
        correctAnswer: 'Content marketing + SEO',
        points: 10,
      },
      {
        title: 'Campaign Metrics',
        description: 'Define success metrics for your campaign.',
        type: 'multipleChoice',
        question: 'Select relevant KPIs to track:',
        options: [
          'Cost Per Acquisition (CPA)',
          'Conversion Rate',
          'Number of likes on social media',
          'Customer Lifetime Value (LTV)',
          'Lead Quality Score'
        ],
        correctAnswer: ['Cost Per Acquisition (CPA)', 'Conversion Rate', 'Customer Lifetime Value (LTV)', 'Lead Quality Score'],
        points: 15,
      },
      {
        title: 'A/B Testing',
        description: 'Design an A/B test for email subject lines.',
        type: 'text',
        question: 'Write two subject line variations and explain your hypothesis:',
        points: 20,
      },
      {
        title: 'Budget Allocation',
        description: 'You have $10,000 monthly budget. How would you allocate it?',
        type: 'text',
        question: 'Create a budget breakdown across channels with justification:',
        points: 10,
      },
    ],
  },
  {
    id: 'asana_product_intern',
    title: 'Asana Product Management Internship',
    description: 'Launch a new collaboration feature for remote teams',
    company: 'Asana',
    track: 'product',
    duration: '5-6 hours',
    difficulty: 'Advanced',
    steps: [
      {
        title: 'Problem Discovery',
        description: 'User research shows teams struggle with async collaboration. What questions should you ask?',
        type: 'multipleChoice',
        question: 'Select important discovery questions:',
        options: [
          'How do teams currently share updates?',
          'What tools do they use?',
          'What is their favorite color?',
          'What pain points exist in current workflow?',
          'How do they measure productivity?'
        ],
        correctAnswer: ['How do teams currently share updates?', 'What tools do they use?', 'What pain points exist in current workflow?', 'How do they measure productivity?'],
        points: 15,
      },
      {
        title: 'Feature Prioritization',
        description: 'Use the RICE framework to prioritize features.',
        type: 'quiz',
        question: 'What does RICE stand for?',
        options: [
          'Reach, Impact, Confidence, Effort',
          'Revenue, Investment, Cost, Execution',
          'Risk, Innovation, Cost, Efficiency',
          'Research, Ideation, Creation, Evaluation'
        ],
        correctAnswer: 'Reach, Impact, Confidence, Effort',
        points: 10,
      },
      {
        title: 'User Stories',
        description: 'Write user stories for the async video messaging feature.',
        type: 'text',
        question: 'Write 3 user stories in the format "As a [user], I want [goal] so that [benefit]":',
        points: 20,
      },
      {
        title: 'Success Metrics',
        description: 'Define how you will measure feature success.',
        type: 'multipleChoice',
        question: 'Select appropriate success metrics:',
        options: [
          'Daily Active Users (DAU) increase',
          'Feature adoption rate',
          'Time to complete tasks',
          'Number of app downloads',
          'User satisfaction (NPS)'
        ],
        correctAnswer: ['Daily Active Users (DAU) increase', 'Feature adoption rate', 'Time to complete tasks', 'User satisfaction (NPS)'],
        points: 15,
      },
      {
        title: 'Go-to-Market Strategy',
        description: 'Create a launch plan for the new feature.',
        type: 'text',
        question: 'Describe your phased rollout strategy and communication plan:',
        points: 20,
      },
    ],
  },
];
