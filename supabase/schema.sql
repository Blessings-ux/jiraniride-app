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
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
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
create policy "Authenticated users can create rides" on public.rides for insert with check (auth.role() = 'authenticated');
create policy "Users can update rides involves them" on public.rides for update using (true); -- Broad for MVP demo

-- 5. FUNCTION: Get Nearby Drivers (FIXED VERSION)
-- RPC call to find drivers within radius (default 5km)
create or replace function get_nearby_drivers(
  user_lat float, 
  user_long float,
  radius_meters float default 5000
)
returns table (
  driver_id uuid, 
  latitude float, 
  longitude float, 
  dist_meters float,
  vehicle_type text,
  plate_number text
)
language plpgsql
as $$
begin
  return query
  select
    dl.driver_id,
    st_y(dl.location::geometry) as latitude,
    st_x(dl.location::geometry) as longitude,
    st_distance(dl.location, st_point(user_long, user_lat)::geography) as dist_meters,
    d.vehicle_type,
    d.plate_number
  from public.driver_locations dl
  join public.drivers d on d.id = dl.driver_id
  where d.is_online = true
  and st_dwithin(dl.location, st_point(user_long, user_lat)::geography, radius_meters)
  order by dist_meters asc;
end;
$$;

-- 6. FUNCTION: Calculate ride distance (in meters)
create or replace function calculate_ride_distance(
  pickup_lat float,
  pickup_long float,
  dropoff_lat float,
  dropoff_long float
)
returns float
language plpgsql
as $$
declare
  distance float;
begin
  select st_distance(
    st_point(pickup_long, pickup_lat)::geography,
    st_point(dropoff_long, dropoff_lat)::geography
  ) into distance;
  
  return distance;
end;
$$;

-- 7. FUNCTION: Estimate fare based on distance and vehicle type
create or replace function estimate_fare(
  distance_meters float,
  vehicle_type text
)
returns numeric
language plpgsql
as $$
declare
  base_fare numeric;
  per_km_rate numeric;
  estimated_fare numeric;
begin
  -- Set base fares and rates based on vehicle type (in KES)
  case vehicle_type
    when 'boda' then
      base_fare := 100;
      per_km_rate := 50;
    when 'tuktuk' then
      base_fare := 150;
      per_km_rate := 75;
    when 'taxi' then
      base_fare := 300;
      per_km_rate := 120;
    else
      base_fare := 200;
      per_km_rate := 100;
  end case;
  
  -- Calculate fare: base + (distance in km * rate per km)
  estimated_fare := base_fare + ((distance_meters / 1000.0) * per_km_rate);
  
  -- Round to nearest 10
  return round(estimated_fare / 10) * 10;
end;
$$;

-- 8. TRIGGER: Handle New User -> Profile Creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'passenger'), 
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. TRIGGER: Update driver's updated_at timestamp
create or replace function public.update_driver_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_drivers_updated_at
  before update on public.drivers
  for each row execute procedure public.update_driver_updated_at();

-- 10. TRIGGER: Auto-create driver record when profile role is set to 'driver'
create or replace function public.handle_driver_profile()
returns trigger as $$
begin
  if new.role = 'driver' and old.role != 'driver' then
    insert into public.drivers (id, updated_at)
    values (new.id, timezone('utc'::text, now()))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_role_change
  after update on public.profiles
  for each row execute procedure public.handle_driver_profile();

-- 11. INDEXES for better performance
create index idx_driver_locations_location on public.driver_locations using gist(location);
create index idx_drivers_is_online on public.drivers(is_online) where is_online = true;
create index idx_rides_status on public.rides(status);
create index idx_rides_passenger_id on public.rides(passenger_id);
create index idx_rides_driver_id on public.rides(driver_id);
create index idx_profiles_role on public.profiles(role);

-- 12. VIEW: Active drivers with their latest location
create or replace view public.active_drivers as
select 
  d.id,
  p.full_name,
  d.vehicle_type,
  d.plate_number,
  dl.location,
  st_y(dl.location::geometry) as latitude,
  st_x(dl.location::geometry) as longitude,
  dl.updated_at as last_location_update
from public.drivers d
join public.profiles p on p.id = d.id
left join public.driver_locations dl on dl.driver_id = d.id
where d.is_online = true
and dl.location is not null;

-- 13. REALTIME CONFIGURATION
-- Note: In Supabase, the default publication is 'supabase_realtime'
-- We need to add tables to it instead of recreating it
alter publication supabase_realtime add table public.rides;
alter publication supabase_realtime add table public.driver_locations;
alter publication supabase_realtime add table public.drivers;

-- If the publication doesn't exist yet, create it
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime for table public.rides, public.driver_locations, public.drivers;
  end if;
end
$$;
