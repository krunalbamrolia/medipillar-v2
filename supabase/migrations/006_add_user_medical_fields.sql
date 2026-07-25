-- Add medical_name, hospital_name, and dr_specialist columns to profiles table
alter table if exists public.profiles
  add column if not exists medical_name text,
  add column if not exists hospital_name text,
  add column if not exists dr_specialist text;
