// src/lib/queries/member.ts — üye paneli okuma sorguları (RLS kullanıcının kendi verisini garanti eder)
import { createClient } from "@/lib/supabase/server";
import type {
  ContactStatus,
  EnrollmentStatus,
  OpenClass,
  PricingPlan,
  RequestStatus,
  Topic,
} from "@/lib/types/catalog";

export async function getModuleTopics(moduleId: string): Promise<Topic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("module_id", moduleId)
    .eq("is_active", true)
    .order("title");
  return data ?? [];
}

// Bireysel saatlik ücret planı: özel modül fiyat hesabının kaynağı
export async function getIndividualHourlyPlan(moduleId: string): Promise<PricingPlan | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("module_id", moduleId)
    .eq("training_type", "individual")
    .eq("unit", "per_hour")
    .eq("is_active", true)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  return data;
}

// Kontenjan sayımı RLS'e takılmadan SECURITY DEFINER fonksiyonundan gelir
export async function getOpenClasses(moduleId: string): Promise<OpenClass[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_open_classes", { p_module_id: moduleId });
  return (data ?? []) as OpenClass[];
}

export interface MyIndividualRequest {
  id: string;
  module_id: string;
  bundle_id: string | null;
  request_type: "bundle" | "custom" | "schedule";
  total_hours: number | null;
  calculated_price: number;
  status: RequestStatus;
  progress_note: string;
  user_message: string | null;
  created_at: string;
  education_modules: { title: string } | null;
  bundle_packages: { title: string } | null;
}

export interface MyEnrollment {
  id: string;
  class_id: string;
  status: EnrollmentStatus;
  created_at: string;
  classes: { title: string; start_date: string; schedule_note: string } | null;
}

export interface MyContactRequest {
  id: string;
  service_type: "analysis" | "thesis";
  message: string;
  status: ContactStatus;
  created_at: string;
}

export async function getMyIndividualRequests(): Promise<MyIndividualRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("individual_requests")
    .select("id, module_id, bundle_id, request_type, total_hours, calculated_price, status, progress_note, user_message, created_at, education_modules(title), bundle_packages(title)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as MyIndividualRequest[];
}

export async function getMyIndividualRequestById(id: string): Promise<MyIndividualRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("individual_requests")
    .select("id, module_id, bundle_id, request_type, total_hours, calculated_price, status, progress_note, user_message, created_at, education_modules(title), bundle_packages(title)")
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as unknown as MyIndividualRequest | null;
}

export async function getMyEnrollments(): Promise<MyEnrollment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_enrollments")
    .select("id, class_id, status, created_at, classes(title, start_date, schedule_note)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as MyEnrollment[];
}

export async function getMyContactRequests(): Promise<MyContactRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_requests")
    .select("id, service_type, message, status, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as MyContactRequest[];
}
