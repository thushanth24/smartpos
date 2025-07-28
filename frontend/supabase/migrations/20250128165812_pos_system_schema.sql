-- Location: supabase/migrations/20250128165812_pos_system_schema.sql
-- Complete POS System Database Schema

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'cashier');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'refunded', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'digital_wallet');
CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'discontinued');
CREATE TYPE public.stock_movement_type AS ENUM ('in', 'out', 'adjustment');

-- 2. Core Tables

-- User profiles (intermediary table for auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'cashier'::public.user_role,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Product categories
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'Package',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE,
    sku TEXT UNIQUE,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) DEFAULT 0 CHECK (cost >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    status public.product_status DEFAULT 'active'::public.product_status,
    image_url TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sales transactions
CREATE TABLE public.sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT NOT NULL UNIQUE,
    receipt_number TEXT NOT NULL UNIQUE,
    cashier_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method public.payment_method NOT NULL,
    payment_reference TEXT,
    status public.transaction_status DEFAULT 'completed'::public.transaction_status,
    notes TEXT,
    synced BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sale items (transaction line items)
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.sales_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Store name in case product is deleted
    product_price DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total DECIMAL(10,2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Stock movements (inventory tracking)
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type public.stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type TEXT, -- 'sale', 'purchase', 'adjustment', etc.
    reference_id UUID, -- ID of related transaction/adjustment
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_sales_transactions_cashier_id ON public.sales_transactions(cashier_id);
CREATE INDEX idx_sales_transactions_customer_id ON public.sales_transactions(customer_id);
CREATE INDEX idx_sales_transactions_created_at ON public.sales_transactions(created_at);
CREATE INDEX idx_sale_items_transaction_id ON public.sale_items(transaction_id);
CREATE INDEX idx_sale_items_product_id ON public.sale_items(product_id);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- 5. Helper Functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT role::TEXT FROM public.user_profiles up WHERE up.id = user_uuid
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = user_uuid AND up.role IN ('admin', 'manager')
)
$$;

CREATE OR REPLACE FUNCTION public.can_access_transaction(transaction_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.sales_transactions st
    WHERE st.id = transaction_uuid AND (
        st.cashier_id = auth.uid() OR
        public.is_admin_or_manager(auth.uid())
    )
)
$$;

-- Function for auto-updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Function for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'cashier')::public.user_role
    );
    RETURN NEW;
END;
$$;

