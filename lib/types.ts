// ─── Database Types ──────────────────────────

export type TripStatus = 'open' | 'preferences' | 'voting' | 'locked' | 'cancelled';
export type MemberStatus = 'pending' | 'committed' | 'withdrawn' | 'interested';
export type BudgetFlexibility = 'strict' | 'flexible' | 'whatever';
export type AccommodationStyle = 'hostel' | 'airbnb' | 'hotel' | 'no_preference';
export type Pace = 'packed' | 'balanced' | 'chill';
export type ActivityInterest = 'food' | 'nightlife' | 'outdoors' | 'culture' | 'relaxation' | 'adventure';

export interface Trip {
  id: string;
  created_at: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_per_person: number;       // cents
  deposit_amount: number;          // cents
  organizer_name: string;
  organizer_email: string;
  commitment_deadline: string | null;
  preference_deadline: string | null;
  status: TripStatus;
  winning_option_id: string | null;
}

export interface Member {
  id: string;
  created_at: string;
  trip_id: string;
  name: string;
  email: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paid: boolean;
  paid_at: string | null;
  status: MemberStatus;
}

export interface Preference {
  id: string;
  created_at: string;
  trip_id: string;
  member_id: string;
  budget_flexibility: BudgetFlexibility;
  accommodation_style: AccommodationStyle;
  activity_interests: ActivityInterest[];
  pace: Pace;
  hard_nos: string | null;
}

export interface DayActivity {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface Option {
  id: string;
  created_at: string;
  trip_id: string;
  option_name: string;
  description: string;
  accommodation: string;
  daily_activities: DayActivity[];
  estimated_cost_per_person: number;  // cents
  why_this_works: string;
  vote_count: number;
}

export interface Vote {
  id: string;
  created_at: string;
  trip_id: string;
  member_id: string;
  option_id: string;
}

// ─── API Request/Response Types ──────────────

export interface CreateTripRequest {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_per_person: number;
  deposit_amount: number;
  organizer_name: string;
  organizer_email: string;
  commitment_deadline?: string;
  preference_deadline?: string;
}

export interface CheckoutRequest {
  trip_id: string;
  member_name: string;
  member_email: string;
}

export interface PreferenceRequest {
  trip_id: string;
  member_id: string;
  budget_flexibility: BudgetFlexibility;
  accommodation_style: AccommodationStyle;
  activity_interests: ActivityInterest[];
  pace: Pace;
  hard_nos?: string;
}

export interface VoteRequest {
  trip_id: string;
  member_id: string;
  option_id: string;
}
