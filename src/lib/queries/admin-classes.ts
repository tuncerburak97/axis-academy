// src/lib/queries/admin-classes.ts — admin sınıf yönetimi okuma sorguları
import { createClient } from "@/lib/supabase/server";
import type {
  AdminClassRow,
  ClassAnnouncement,
  ClassEnrollmentRow,
  ClassMaterial,
} from "@/lib/types/catalog";

export async function getAdminClasses(): Promise<AdminClassRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("classes")
    .select("id, module_id, title, start_date, duration_hours, capacity, status, education_modules(title, category), class_enrollments(status)")
    .order("start_date", { ascending: false });
  return (data ?? []) as unknown as AdminClassRow[];
}

export interface PendingEnrollmentRow {
  id: string;
  class_id: string;
  created_at: string;
  classes: { title: string } | null;
  profiles: { full_name: string; email: string } | null;
}

export async function getPendingEnrollments(): Promise<PendingEnrollmentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_enrollments")
    .select("id, class_id, created_at, classes(title), profiles(full_name, email)")
    .eq("status", "pending")
    .order("created_at");
  return (data ?? []) as unknown as PendingEnrollmentRow[];
}

export async function getClassEnrollments(classId: string): Promise<ClassEnrollmentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_enrollments")
    .select("id, class_id, user_id, status, created_at, profiles(full_name, email)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ClassEnrollmentRow[];
}

export async function getClassAnnouncements(classId: string): Promise<ClassAnnouncement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_announcements")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getClassMaterials(classId: string): Promise<ClassMaterial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_materials")
    .select("*")
    .eq("class_id", classId)
    .order("week_number", { nullsFirst: true })
    .order("sort_order");
  return (data ?? []) as ClassMaterial[];
}
