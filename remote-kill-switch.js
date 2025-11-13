/**
 * WannaCry-Style Remote Kill Switch Failsafe
 * Makes taisen.pages.dev completely unusable when taisenfailsafe.pages.dev goes live
 */

class WannaCryKillSwitch {
    constructor(options = {}) {
        this.options = {
            killSwitchUrl: 'https://taisenfailsafe.pages.dev',
            checkInterval: 10000, // Check every 10 seconds
            timeout: 3000, // 3 second timeout
            enableLogging: true,
            shutdownMessage: 'REMOTE KILL SWITCH ACTIVATED - SYSTEM COMPROMISED',
            enableAudio: true,
            enableTerminal: true,
            ...options
        };
        
        this.isActive = true;
        this.failsafeTriggered = false;
        this.audioContext = null;
        
        this.init();
    }

    init() {
        if (!this.isActive) return;

        console.log('💀 WannaCry Kill Switch Activated');
        console.log(`📡 Monitoring: ${this.options.killSwitchUrl}`);
        console.log('⚠️  Site will become unusable when kill switch activates');
        
        // Initial immediate check
        this.checkKillSwitch();
        
        // Periodic checks
        this.intervalId = setInterval(() => {
            this.checkKillSwitch();
        }, this.options.checkInterval);

        // Check when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.failsafeTriggered) {
                this.checkKillSwitch();
            }
        });

        // Initialize audio context
        if (this.options.enableAudio) {
            this.initAudio();
        }
    }

    async checkKillSwitch() {
        if (!this.isActive || this.failsafeTriggered) return;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

            // Try multiple detection methods
            const methods = [
                this.checkViaHEAD.bind(this),
                this.checkViaGET.bind(this),
                this.checkViaStatusFile.bind(this)
            ];

            for (const method of methods) {
                try {
                    const result = await method(controller);
                    if (result) {
                        clearTimeout(timeoutId);
                        this.triggerApocalypse('Kill switch site is now live');
                        return;
                    }
                } catch (error) {
                    // Continue to next method
                }
            }

            clearTimeout(timeoutId);

        } catch (error) {
            if (this.options.enableLogging) {
                console.log('✅ Kill switch inactive:', error.message);
            }
        }
    }

    async checkViaHEAD(controller) {
        const response = await fetch(this.options.killSwitchUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller?.signal,
            cache: 'no-cache'
        });
        return true;
    }

    async checkViaGET(controller) {
        const response = await fetch(this.options.killSwitchUrl, {
            method: 'GET',
            mode: 'no-cors',
            signal: controller?.signal,
            cache: 'no-cache'
        });
        return true;
    }

    async checkViaStatusFile(controller) {
        const response = await fetch(`${this.options.killSwitchUrl}/status.json`, {
            signal: controller?.signal,
            cache: 'no-cache'
        });
        const data = await response.json();
        return data.active === true;
    }

    triggerApocalypse(reason) {
        if (this.failsafeTriggered) return;

        this.failsafeTriggered = true;
        this.isActive = false;
        clearInterval(this.intervalId);

        console.error('💀💀💀 APOCALYPSE TRIGGERED 💀💀💀');
        console.error(`Reason: ${reason}`);
        
        this.initiateSystemMeltdown(reason);
    }

    initiateSystemMeltdown(reason) {
        try {
            // Phase 1: Immediate lockdown
            this.lockdownSystem();
            
            // Phase 2: Visual destruction
            this.createTerrorScreen(reason);
            
            // Phase 3: Audio terror
            if (this.options.enableAudio) {
                this.playTerrorSounds();
            }
            
            // Phase 4: Terminal simulation
            if (this.options.enableTerminal) {
                this.createFakeHackTerminal();
            }
            
            // Phase 5: Permanent blocking
            this.blockAllEscapeAttempts();

        } catch (error) {
            console.error('Meltdown error:', error);
            // Even if something fails, make sure site is dead
            document.body.innerHTML = '<div style="background:black;color:red;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:24px;">SYSTEM DESTROYED</div>';
        }
    }

    lockdownSystem() {
        // Kill all timers
        const maxId = window.setTimeout(() => {}, 0);
        for (let i = 0; i < maxId; i++) {
            window.clearTimeout(i);
            window.clearInterval(i);
        }

        // Freeze everything
        Object.freeze(window);
        Object.freeze(document);
        
        // Stop all network requests
        window.stop();
    }

    createTerrorScreen(reason) {
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
            ">
                <!-- Red emergency overlay -->
                <div id="red-pulse" style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: radial-gradient(circle, rgba(255,0,0,0.3) 0%, rgba(0,0,0,1) 70%);
                    animation: redPulse 2s infinite;
                "></div>

                <!-- Main terror container -->
                <div style="
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.95);
                    border: 4px solid #ff0000;
                    padding: 40px;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow: auto;
                    box-shadow: 0 0 100px rgba(255,0,0,0.8);
                    text-align: center;
                ">
                    <!-- Skull ASCII -->
                    <pre style="color: #ff0000; font-size: 10px; margin: 0 0 30px 0; line-height: 1; text-align: center;">
    ░██████╗██╗░░░██╗███████╗████████╗███████╗███╗░░██╗
    ██╔════╝╚██╗░██╔╝██╔════╝╚══██╔══╝██╔════╝████╗░██║
    ╚█████╗░░╚████╔╝░█████╗░░░░░██║░░░█████╗░░██╔██╗██║
    ░╚═══██╗░░╚██╔╝░░██╔══╝░░░░░██║░░░██╔══╝░░██║╚████║
    ██████╔╝░░░██║░░░███████╗░░░██║░░░███████╗██║░╚███║
    ╚═════╝░░░░╚═╝░░░╚══════╝░░░╚═╝░░░╚══════╝╚═╝░░╚══╝
                    </pre>

                    <h1 style="font-size: 2.5em; margin: 20px 0; color: #ff0000; text-shadow: 0 0 20px #ff0000;">
                        💀 SYSTEM DESTROYED 💀
                    </h1>

                    <!-- Emergency alert box -->
                    <div style="
                        background: rgba(255,0,0,0.2);
                        border: 2px solid #ff0000;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: left;
                        font-size: 1.1em;
                    ">
                        <div style="color: #ffff00; margin-bottom: 10px;">⚠️ CRITICAL SYSTEM FAILURE</div>
                        <div><strong>REASON:</strong> ${reason}</div>
                        <div><strong>TIME:</strong> <span id="doomsday-clock">${new Date().toLocaleString()}</span></div>
                        <div><strong>STATUS:</strong> PERMANENTLY TERMINATED</div>
                    </div>

                    <!-- Scrolling doom message -->
                    <div style="
                        background: #000000;
                        border: 1px solid #ff0000;
                        padding: 10px;
                        margin: 20px 0;
                        overflow: hidden;
                    ">
                        <marquee behavior="scroll" direction="left" style="color: #ffff00; font-size: 1.2em;">
                            🚨 CRITICAL FAILURE 🚨 REMOTE KILL SWITCH ACTIVATED 🚨 ALL ACCESS TERMINATED 🚨
                        </marquee>
                    </div>

                    <!-- Fake file corruption list -->
                    <div style="text-align: left; background: rgba(255,0,0,0.1); padding: 15px; margin: 20px 0;">
                        <div style="color: #ffff00; margin-bottom: 10px;">CORRUPTED SYSTEM FILES:</div>
                        <div style="font-size: 0.9em;">
                            <div>❌ kernel32.dll - CORRUPTED</div>
                            <div>❌ ntoskrnl.exe - DAMAGED</div>
                            <div>❌ winsock.dll - DESTROYED</div>
                            <div>❌ user32.dll - INFECTED</div>
                            <div>❌ hal.dll - TERMINATED</div>
                        </div>
                    </div>

                    <!-- Blinking final warning -->
                    <div style="
                        background: #ff0000;
                        padding: 15px;
                        margin: 20px 0;
                        animation: blinkWarning 1s infinite;
                    ">
                        <div style="color: #000000; font-weight: bold; font-size: 1.1em;">
                            ⚠️ DO NOT CLOSE - SECURITY PROTOCOLS ACTIVE ⚠️
                        </div>
                    </div>
                </div>

                <!-- Floating corruption errors -->
                <div id="floating-errors"></div>
            </div>

            <style>
                @keyframes redPulse {
                    0% { opacity: 0.1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 0.1; }
                }

                @keyframes blinkWarning {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                @keyframes glitch {
                    0% { transform: translate(0px, 0px); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0px, 0px); }
                }

                body, html {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background: #000000;
                    cursor: none !important;
                }

                #wannacry-hell {
                    animation: glitch 0.5s infinite;
                }
            </style>
        `;

        document.body.innerHTML = terrorHTML;
        this.startErrorRain();
        this.updateDoomsdayClock();
    }

    startErrorRain() {
        const errors = [
            'MEMORY_VIOLATION', 'STACK_CORRUPT', 'HEAP_OVERFLOW', 
            'NULL_POINTER', 'ACCESS_DENIED', 'KERNEL_PANIC',
            'DRIVER_FAILURE', 'IRQ_CONFLICT', 'DMA_ERROR',
            'PAGE_FAULT', 'SEGMENTATION_FAULT', 'BUFFER_OVERFLOW'
        ];

        setInterval(() => {
            const error = document.createElement('div');
            error.textContent = errors[Math.floor(Math.random() * errors.length)];
            error.style.cssText = `
                position: fixed;
                color: #ff0000;
                font-family: 'Courier New', monospace;
                font-size: ${10 + Math.random() * 10}px;
                left: ${Math.random() * 100}%;
                top: -20px;
                opacity: ${0.3 + Math.random() * 0.7};
                pointer-events: none;
                z-index: 99998;
                text-shadow: 0 0 5px #ff0000;
                animation: fallDown ${3 + Math.random() * 7}s linear forwards;
            `;
            
            document.getElementById('wannacry-hell').appendChild(error);
            
            setTimeout(() => {
                if (error.parentNode) error.parentNode.removeChild(error);
            }, 10000);
            
        }, 200);

        // Add falling animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fallDown {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    updateDoomsdayClock() {
        setInterval(() => {
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
            console.log('Audio not supported');
        }
    }

    playTerrorSounds() {
        if (!this.audioContext) return;

        // Emergency beep
        this.playBeep(200, 150, 0.1);
        
        // Periodic scary sounds
        setInterval(() => {
            this.playBeep(100 + Math.random() * 100, 100 + Math.random() * 200, 0.05);
        }, 3000);
    }

    playBeep(freq1, freq2, duration) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(freq1, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(freq2, this.audioContext.currentTime + duration * 0.5);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createFakeHackTerminal() {
        const terminal = document.createElement('div');
        terminal.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px; right: 20px;
                width: 500px; height: 250px;
                background: #001100;
                border: 2px solid #00ff00;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                padding: 10px;
                overflow: hidden;
                z-index: 99999;
                box-shadow: 0 0 20px #00ff00;
            ">
                <div style="color: #ffff00; border-bottom: 1px solid #00ff00; margin-bottom: 10px;">
                    SYSTEM RECOVERY TERMINAL [FAILED]
                </div>
                <div id="hack-output" style="height: 200px; overflow-y: auto; line-height: 1.2;">
                    <div>> INITIATING SYSTEM SCAN...</div>
                    <div>> ERROR: BOOT SECTOR CORRUPTED</div>
                    <div>> ATTEMPTING DATA RECOVERY...</div>
                    <div>> FAILED: HARD DRIVE DAMAGED</div>
                    <div>> SCANNING FOR MALWARE...</div>
                    <div>> DETECTED: CRYPTO-LOCKER VARIANT</div>
                    <div>> ISOLATING INFECTED FILES...</div>
                    <div>> CRITICAL: SYSTEM INTEGRITY LOST</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(terminal);
        
        // Add scrolling hack messages
        const messages = [
            "> MEMORY CORRUPTION DETECTED",
            "> NETWORK CONNECTION TERMINATED", 
            "> SECURITY PROTOCOLS OVERRIDDEN",
            "> FILE SYSTEM ENCRYPTED",
            "> RECOVERY IMPOSSIBLE",
            "> INITIATING SELF-DESTRUCT",
            "> ALL HOPE IS LOST",
            "> SYSTEM PERMANENTLY OFFLINE"
        ];
        
        setInterval(() => {
            const output = document.getElementById('hack-output');
            if (output) {
                const newLine = document.createElement('div');
                newLine.textContent = messages[Math.floor(Math.random() * messages.length)];
                newLine.style.color = Math.random() > 0.7 ? '#ff0000' : '#00ff00';
                output.appendChild(newLine);
                output.scrollTop = output.scrollHeight;
                
                // Keep only last 15 lines
                while (output.children.length > 15) {
                    output.removeChild(output.firstChild);
                }
            }
        }, 1500);
    }

    blockAllEscapeAttempts() {
        // Block navigation
        window.onbeforeunload = () => "SYSTEM CRITICAL: Do not leave!";
        history.pushState(null, null, location.href);
        window.onpopstate = () => history.pushState(null, null, location.href);

        // Block all user interactions
        const block = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };

        const events = ['click', 'dblclick', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress', 'contextmenu'];
        events.forEach(event => {
            document.addEventListener(event, block, true);
            window.addEventListener(event, block, true);
        });

        // Disable selection and dragging
        document.onselectstart = () => false;
        document.ondragstart = () => false;
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    }

    // Manual activation for testing
    manualActivate(reason = 'Manual doomsday activation') {
        this.triggerApocalypse(reason);
    }

    // Emergency disable (use carefully)
    emergencyDisable() {
        this.isActive = false;
        this.failsafeTriggered = false;
        clearInterval(this.intervalId);
        console.warn('💀 Kill Switch DISABLED - System vulnerable');
    }
}

// Auto-deploy on taisen.pages.dev
if (window.location.hostname === 'taisen.pages.dev') {
    window.doomSwitch = new WannaCryKillSwitch({
        killSwitchUrl: 'https://taisenfailsafe.pages.dev',
        checkInterval: 15000,
        enableAudio: true,
        enableTerminal: true,
        enableLogging: true
    });

    // Global access for testing
    window.activateDoomsday = (reason) => window.doomSwitch.manualActivate(reason);
}

console.log('💀 WannaCry Kill Switch Loaded');
console.log('⚠️  taisen.pages.dev will self-destruct when taisenfailsafe.pages.dev goes live');