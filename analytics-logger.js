// analytics-logger.js - Firebase Analytics for Taisen
// Improved version with event-driven initialization

class AnalyticsLogger {
    constructor() {
        this.initialized = false;
        this.auth = null;
        this.db = null;
        this.mainAppAuth = null;
        this.userId = null;
        this.hasAccount = false;
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = Date.now();
        
        console.log('🚀 Taisen Analytics created, waiting for Firebase...');
        
        // Listen for Firebase ready event
        document.addEventListener('firebaseReady', () => {
            console.log('🎯 Firebase ready event received, initializing analytics...');
            this.initializeFirebase();
        });
        
        // Fallback: try to initialize after a delay
        setTimeout(() => {
            if (!this.initialized && typeof firebase !== 'undefined') {
                console.log('⏰ Fallback initialization...');
                this.initializeFirebase();
            }
        }, 5000);
    }

    async initializeFirebase() {
        try {
            if (this.initialized) return;
            
            if (typeof firebase === 'undefined') {
                console.log('❌ Firebase still not available');
                return;
            }

            const analyticsConfig = {
                apiKey: "AIzaSyDKWcglmmQhiVwkmx9ACYvk7Jnhh2kGheM",
                authDomain: "taisen-analytics-e2f7f.firebaseapp.com",
                projectId: "taisen-analytics-e2f7f",
                storageBucket: "taisen-analytics-e2f7f.firebasestorage.app",
                messagingSenderId: "334559308937",
                appId: "1:334559308937:web:3930ff78b17f8569f8aa58"
            };

            const analyticsApp = firebase.initializeApp(analyticsConfig, "TaisenAnalytics");
            this.auth = firebase.auth(analyticsApp);
            this.db = firebase.firestore(analyticsApp);
            
            this.mainAppAuth = firebase.app().auth();
            
            this.initialized = true;
            this.setupAuthListener();
            await this.logPageView();
            
            console.log('✅ Taisen Analytics initialized successfully');
            
        } catch (error) {
            console.error('❌ Analytics initialization error:', error);
        }
    }

    // ... rest of your existing methods (getClientIP, getDeviceType, etc.) ...
    // Keep all the other methods the same as before

    generateSessionId() {
        return 'taisen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
        return "desktop";
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "unknown";
        if (ua.includes("Firefox")) browser = "firefox";
        else if (ua.includes("Chrome")) browser = "chrome";
        else if (ua.includes("Safari")) browser = "safari";
        else if (ua.includes("Edge")) browser = "edge";
        return { name: browser };
    }

    async logPageView() {
        try {
            const ipAddress = await this.getClientIP();
            const browserInfo = this.getBrowserInfo();
            const deviceType = this.getDeviceType();

            const analyticsData = {
                userId: this.userId,
                hasAccount: this.hasAccount,
                sessionId: this.sessionId,
                ipAddress: ipAddress,
                deviceType: deviceType,
                browser: browserInfo,
                url: window.location.href,
                timestamp: this.initialized ? firebase.firestore.Timestamp.fromDate(new Date()) : new Date(),
            };

            if (this.initialized && this.db) {
                await this.db.collection('page_views').add(analyticsData);
                console.log('📊 Page view logged to Firestore');
            }

            console.log('📊 Taisen Analytics - Page View:', {
                ip: ipAddress,
                device: deviceType,
                browser: browserInfo.name,
                hasAccount: this.hasAccount
            });
            
        } catch (error) {
            console.error('❌ Error logging page view:', error);
        }
    }

    async logEvent(eventName, eventData = {}) {
        try {
            const event = {
                eventName: eventName,
                userId: this.userId,
                hasAccount: this.hasAccount,
                sessionId: this.sessionId,
                timestamp: this.initialized ? firebase.firestore.Timestamp.fromDate(new Date()) : new Date(),
                url: window.location.href,
                ...eventData
            };

            if (this.initialized && this.db) {
                await this.db.collection('events').add(event);
            }
            
        } catch (error) {
            console.error('❌ Error logging event:', error);
        }
    }
}

// Initialize immediately but wait for Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Taisen Analytics loading...');
    window.taisenAnalytics = new AnalyticsLogger();
});

// Global methods
window.logTaisenSearch = (query, resultsCount, searchType) => {
    window.taisenAnalytics?.logEvent('search_executed', { query, resultsCount, searchType });
};

window.logTaisenAuth = (authType, success, errorMessage) => {
    window.taisenAnalytics?.logEvent('authentication_attempt', { authType, success, errorMessage });
};