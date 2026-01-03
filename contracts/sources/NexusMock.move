/// NexusMock Module - Endless Nexus AI Service Simulator
/// 
/// This module simulates an AI service on the Endless blockchain.
/// Users can "pay" for an AI agent service using EDS (Endless native token)
/// and the module emits an on-chain event for tracking.

module nexus_addr::nexus_mock {
    use std::signer;
    use std::string::String;
    use endless_framework::event;
    use endless_framework::timestamp;
    use endless_framework::endless_coin;

    // ============================================
    // CONSTANTS
    // ============================================
    
    /// Default price for AI service in EDS base units (u128)
    /// 100 units = 0.000001 EDS (symbolic price for testnet)
    const DEFAULT_SERVICE_PRICE: u128 = 100;

    // ============================================
    // ERRORS
    // ============================================
    
    /// Error: NexusEvents resource already exists
    const E_ALREADY_INITIALIZED: u64 = 1;
    /// Error: Insufficient funds to pay for AI service
    const E_INSUFFICIENT_FUNDS: u64 = 3;
    /// Error: Empty prompt provided
    const E_EMPTY_PROMPT: u64 = 4;
    /// Error: Empty model_id provided
    const E_EMPTY_MODEL_ID: u64 = 5;

    // ============================================
    // STRUCTS & RESOURCES
    // ============================================

    #[event]
    /// Event emitted when an AI service is requested.
    struct AIRequestEvent has drop, store {
        requester: address,
        prompt: String,
        model_id: String,
        amount_paid: u128,
        timestamp: u64,
    }

    /// Resource that stores platform state and treasury config.
    struct NexusEvents has key {
        total_requests: u64,
        total_revenue: u128,
        treasury: address,
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    /// Initialize the NexusMock module.
    /// Called automatically when the module is published.
    fun init_module(account: &signer) {
        let account_addr = signer::address_of(account);
        
        assert!(!exists<NexusEvents>(account_addr), E_ALREADY_INITIALIZED);
        
        move_to(account, NexusEvents {
            total_requests: 0,
            total_revenue: 0,
            treasury: account_addr,
        });
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    /// Request an AI service by paying in EDS and submitting a prompt.
    public entry fun request_ai_service(
        account: &signer,
        model_id: String,
        prompt: String
    ) acquires NexusEvents {
        let requester_addr = signer::address_of(account);
        
        // Input validation
        assert!(std::string::length(&prompt) > 0, E_EMPTY_PROMPT);
        assert!(std::string::length(&model_id) > 0, E_EMPTY_MODEL_ID);
        
        // Check balance using endless_coin
        assert!(endless_coin::balance(requester_addr) >= DEFAULT_SERVICE_PRICE, E_INSUFFICIENT_FUNDS);
        
        // Get treasury and execute transfer
        let events = borrow_global_mut<NexusEvents>(@nexus_addr);
        let treasury_addr = events.treasury;
        
        // Transfer EDS using endless_coin::transfer
        endless_coin::transfer(account, treasury_addr, DEFAULT_SERVICE_PRICE);
        
        // Update state
        events.total_requests = events.total_requests + 1;
        events.total_revenue = events.total_revenue + DEFAULT_SERVICE_PRICE;
        
        // Emit event using new event system
        event::emit(AIRequestEvent {
            requester: requester_addr,
            model_id,
            prompt,
            amount_paid: DEFAULT_SERVICE_PRICE,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Request an AI service with a custom payment amount.
    public entry fun request_ai_service_with_payment(
        account: &signer,
        model_id: String,
        prompt: String,
        payment_amount: u128
    ) acquires NexusEvents {
        let requester_addr = signer::address_of(account);
        
        // Input validation
        assert!(std::string::length(&prompt) > 0, E_EMPTY_PROMPT);
        assert!(std::string::length(&model_id) > 0, E_EMPTY_MODEL_ID);
        
        // Check balance
        assert!(endless_coin::balance(requester_addr) >= payment_amount, E_INSUFFICIENT_FUNDS);
        
        // Get treasury and execute transfer
        let events = borrow_global_mut<NexusEvents>(@nexus_addr);
        let treasury_addr = events.treasury;
        
        endless_coin::transfer(account, treasury_addr, payment_amount);
        
        // Update state
        events.total_requests = events.total_requests + 1;
        events.total_revenue = events.total_revenue + payment_amount;
        
        // Emit event
        event::emit(AIRequestEvent {
            requester: requester_addr,
            model_id,
            prompt,
            amount_paid: payment_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    #[view]
    public fun is_initialized(): bool {
        exists<NexusEvents>(@nexus_addr)
    }

    #[view]
    public fun get_service_price(): u128 {
        DEFAULT_SERVICE_PRICE
    }

    #[view]
    public fun get_treasury(): address acquires NexusEvents {
        let events = borrow_global<NexusEvents>(@nexus_addr);
        events.treasury
    }

    #[view]
    public fun get_total_requests(): u64 acquires NexusEvents {
        let events = borrow_global<NexusEvents>(@nexus_addr);
        events.total_requests
    }

    #[view]
    public fun get_total_revenue(): u128 acquires NexusEvents {
        let events = borrow_global<NexusEvents>(@nexus_addr);
        events.total_revenue
    }

    #[view]
    public fun get_platform_stats(): (u64, u128) acquires NexusEvents {
        let events = borrow_global<NexusEvents>(@nexus_addr);
        (events.total_requests, events.total_revenue)
    }

    #[view]
    public fun get_user_eds_balance(user: address): u128 {
        endless_coin::balance(user)
    }
}
