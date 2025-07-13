-- Migration: Add category and image_url columns to outlines table
ALTER TABLE outlines 
  ADD COLUMN category VARCHAR(100) DEFAULT NULL,
  ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;
