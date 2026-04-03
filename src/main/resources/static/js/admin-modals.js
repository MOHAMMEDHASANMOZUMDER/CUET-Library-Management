// Admin Modal Utilities - Conflict-Safe Version
// This file provides modal utilities while avoiding conflicts with existing code

console.log('Admin modals utilities loaded');

// Simple utility functions that don't conflict with existing implementations
window.adminModalUtils = {
    initialized: true,
    version: '1.0'
};

// Only add this if needed by other admin pages that don't have their own modal functions
// Currently admin-fines.html has its own modal implementation, so this is mainly for future use