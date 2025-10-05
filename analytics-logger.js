// analytics-logger.js - Firebase Analytics for Taisen
class AnalyticsLogger {
    constructor() {
        this.initialized = false;
        this.db = null;
        this.userId = null;
        this.hasAccount = false;
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = Date.now();
        
        console.log('🚀 Taisen Analytics starting...');
        this.init();
    }

    async init() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.log('⏳ Waiting for Firebase...');
                setTimeout(() => this.init(), 500);
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

            // Initialize separate analytics app
            const analyticsApp = firebase.initializeApp(analyticsConfig, "TaisenAnalytics");
            this.db = firebase.firestore(analyticsApp);
            
            this.initialized = true;
            console.log('✅ Taisen Analytics initialized!');
            
            // Log page view
            await this.logPageView();
            
        } catch (error) {
            console.error('❌ Analytics error:', error);
        }
    }

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
        if (/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
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

    getOS() {
        const ua = navigator.userAgent;
        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac")) return "MacOS";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
        return "unknown";
    }

    async logPageView() {
        try {
            const ipAddress = await this.getClientIP();
            const browserInfo = this.getBrowserInfo();
            const deviceType = this.getDeviceType();
            const os = this.getOS();

            const analyticsData = {
                userId: this.userId,
                hasAccount: this.hasAccount,
                sessionId: this.sessionId,
                ipAddress: ipAddress,
                deviceType: deviceType,
                browser: browserInfo,
                os: os,
                url: window.location.href,
                referrer: document.referrer || 'direct',
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                pageTitle: document.title,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                userAgent: navigator.userAgent
            };

            if (this.initialized && this.db) {
                await this.db.collection('page_views').add(analyticsData);
                console.log('📊 Page view logged to Firestore!');
                
                // Also log session
                await this.logSession(analyticsData);
            }

            console.log('📊 Analytics Data:', {
                ip: ipAddress,
                device: deviceType,
                browser: browserInfo.name,
                os: os
            });
            
        } catch (error) {
            console.error('❌ Page view error:', error);
        }
    }

    async logSession(pageData) {
        const sessionData = {
            sessionId: this.sessionId,
            userId: this.userId,
            hasAccount: this.hasAccount,
            startTime: firebase.firestore.Timestamp.fromDate(new Date()),
            ipAddress: pageData.ipAddress,
            deviceType: pageData.deviceType,
            browser: pageData.browser,
            os: pageData.os,
            initialUrl: pageData.url
        };

        try {
            if (this.initialized && this.db) {
                await this.db.collection('sessions').doc(this.sessionId).set(sessionData, { merge: true });
                console.log('🔗 Session logged:', this.sessionId);
            }
        } catch (error) {
            console.error('❌ Session log error:', error);
        }
    }

    async logEvent(eventName, eventData = {}) {
        try {
            const event = {
                eventName: eventName,
                userId: this.userId,
                hasAccount: this.hasAccount,
                sessionId: this.sessionId,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                url: window.location.href,
                ...eventData
            };

            if (this.initialized && this.db) {
                await this.db.collection('events').add(event);
                console.log('📈 Event logged:', eventName);
            }
            
        } catch (error) {
            console.error('❌ Event log error:', error);
        }
    }

    // Search logging method
    async logSearch(query, resultsCount = null, searchType = 'web') {
        await this.logEvent('search', {
            query: query,
            resultsCount: resultsCount,
            searchType: searchType
        });
    }

    // Auth logging method
    async logAuth(authType, success = true, errorMessage = null) {
        await this.logEvent('auth', {
            authType: authType,
            success: success,
            errorMessage: errorMessage
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Starting Taisen Analytics...');
    window.taisenAnalytics = new AnalyticsLogger();
    
    // Global methods for other scripts
    window.logTaisenSearch = (query, resultsCount, searchType) => {
        if (window.taisenAnalytics) {
            window.taisenAnalytics.logSearch(query, resultsCount, searchType);
        } else {
            console.log('📊 Search (analytics not ready):', query);
        }
    };
    
    window.logTaisenAuth = (authType, success, errorMessage) => {
        if (window.taisenAnalytics) {
            window.taisenAnalytics.logAuth(authType, success, errorMessage);
        } else {
            console.log('📊 Auth (analytics not ready):', authType, success);
        }
    };
    
    console.log('🔍 Taisen Analytics global methods ready!');
});

// Track page unload
window.addEventListener('beforeunload', () => {
    if (window.taisenAnalytics) {
        const sessionDuration = Date.now() - window.taisenAnalytics.pageLoadTime;
        window.taisenAnalytics.logEvent('page_unload', { duration: sessionDuration });
    }
});