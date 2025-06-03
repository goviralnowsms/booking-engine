-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create enum types
CREATE TYPE tour_level AS ENUM ('basic', 'standard', 'luxury');
CREATE TYPE availability_status AS ENUM ('OK', 'RQ', 'NO');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Countries table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, country_id)
);

-- Tour suppliers table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    tourplan_supplier_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tours table
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    tourplan_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in days
    base_price DECIMAL(10,2) NOT NULL,
    level tour_level NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    destination_id INTEGER REFERENCES destinations(id),
    availability availability_status DEFAULT 'OK',
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tour extras table
CREATE TABLE tour_extras (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    tourplan_extra_id VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_compulsory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    tour_id INTEGER REFERENCES tours(id),
    customer_id INTEGER REFERENCES customers(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    tourplan_booking_id VARCHAR(100),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking extras (many-to-many relationship)
CREATE TABLE booking_extras (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    tour_extra_id INTEGER REFERENCES tour_extras(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50), -- stripe, paypal, etc.
    provider_transaction_id VARCHAR(200),
    status payment_status DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tours_destination ON tours(destination_id);
CREATE INDEX idx_tours_supplier ON tours(supplier_id);
CREATE INDEX idx_tours_level ON tours(level);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_tour ON bookings(tour_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_customers_email ON customers(email);
