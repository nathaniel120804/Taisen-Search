/**
 * WannaCry-Style Remote Kill Switch Failsafe - IMPROVED VERSION
 * Makes taisen.pages.dev completely unusable when taisenfailsafe.pages.dev goes live
 * FIXED: Cache issues, multiple verification, recovery options
 */

class WannaCryKillSwitch {
    constructor(options = {}) {
        this.options = {
            killSwitchUrl: 'https://taisenfailsafe.pages.dev',
            checkInterval: 30000, // Check every 30 seconds
            timeout: 5000, // 5 second timeout
            enableLogging: true,
            shutdownMessage: 'REMOTE KILL SWITCH ACTIVATED - SYSTEM COMPROMISED',
            enableAudio: true,
            enableTerminal: true,
            requiredConfirmations: 2, // Require multiple successful checks
            enableCacheBusting: true,
            ...options
        };
        
        this.isActive = true;
        this.failsafeTriggered = false;
        this.audioContext = null;
        this.confirmationCount = 0;
        this.lastCheckTime = 0;
        
        this.init();
    }

    init() {
        if (!this.isActive) return;

        console.log('💀 WannaCry Kill Switch Activated');
        console.log(`📡 Monitoring: ${this.options.killSwitchUrl}`);
        console.log('⚠️  Site will become unusable when kill switch activates');
        console.log('🛡️  Requires multiple confirmations to prevent false triggers');
        
        // Initial check after short delay
        setTimeout(() => this.checkKillSwitch(), 2000);
        
        // Periodic checks
        this.intervalId = setInterval(() => {
            this.checkKillSwitch();
        }, this.options.checkInterval);

        // Check when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.failsafeTriggered) {
                setTimeout(() => this.checkKillSwitch(), 1000);
            }
        });

        // Initialize audio context
        if (this.options.enableAudio) {
            this.initAudio();
        }
    }

    async checkKillSwitch() {
        if (!this.isActive || this.failsafeTriggered) return;

        // Rate limiting
        const now = Date.now();
        if (now - this.lastCheckTime < 5000) return;
        this.lastCheckTime = now;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

            // Aggressive cache busting
            const cacheBuster = this.options.enableCacheBusting ? 
                `?killswitch=${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : '';

            const response = await fetch(this.options.killSwitchUrl + cacheBuster, {
                method: 'GET',
                mode: 'no-cors',
                signal: controller.signal,
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            clearTimeout(timeoutId);

            // Site is accessible - increment confirmation
            this.confirmationCount++;
            
            if (this.options.enableLogging) {
                console.log(`✅ Kill switch check passed (${this.confirmationCount}/${this.options.requiredConfirmations})`);
            }

            // Only trigger after required confirmations
            if (this.confirmationCount >= this.options.requiredConfirmations) {
                this.triggerApocalypse('Kill switch site confirmed live after multiple checks');
            }

        } catch (error) {
            // Site is not accessible - reset confirmation counter
            this.confirmationCount = 0;
            
            if (this.options.enableLogging && error.name !== 'AbortError') {
                console.log('❌ Kill switch check failed - site appears down');
            }
            
            // If we were previously triggered but now the site is down, allow recovery
            if (this.failsafeTriggered) {
                console.log('🔄 Kill switch site is down - system may recover on refresh');
            }
        }
    }

    triggerApocalypse(reason) {
        if (this.failsafeTriggered) return;

        this.failsafeTriggered = true;
        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        console.error('💀💀💀 APOCALYPSE TRIGGERED 💀💀💀');
        console.error(`Reason: ${reason}`);
        console.error(`Time: ${new Date().toISOString()}`);
        
        // Store trigger state to persist across reloads
        try {
            sessionStorage.setItem('killSwitchTriggered', 'true');
            sessionStorage.setItem('killSwitchReason', reason);
            sessionStorage.setItem('killSwitchTime', Date.now().toString());
        } catch (e) {
            // Ignore storage errors
        }
        
        this.initiateSystemMeltdown(reason);
    }

    initiateSystemMeltdown(reason) {
        try {
            // Phase 1: Safe system lockdown
            this.safeLockdown();
            
            // Phase 2: Visual destruction
            this.createTerrorScreen(reason);
            
            // Phase 3: Audio terror (delayed to avoid blocking)
            if (this.options.enableAudio) {
                setTimeout(() => this.playTerrorSounds(), 1000);
            }
            
            // Phase 4: Terminal simulation (delayed)
            if (this.options.enableTerminal) {
                setTimeout(() => this.createFakeHackTerminal(), 2000);
            }
            
            // Phase 5: Permanent blocking (delayed)
            setTimeout(() => this.blockAllEscapeAttempts(), 3000);

        } catch (error) {
            console.error('Meltdown error:', error);
            // Emergency fallback
            this.emergencyShutdown();
        }
    }

    safeLockdown() {
        // Stop page loading
        try {
            window.stop();
        } catch (e) {}
        
        // Clear our own interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Block new timers by overriding (safer than clearing all)
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function() {
            console.warn('🚫 Timers disabled during system meltdown');
            return 0;
        };
        
        window.setInterval = function() {
            console.warn('🚫 Intervals disabled during system meltdown');
            return 0;
        };
    }

    createTerrorScreen(reason) {
        // Quick and safe DOM clearance
        document.body.innerHTML = '';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        const terrorHTML = `
            <div id="wannacry-hell" style="
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: #000000;
                color: #ff0000;
                font-family: 'Courier New', monospace;
                overflow: hidden;
                cursor: none;
                z-index: 99999;
                margin: 0;
                padding: 0;
            ">
                <!-- Red emergency overlay -->
                <div id="red-pulse" style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: radial-gradient(circle, rgba(255,0,0,0.3) 0%, rgba(0,0,0,1) 70%);
                    animation: redPulse 3s infinite;
                "></div>

                <!-- Main terror container -->
                <div style="
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.95);
                    border: 4px solid #ff0000;
                    padding: 30px;
                    max-width: 800px;
                    width: 90vw;
                    box-shadow: 0 0 50px rgba(255,0,0,0.7);
                    text-align: center;
                ">
                    <!-- Skull ASCII -->
                    <pre style="color: #ff0000; font-size: 8px; margin: 0 0 20px 0; line-height: 1.1; text-align: center; white-space: pre;">
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⢀⣴⠾⠛⠉⠉⠉⠉⠉⠛⠷⣦⣀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⢀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣦⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⣰⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣆⠀⠀⠀
    ⠀⠀⠀⣰⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣆⠀⠀
    ⠀⠀⢠⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀
    ⠀⠀⣾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⠀
    ⠀⢀⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀
    ⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇
    ⠀⠘⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠃
    ⠀⠀⠹⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠏⠀
    ⠀⠀⠀⠹⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣰⠏⠀⠀
    ⠀⠀⠀⠀⠈⠻⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⠟⠁⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠉⠛⠶⣤⣀⣀⣀⣀⣀⣠⣤⠶⠛⠉⠀⠀⠀⠀⠀⠀
                    </pre>

                    <h1 style="font-size: 2.2em; margin: 15px 0; color: #ff0000; text-shadow: 0 0 15px #ff0000; font-weight: bold;">
                        💀 CRITICAL SYSTEM FAILURE 💀
                    </h1>

                    <!-- Emergency alert box -->
                    <div style="
                        background: rgba(255,0,0,0.15);
                        border: 2px solid #ff0000;
                        padding: 15px;
                        margin: 15px 0;
                        text-align: left;
                        font-size: 0.95em;
                        border-radius: 5px;
                    ">
                        <div style="color: #ffff00; margin-bottom: 8px; font-weight: bold;">⚠️ REMOTE KILL SWITCH ACTIVATED</div>
                        <div style="margin: 5px 0;"><strong>REASON:</strong> ${this.escapeHtml(reason)}</div>
                        <div style="margin: 5px 0;"><strong>TIME:</strong> <span id="doomsday-clock">${new Date().toLocaleString()}</span></div>
                        <div style="margin: 5px 0;"><strong>TARGET:</strong> taisen.pages.dev</div>
                        <div style="margin: 5px 0;"><strong>TRIGGER:</strong> taisenfailsafe.pages.dev</div>
                    </div>

                    <!-- Scrolling doom message -->
                    <div style="
                        background: #000000;
                        border: 1px solid #ff0000;
                        padding: 8px;
                        margin: 15px 0;
                        overflow: hidden;
                        border-radius: 3px;
                    ">
                        <marquee behavior="scroll" direction="left" style="color: #ffff00; font-size: 0.9em;">
                            🚨 CRITICAL FAILURE 🚨 REMOTE KILL SWITCH ACTIVATED 🚨 SYSTEM OFFLINE 🚨
                        </marquee>
                    </div>

                    <!-- Recovery instructions -->
                    <div style="
                        background: rgba(255,255,255,0.05);
                        border: 1px solid #666;
                        padding: 12px;
                        margin: 15px 0;
                        border-radius: 3px;
                        font-size: 0.85em;
                    ">
                        <div style="color: #ccc; margin-bottom: 5px;">To recover:</div>
                        <div style="color: #999;">1. Close this tab</div>
                        <div style="color: #999;">2. Clear browser cache (Ctrl+Shift+Delete)</div>
                        <div style="color: #999;">3. Visit taisen.pages.dev again</div>
                    </div>

                    <!-- Blinking final warning -->
                    <div style="
                        background: #ff0000;
                        padding: 10px;
                        margin: 15px 0;
                        animation: blinkWarning 1.5s infinite;
                        border-radius: 3px;
                    ">
                        <div style="color: #000000; font-weight: bold; font-size: 0.9em;">
                            ⚠️ SECURITY PROTOCOLS ACTIVE - SYSTEM OFFLINE ⚠️
                        </div>
                    </div>
                </div>
            </div>

            <style>
                @keyframes redPulse {
                    0% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.1; }
                }

                @keyframes blinkWarning {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                @keyframes floatError {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(180deg);
                        opacity: 0;
                    }
                }

                body, html {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: #000000 !important;
                    cursor: none !important;
                    height: 100% !important;
                    width: 100% !important;
                }

                * {
                    box-sizing: border-box !important;
                }
            </style>
        `;

        document.body.innerHTML = terrorHTML;
        
        // Start effects
        this.startErrorRain();
        this.updateDoomsdayClock();
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    startErrorRain() {
        const errors = [
            'MEMORY_VIOLATION', 'SYSTEM_CORRUPT', 'ACCESS_DENIED',
            'KERNEL_PANIC', 'STACK_OVERFLOW', 'HEAP_CORRUPTION'
        ];

        this.errorInterval = setInterval(() => {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = errors[Math.floor(Math.random() * errors.length)];
            errorDiv.style.cssText = `
                position: fixed;
                color: #ff0000;
                font-family: 'Courier New', monospace;
                font-size: ${10 + Math.random() * 8}px;
                left: ${Math.random() * 100}%;
                top: -20px;
                opacity: ${0.3 + Math.random() * 0.5};
                pointer-events: none;
                z-index: 99998;
                text-shadow: 0 0 3px #ff0000;
                animation: floatError ${4 + Math.random() * 6}s linear forwards;
            `;
            
            const container = document.getElementById('wannacry-hell');
            if (container) {
                container.appendChild(errorDiv);
                
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 10000);
            }
        }, 500);
    }

    updateDoomsdayClock() {
        this.clockInterval = setInterval(() => {
            const clock = document.getElementById('doomsday-clock');
            if (clock) {
                clock.textContent = new Date().toLocaleString();
            }
        }, 1000);
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            if (this.options.enableLogging) {
                console.log('🔇 Audio not supported');
            }
        }
    }

    playTerrorSounds() {
        if (!this.audioContext) return;

        // Initial emergency beep
        this.playBeep(180, 120, 0.2);
        
        // Periodic scary sounds
        this.soundInterval = setInterval(() => {
            this.playBeep(80 + Math.random() * 100, 60 + Math.random() * 150, 0.1);
        }, 5000);
    }

    playBeep(freq1, freq2, duration) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(freq1, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(freq2, this.audioContext.currentTime + duration);
            
            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Ignore audio errors
        }
    }

    createFakeHackTerminal() {
        const terminal = document.createElement('div');
        terminal.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px; right: 20px;
                width: 450px; height: 200px;
                background: #001100;
                border: 2px solid #00ff00;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                padding: 8px;
                overflow: hidden;
                z-index: 99999;
                box-shadow: 0 0 15px #00ff00;
                border-radius: 3px;
            ">
                <div style="color: #ffff00; border-bottom: 1px solid #00ff00; margin-bottom: 8px; padding-bottom: 4px; font-weight: bold;">
                    SYSTEM RECOVERY TERMINAL [FAILED]
                </div>
                <div id="hack-output" style="height: 160px; overflow-y: auto; line-height: 1.2;">
                    <div>> INITIATING SYSTEM SCAN...</div>
                    <div>> ERROR: CRITICAL SYSTEM FAILURE</div>
                    <div>> REMOTE KILL SWITCH DETECTED</div>
                    <div>> ATTEMPTING RECOVERY...</div>
                    <div>> FAILED: SYSTEM INTEGRITY LOST</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(terminal);
        
        // Add scrolling hack messages
        const messages = [
            "> MEMORY CORRUPTION DETECTED",
            "> SECURITY PROTOCOLS BREACHED", 
            "> FILE SYSTEM ENCRYPTED",
            "> NETWORK ACCESS TERMINATED",
            "> RECOVERY IMPOSSIBLE",
            "> INITIATING SHUTDOWN SEQUENCE"
        ];
        
        this.terminalInterval = setInterval(() => {
            const output = document.getElementById('hack-output');
            if (output) {
                const newLine = document.createElement('div');
                newLine.textContent = messages[Math.floor(Math.random() * messages.length)];
                newLine.style.color = Math.random() > 0.7 ? '#ff0000' : '#00ff00';
                output.appendChild(newLine);
                output.scrollTop = output.scrollHeight;
                
                // Keep only last 12 lines
                while (output.children.length > 12) {
                    output.removeChild(output.firstChild);
                }
            }
        }, 2500);
    }

    blockAllEscapeAttempts() {
        // Block navigation with custom message
        window.onbeforeunload = (e) => {
            e.preventDefault();
            e.returnValue = 'SYSTEM CRITICAL: Do not leave this page!';
            return e.returnValue;
        };
        
        // Block back button
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', (e) => {
            history.pushState(null, null, window.location.href);
        });

        // Block all user interactions
        const blockEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };

        const events = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend', 
                       'keydown', 'keyup', 'keypress', 'contextmenu', 'wheel', 'scroll'];
        
        events.forEach(event => {
            document.addEventListener(event, blockEvent, { 
                capture: true, 
                passive: false 
            });
        });

        // Disable text selection and dragging
        document.onselectstart = () => false;
        document.ondragstart = () => false;
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.MozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
    }

    emergencyShutdown() {
        // Absolute minimum shutdown
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: #000000;
                color: #ff0000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: monospace;
                font-size: 24px;
                z-index: 99999;
                margin: 0;
                padding: 0;
            ">
                💀 SYSTEM DESTROYED 💀
            </div>
        `;
    }

    // Clean shutdown and recovery
    destroy() {
        this.isActive = false;
        this.failsafeTriggered = false;
        this.confirmationCount = 0;
        
        // Clear all intervals
        const intervals = [this.intervalId, this.errorInterval, this.clockInterval, 
                          this.soundInterval, this.terminalInterval];
        
        intervals.forEach(id => {
            if (id) clearInterval(id);
        });
        
        // Clear session storage
        try {
            sessionStorage.removeItem('killSwitchTriggered');
            sessionStorage.removeItem('killSwitchReason');
            sessionStorage.removeItem('killSwitchTime');
        } catch (e) {}
        
        console.warn('💀 Kill Switch Disabled - System can now recover');
    }

    // Manual activation for testing
    manualActivate(reason = 'Manual doomsday activation') {
        this.triggerApocalypse(reason);
    }
}

