-- Enable Row Level Security on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data
CREATE POLICY "Public read access" ON countries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON destinations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tours FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tour_extras FOR SELECT USING (true);

-- Customer data policies (customers can only see their own data)
CREATE POLICY "Customers can view own data" ON customers 
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Customers can insert own data" ON customers 
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

CREATE POLICY "Customers can update own data" ON customers 
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Booking policies
CREATE POLICY "Customers can view own bookings" ON bookings 
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Customers can create bookings" ON bookings 
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Booking extras policies
CREATE POLICY "Customers can view own booking extras" ON booking_extras 
    FOR SELECT USING (
        booking_id IN (
            SELECT b.id FROM bookings b 
            JOIN customers c ON b.customer_id = c.id 
            WHERE c.email = auth.jwt() ->> 'email'
        )
    );

-- Payment policies
CREATE POLICY "Customers can view own payments" ON payments 
    FOR SELECT USING (
        booking_id IN (
            SELECT b.id FROM bookings b 
            JOIN customers c ON b.customer_id = c.id 
            WHERE c.email = auth.jwt() ->> 'email'
        )
    );
