const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

class EnhancedSupabaseService {
    constructor() {
        this.client = null;
        this.initialized = false;
        
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('✅ Enhanced Supabase client initialized');
        } else {
            console.log('⚠️ Supabase credentials not found, running in placeholder mode');
        }
    }

    // Enhanced customer creation with full vehicle preferences
    async createEnhancedCustomer(customerData) {
        if (!this.initialized) return null;

        try {
            const enhancedData = {
                phone_number: customerData.phoneNumber,
                name: customerData.name,
                email: customerData.email,
                budget: customerData.budget,
                preferred_make: customerData.preferredMake,
                preferred_model: customerData.preferredModel,
                preferred_year: customerData.preferredYear,
                min_mileage: customerData.minMileage,
                max_mileage: customerData.maxMileage,
                price_range_min: customerData.priceRangeMin,
                price_range_max: customerData.priceRangeMax,
                vehicle_type: customerData.vehicleType,
                purchase_timeline: customerData.timeline
            };

            const { data, error } = await this.client
                .from('customers')
                .insert([enhancedData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating enhanced customer:', error);
            return null;
        }
    }

    // Search inventory with enhanced filters
    async searchInventory(criteria) {
        if (!this.initialized) return [];

        try {
            let query = this.client
                .from('inventory')
                .select('*')
                .eq('is_available', true);

            if (criteria.year) query = query.eq('year', criteria.year);
            if (criteria.make) query = query.ilike('make', `%${criteria.make}%`);
            if (criteria.model) query = query.ilike('model', `%${criteria.model}%`);
            if (criteria.stockNumber) query = query.eq('stock_number', criteria.stockNumber);
            
            if (criteria.minMileage) query = query.gte('mileage', criteria.minMileage);
            if (criteria.maxMileage) query = query.lte('mileage', criteria.maxMileage);
            
            if (criteria.priceMin) query = query.gte('price', criteria.priceMin);
            if (criteria.priceMax) query = query.lte('price', criteria.priceMax);

            const { data, error } = await query.order('price', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error searching inventory:', error);
            return [];
        }
    }

    // Create shareable link for inventory
    async createShareableLink(callId, customerId, inventoryIds) {
        if (!this.initialized) return null;

        try {
            const shortCode = crypto.randomBytes(5).toString('hex');
            const baseUrl = process.env.BASE_URL || 'https://vapi-dealership-demo-production.up.railway.app';
            const fullUrl = `${baseUrl}/inventory/${shortCode}`;

            const { data, error } = await this.client
                .from('shared_links')
                .insert([{
                    call_id: callId,
                    customer_id: customerId,
                    inventory_ids: inventoryIds,
                    short_code: shortCode,
                    full_url: fullUrl,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating shareable link:', error);
            return null;
        }
    }

    // Store call transcript with analysis
    async storeCallTranscript(transcriptData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('call_transcripts')
                .insert([{
                    call_id: transcriptData.callId,
                    customer_id: transcriptData.customerId,
                    transcript: transcriptData.transcript,
                    summary: transcriptData.summary,
                    intent_analysis: transcriptData.intentAnalysis,
                    lead_score: transcriptData.leadScore,
                    action_items: transcriptData.actionItems,
                    duration_seconds: transcriptData.duration
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error storing transcript:', error);
            return null;
        }
    }

    // Schedule communication (email/SMS)
    async scheduleCommunication(commData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('communication_logs')
                .insert([{
                    call_id: commData.callId,
                    customer_id: commData.customerId,
                    type: commData.type,
                    subject: commData.subject,
                    content: commData.content,
                    status: 'pending',
                    scheduled_at: commData.scheduledAt,
                    metadata: commData.metadata
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error scheduling communication:', error);
            return null;
        }
    }

    // Assign salesperson to customer
    async assignSalesperson(assignmentData) {
        if (!this.initialized) return null;

        try {
            const { data, error } = await this.client
                .from('sales_assignments')
                .insert([{
                    call_id: assignmentData.callId,
                    customer_id: assignmentData.customerId,
                    salesperson_name: assignmentData.salespersonName,
                    salesperson_email: assignmentData.salespersonEmail,
                    salesperson_phone: assignmentData.salespersonPhone
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error assigning salesperson:', error);
            return null;
        }
    }

    // Get education campaigns
    async getEducationCampaigns(type) {
        if (!this.initialized) return [];

        try {
            let query = this.client
                .from('education_campaigns')
                .select('*')
                .eq('is_active', true);

            if (type) query = query.eq('type', type);

            const { data, error } = await query.order('sequence_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getting education campaigns:', error);
            return [];
        }
    }

    // Log vehicle interest with matched inventory
    async logEnhancedVehicleInterest(interestData) {
        if (!this.initialized) return null;

        try {
            // Search for matching inventory
            const matches = await this.searchInventory({
                year: interestData.year,
                make: interestData.make,
                model: interestData.model,
                minMileage: interestData.minMileage,
                maxMileage: interestData.maxMileage,
                priceMin: interestData.priceRangeMin,
                priceMax: interestData.priceRangeMax
            });

            const matchedIds = matches.map(v => v.id);

            const { data, error } = await this.client
                .from('vehicle_interests')
                .insert([{
                    call_id: interestData.callId,
                    customer_id: interestData.customerId,
                    year: interestData.year,
                    make: interestData.make,
                    model: interestData.model,
                    min_mileage: interestData.minMileage,
                    max_mileage: interestData.maxMileage,
                    price_range_min: interestData.priceRangeMin,
                    price_range_max: interestData.priceRangeMax,
                    stock_number: interestData.stockNumber,
                    matched_inventory_ids: matchedIds
                }])
                .select()
                .single();

            if (error) throw error;
            
            return {
                interest: data,
                matchedVehicles: matches
            };
        } catch (error) {
            console.error('❌ Error logging vehicle interest:', error);
            return null;
        }
    }

    // Get pending communications
    async getPendingCommunications() {
        if (!this.initialized) return [];

        try {
            const { data, error } = await this.client
                .from('communication_logs')
                .select('*')
                .eq('status', 'pending')
                .lte('scheduled_at', new Date().toISOString())
                .order('scheduled_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getting pending communications:', error);
            return [];
        }
    }

    // Update communication status
    async updateCommunicationStatus(id, status, sentAt = null) {
        if (!this.initialized) return null;

        try {
            const updateData = { status };
            if (sentAt) updateData.sent_at = sentAt;

            const { data, error } = await this.client
                .from('communication_logs')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updating communication status:', error);
            return null;
        }
    }

    // Track link clicks
    async trackLinkClick(shortCode) {
        if (!this.initialized) return null;

        try {
            // First get the current click count
            const { data: link, error: getError } = await this.client
                .from('shared_links')
                .select('clicks')
                .eq('short_code', shortCode)
                .single();

            if (getError) throw getError;

            // Update with incremented count
            const { data, error } = await this.client
                .from('shared_links')
                .update({ clicks: (link.clicks || 0) + 1 })
                .eq('short_code', shortCode)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error tracking link click:', error);
            return null;
        }
    }
}

module.exports = new EnhancedSupabaseService();