-- Function to update product stock
CREATE OR REPLACE FUNCTION public.update_product_stock(
    product_uuid UUID,
    movement_type_param public.stock_movement_type,
    quantity_param INTEGER,
    reference_type_param TEXT DEFAULT NULL,
    reference_id_param UUID DEFAULT NULL,
    notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_stock INTEGER;
    new_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM public.products
    WHERE id = product_uuid;
    
    IF current_stock IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new stock
    CASE movement_type_param
        WHEN 'in' THEN new_stock := current_stock + quantity_param;
        WHEN 'out' THEN new_stock := current_stock - quantity_param;
        WHEN 'adjustment' THEN new_stock := quantity_param;
    END CASE;
    
    -- Prevent negative stock
    IF new_stock < 0 THEN
        new_stock := 0;
    END IF;
    
    -- Update product stock
    UPDATE public.products
    SET stock_quantity = new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = product_uuid;
    
    -- Record stock movement
    INSERT INTO public.stock_movements (
        product_id, movement_type, quantity,
        previous_stock, new_stock,
        reference_type, reference_id, notes,
        created_by
    ) VALUES (
        product_uuid, movement_type_param, quantity_param,
        current_stock, new_stock,
        reference_type_param, reference_id_param, notes_param,
        auth.uid()
    );
    
    RETURN TRUE;
END;
$$;

-- 6. RLS Policies
-- User profiles - users can view all profiles but only edit their own
CREATE POLICY "authenticated_can_view_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_can_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Product categories - all authenticated users can view, only admin/manager can modify
CREATE POLICY "authenticated_can_view_categories"
ON public.product_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manager_can_manage_categories"
ON public.product_categories
FOR ALL
TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Products - all authenticated users can view, only admin/manager can modify
CREATE POLICY "authenticated_can_view_products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manager_can_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Customers - all authenticated users can view and manage
CREATE POLICY "authenticated_can_manage_customers"
ON public.customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Sales transactions - cashiers can view/create their own, admin/manager can view all
CREATE POLICY "users_can_view_accessible_transactions"
ON public.sales_transactions
FOR SELECT
TO authenticated
USING (
    cashier_id = auth.uid() OR
    public.is_admin_or_manager(auth.uid())
);

CREATE POLICY "authenticated_can_create_transactions"
ON public.sales_transactions
FOR INSERT
TO authenticated
WITH CHECK (cashier_id = auth.uid());

CREATE POLICY "authorized_can_update_transactions"
ON public.sales_transactions
FOR UPDATE
TO authenticated
USING (public.can_access_transaction(id))
WITH CHECK (public.can_access_transaction(id));

-- Sale items - follow same access as parent transaction
CREATE POLICY "users_can_view_accessible_sale_items"
ON public.sale_items
FOR SELECT
TO authenticated
USING (public.can_access_transaction(transaction_id));

CREATE POLICY "authenticated_can_create_sale_items"
ON public.sale_items
FOR INSERT
TO authenticated
WITH CHECK (public.can_access_transaction(transaction_id));

-- Stock movements - all authenticated users can view, admin/manager can manage
CREATE POLICY "authenticated_can_view_stock_movements"
ON public.stock_movements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manager_can_manage_stock_movements"
ON public.stock_movements
FOR ALL
TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 7. Triggers
-- Auto-update timestamps
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profiles
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Sample Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    cashier_uuid UUID := gen_random_uuid();
    beverages_cat_id UUID := gen_random_uuid();
    bakery_cat_id UUID := gen_random_uuid();
    snacks_cat_id UUID := gen_random_uuid();
    coffee_product_id UUID := gen_random_uuid();
    tea_product_id UUID := gen_random_uuid();
    chocolate_product_id UUID := gen_random_uuid();
    croissant_product_id UUID := gen_random_uuid();
    muffin_product_id UUID := gen_random_uuid();
    customer1_id UUID := gen_random_uuid();
    customer2_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@modernpos.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (cashier_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'cashier@modernpos.com', crypt('cashier123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Jane Cashier", "role": "cashier"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create product categories
    INSERT INTO public.product_categories (id, name, description, color, icon) VALUES
        (beverages_cat_id, 'Beverages', 'Hot and cold drinks', '#3b82f6', 'Coffee'),
        (bakery_cat_id, 'Bakery', 'Fresh baked goods', '#f59e0b', 'Cookie'),
        (snacks_cat_id, 'Snacks', 'Light snacks and treats', '#10b981', 'Apple');

    -- Create products
    INSERT INTO public.products (id, name, description, barcode, sku, category_id, price, cost, stock_quantity, min_stock_level, image_url, created_by) VALUES
        (coffee_product_id, 'Premium Coffee Beans', 'High-quality arabica coffee beans', '1234567890123', 'COF-001', beverages_cat_id, 18.99, 12.50, 45, 20, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', admin_uuid),
        (tea_product_id, 'Organic Green Tea', 'Premium loose leaf green tea', '1234567890124', 'TEA-001', beverages_cat_id, 12.50, 8.00, 32, 15, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?w=400', admin_uuid),
        (chocolate_product_id, 'Artisan Chocolate Bar', 'Handcrafted dark chocolate', '1234567890125', 'CHO-001', snacks_cat_id, 8.99, 5.50, 28, 10, 'https://images.pixabay.com/photo/2016/12/10/21/26/food-1897455_960_720.jpg', admin_uuid),
        (croissant_product_id, 'Fresh Croissants', 'Buttery, flaky croissants', '1234567890126', 'CRO-001', bakery_cat_id, 3.50, 1.80, 24, 12, 'https://images.unsplash.com/photo-1555507036-ab794f4ade2a?w=400', admin_uuid),
        (muffin_product_id, 'Specialty Muffins', 'Assorted gourmet muffins', '1234567890127', 'MUF-001', bakery_cat_id, 4.25, 2.10, 18, 10, 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?w=400', admin_uuid);

    -- Create customers
    INSERT INTO public.customers (id, name, email, phone, loyalty_points, total_spent) VALUES
        (customer1_id, 'Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0123', 120, 245.75),
        (customer2_id, 'Michael Chen', 'michael.chen@email.com', '+1-555-0124', 85, 189.50);

    -- Create sample transactions
    INSERT INTO public.sales_transactions (transaction_number, receipt_number, cashier_id, customer_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, status) VALUES
        ('TXN-20250128-001', 'R-2025-001', cashier_uuid, customer1_id, 89.99, 7.65, 0.00, 97.64, 'card', 'completed'),
        ('TXN-20250128-002', 'R-2025-002', cashier_uuid, null, 24.50, 2.08, 0.00, 26.58, 'cash', 'completed'),
        ('TXN-20250128-003', 'R-2025-003', admin_uuid, customer2_id, 156.75, 13.32, 15.68, 154.39, 'digital_wallet', 'completed');

    -- Create sample sale items (using transaction IDs from above)
    INSERT INTO public.sale_items (transaction_id, product_id, product_name, product_price, quantity, line_total)
    SELECT 
        st.id, 
        coffee_product_id, 
        'Premium Coffee Beans', 
        18.99, 
        2, 
        37.98
    FROM public.sales_transactions st WHERE st.transaction_number = 'TXN-20250128-001'
    UNION ALL
    SELECT 
        st.id, 
        chocolate_product_id, 
        'Artisan Chocolate Bar', 
        8.99, 
        3, 
        26.97
    FROM public.sales_transactions st WHERE st.transaction_number = 'TXN-20250128-001'
    UNION ALL
    SELECT 
        st.id, 
        croissant_product_id, 
        'Fresh Croissants', 
        3.50, 
        1, 
        3.50
    FROM public.sales_transactions st WHERE st.transaction_number = 'TXN-20250128-002';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;