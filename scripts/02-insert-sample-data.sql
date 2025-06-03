-- Insert sample countries
INSERT INTO countries (name, code) VALUES 
('South Africa', 'ZA'),
('Kenya', 'KE'),
('Tanzania', 'TZ'),
('Uganda', 'UG'),
('Rwanda', 'RW'),
('Botswana', 'BW'),
('Namibia', 'NA'),
('Zimbabwe', 'ZW'),
('Zambia', 'ZM');

-- Insert sample destinations
INSERT INTO destinations (name, country_id, description) VALUES 
('Cape Town', 1, 'Beautiful coastal city with Table Mountain'),
('Johannesburg', 1, 'Economic hub of South Africa'),
('Kruger National Park', 1, 'Premier game reserve'),
('Garden Route', 1, 'Scenic coastal drive'),
('Nairobi', 2, 'Capital city and safari gateway'),
('Masai Mara', 2, 'Famous for the Great Migration'),
('Amboseli', 2, 'Known for elephant herds and Kilimanjaro views'),
('Tsavo', 2, 'Large wilderness area'),
('Arusha', 3, 'Gateway to northern safari circuit'),
('Serengeti', 3, 'World-famous for wildlife'),
('Ngorongoro', 3, 'UNESCO World Heritage crater'),
('Zanzibar', 3, 'Tropical island paradise');

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_email, tourplan_supplier_id) VALUES 
('African Safari Co', 'info@africansafari.com', 'ASC001'),
('Kenya Wildlife Tours', 'bookings@kenyawildlife.com', 'KWT001'),
('Uganda Gorilla Tours', 'info@ugandagorilla.com', 'UGT001'),
('Tanzania Adventures', 'hello@tanzaniaadv.com', 'TAD001');

-- Insert sample tours
INSERT INTO tours (tourplan_id, name, description, duration, base_price, level, supplier_id, destination_id) VALUES 
('SAFKRUGER001', 'Kruger National Park Safari', 'Experience the Big Five in South Africa''s premier game reserve. Includes game drives, accommodation, and meals.', 3, 1250.00, 'standard', 1, 3),
('KENMARA001', 'Masai Mara Great Migration', 'Witness the spectacular wildebeest migration in Kenya''s most famous reserve.', 4, 2100.00, 'luxury', 2, 6),
('UGABWINDI001', 'Gorilla Trekking Adventure', 'Track mountain gorillas in Bwindi Impenetrable Forest. Permits included.', 2, 1800.00, 'standard', 3, 3),
('TANSER001', 'Serengeti Classic Safari', 'Classic safari experience in the world-famous Serengeti National Park.', 5, 2800.00, 'luxury', 4, 10);

-- Insert sample tour extras
INSERT INTO tour_extras (tour_id, tourplan_extra_id, name, description, price, is_compulsory) VALUES 
(1, 'EXT001', 'Bush Walk', 'Guided walking safari', 150.00, false),
(1, 'EXT002', 'Night Drive', 'Evening game drive', 200.00, false),
(2, 'EXT003', 'Hot Air Balloon', 'Sunrise balloon safari', 450.00, false),
(2, 'EXT004', 'Masai Village Visit', 'Cultural experience', 100.00, false),
(3, 'EXT005', 'Gorilla Permit', 'Required gorilla tracking permit', 700.00, true),
(3, 'EXT006', 'Porter Service', 'Assistance during trek', 50.00, false);
