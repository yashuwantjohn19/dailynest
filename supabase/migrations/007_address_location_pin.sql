-- Optional one-time customer location pin for delivery routing.
alter table public.addresses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_m double precision,
  add column if not exists location_captured_at timestamptz;

alter table public.addresses
  drop constraint if exists addresses_latitude_range,
  add constraint addresses_latitude_range
    check (latitude is null or latitude between -90 and 90),
  drop constraint if exists addresses_longitude_range,
  add constraint addresses_longitude_range
    check (longitude is null or longitude between -180 and 180),
  drop constraint if exists addresses_location_pair,
  add constraint addresses_location_pair
    check ((latitude is null) = (longitude is null));
