-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  price INTEGER NOT NULL,
  rating FLOAT DEFAULT 0,
  description TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_requests table
CREATE TABLE IF NOT EXISTS event_requests (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  location TEXT NOT NULL,
  budget INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_details table
CREATE TABLE IF NOT EXISTS user_details (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_request_id INTEGER REFERENCES event_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_vendors table
CREATE TABLE IF NOT EXISTS event_vendors (
  id SERIAL PRIMARY KEY,
  event_request_id INTEGER REFERENCES event_requests(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (if not exists)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES ('nil@gmail.com', 'nil123_hash', 'Admin User', 'administrator')
ON CONFLICT (email) DO NOTHING;

-- Add some sample vendors
INSERT INTO vendors (name, category, city, price, rating, description, contact_email, contact_phone, image_url, status)
VALUES 
  ('Elegant Decor', 'Decorator', 'Mumbai', 50000, 4.8, 'Luxury wedding and event decoration services', 'elegant@example.com', '9876543210', 'https://images.unsplash.com/photo-1519741497674-611481863552', 'active'),
  ('Capture Moments', 'Photographer', 'Delhi', 35000, 4.7, 'Professional photography for all occasions', 'capture@example.com', '9876543211', 'https://images.unsplash.com/photo-1605723517503-3cadb5818894', 'active'),
  ('Delicious Caterers', 'Caterer', 'Bangalore', 65000, 4.9, 'Delicious multi-cuisine catering services', 'delicious@example.com', '9876543212', 'https://images.unsplash.com/photo-1555244162-803834f70033', 'active'),
  ('Royal Venue', 'Venue', 'Mumbai', 120000, 4.8, 'Luxury banquet hall and event space', 'royal@example.com', '9876543213', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'active'),
  ('Sound Masters', 'Sound & Lighting', 'Delhi', 45000, 4.6, 'Professional sound and lighting solutions', 'sound@example.com', '9876543214', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', 'active'),
  ('Star Entertainment', 'Entertainment', 'Bangalore', 50000, 4.7, 'Live music and entertainment services', 'star@example.com', '9876543215', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4', 'active'),
  ('Professional Hosts', 'Anchor', 'Mumbai', 20000, 4.5, 'Experienced event hosts and MCs', 'hosts@example.com', '9876543216', 'https://images.unsplash.com/photo-1559673795-3c78d5f60947', 'active'),
  ('Glamour Touch', 'Makeup Artist', 'Delhi', 25000, 4.9, 'Professional makeup services for all occasions', 'glamour@example.com', '9876543217', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2', 'active')
ON CONFLICT DO NOTHING;

-- Add sample event requests
INSERT INTO event_requests (event_type, location, budget, special_requests, status)
VALUES
  ('wedding', 'Mumbai', 500000, 'Looking for vendors who can handle a traditional ceremony with 200 guests', 'pending'),
  ('birthday', 'Delhi', 100000, 'Planning a surprise 30th birthday party', 'in_progress'),
  ('corporate', 'Bangalore', 300000, 'Annual company event for 150 employees', 'completed'),
  ('collegeFest', 'Hyderabad', 200000, 'Two-day college cultural festival', 'pending')
ON CONFLICT DO NOTHING;

-- Add sample user details linked to event requests
INSERT INTO user_details (name, phone, event_request_id)
VALUES
  ('Rahul Sharma', '9876543210', 1),
  ('Priya Patel', '9876543211', 2),
  ('Ajay Singh', '9876543212', 3),
  ('Neha Verma', '9876543213', 4)
ON CONFLICT DO NOTHING;

-- Add sample event_vendors connections
INSERT INTO event_vendors (event_request_id, vendor_id, vendor_name, vendor_category)
VALUES
  (1, 1, 'Elegant Decor', 'Decorator'),
  (1, 2, 'Capture Moments', 'Photographer'),
  (1, 3, 'Delicious Caterers', 'Caterer'),
  (2, 3, 'Delicious Caterers', 'Caterer'),
  (2, 6, 'Star Entertainment', 'Entertainment'),
  (3, 4, 'Royal Venue', 'Venue'),
  (3, 5, 'Sound Masters', 'Sound & Lighting'),
  (3, 7, 'Professional Hosts', 'Anchor')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security but allow all operations for now
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users on admin_users" ON admin_users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on vendors" ON vendors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on event_requests" ON event_requests FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on user_details" ON user_details FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on event_vendors" ON event_vendors FOR ALL TO authenticated USING (true);

-- Also allow anonymous access for the application to function without auth
CREATE POLICY "Allow all for anonymous users on admin_users" ON admin_users FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anonymous users on vendors" ON vendors FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anonymous users on event_requests" ON event_requests FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anonymous users on user_details" ON user_details FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anonymous users on event_vendors" ON event_vendors FOR ALL TO anon USING (true); 