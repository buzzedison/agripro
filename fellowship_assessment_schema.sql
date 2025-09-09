-- Fellowship Assessment System Database Schema
-- Add this to your existing database

-- Assessment Invitations Table
CREATE TABLE assessment_invitations (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES fellowship_applications(id) ON DELETE CASCADE,
  invitation_token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'started', 'completed', 'expired'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Questions Table
CREATE TABLE assessment_questions (
  id SERIAL PRIMARY KEY,
  question_number INTEGER NOT NULL,
  section VARCHAR(100) NOT NULL, -- 'systems_thinking', 'problem_solving', 'data_driven', 'strategic_thinking', 'applied_problem_solving'
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'essay', 'ranking'
  question TEXT NOT NULL,
  options JSONB, -- For multiple choice questions
  max_points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(question_number)
);

-- Assessment Responses Table
CREATE TABLE assessment_responses (
  id SERIAL PRIMARY KEY,
  invitation_id INTEGER REFERENCES assessment_invitations(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES assessment_questions(id) ON DELETE CASCADE,
  response_text TEXT,
  response_options JSONB, -- For multiple choice or ranking responses
  points_awarded INTEGER DEFAULT 0,
  graded_by VARCHAR(255),
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(invitation_id, question_id)
);

-- Assessment Results Table
CREATE TABLE assessment_results (
  id SERIAL PRIMARY KEY,
  invitation_id INTEGER REFERENCES assessment_invitations(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  percentage_score DECIMAL(5,2),
  qualitative_score INTEGER DEFAULT 0, -- Out of 45
  quantitative_score INTEGER DEFAULT 0, -- Out of 55
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'graded', 'reviewed'
  reviewer_notes TEXT,
  recommendation VARCHAR(50), -- 'accept', 'interview', 'reject', 'waitlist'
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_assessment_invitations_token ON assessment_invitations(invitation_token);
CREATE INDEX idx_assessment_invitations_application_id ON assessment_invitations(application_id);
CREATE INDEX idx_assessment_invitations_status ON assessment_invitations(status);
CREATE INDEX idx_assessment_invitations_expires_at ON assessment_invitations(expires_at);
CREATE INDEX idx_assessment_responses_invitation_id ON assessment_responses(invitation_id);
CREATE INDEX idx_assessment_responses_question_id ON assessment_responses(question_id);
CREATE INDEX idx_assessment_results_invitation_id ON assessment_results(invitation_id);

-- Insert the assessment questions
INSERT INTO assessment_questions (question_number, section, question_type, question, options, max_points) VALUES
-- Section 1: Systems Thinking & Market Analysis
(1, 'systems_thinking', 'multiple_choice', 'A tomato farmer in Ghana loses 60% of harvest value between farm gate and consumer. The biggest value leakage typically occurs at which stage?', '["a) Production inefficiencies", "b) Post-harvest handling and storage", "c) Transportation logistics", "d) Retail markup margins"]'::jsonb, 5),
(2, 'systems_thinking', 'multiple_choice', 'What is the primary barrier preventing smallholder farmers from accessing formal credit in Sub-Saharan Africa?', '["a) High interest rates", "b) Lack of collateral and credit history", "c) Distance to bank branches", "d) Language barriers in loan applications"]'::jsonb, 5),
(3, 'systems_thinking', 'multiple_choice', 'A mobile platform for crop price discovery has 5% farmer adoption after 6 months. What''s the most likely primary barrier?', '["a) Poor network connectivity", "b) Lack of immediate, tangible value to farmers", "c) Complex user interface", "d) Competition from existing solutions"]'::jsonb, 5),

-- Section 2: Problem Solving & Prioritization
(4, 'problem_solving', 'multiple_choice', 'You have $50,000 to improve outcomes for 1,000 smallholder farmers. Which intervention would likely generate the highest ROI?', '["a) Distribute improved seeds to all farmers", "b) Build 5 solar-powered cold storage facilities", "c) Train 50 farmers as extension agents for peer-to-peer knowledge transfer", "d) Provide smartphones to 200 lead farmers for market access"]'::jsonb, 5),
(5, 'problem_solving', 'multiple_choice', 'An agribusiness wants consistent supply but farmers prefer selling to whoever pays highest at harvest time. What''s the most sustainable solution?', '["a) Offer farmers guaranteed premium pricing contracts", "b) Educate farmers about the benefits of consistent partnerships", "c) Create a transparent bidding system with multiple buyers", "d) Develop a farmer loyalty program with end-of-season bonuses"]'::jsonb, 5),
(6, 'problem_solving', 'multiple_choice', 'You can either: (A) Reach 10,000 farmers with basic SMS weather alerts, or (B) Provide 500 farmers with comprehensive digital farming support. Which do you choose and why?', '["a) Option A - broader reach creates more aggregate impact", "b) Option B - deeper intervention creates replicable success model", "c) Split resources 50/50 between both approaches", "d) Need more data to make this decision"]'::jsonb, 5),

-- Section 3: Data-Driven Decision Making
(7, 'data_driven', 'multiple_choice', 'You''re measuring the success of a farmer-buyer matching platform. Which KPI best indicates true value creation?', '["a) Number of farmers registered", "b) Number of successful transactions completed", "c) Average price premium achieved vs. local market rates", "d) Platform user engagement time"]'::jsonb, 5),
(8, 'data_driven', 'multiple_choice', 'Crop yields are 40% lower in Region A vs Region B despite similar climate and soil. Your first analytical step should be:', '["a) Test soil samples for nutrient differences", "b) Survey farmers about their agricultural practices", "c) Analyze input supply chain accessibility in both regions", "d) Review historical weather pattern variations"]'::jsonb, 5),
(9, 'data_driven', 'multiple_choice', 'A pilot program shows promising results but relied heavily on one charismatic local leader. What''s the biggest scaling risk?', '["a) Difficulty replicating the leader''s expertise elsewhere", "b) Overdependence on individual relationships vs. systematic processes", "c) Limited budget to hire similar leaders for other regions", "d) Community resistance in areas without established leadership"]'::jsonb, 5),

-- Section 4: Strategic Thinking
(10, 'strategic_thinking', 'multiple_choice', 'Africa imports $75B in food annually. The most promising opportunity for domestic substitution lies in:', '["a) Staple grains (rice, wheat, maize) due to volume", "b) High-value crops (fruits, vegetables) due to margins and transport costs", "c) Processed foods due to value-addition potential", "d) Livestock products due to growing urban demand"]'::jsonb, 5),
(11, 'strategic_thinking', 'multiple_choice', 'To scale an agricultural innovation across West Africa, the most critical first partnership should be with:', '["a) International development organizations for funding", "b) Telecom companies for digital infrastructure", "c) Local governments for policy support and legitimacy", "d) Established agribusinesses for market access"]'::jsonb, 5),

-- Section 5: Applied Problem Solving
(12, 'applied_problem_solving', 'essay', 'A cassava processing cooperative has consistent demand for 100 tons/month but can only source 60 tons due to fragmented smallholder suppliers. Design a 6-month intervention to close this supply gap. Address: farmer aggregation, quality standards, logistics, and incentive alignment.', null, 15),
(13, 'applied_problem_solving', 'essay', 'Design a digital solution to reduce post-harvest losses for perishable crops. Your solution should address: data collection, decision support, stakeholder coordination, and measurable outcomes. Consider technical feasibility and farmer adoption barriers.', null, 15),
(14, 'applied_problem_solving', 'ranking', 'Rank these initiatives by implementation priority for maximum farmer income impact (1=first priority, explain your ranking logic in 50 words): Digital payment systems for instant settlement, Cold chain infrastructure development, Farmer training on good agricultural practices, Market linkage platforms connecting farmers to buyers', '["___ Digital payment systems for instant settlement", "___ Cold chain infrastructure development", "___ Farmer training on good agricultural practices", "___ Market linkage platforms connecting farmers to buyers"]'::jsonb, 10),
(15, 'applied_problem_solving', 'essay', 'Describe one innovative solution (not currently widely implemented) that could significantly transform African agriculture in the next 5 years. Address: the problem it solves, why existing solutions fall short, your proposed approach, and potential obstacles to adoption.', null, 5);

-- Add update triggers
CREATE TRIGGER update_assessment_invitations_updated_at
    BEFORE UPDATE ON assessment_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_questions_updated_at
    BEFORE UPDATE ON assessment_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_responses_updated_at
    BEFORE UPDATE ON assessment_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_results_updated_at
    BEFORE UPDATE ON assessment_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
