-- Enable PostGIS extension for geolocation
create extension if not exists postgis;

-- 1. PROFILES Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('passenger', 'driver', 'admin')) not null default 'passenger',
  full_name text,
  phone text unique,
  loyalty_points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. DRIVERS Table (Extension of profiles)
create table public.drivers (
  id uuid references public.profiles(id) not null primary key,
  vehicle_type text check (vehicle_type in ('boda', 'tuktuk', 'taxi')),
  plate_number text,
  is_online boolean default false,
  owner_id uuid references public.profiles(id), -- Optional Fleet Owner
  updated_at timestamp with time zone
);

alter table public.drivers enable row level security;
create policy "Drivers viewable by everyone" on public.drivers for select using (true);
create policy "Drivers can update own status" on public.drivers for update using (auth.uid() = id);
create policy "Drivers can insert own record" on public.drivers for insert with check (auth.uid() = id);

-- 3. DRIVER LOCATIONS Table (Real-time tracking)
create table public.driver_locations (
  driver_id uuid references public.profiles(id) not null primary key,
  location geography(Point),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.driver_locations enable row level security;
create policy "Locations viewable by everyone" on public.driver_locations for select using (true);
create policy "Drivers can update own location" on public.driver_locations for insert with check (auth.uid() = driver_id);
create policy "Drivers can update own location update" on public.driver_locations for update using (auth.uid() = driver_id);

-- 4. RIDES Table
create table public.rides (
  id uuid default gen_random_uuid() primary key,
  passenger_id uuid references public.profiles(id) not null,
  driver_id uuid references public.profiles(id), -- Nullable until accepted
  pickup_location geography(Point) not null,
  dropoff_location geography(Point) not null,
  status text check (status in ('pending', 'accepted', 'ongoing', 'completed', 'cancelled')) default 'pending',
  fare numeric default 0,
  payment_status text check (payment_status in ('unpaid', 'paid')) default 'unpaid',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rides enable row level security;
-- Simple policies for MVP (refine for production)
create policy "Everyone can view rides" on public.rides for select using (true);
create policy "Authenticated users can create rides" on public.rides for insert with check (auth.rol() = 'authenticated');
create policy "Users can update rides involves them" on public.rides for update using (true); -- Broad for MVP demo

-- 5. FUNCTION: Get Nearby Drivers
-- RPC call to find drivers within radius (default 5km)
create or replace function get_nearby_drivers(lat float, long float)
returns table (id uuid, lat float, long float, dist_meters float)
language plpgsql
as $$
begin
  return query
  select
    dl.driver_id as id,
    st_y(dl.location::geometry) as lat,
    st_x(dl.location::geometry) as long,
    st_distance(dl.location, st_point(long, lat)::geography) as dist_meters
  from public.driver_locations dl
  join public.drivers d on d.id = dl.driver_id
  where d.is_online = true
  and st_dwithin(dl.location, st_point(long, lat)::geography, 5000);
end;
$$;

-- 6. TRIGGER: Handle New User -> Profile Creation (Optional convenience)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'passenger'), new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. REALTIME CONFIGURATION
-- Critical: Enable Realtime for the tables we listen to
begin;
  -- Check if publication exists (default in Supabase), then add tables
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.rides, public.driver_locations, public.drivers;
commit;
