-- SQL script to create tables manually in Supabase
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_accounts table
CREATE TABLE social_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('TWITTER', 'LINKEDIN', 'INSTAGRAM')),
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT "social_accounts_userId_platform_key" UNIQUE ("userId", platform)
);

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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_social_accounts_userId ON social_accounts("userId");
CREATE INDEX idx_conversations_userId ON conversations("userId");
CREATE INDEX idx_messages_conversationId ON messages("conversationId");
CREATE INDEX idx_scheduled_posts_userId ON scheduled_posts("userId");
CREATE INDEX idx_scheduled_posts_scheduledTime ON scheduled_posts("scheduledTime");