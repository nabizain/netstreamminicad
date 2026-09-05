create extension if not exists pgcrypto;

-- =========================================================
-- PROFILES
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    phone text,
    role text not null
        check (role in ('dispatcher', 'officer')),
    created_at timestamptz not null default now()
);

-- =========================================================
-- OFFICER STATUS
-- =========================================================

create table if not exists public.officer_status (
    officer_id uuid primary key
        references public.profiles(id)
        on delete cascade,

    is_on_duty boolean not null default false,

    availability text not null default 'off_duty'
        check (
            availability in (
                'available',
                'responding',
                'off_duty'
            )
        ),

    last_seen_at timestamptz,

    updated_at timestamptz not null default now()
);

-- =========================================================
-- INCIDENTS
-- =========================================================

create table if not exists public.incidents (
    id uuid primary key default gen_random_uuid(),

    caller_name text not null,

    caller_phone text not null,

    location text not null,

    incident_type text not null,

    priority text not null
        check (
            priority in (
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    description text not null,

    status text not null default 'new'
        check (
            status in (
                'new',
                'dispatched',
                'claimed',
                'responding',
                'resolved'
            )
        ),

    created_by uuid not null
        references public.profiles(id),

    claimed_by uuid null
        references public.profiles(id),

    created_at timestamptz not null default now(),

    dispatched_at timestamptz null,

    claimed_at timestamptz null,

    resolved_at timestamptz null
);

-- =========================================================
-- INCIDENT REPORTS
-- =========================================================

create table if not exists public.incident_reports (
    id uuid primary key default gen_random_uuid(),

    incident_id uuid not null
        unique
        references public.incidents(id)
        on delete cascade,

    officer_id uuid not null
        references public.profiles(id),

    report_text text not null,

    submitted_at timestamptz not null default now()
);