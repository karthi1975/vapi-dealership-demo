const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
    constructor() {
        this.client = null;
        this.initialized = false;
        
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('✅ Supabase client initialized');
        } else {
            console.log('⚠️ Supabase credentials not found, running in placeholder mode');
        }
    }

    // Database Schema Tables
    async createTables() {
        if (!this.initialized) return false;

        try {
            // 1. Customers Table
            await this.client.rpc('create_customers_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS customers (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        phone_number VARCHAR(20) UNIQUE NOT NULL,
                        name VARCHAR(100),
                        email VARCHAR(255),
                        address TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 2. Calls Table
            await this.client.rpc('create_calls_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS calls (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        customer_id UUID REFERENCES customers(id),
                        phone_number VARCHAR(20) NOT NULL,
                        call_duration INTEGER,
                        start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        end_time TIMESTAMP WITH TIME ZONE,
                        status VARCHAR(20) DEFAULT 'active',
                        outcome VARCHAR(50),
                        summary TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 3. Call Transfers Table
            await this.client.rpc('create_call_transfers_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS call_transfers (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        from_agent VARCHAR(50) NOT NULL,
                        to_agent VARCHAR(50) NOT NULL,
                        reason VARCHAR(100),
                        transfer_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        conversation_context JSONB,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 4. Customer Intents Table
            await this.client.rpc('create_customer_intents_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS customer_intents (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        intent_type VARCHAR(50) NOT NULL,
                        confidence DECIMAL(3,2),
                        details JSONB,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 5. Vehicle Interests Table
            await this.client.rpc('create_vehicle_interests_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS vehicle_interests (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        make VARCHAR(50),
                        model VARCHAR(50),
                        year INTEGER,
                        price_range_min DECIMAL(10,2),
                        price_range_max DECIMAL(10,2),
                        condition VARCHAR(20),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 6. Test Drive Bookings Table
            await this.client.rpc('create_test_drive_bookings_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS test_drive_bookings (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        customer_id UUID REFERENCES customers(id),
                        vehicle_make VARCHAR(50),
                        vehicle_model VARCHAR(50),
                        vehicle_year INTEGER,
                        preferred_date DATE,
                        preferred_time TIME,
                        status VARCHAR(20) DEFAULT 'pending',
                        notes TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 7. Financing Applications Table
            await this.client.rpc('create_financing_applications_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS financing_applications (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        customer_id UUID REFERENCES customers(id),
                        vehicle_price DECIMAL(10,2),
                        down_payment DECIMAL(10,2),
                        loan_amount DECIMAL(10,2),
                        credit_score INTEGER,
                        employment_status VARCHAR(50),
                        monthly_income DECIMAL(10,2),
                        status VARCHAR(20) DEFAULT 'pending',
                        approval_decision VARCHAR(20),
                        notes TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 8. Trade-in Evaluations Table
            await this.client.rpc('create_trade_in_evaluations_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS trade_in_evaluations (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        customer_id UUID REFERENCES customers(id),
                        vehicle_make VARCHAR(50),
                        vehicle_model VARCHAR(50),
                        vehicle_year INTEGER,
                        mileage INTEGER,
                        condition VARCHAR(20),
                        estimated_value DECIMAL(10,2),
                        status VARCHAR(20) DEFAULT 'pending',
                        notes TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 9. Agent Performance Table
            await this.client.rpc('create_agent_performance_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS agent_performance (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        agent_name VARCHAR(50) NOT NULL,
                        date DATE NOT NULL,
                        calls_handled INTEGER DEFAULT 0,
                        transfers_out INTEGER DEFAULT 0,
                        transfers_in INTEGER DEFAULT 0,
                        avg_call_duration INTEGER,
                        customer_satisfaction DECIMAL(3,2),
                        resolution_rate DECIMAL(3,2),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `
            });

            // 10. Conversation Logs Table
            await this.client.rpc('create_conversation_logs_table', {
                sql: `
                    CREATE TABLE IF NOT EXISTS conversation_logs (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        call_id UUID REFERENCES calls(id),
                        agent_name VARCHAR(50),
                        message_type VARCHAR(20),
                        content TEXT,
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        metadata JSONB
                    );
                `
            });

            console.log('✅ All database tables created successfully');
            return true;

        } catch (error) {
            console.error('❌ Error creating tables:', error);
            return false;
        }
    }

    // Customer Management
    async createCustomer(customerData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('customers')
                .insert([customerData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating customer:', error);
            return null;
        }
    }

    async getCustomerByPhone(phoneNumber) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('customers')
                .select('*')
                .eq('phone_number', phoneNumber)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting customer:', error);
            return null;
        }
    }

    // Call Management
    async createCall(callData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('calls')
                .insert([callData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating call:', error);
            return null;
        }
    }

    async updateCall(callId, updateData) {
        if (!this.initialized) return false;

        try {
            const { error } = await this.client
                .from('calls')
                .update(updateData)
                .eq('id', callId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating call:', error);
            return false;
        }
    }

    // Transfer Management
    async logTransfer(transferData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('call_transfers')
                .insert([transferData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error logging transfer:', error);
            return null;
        }
    }

    // Intent Management
    async logIntent(intentData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('customer_intents')
                .insert([intentData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error logging intent:', error);
            return null;
        }
    }

    // Vehicle Interest Management
    async logVehicleInterest(interestData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('vehicle_interests')
                .insert([interestData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error logging vehicle interest:', error);
            return null;
        }
    }

    // Test Drive Management
    async createTestDriveBooking(bookingData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('test_drive_bookings')
                .insert([bookingData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating test drive booking:', error);
            return null;
        }
    }

    // Financing Management
    async createFinancingApplication(applicationData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('financing_applications')
                .insert([applicationData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating financing application:', error);
            return null;
        }
    }

    // Trade-in Management
    async createTradeInEvaluation(evaluationData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('trade_in_evaluations')
                .insert([evaluationData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating trade-in evaluation:', error);
            return null;
        }
    }

    // Performance Tracking
    async updateAgentPerformance(performanceData) {
        if (!this.initialized) return false;

        try {
            const { error } = await this.client
                .from('agent_performance')
                .upsert([performanceData], { 
                    onConflict: 'agent_name,date' 
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating agent performance:', error);
            return false;
        }
    }

    // Conversation Logging
    async logConversation(logData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('conversation_logs')
                .insert([logData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error logging conversation:', error);
            return null;
        }
    }

    // Analytics and Reporting
    async getCallAnalytics(dateRange) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('calls')
                .select(`
                    *,
                    customer:customers(*),
                    transfers:call_transfers(*),
                    intents:customer_intents(*)
                `)
                .gte('created_at', dateRange.start)
                .lte('created_at', dateRange.end);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting call analytics:', error);
            return null;
        }
    }

    async getAgentPerformance(agentName, dateRange) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('agent_performance')
                .select('*')
                .eq('agent_name', agentName)
                .gte('date', dateRange.start)
                .lte('date', dateRange.end);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting agent performance:', error);
            return null;
        }
    }

    // Test Connection
    async testConnection() {
        if (!this.initialized) {
            console.log('Supabase service - placeholder mode');
            return true;
        }

        try {
            const { data, error } = await this.client
                .from('customers')
                .select('count')
                .limit(1);

            if (error) throw error;
            console.log('✅ Supabase connection successful');
            return true;
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return false;
        }
    }
}

module.exports = new SupabaseService();
