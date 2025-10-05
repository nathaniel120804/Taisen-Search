// analytics-logger.js - Instant Firebase Analytics
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
        // Use the global signal from your main script
        if (!window.firebaseReady) {
            console.log('⏳ Waiting for Firebase ready signal...');
            setTimeout(() => this.init(), 500);
            return;
        }

        try {
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
            this.setupAuthDetection();
            await this.logPageView();
            
            console.log('✅ Taisen Analytics initialized instantly!');
            
        } catch (error) {
            console.error('❌ Analytics error:', error);
        }
    }

    generateSessionId() {
        return 'taisen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupAuthDetection() {
        // Try to detect auth state from main app
        const checkAuth = () => {
            try {
                const mainAuth = firebase.app().auth();
                if (mainAuth) {
                    mainAuth.onAuthStateChanged((user) => {
                        this.userId = user?.uid || null;
                        this.hasAccount = user ? !user.isAnonymous : false;
                        console.log(`🔐 Auth detected: ${this.userId ? 'User' : 'Anonymous'}`);
                    });
                } else {
                    setTimeout(checkAuth, 1000);
                }
            } catch (error) {
                // Main auth not accessible, continue without user tracking
                console.log('🔐 Main auth not accessible, continuing anonymously');
            }
        };
        checkAuth();
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
                language: navigator.language
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
                os: os,
                hasAccount: this.hasAccount
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
}

// Initialize immediately
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Starting Taisen Analytics...');
    window.taisenAnalytics = new AnalyticsLogger();
    
    // Global methods for other scripts
    window.logTaisenSearch = (query, resultsCount, searchType) => {
        window.taisenAnalytics?.logEvent('search', { query, resultsCount, searchType });
    };
    
    window.logTaisenAuth = (authType, success, errorMessage) => {
        window.taisenAnalytics?.logEvent('auth', { authType, success, errorMessage });
    };
    
    console.log('🔍 Taisen Analytics ready! Use window.logTaisenSearch()');
});

// Track page unload
window.addEventListener('beforeunload', () => {
    if (window.taisenAnalytics) {
        const sessionDuration = Date.now() - window.taisenAnalytics.pageLoadTime;
        window.taisenAnalytics.logEvent('page_unload', { duration: sessionDuration });
    }
});