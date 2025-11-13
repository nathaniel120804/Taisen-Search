/**
 * Remote Kill Switch Failsafe for taisen.pages.dev
 * Shuts down when taisenfailsafe.pages.dev is deployed
 */

class RemoteKillSwitch {
    constructor(options = {}) {
        this.options = {
            killSwitchUrl: 'https://taisenfailsafe.pages.dev',
            checkInterval: 30000, // Check every 30 seconds
            timeout: 5000, // 5 second timeout
            enableLogging: true,
            shutdownMessage: 'Remote kill switch activated',
            ...options
        };
        
        this.isActive = true;
        this.failsafeTriggered = false;
        
        this.init();
    }

    init() {
        if (!this.isActive) return;

        console.log('🔒 Remote Kill Switch activated');
        console.log(`🛑 Monitoring: ${this.options.killSwitchUrl}`);
        
        // Initial check
        this.checkKillSwitch();
        
        // Periodic checks
        this.intervalId = setInterval(() => {
            this.checkKillSwitch();
        }, this.options.checkInterval);

        // Also check on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkKillSwitch();
            }
        });
    }

    async checkKillSwitch() {
        if (!this.isActive || this.failsafeTriggered) return;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

            const response = await fetch(this.options.killSwitchUrl, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal,
                cache: 'no-cache'
            });

            clearTimeout(timeoutId);

            // If we get here, the site is live and accessible
            this.triggerShutdown('taisenfailsafe.pages.dev is now live');

        } catch (error) {
            // Site is not live or not accessible - continue normally
            if (this.options.enableLogging) {
                console.log('✅ Kill switch check: Site not live', error.message);
            }
        }
    }

    triggerShutdown(reason = 'Remote kill switch activated') {
        if (this.failsafeTriggered) return;

        this.failsafeTriggered = true;
        this.isActive = false;
        clearInterval(this.intervalId);

        console.error(`🛑 REMOTE KILL SWITCH ACTIVATED: ${reason}`);
        
        this.emergencyShutdown(reason);
    }

    emergencyShutdown(reason) {
        try {
            // Stop all intervals and timeouts
            this.stopAllTimers();

            // Clear page content
            document.body.innerHTML = '';

            // Create shutdown screen
            this.createShutdownScreen(reason);

            // Prevent further execution
            window.stop();

            // Disable interactions
            window.addEventListener = function() {};
            document.addEventListener = function() {};

        } catch (error) {
            console.error('Error during emergency shutdown:', error);
        }
    }

    stopAllTimers() {
        let highestId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    }

    createShutdownScreen(reason) {
        const shutdownHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                z-index: 99999;
                padding: 20px;
            ">
                <div style="background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; max-width: 600px;">
                    <h1 style="font-size: 2.5em; margin-bottom: 20px;">🚨 REMOTE SHUTDOWN ACTIVATED</h1>
                    <p style="font-size: 1.2em; margin-bottom: 30px;">
                        This site has been remotely shut down by the kill switch.
                    </p>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong>Reason:</strong> ${reason}
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <strong>Trigger:</strong> taisenfailsafe.pages.dev is now live
                    </div>
                    <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
                        This is a remote kill switch demonstration.
                    </p>
                </div>
            </div>
        `;

        document.body.innerHTML = shutdownHTML;
    }

    // Manual disable for testing
    disable() {
        this.isActive = false;
        clearInterval(this.intervalId);
        console.warn('⚠️ Remote Kill Switch disabled');
    }
}

// Enhanced version with multiple detection methods
class AdvancedRemoteKillSwitch extends RemoteKillSwitch {
    constructor(options = {}) {
        super({
            statusEndpoint: '/kill-switch-status.json',
            ...options
        });

        this.detectionMethods = [
            this.checkViaHEAD.bind(this),
            this.checkViaStatusEndpoint.bind(this),
            this.checkViaScriptTag.bind(this)
        ];
    }

    async checkKillSwitch() {
        if (!this.isActive || this.failsafeTriggered) return;

        // Try multiple detection methods
        for (const method of this.detectionMethods) {
            try {
                const result = await method();
                if (result) {
                    this.triggerShutdown('Remote kill switch activated via multiple detection');
                    return;
                }
            } catch (error) {
                // Continue to next method
            }
        }
    }

    async checkViaHEAD() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        await fetch(this.options.killSwitchUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
            cache: 'no-store'
        });

        clearTimeout(timeoutId);
        return true;
    }

    async checkViaStatusEndpoint() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        const response = await fetch(`${this.options.killSwitchUrl}${this.options.statusEndpoint}`, {
            signal: controller.signal,
            cache: 'no-store'
        });

        clearTimeout(timeoutId);
        
        const status = await response.json();
        return status.shutdown === true;
    }

    checkViaScriptTag() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = `${this.options.killSwitchUrl}/kill-switch.js?callback=window.killSwitchCallback`;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            
            window.killSwitchCallback = (status) => {
                resolve(status.shutdown === true);
            };

            document.head.appendChild(script);
            
            setTimeout(() => {
                document.head.removeChild(script);
                resolve(false);
            }, this.options.timeout);
        });
    }
}

// Auto-initialize on taisen.pages.dev
if (window.location.hostname === 'taisen.pages.dev') {
    window.remoteKillSwitch = new AdvancedRemoteKillSwitch({
        killSwitchUrl: 'https://taisenfailsafe.pages.dev',
        checkInterval: 15000, // Check every 15 seconds
        enableLogging: true,
        shutdownMessage: 'taisenfailsafe.pages.dev has been deployed - Emergency shutdown'
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RemoteKillSwitch, AdvancedRemoteKillSwitch };
}