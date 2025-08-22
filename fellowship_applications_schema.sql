-- Fellowship Applications Database Schema
-- Add this to your existing database

CREATE TABLE fellowship_applications (
  id SERIAL PRIMARY KEY,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  current_location VARCHAR(255),
  
  -- Education & Experience
  education VARCHAR(100),
  graduation_year VARCHAR(10),
  current_status VARCHAR(100),
  previous_experience TEXT,
  
  -- Skills & Background
  technical_skills TEXT[], -- Array of selected skills
  language_skills TEXT[], -- Array of selected languages
  relevant_experience TEXT,
  
  -- Essays
  motivation_essay TEXT NOT NULL,
  problem_solving_example TEXT NOT NULL,
  career_goals TEXT NOT NULL,
  
  -- Preferences
  preferred_placement VARCHAR(100),
  availability_start DATE,
  accommodation_needs TEXT,
  
  -- Documents
  resume_file_name VARCHAR(255),
  transcript_file_name VARCHAR(255),
  video_url VARCHAR(500) NOT NULL,
  
  -- References
  reference1_name VARCHAR(255) NOT NULL,
  reference1_email VARCHAR(255) NOT NULL,
  reference1_relationship VARCHAR(100) NOT NULL,
  reference2_name VARCHAR(255) NOT NULL,
  reference2_email VARCHAR(255) NOT NULL,
  reference2_relationship VARCHAR(100) NOT NULL,
  
  -- Application Management
  status VARCHAR(50) DEFAULT 'submitted',
  shortlisted BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  admin_notes TEXT,
  
  -- Agreements
  commitment_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  CONSTRAINT fellowship_applications_email_key UNIQUE (email)
);

-- Create indexes for common queries
CREATE INDEX idx_fellowship_applications_status ON fellowship_applications(status);
CREATE INDEX idx_fellowship_applications_shortlisted ON fellowship_applications(shortlisted);
CREATE INDEX idx_fellowship_applications_created_at ON fellowship_applications(created_at);
CREATE INDEX idx_fellowship_applications_email ON fellowship_applications(email);

-- Application status enum values
-- 'submitted', 'under_review', 'assessment_invited', 'interviewed', 'accepted', 'rejected', 'waitlisted'

-- Create admin notes table for detailed tracking
CREATE TABLE fellowship_application_notes (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES fellowship_applications(id) ON DELETE CASCADE,
  admin_email VARCHAR(255) NOT NULL,
  note TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- 'general', 'rating', 'interview', 'decision'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application status history
CREATE TABLE fellowship_status_history (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES fellowship_applications(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fellowship_applications_updated_at 
    BEFORE UPDATE ON fellowship_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
