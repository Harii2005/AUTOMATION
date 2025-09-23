-- SQL script to create the remaining missing tables
-- Run this in your Supabase SQL Editor

-- Create conversations table
CREATE TABLE conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    title TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "conversationId" TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES conversations(id) ON DELETE CASCADE
);

-- Create scheduled_posts table
CREATE TABLE scheduled_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    content TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT CHECK ("mediaType" IN ('IMAGE', 'VIDEO', 'GIF')),
    "scheduledTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'POSTED', 'FAILED', 'CANCELLED')),
    platform TEXT NOT NULL CHECK (platform IN ('TWITTER', 'LINKEDIN', 'INSTAGRAM')),
    "platformPostId" TEXT,
    error TEXT,
    "retryCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "scheduled_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT "scheduled_posts_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES social_accounts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_userId ON conversations("userId");
CREATE INDEX idx_messages_conversationId ON messages("conversationId");
CREATE INDEX idx_scheduled_posts_userId ON scheduled_posts("userId");
CREATE INDEX idx_scheduled_posts_socialAccountId ON scheduled_posts("socialAccountId");
CREATE INDEX idx_scheduled_posts_scheduledTime ON scheduled_posts("scheduledTime");

-- Verify all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;