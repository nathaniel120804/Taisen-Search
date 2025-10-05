// analytics-logger.js - Firebase Analytics for Taisen
// Separate project: taisen-analytics-e2f7f

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
        
        this.init();
    }

    // Initialize analytics Firebase app (separate from main app)
    async init() {
        try {
            // Wait for Firebase to be available from your main app
            if (typeof firebase === 'undefined') {
                console.log('Firebase not loaded yet, waiting...');
                setTimeout(() => this.init(), 500);
                return;
            }

            // Your analytics project configuration
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
            this.auth = firebase.auth(analyticsApp);
            this.db = firebase.firestore(analyticsApp);
            
            // Get reference to main app auth (your existing Taisen auth)
            this.mainAppAuth = firebase.app().auth();
            
            this.initialized = true;
            this.setupAuthListener();
            await this.logPageView();
            
            console.log('✅ Taisen Analytics initialized successfully');
            
        } catch (error) {
            console.error('❌ Analytics initialization error:', error);
            // Fallback: log to console even if Firebase fails
            this.logToConsole();
        }
    }

    // Generate unique session ID
    generateSessionId() {
        return 'taisen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Set up auth state listener to track user account status
    setupAuthListener() {
        if (!this.mainAppAuth) {
            console.log('Waiting for main auth...');
            setTimeout(() => this.setupAuthListener(), 500);
            return;
        }
        
        this.mainAppAuth.onAuthStateChanged((user) => {
            if (user) {
                this.userId = user.uid;
                this.hasAccount = !user.isAnonymous;
                console.log(`🔐 User detected: ${this.userId.substring(0, 8)}..., Has account: ${this.hasAccount}`);
                
                // Log auth event
                this.logEvent('user_auth_state', {
                    action: 'signed_in',
                    isAnonymous: user.isAnonymous,
                    hasAccount: this.hasAccount,
                    provider: user.providerData[0]?.providerId || 'anonymous'
                });
            } else {
                this.userId = null;
                this.hasAccount = false;
                console.log('🔐 No user signed in');
                this.logEvent('user_auth_state', { action: 'signed_out' });
            }
        });
    }

    // Get client IP address using ipify API
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json', {
                method: 'GET',
                timeout: 5000
            });
            
            if (!response.ok) throw new Error('IP API response not ok');
            
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('⚠️ Primary IP fetch failed, trying fallback...');
            try {
                const response = await fetch('https://api64.ipify.org?format=json');
                const data = await response.json();
                return data.ip + ' (IPv6)';
            } catch (fallbackError) {
                console.error('❌ Fallback IP fetch failed:', fallbackError);
                return 'unknown';
            }
        }
    }

    // Detect device type
    getDeviceType() {
        const ua = navigator.userAgent;
        const width = window.innerWidth;
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "mobile";
        }
        if (width <= 768) return "mobile";
        if (width <= 1024) return "tablet";
        return "desktop";
    }

    // Detect browser
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "unknown";
        let version = "unknown";
        
        if (ua.includes("Firefox")) {
            browser = "firefox";
            version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || "unknown";
        } else if (ua.includes("SamsungBrowser")) {
            browser = "samsung";
            version = ua.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || "unknown";
        } else if (ua.includes("Opera") || ua.includes("OPR/")) {
            browser = "opera";
            version = ua.match(/(Opera|OPR)\/([0-9.]+)/)?.[2] || "unknown";
        } else if (ua.includes("Trident") || ua.includes("MSIE")) {
            browser = "ie";
            version = ua.match(/(MSIE |rv:)([0-9.]+)/)?.[2] || "unknown";
        } else if (ua.includes("Edge")) {
            browser = "edge";
            version = ua.match(/Edge\/([0-9.]+)/)?.[1] || "unknown";
        } else if (ua.includes("Chrome")) {
            browser = "chrome";
            version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || "unknown";
        } else if (ua.includes("Safari")) {
            browser = "safari";
            version = ua.match(/Version\/([0-9.]+)/)?.[1] || "unknown";
        }
        
        return { name: browser, version: version, full: ua };
    }

    // Get screen resolution
    getScreenResolution() {
        return {
            width: screen.width,
            height: screen.height,
            availableWidth: screen.availWidth,
            availableHeight: screen.availHeight,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        };
    }

    // Get operating system
    getOS() {
        const ua = navigator.userAgent;
        if (ua.includes("Windows NT 10")) return "Windows 10/11";
        if (ua.includes("Windows NT 6.3")) return "Windows 8.1";
        if (ua.includes("Windows NT 6.2")) return "Windows 8";
        if (ua.includes("Windows NT 6.1")) return "Windows 7";
        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac")) return "MacOS";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
        return "unknown";
    }

    // Get connection information
    getConnectionInfo() {
        const connection = navigator.connection;
        if (!connection) return { supported: false };
        
        return {
            supported: true,
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }

    // Log page view with all analytics data
    async logPageView() {
        try {
            const ipAddress = await this.getClientIP();
            const browserInfo = this.getBrowserInfo();
            const deviceType = this.getDeviceType();
            const screenRes = this.getScreenResolution();
            const os = this.getOS();
            const connectionInfo = this.getConnectionInfo();

            const timestamp = new Date();
            const userAgent = navigator.userAgent;
            const language = navigator.language;
            const url = window.location.href;
            const referrer = document.referrer || 'direct';
            const pageLoadDuration = Date.now() - this.pageLoadTime;

            const analyticsData = {
                // User identification
                userId: this.userId,
                hasAccount: this.hasAccount,
                sessionId: this.sessionId,
                
                // Technical data
                ipAddress: ipAddress,
                deviceType: deviceType,
                browser: browserInfo,
                os: os,
                screenResolution: screenRes,
                userAgent: userAgent,
                language: language,
                connection: connectionInfo,
                
                // Page data
                url: url,
                referrer: referrer,
                timestamp: firebase.firestore.Timestamp.fromDate(timestamp),
                pageLoadDuration: pageLoadDuration,
                
                // Additional context
                pageTitle: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                cookiesEnabled: navigator.cookieEnabled,
                javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
                
                // Platform info
                platform: navigator.platform,
                vendor: navigator.vendor,
                appVersion: navigator.appVersion
            };

            // Save to Firestore
            if (this.initialized) {
                await this.db.collection('page_views').add(analyticsData);
                console.log('📊 Page view logged to Firestore');
            }
            
            // Console log for debugging
            console.log('📊 Taisen Analytics:', {
                ip: ipAddress,
                device: deviceType,
                browser: browserInfo.name,
                hasAccount: this.hasAccount,
                userId: this.userId ? this.userId.substring(0, 8) + '...' : 'anonymous',
                session: this.sessionId.substring(0, 10) + '...'
            });
            
            // Log session start
            await this.logSessionStart(analyticsData);
            
        } catch (error) {
            console.error('❌ Error logging page view:', error);
        }
    }

    // Log session start
    async logSessionStart(pageData) {
        const sessionData = {
            sessionId: this.sessionId,
            userId: this.userId,
            hasAccount: this.hasAccount,
            startTime: firebase.firestore.Timestamp.fromDate(new Date()),
            ipAddress: pageData.ipAddress,
            deviceType: pageData.deviceType,
            browser: pageData.browser,
            os: pageData.os,
            userAgent: pageData.userAgent,
            initialUrl: pageData.url,
            referrer: pageData.referrer,
            screenResolution: pageData.screenResolution,
            language: pageData.language
        };

        try {
            if (this.initialized) {
                await this.db.collection('sessions').doc(this.sessionId).set(sessionData, { merge: true });
                console.log('🔗 Session logged:', this.sessionId);
            }
        } catch (error) {
            console.error('❌ Error logging session:', error);
        }
    }

    // Log custom events
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

            if (this.initialized) {
                await this.db.collection('events').add(event);
            }
            
            console.log('📈 Event logged:', eventName, eventData);
            
        } catch (error) {
            console.error('❌ Error logging event:', error);
        }
    }

    // Log search queries
    async logSearch(query, resultsCount = null, searchType = 'web') {
        await this.logEvent('search_executed', {
            query: query,
            resultsCount: resultsCount,
            searchType: searchType
        });
    }

    // Log authentication events
    async logAuthEvent(authType, success = true, errorMessage = null) {
        await this.logEvent('authentication_attempt', {
            authType: authType,
            success: success,
            errorMessage: errorMessage
        });
    }

    // Log button clicks and interactions
    async logInteraction(elementId, action = 'click', metadata = {}) {
        await this.logEvent('user_interaction', {
            elementId: elementId,
            action: action,
            ...metadata
        });
    }

    // Log error events
    async logError(errorMessage, errorStack = null, component = null) {
        await this.logEvent('error_occurred', {
            errorMessage: errorMessage,
            errorStack: errorStack,
            component: component
        });
    }

    // Fallback: log to console if Firebase fails
    logToConsole(message) {
        console.log('📊 Taisen Analytics (console):', message);
    }

    // Get analytics summary
    getSummary() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            hasAccount: this.hasAccount,
            initialized: this.initialized,
            project: 'taisen-analytics-e2f7f'
        };
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Taisen Analytics...');
    
    // Wait for your main Firebase to load
    setTimeout(() => {
        window.taisenAnalytics = new AnalyticsLogger();
        
        // Expose global methods for other scripts to use
        window.logTaisenSearch = (query, resultsCount, searchType) => {
            window.taisenAnalytics?.logSearch(query, resultsCount, searchType);
        };
        
        window.logTaisenAuth = (authType, success, errorMessage) => {
            window.taisenAnalytics?.logAuthEvent(authType, success, errorMessage);
        };
        
        window.logTaisenInteraction = (elementId, action, metadata) => {
            window.taisenAnalytics?.logInteraction(elementId, action, metadata);
        };
        
        console.log('🔍 Taisen Analytics ready! Use:');
        console.log('   - window.logTaisenSearch("query")');
        console.log('   - window.logTaisenAuth("google", true)');
        console.log('   - window.logTaisenInteraction("button-id")');
    }, 2000);
});

// Track page unload for session duration
window.addEventListener('beforeunload', () => {
    if (window.taisenAnalytics) {
        const sessionDuration = Date.now() - window.taisenAnalytics.pageLoadTime;
        window.taisenAnalytics.logEvent('session_ended', {
            duration: sessionDuration,
            page: window.location.href
        });
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsLogger;
}