// Check for previous trigger state
const wasTriggered = sessionStorage.getItem('killSwitchTriggered') === 'true';

// Auto-deploy on taisen.pages.dev (unless already triggered)
if (window.location.hostname === 'taisen.pages.dev' && !wasTriggered) {
    window.doomSwitch = new WannaCryKillSwitch({
        killSwitchUrl: 'https://taisenfailsafe.pages.dev',
        checkInterval: 30000, // 30 seconds
        requiredConfirmations: 2, // Require 2 successful checks
        enableCacheBusting: true, // Prevent false triggers from caching
        enableAudio: true,
        enableTerminal: true,
        enableLogging: true
    });

    // Global access for testing
    window.activateDoomsday = (reason) => window.doomSwitch?.manualActivate(reason);
    window.disableDoomsday = () => window.doomSwitch?.destroy();
}

// If previously triggered, show shutdown screen immediately
if (wasTriggered) {
    const reason = sessionStorage.getItem('killSwitchReason') || 'Previous activation detected';
    document.addEventListener('DOMContentLoaded', () => {
        const killSwitch = new WannaCryKillSwitch();
        killSwitch.initiateSystemMeltdown(reason);
    });
}

console.log('💀 WannaCry Kill Switch Loaded - IMPROVED VERSION');
console.log('🛡️  Features: Cache busting, Multiple confirmations, Recovery options');
console.log('⚠️  taisen.pages.dev will self-destruct when taisenfailsafe.pages.dev is confirmed live');