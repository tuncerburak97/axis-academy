
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity": string,"entity_id": string | null,"id": number,"summary": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"id"?: never,"summary"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"id"?: never,"summary"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"bundle_packages": {
                  Row: {
                    "description": string,"duration_hours": number,"fixed_price": number,"id": string,"is_active": boolean,"module_id": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string,"duration_hours": number,"fixed_price": number,"id"?: string,"is_active"?: boolean,"module_id": string,"title": string
                  }
                  Update: {
                    "description"?: string,"duration_hours"?: number,"fixed_price"?: number,"id"?: string,"is_active"?: boolean,"module_id"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "bundle_packages_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    }
                  ]
                },"bundle_syllabus_weeks": {
                  Row: {
                    "bundle_id": string,"description": string,"id": string,"sort_order": number,"source_module_week_id": string | null,"title": string,"week_kind": string,"week_number": number
                  }
                  ComputedFields: never
                  Insert: {
                    "bundle_id": string,"description"?: string,"id"?: string,"sort_order"?: number,"source_module_week_id"?: string | null,"title": string,"week_kind"?: string,"week_number": number
                  }
                  Update: {
                    "bundle_id"?: string,"description"?: string,"id"?: string,"sort_order"?: number,"source_module_week_id"?: string | null,"title"?: string,"week_kind"?: string,"week_number"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "bundle_syllabus_weeks_bundle_id_fkey"
      columns: ["bundle_id"]
isOneToOne: false
      referencedRelation: "bundle_packages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bundle_syllabus_weeks_source_module_week_id_fkey"
      columns: ["source_module_week_id"]
isOneToOne: false
      referencedRelation: "module_syllabus_weeks"
      referencedColumns: ["id"]
    }
                  ]
                },"certificates": {
                  Row: {
                    "class_id": string | null,"code": string,"hours": number,"id": string,"issued_at": string,"program_title": string,"recipient_name": string,"request_id": string | null,"revoked_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id"?: string | null,"code": string,"hours"?: number,"id"?: string,"issued_at"?: string,"program_title": string,"recipient_name": string,"request_id"?: string | null,"revoked_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "class_id"?: string | null,"code"?: string,"hours"?: number,"id"?: string,"issued_at"?: string,"program_title"?: string,"recipient_name"?: string,"request_id"?: string | null,"revoked_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "certificates_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "certificates_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "certificates_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"class_announcements": {
                  Row: {
                    "body": string,"class_id": string,"created_at": string,"id": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"class_id": string,"created_at"?: string,"id"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"class_id"?: string,"created_at"?: string,"id"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "class_announcements_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    }
                  ]
                },"class_enrollments": {
                  Row: {
                    "class_id": string,"created_at": string,"discount_code": string | null,"id": string,"note": string,"status": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id": string,"created_at"?: string,"discount_code"?: string | null,"id"?: string,"note"?: string,"status"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "class_id"?: string,"created_at"?: string,"discount_code"?: string | null,"id"?: string,"note"?: string,"status"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "class_enrollments_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "class_enrollments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"class_materials": {
                  Row: {
                    "category": string,"class_id": string,"content_md": string,"created_at": string,"file_path": string | null,"id": string,"sort_order": number,"title": string,"week_number": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "category": string,"class_id": string,"content_md"?: string,"created_at"?: string,"file_path"?: string | null,"id"?: string,"sort_order"?: number,"title": string,"week_number"?: number | null
                  }
                  Update: {
                    "category"?: string,"class_id"?: string,"content_md"?: string,"created_at"?: string,"file_path"?: string | null,"id"?: string,"sort_order"?: number,"title"?: string,"week_number"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "class_materials_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    }
                  ]
                },"classes": {
                  Row: {
                    "capacity": number,"completed_at": string | null,"created_at": string,"current_week_override": number | null,"description": string,"duration_hours": number,"duration_weeks": number,"id": string,"instructor_id": string | null,"location": string,"meeting_url": string,"module_id": string,"overview": string,"price": number | null,"schedule_note": string,"start_date": string,"status": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "capacity": number,"completed_at"?: string | null,"created_at"?: string,"current_week_override"?: number | null,"description"?: string,"duration_hours": number,"duration_weeks"?: number,"id"?: string,"instructor_id"?: string | null,"location"?: string,"meeting_url"?: string,"module_id": string,"overview"?: string,"price"?: number | null,"schedule_note"?: string,"start_date": string,"status"?: string,"title": string
                  }
                  Update: {
                    "capacity"?: number,"completed_at"?: string | null,"created_at"?: string,"current_week_override"?: number | null,"description"?: string,"duration_hours"?: number,"duration_weeks"?: number,"id"?: string,"instructor_id"?: string | null,"location"?: string,"meeting_url"?: string,"module_id"?: string,"overview"?: string,"price"?: number | null,"schedule_note"?: string,"start_date"?: string,"status"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "classes_instructor_id_fkey"
      columns: ["instructor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "classes_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    }
                  ]
                },"contact_requests": {
                  Row: {
                    "admin_notes": string,"created_at": string,"file_path": string | null,"id": string,"message": string,"service_type": string,"status": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string,"created_at"?: string,"file_path"?: string | null,"id"?: string,"message": string,"service_type": string,"status"?: string,"user_id": string
                  }
                  Update: {
                    "admin_notes"?: string,"created_at"?: string,"file_path"?: string | null,"id"?: string,"message"?: string,"service_type"?: string,"status"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "contact_requests_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"discount_codes": {
                  Row: {
                    "code": string,"created_at": string,"description": string,"id": string,"is_active": boolean,"max_uses": number | null,"percent": number,"used_count": number,"valid_until": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"description"?: string,"id"?: string,"is_active"?: boolean,"max_uses"?: number | null,"percent": number,"used_count"?: number,"valid_until"?: string | null
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"description"?: string,"id"?: string,"is_active"?: boolean,"max_uses"?: number | null,"percent"?: number,"used_count"?: number,"valid_until"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"education_modules": {
                  Row: {
                    "audience": string,"badge": string,"category": string,"description": string,"features": (string)[],"id": string,"is_active": boolean,"level": string,"long_description": string,"outcomes": (string)[],"public_price_hint": string,"slug": string,"sort_order": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audience"?: string,"badge"?: string,"category": string,"description"?: string,"features"?: (string)[],"id"?: string,"is_active"?: boolean,"level"?: string,"long_description"?: string,"outcomes"?: (string)[],"public_price_hint"?: string,"slug"?: string,"sort_order"?: number,"title": string
                  }
                  Update: {
                    "audience"?: string,"badge"?: string,"category"?: string,"description"?: string,"features"?: (string)[],"id"?: string,"is_active"?: boolean,"level"?: string,"long_description"?: string,"outcomes"?: (string)[],"public_price_hint"?: string,"slug"?: string,"sort_order"?: number,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"individual_requests": {
                  Row: {
                    "admin_notes": string,"bundle_id": string | null,"calculated_price": number,"created_at": string,"id": string,"module_id": string,"progress_note": string,"request_type": string,"status": string,"topic_ids": (string)[],"total_hours": number | null,"user_id": string,"user_message": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string,"bundle_id"?: string | null,"calculated_price": number,"created_at"?: string,"id"?: string,"module_id": string,"progress_note"?: string,"request_type": string,"status"?: string,"topic_ids"?: (string)[],"total_hours"?: number | null,"user_id": string,"user_message"?: string
                  }
                  Update: {
                    "admin_notes"?: string,"bundle_id"?: string | null,"calculated_price"?: number,"created_at"?: string,"id"?: string,"module_id"?: string,"progress_note"?: string,"request_type"?: string,"status"?: string,"topic_ids"?: (string)[],"total_hours"?: number | null,"user_id"?: string,"user_message"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "individual_requests_bundle_id_fkey"
      columns: ["bundle_id"]
isOneToOne: false
      referencedRelation: "bundle_packages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "individual_requests_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "individual_requests_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"module_syllabus_weeks": {
                  Row: {
                    "description": string,"id": string,"module_id": string,"sort_order": number,"title": string,"week_number": number
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string,"id"?: string,"module_id": string,"sort_order"?: number,"title": string,"week_number": number
                  }
                  Update: {
                    "description"?: string,"id"?: string,"module_id"?: string,"sort_order"?: number,"title"?: string,"week_number"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "module_syllabus_weeks_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"kind": string,"link": string,"read_at": string | null,"title": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"link"?: string,"read_at"?: string | null,"title": string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"link"?: string,"read_at"?: string | null,"title"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"posts": {
                  Row: {
                    "author_name": string,"body_md": string,"created_at": string,"excerpt": string,"id": string,"is_published": boolean,"published_at": string | null,"reading_minutes": number,"slug": string,"tags": (string)[],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_name"?: string,"body_md"?: string,"created_at"?: string,"excerpt"?: string,"id"?: string,"is_published"?: boolean,"published_at"?: string | null,"reading_minutes"?: number,"slug": string,"tags"?: (string)[],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_name"?: string,"body_md"?: string,"created_at"?: string,"excerpt"?: string,"id"?: string,"is_published"?: boolean,"published_at"?: string | null,"reading_minutes"?: number,"slug"?: string,"tags"?: (string)[],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"pricing_plans": {
                  Row: {
                    "id": string,"is_active": boolean,"max_people": number,"min_people": number,"module_id": string,"note": string,"price": number,"sort_order": number,"training_type": string,"unit": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"is_active"?: boolean,"max_people"?: number,"min_people"?: number,"module_id": string,"note"?: string,"price": number,"sort_order"?: number,"training_type": string,"unit": string
                  }
                  Update: {
                    "id"?: string,"is_active"?: boolean,"max_people"?: number,"min_people"?: number,"module_id"?: string,"note"?: string,"price"?: number,"sort_order"?: number,"training_type"?: string,"unit"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pricing_plans_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string,"email_notifications": boolean,"full_name": string,"phone": string | null,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email"?: string,"email_notifications"?: boolean,"full_name"?: string,"phone"?: string | null,"role"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"email_notifications"?: boolean,"full_name"?: string,"phone"?: string | null,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"public_inquiries": {
                  Row: {
                    "admin_notes": string,"created_at": string,"email": string,"id": string,"message": string,"name": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string,"created_at"?: string,"email": string,"id"?: string,"message": string,"name": string,"status"?: string
                  }
                  Update: {
                    "admin_notes"?: string,"created_at"?: string,"email"?: string,"id"?: string,"message"?: string,"name"?: string,"status"?: string
                  }
                  Relationships: [
                    
                  ]
                },"request_files": {
                  Row: {
                    "created_at": string,"file_name": string,"file_path": string,"file_size": number,"id": string,"is_deliverable": boolean,"request_id": string,"uploaded_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"file_name": string,"file_path": string,"file_size"?: number,"id"?: string,"is_deliverable"?: boolean,"request_id": string,"uploaded_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"file_name"?: string,"file_path"?: string,"file_size"?: number,"id"?: string,"is_deliverable"?: boolean,"request_id"?: string,"uploaded_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "request_files_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "request_files_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"request_messages": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"id": string,"is_staff": boolean,"request_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"id"?: string,"is_staff"?: boolean,"request_id": string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"id"?: string,"is_staff"?: boolean,"request_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "request_messages_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "request_messages_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    }
                  ]
                },"requests": {
                  Row: {
                    "admin_notes": string,"assignee_id": string | null,"bundle_id": string | null,"created_at": string,"decided_at": string | null,"details": NonNullable<Json>,"discount_code": string | null,"discount_percent": number | null,"due_date": string | null,"id": string,"kind": string,"last_activity_at": string,"legacy_id": string | null,"legacy_table": string | null,"message": string,"module_id": string | null,"price_estimate": number | null,"progress_note": string,"quote_amount": number | null,"quote_note": string,"quote_valid_until": string | null,"quoted_at": string | null,"status": string,"title": string,"topic_ids": (string)[],"total_hours": number | null,"training_mode": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string,"assignee_id"?: string | null,"bundle_id"?: string | null,"created_at"?: string,"decided_at"?: string | null,"details"?: NonNullable<Json>,"discount_code"?: string | null,"discount_percent"?: number | null,"due_date"?: string | null,"id"?: string,"kind": string,"last_activity_at"?: string,"legacy_id"?: string | null,"legacy_table"?: string | null,"message"?: string,"module_id"?: string | null,"price_estimate"?: number | null,"progress_note"?: string,"quote_amount"?: number | null,"quote_note"?: string,"quote_valid_until"?: string | null,"quoted_at"?: string | null,"status"?: string,"title"?: string,"topic_ids"?: (string)[],"total_hours"?: number | null,"training_mode"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "admin_notes"?: string,"assignee_id"?: string | null,"bundle_id"?: string | null,"created_at"?: string,"decided_at"?: string | null,"details"?: NonNullable<Json>,"discount_code"?: string | null,"discount_percent"?: number | null,"due_date"?: string | null,"id"?: string,"kind"?: string,"last_activity_at"?: string,"legacy_id"?: string | null,"legacy_table"?: string | null,"message"?: string,"module_id"?: string | null,"price_estimate"?: number | null,"progress_note"?: string,"quote_amount"?: number | null,"quote_note"?: string,"quote_valid_until"?: string | null,"quoted_at"?: string | null,"status"?: string,"title"?: string,"topic_ids"?: (string)[],"total_hours"?: number | null,"training_mode"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "requests_assignee_id_fkey"
      columns: ["assignee_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "requests_bundle_id_fkey"
      columns: ["bundle_id"]
isOneToOne: false
      referencedRelation: "bundle_packages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "class_id": string | null,"comment": string,"created_at": string,"id": string,"is_published": boolean,"module_id": string | null,"rating": number,"request_id": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id"?: string | null,"comment"?: string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"module_id"?: string | null,"rating": number,"request_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "class_id"?: string | null,"comment"?: string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"module_id"?: string | null,"rating"?: number,"request_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"sessions": {
                  Row: {
                    "class_id": string | null,"created_at": string,"ends_at": string,"id": string,"location": string,"meeting_url": string,"notes": string,"request_id": string | null,"starts_at": string,"title": string,"week_number": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id"?: string | null,"created_at"?: string,"ends_at": string,"id"?: string,"location"?: string,"meeting_url"?: string,"notes"?: string,"request_id"?: string | null,"starts_at": string,"title"?: string,"week_number"?: number | null
                  }
                  Update: {
                    "class_id"?: string | null,"created_at"?: string,"ends_at"?: string,"id"?: string,"location"?: string,"meeting_url"?: string,"notes"?: string,"request_id"?: string | null,"starts_at"?: string,"title"?: string,"week_number"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "sessions_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "sessions_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    }
                  ]
                },"settings": {
                  Row: {
                    "key": string,"value_json": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "key": string,"value_json": NonNullable<Json>
                  }
                  Update: {
                    "key"?: string,"value_json"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"site_content": {
                  Row: {
                    "content_json": NonNullable<Json>,"page_key": string,"section_key": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content_json"?: NonNullable<Json>,"page_key": string,"section_key": string,"updated_at"?: string
                  }
                  Update: {
                    "content_json"?: NonNullable<Json>,"page_key"?: string,"section_key"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"topics": {
                  Row: {
                    "description": string,"estimated_hours": number,"id": string,"is_active": boolean,"module_id": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string,"estimated_hours"?: number,"id"?: string,"is_active"?: boolean,"module_id": string,"title": string
                  }
                  Update: {
                    "description"?: string,"estimated_hours"?: number,"id"?: string,"is_active"?: boolean,"module_id"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "topics_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "education_modules"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_add_enrollment":
{ Args: { "p_class_id": string,"p_user_id": string }; Returns: {
              "class_id": string,
"created_at": string,
"discount_code": string | null,
"id": string,
"note": string,
"status": string,
"updated_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "class_enrollments"
        isOneToOne: true
        isSetofReturn: false
      } },
"approve_class_enrollment":
{ Args: { "p_enrollment_id": string }; Returns: {
              "class_id": string,
"created_at": string,
"discount_code": string | null,
"id": string,
"note": string,
"status": string,
"updated_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "class_enrollments"
        isOneToOne: true
        isSetofReturn: false
      } },
"cancel_my_enrollment":
{ Args: { "p_enrollment_id": string }; Returns: undefined
                           },
"cancel_my_request":
{ Args: { "p_request_id": string }; Returns: undefined
                           },
"check_discount_code":
{ Args: { "p_code": string }; Returns: number
                           },
"class_taken_seats":
{ Args: { "p_class_id": string }; Returns: number
                           },
"complete_class":
{ Args: { "p_class_id": string }; Returns: number
                           },
"get_catalog_cohorts":
{ Args: { "p_limit"?: number,"p_module_id"?: string }; Returns: {
              "capacity": number,"description": string,"duration_hours": number,"duration_weeks": number,"id": string,"location": string,"module_category": string,"module_id": string,"module_slug": string,"module_title": string,"my_status": string,"overview": string,"price": number,"schedule_note": string,"start_date": string,"status": string,"taken_seats": number,"title": string
            }[]
                           },
"get_member_upcoming_classes":
{ Args: Record<PropertyKey, never>; Returns: {
              "approved_count": number,"capacity": number,"description": string,"duration_hours": number,"id": string,"module_category": string,"module_id": string,"module_title": string,"my_status": string,"schedule_note": string,"start_date": string,"title": string
            }[]
                           },
"get_open_classes":
{ Args: { "p_module_id": string }; Returns: {
              "approved_count": number,"capacity": number,"description": string,"duration_hours": number,"id": string,"my_status": string,"schedule_note": string,"start_date": string,"title": string
            }[]
                           },
"get_public_all_upcoming_classes":
{ Args: Record<PropertyKey, never>; Returns: {
              "approved_count": number,"capacity": number,"duration_hours": number,"id": string,"module_category": string,"module_id": string,"module_title": string,"schedule_note": string,"start_date": string,"title": string
            }[]
                           },
"get_public_reviews":
{ Args: { "p_limit"?: number,"p_module_id"?: string }; Returns: {
              "author": string,"comment": string,"created_at": string,"id": string,"program_title": string,"rating": number
            }[]
                           },
"get_public_upcoming_classes":
{ Args: { "p_module_id": string }; Returns: {
              "approved_count": number,"capacity": number,"duration_hours": number,"duration_weeks": number,"id": string,"schedule_note": string,"start_date": string,"title": string
            }[]
                           },
"get_visible_profile_names":
{ Args: { "p_ids": (string)[] }; Returns: {
              "full_name": string,"user_id": string
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_class_instructor":
{ Args: { "p_class_id": string }; Returns: boolean
                           },
"is_instructor":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"mark_notifications_read":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"my_role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"new_certificate_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"notify_admins":
{ Args: { "p_body": string,"p_kind": string,"p_link": string,"p_title": string }; Returns: undefined
                           },
"push_notification":
{ Args: { "p_body": string,"p_kind": string,"p_link": string,"p_title": string,"p_user_id": string }; Returns: undefined
                           },
"request_class_enrollment":
{ Args: { "p_class_id": string,"p_discount_code"?: string,"p_note"?: string }; Returns: {
              "class_id": string,
"created_at": string,
"discount_code": string | null,
"id": string,
"note": string,
"status": string,
"updated_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "class_enrollments"
        isOneToOne: true
        isSetofReturn: false
      } },
"request_status_label":
{ Args: { "p_status": string }; Returns: string
                           },
"respond_to_quote":
{ Args: { "p_accept": boolean,"p_request_id": string }; Returns: {
              "admin_notes": string,
"assignee_id": string | null,
"bundle_id": string | null,
"created_at": string,
"decided_at": string | null,
"details": NonNullable<Json>,
"discount_code": string | null,
"discount_percent": number | null,
"due_date": string | null,
"id": string,
"kind": string,
"last_activity_at": string,
"legacy_id": string | null,
"legacy_table": string | null,
"message": string,
"module_id": string | null,
"price_estimate": number | null,
"progress_note": string,
"quote_amount": number | null,
"quote_note": string,
"quote_valid_until": string | null,
"quoted_at": string | null,
"status": string,
"title": string,
"topic_ids": (string)[],
"total_hours": number | null,
"training_mode": string | null,
"updated_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "requests"
        isOneToOne: true
        isSetofReturn: false
      } },
"slugify":
{ Args: { "p_text": string }; Returns: string
                           },
"verify_certificate":
{ Args: { "p_code": string }; Returns: {
              "code": string,"hours": number,"issued_at": string,"program_title": string,"recipient_name": string,"revoked": boolean
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
