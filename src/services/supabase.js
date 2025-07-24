
// Placeholder for Supabase service
// Will be activated when environment variables are set

class SupabaseService {
    constructor() {
        this.initialized = false;
    }

    async testConnection() {
        console.log('Supabase service - placeholder mode');
        return true;
    }
}

module.exports = new SupabaseService();
