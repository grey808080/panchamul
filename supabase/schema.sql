-- ENUM types
create type order_status as enum (
  'received', 'processing', 'out_for_delivery', 'delivered', 'cancelled'
);

create type payment_method as enum (
  'cod', 'esewa', 'khalti', 'bank_transfer'
);

create type gallery_type as enum ('store', 'work');

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_np text not null,
  slug text unique not null,
  icon text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_np text,
  slug text unique not null,
  category_id uuid references categories(id),
  brand text,
  price numeric(10, 2) not null,
  compare_price numeric(10, 2),
  stock_qty int default 0,
  images text[],
  description_en text,
  description_np text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  city text default 'Kohalpur',
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id),
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  delivery_charge numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  payment_method payment_method default 'cod',
  payment_status text default 'pending',
  status order_status default 'received',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Electricians
create table electricians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  specialties text[],
  phone text not null,
  whatsapp text,
  experience_years int,
  is_available boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Services
create table services (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_np text,
  description_en text,
  description_np text,
  icon text,
  display_order int default 0,
  is_active boolean default true
);

-- Gallery
create table gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  type gallery_type default 'store',
  display_order int default 0,
  created_at timestamptz default now()
);

-- Site settings
create table site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- RLS
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table profiles enable row level security;
alter table electricians enable row level security;
alter table services enable row level security;
alter table gallery enable row level security;
alter table site_settings enable row level security;

-- Public read policies
create policy "Public read categories"
  on categories for select using (true);

create policy "Public read active products"
  on products for select using (is_active = true);

create policy "Public read electricians"
  on electricians for select using (true);

create policy "Public read services"
  on services for select using (is_active = true);

create policy "Public read gallery"
  on gallery for select using (true);

create policy "Public read site_settings"
  on site_settings for select using (true);

create policy "Users see own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Anyone can create order"
  on orders for insert with check (true);

create policy "Users see own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();