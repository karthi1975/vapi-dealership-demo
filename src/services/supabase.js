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

    // Test connection
    async testConnection() {
        if (!this.initialized) {
            console.log('❌ Supabase not initialized');
            return false;
        }

        try {
            const { data, error } = await this.client
                .from('customers')
                .select('count')
                .limit(1);
            
            if (error) {
                console.log('❌ Supabase connection test failed:', error.message);
                return false;
            }
            
            console.log('✅ Supabase connection test successful');
            return true;
        } catch (error) {
            console.log('❌ Supabase connection error:', error.message);
            return false;
        }
    }

    // Create customer
    async createCustomer(customerData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping customer creation');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('customers')
                .insert([customerData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating customer:', error);
                return null;
            }

            console.log('✅ Customer created:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error creating customer:', error);
            return null;
        }
    }

    // Update customer with vehicle preferences
    async updateCustomerPreferences(customerId, preferences) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping customer update');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('customers')
                .update({
                    preferred_make: preferences.make,
                    preferred_model: preferences.model,
                    budget: preferences.budget,
                    vehicle_type: preferences.vehicleType,
                    purchase_timeline: preferences.timeline,
                    updated_at: new Date().toISOString()
                })
                .eq('id', customerId)
                .select()
                .single();

            if (error) {
                console.error('❌ Error updating customer preferences:', error);
                return null;
            }

            console.log('✅ Customer preferences updated:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error updating customer preferences:', error);
            return null;
        }
    }

    // Get customer by phone
    async getCustomerByPhone(phoneNumber) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping customer lookup');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('customers')
                .select('*')
                .eq('phone_number', phoneNumber)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error getting customer:', error);
                return null;
            }

            return data || null;
        } catch (error) {
            console.error('❌ Error getting customer:', error);
            return null;
        }
    }

    // Create call record
    async createCall(callData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping call creation');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('calls')
                .insert([callData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating call:', error);
                return null;
            }

            console.log('✅ Call created:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error creating call:', error);
            return null;
        }
    }

    // Update call record
    async updateCall(callId, updateData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping call update');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('calls')
                .update(updateData)
                .eq('id', callId)
                .select()
                .single();

            if (error) {
                console.error('❌ Error updating call:', error);
                return null;
            }

            console.log('✅ Call updated:', callId);
            return data;
        } catch (error) {
            console.error('❌ Error updating call:', error);
            return null;
        }
    }

    // Log transfer
    async logTransfer(transferData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping transfer log');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('call_transfers')
                .insert([transferData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error logging transfer:', error);
                return null;
            }

            console.log('✅ Transfer logged:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error logging transfer:', error);
            return null;
        }
    }

    // Log intent
    async logIntent(intentData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping intent log');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('customer_intents')
                .insert([intentData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error logging intent:', error);
                return null;
            }

            console.log('✅ Intent logged:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error logging intent:', error);
            return null;
        }
    }

    // Log vehicle interest
    async logVehicleInterest(interestData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping vehicle interest log');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('vehicle_interests')
                .insert([interestData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error logging vehicle interest:', error);
                return null;
            }

            console.log('✅ Vehicle interest logged:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error logging vehicle interest:', error);
            return null;
        }
    }

    // Create test drive booking
    async createTestDriveBooking(bookingData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping test drive booking');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('test_drive_bookings')
                .insert([bookingData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating test drive booking:', error);
                return null;
            }

            console.log('✅ Test drive booking created:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error creating test drive booking:', error);
            return null;
        }
    }

    // Create financing application
    async createFinancingApplication(applicationData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping financing application');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('financing_applications')
                .insert([applicationData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating financing application:', error);
                return null;
            }

            console.log('✅ Financing application created:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Error creating financing application:', error);
            return null;
        }
    }

    // Get call analytics
    async getCallAnalytics(dateRange) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, returning empty analytics');
            return {
                totalCalls: 0,
                averageDuration: 0,
                outcomes: {},
                transfers: 0
            };
        }

        try {
            const { data: calls, error } = await this.client
                .from('calls')
                .select('*')
                .gte('start_time', dateRange.start)
                .lte('start_time', dateRange.end);

            if (error) {
                console.error('❌ Error getting call analytics:', error);
                return {
                    totalCalls: 0,
                    averageDuration: 0,
                    outcomes: {},
                    transfers: 0
                };
            }

            const totalCalls = calls.length;
            const averageDuration = calls.reduce((sum, call) => sum + (call.call_duration || 0), 0) / totalCalls;
            const outcomes = calls.reduce((acc, call) => {
                acc[call.outcome] = (acc[call.outcome] || 0) + 1;
                return acc;
            }, {});

            return {
                totalCalls,
                averageDuration: Math.round(averageDuration),
                outcomes,
                transfers: 0 // TODO: Add transfer count
            };
        } catch (error) {
            console.error('❌ Error getting call analytics:', error);
            return {
                totalCalls: 0,
                averageDuration: 0,
                outcomes: {},
                transfers: 0
            };
        }
    }

    // Store call context for agent transfers
    async storeCallContext(contextData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping context storage');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('call_contexts')
                .upsert([{
                    call_id: contextData.call_id,
                    context: contextData.context,
                    target_agent: contextData.target_agent,
                    created_at: contextData.timestamp
                }], {
                    onConflict: 'call_id'
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error storing call context:', error);
                return null;
            }

            console.log('✅ Call context stored:', data.call_id);
            return data;
        } catch (error) {
            console.error('❌ Error storing call context:', error);
            return null;
        }
    }

    // Get call context for transferred calls
    async getCallContext(callId) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping context retrieval');
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('call_contexts')
                .select('*')
                .eq('call_id', callId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error getting call context:', error);
                return null;
            }

            return data?.context || null;
        } catch (error) {
            console.error('❌ Error getting call context:', error);
            return null;
        }
    }

    // Get agent performance
    async getAgentPerformance(agentName, dateRange) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, returning empty performance data');
            return {
                agentName,
                totalCalls: 0,
                averageDuration: 0,
                transfers: 0,
                outcomes: {}
            };
        }

        try {
            const { data: transfers, error } = await this.client
                .from('call_transfers')
                .select('*')
                .eq('to_agent', agentName)
                .gte('transfer_time', dateRange.start)
                .lte('transfer_time', dateRange.end);

            if (error) {
                console.error('❌ Error getting agent performance:', error);
                return {
                    agentName,
                    totalCalls: 0,
                    averageDuration: 0,
                    transfers: 0,
                    outcomes: {}
                };
            }

            return {
                agentName,
                totalCalls: transfers.length,
                averageDuration: 0, // TODO: Calculate from call data
                transfers: transfers.length,
                outcomes: {}
            };
        } catch (error) {
            console.error('❌ Error getting agent performance:', error);
            return {
                agentName,
                totalCalls: 0,
                averageDuration: 0,
                transfers: 0,
                outcomes: {}
            };
        }
    }
}

module.exports = new SupabaseService();