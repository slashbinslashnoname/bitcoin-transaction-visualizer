    class BlockchainVis {
        constructor() {
            // Initialize audio context first
            this.audioContext = null;
            this.lastSoundTime = 0;
            this.minSoundInterval = 50; // Minimum ms between sounds
            this.initAudioContext();
            
            this.canvas = document.getElementById('blockchainCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.blocks = [];
            this.transactions = [];
            this.hoverInfo = null;
            this.particles = [];
            this.connectionStatus = 'connecting';
            this.scrollSpeed = 0.2; // Pixels per frame
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetMouseX = 0;
            this.targetMouseY = 0;
            
            // Set canvas size
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // Connect to WebSocket
            this.connectWebSocket();
            
            // Add mouse move listener for hover effects
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            
            // Add mouse move listener for parallax
            window.addEventListener('mousemove', (e) => {
                this.targetMouseX = (e.clientX - window.innerWidth / 2) * 0.1;
                this.targetMouseY = (e.clientY - window.innerHeight / 2) * 0.1;
            });
            
            // Start animation
            this.animate();
        }
    
        initAudioContext() {
            // Create audio context but keep it suspended until user interaction
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Add one-time click handler to resume audio context
                const resumeAudio = () => {
                    if (this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('touchstart', resumeAudio);
                };
                
                document.addEventListener('click', resumeAudio);
                document.addEventListener('touchstart', resumeAudio);
                
            } catch (e) {
                console.warn('Audio not supported:', e);
                this.audioContext = null;
            }
        }
    
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    
        connectWebSocket() {
            this.connectionStatus = 'connecting';
            this.ws = new WebSocket('wss://ws.blockchain.info/inv');
            
            this.ws.onopen = () => {
                console.log('Connected to Blockchain.info WebSocket');
                this.connectionStatus = 'connected';
                // Subscribe to new blocks and transactions
                this.ws.send(JSON.stringify({ "op": "unconfirmed_sub" }));
                this.ws.send(JSON.stringify({ "op": "blocks_sub" }));
            };
    
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.op === 'block') {
                    this.addBlock(data.x);
                } else if (data.op === 'utx') {
                    this.addTransaction(data.x);
                }
            };
    
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
    
            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.connectionStatus = 'disconnected';
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        }
    
        addBlock(blockData) {
            const block = {
                x: this.canvas.width / 2,
                y: this.canvas.height + 40, // Start lower to account for scroll
                targetX: Math.random() * this.canvas.width,
                targetY: this.canvas.height * 0.7, // Target higher to account for scroll
                size: 80,
                hash: blockData.hash,
                size: blockData.size,
                color: 'rgba(76, 175, 80, 0.6)',
                birth: Date.now(),
                rotation: Math.random() * Math.PI * 2,
                particles: this.createParticles(20)
            };
            this.blocks.push(block);
        }
    
        addTransaction(txData) {
            const value = txData.out.reduce((sum, output) => sum + output.value, 0);
            const btcValue = value / 100000000;
            const radius = Math.min(25, Math.max(3, 
                3 + Math.log10(btcValue + 0.1) * 8
            ));
    
            const transaction = {
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + radius,
                targetY: this.canvas.height * 0.8,
                radius: radius,
                hash: txData.hash,
                value: value,
                color: 'rgba(76, 175, 80, 0.8)',
                birth: Date.now()
            };
            this.transactions.push(transaction);
            
            // Play dot sound for new transaction
            this.playDotSound();
        }
    
        createParticles(count) {
            const particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: 0,
                    y: 0,
                    speed: Math.random() * 2 + 1,
                    angle: (Math.PI * 2 * i) / count,
                    size: Math.random() * 3 + 1
                });
            }
            return particles;
        }
    
        handleMouseMove(event) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
    
            // Reset hover info
            this.hoverInfo = null;
    
            // Check blocks using display coordinates
            for (const block of this.blocks) {
                const halfSize = block.size / 2;
                if (Math.abs(mouseX - block.displayX) < halfSize && 
                    Math.abs(mouseY - block.displayY) < halfSize) {
                    this.hoverInfo = {
                        x: mouseX,
                        y: mouseY,
                        data: {
                            type: 'Block',
                            hash: block.hash.substring(0, 8) + '...',
                            size: block.size + ' bytes',
                            age: Math.round((Date.now() - block.birth) / 1000) + 's ago'
                        }
                    };
                    break;
                }
            }
    
            // Check transactions using display coordinates
            if (!this.hoverInfo) {
                for (const tx of this.transactions) {
                    const distance = Math.hypot(mouseX - tx.displayX, mouseY - tx.displayY);
                    if (distance < tx.radius + 5) {
                        this.hoverInfo = {
                            x: mouseX,
                            y: mouseY,
                            data: {
                                type: 'Transaction',
                                hash: tx.hash.substring(0, 8) + '...',
                                value: (tx.value / 100000000).toFixed(8) + ' BTC',
                                age: Math.round((Date.now() - tx.birth) / 1000) + 's ago'
                            }
                        };
                        break;
                    }
                }
            }
        }
    
        drawHoverInfo() {
            if (!this.hoverInfo) return;
    
            this.ctx.save();
            
            // Different colors for blocks vs transactions
            const isBlock = this.hoverInfo.data.type === 'Block';
            this.ctx.fillStyle = isBlock ? 
                'rgba(0, 0, 0, 0.8)' : 
                'rgba(0, 0, 0, 0.7)';
            this.ctx.strokeStyle = isBlock ? 
                'rgba(255, 255, 255, 0.5)' : 
                'rgba(255, 255, 255, 0.3)';
            
            // Draw info box
            const padding = 10;
            const lineHeight = 20;
            const width = 200;
            const height = Object.keys(this.hoverInfo.data).length * lineHeight + padding * 2;
            
            this.ctx.beginPath();
            this.ctx.roundRect(
                this.hoverInfo.x + 10,
                this.hoverInfo.y + 10,
                width,
                height,
                5
            );
            this.ctx.fill();
            this.ctx.stroke();
    
            // Draw text
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            let y = this.hoverInfo.y + 25;
            for (const [key, value] of Object.entries(this.hoverInfo.data)) {
                this.ctx.fillText(
                    `${key}: ${value}`,
                    this.hoverInfo.x + 20,
                    y
                );
                y += lineHeight;
            }
            this.ctx.restore();
        }
    
        drawTransactionMonitor() {
            this.ctx.save();
            
            // Draw title
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            this.ctx.font = 'bold 14px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Bitcoin Transactions Visualizer', this.canvas.width / 2, 25);
            
            // Draw monitor bar background
            const barHeight = 4;
            const barY = 50;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(20, barY, this.canvas.width - 40, barHeight);
            
            // Calculate transactions per second over last 10 seconds
            const now = Date.now();
            const timeWindow = 10000; // 10 seconds
            const recentTxs = this.transactions.filter(tx => now - tx.birth < timeWindow);
            const txRate = (recentTxs.length / timeWindow * 1000).toFixed(1);
            
            // Draw activity indicator for last second only
            this.ctx.fillStyle = '#4CAF50';
            const lastSecondTxs = recentTxs.filter(tx => now - tx.birth < 1000);
            lastSecondTxs.forEach(tx => {
                const progress = (now - tx.birth) / 1000;
                const width = 10;
                const x = 20 + (this.canvas.width - 40 - width) * (1 - progress);
                this.ctx.fillRect(x, barY, width, barHeight);
            });
            
            // Draw TPS counter with longer window - matching title style
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            this.ctx.font = 'bold 14px "Courier New", monospace';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${txRate} tx/s (10s avg)`, this.canvas.width - 20, barY - 5);
            
            this.ctx.restore();
        }
    
        updatePositions() {
            // Update mouse position with smooth interpolation
            this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;
    
            const now = Date.now();
    
            // Update block positions
            this.blocks.forEach(block => {
                const age = (now - block.birth) / 1000; // age in seconds
                const ageMultiplier = 1 + (age * 0.1); // Increase speed with age
                
                // Normal movement
                block.x += (block.targetX - block.x) * 0.05;
                block.y += (block.targetY - block.y) * 0.05;
                
                // Parallax effect - blocks move slower than transactions
                const parallaxX = this.mouseX * 0.3;
                const parallaxY = this.mouseY * 0.3;
                
                // Move blocks up with scroll and add parallax
                block.y -= this.scrollSpeed * ageMultiplier;
                block.targetY -= this.scrollSpeed * ageMultiplier;
                block.displayX = block.x + parallaxX;
                block.displayY = block.y + parallaxY;
                
                // Update particle positions with parallax
                block.particles.forEach(particle => {
                    particle.x = block.displayX + Math.cos(particle.angle) * (block.size + 10);
                    particle.y = block.displayY + Math.sin(particle.angle) * (block.size + 10);
                    particle.angle += particle.speed * 0.01;
                });
            });
    
            // Update transaction positions
            this.transactions.forEach(tx => {
                const age = (now - tx.birth) / 1000; // age in seconds
                const ageMultiplier = 1 + (age * 0.1); // Increase speed with age
                
                if (tx.y > tx.targetY) {
                    tx.y += (tx.targetY - tx.y) * 0.1;
                }
                // Move transactions up with scroll, faster when older
                tx.y -= this.scrollSpeed * ageMultiplier;
                tx.targetY -= this.scrollSpeed * ageMultiplier;
                
                // Parallax effect - transactions move faster than blocks
                tx.displayX = tx.x + this.mouseX * 0.5;
                tx.displayY = tx.y + this.mouseY * 0.5;
            });
    
            // Remove off-screen elements using display positions
            this.blocks = this.blocks.filter(block => block.displayY + block.size > 0);
            this.transactions = this.transactions.filter(tx => tx.displayY + tx.radius > 0);
        }
    
        drawConnectionStatus() {
            this.ctx.save();
            
            // Status text
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            
            // Status indicator
            const radius = 6;
            const x = 20;
            const y = 20;
            
            // Draw status dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            
            switch (this.connectionStatus) {
                case 'connected':
                    this.ctx.fillStyle = '#4CAF50';  // Green
                    this.ctx.fillText('Connected', x + 15, y + 5);
                    break;
                case 'connecting':
                    this.ctx.fillStyle = '#FFC107';  // Yellow
                    this.ctx.fillText('Connecting...', x + 15, y + 5);
                    break;
                case 'disconnected':
                    this.ctx.fillStyle = '#F44336';  // Red
                    this.ctx.fillText('Disconnected - Retrying...', x + 15, y + 5);
                    break;
            }
            
            this.ctx.fill();
            this.ctx.restore();
        }
    
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.updatePositions();
            
            // Draw blocks and their particles
            this.blocks.forEach(block => {
                // Draw particles
                block.particles.forEach(particle => {
                    this.ctx.beginPath();
                    const particleSize = particle.size * 2;
                    this.ctx.save();
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.angle);
                    this.ctx.fillStyle = block.color;
                    this.ctx.fillRect(-particleSize/2, -particleSize/2, particleSize, particleSize);
                    this.ctx.restore();
                });
    
                // Draw block using display coordinates
                this.ctx.save();
                this.ctx.translate(block.displayX, block.displayY);
                this.ctx.rotate(block.rotation);
                
                const halfSize = block.size / 2;
                this.ctx.fillStyle = block.color;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                this.ctx.rect(-halfSize, -halfSize, block.size, block.size);
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.restore();
            });
            
            // Draw transactions using display coordinates
            this.transactions.forEach(tx => {
                // Draw transaction circle
                this.ctx.beginPath();
                this.ctx.arc(tx.displayX, tx.displayY, tx.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = tx.color;
                this.ctx.fill();
    
                // Draw value text if bubble is large enough
                if (tx.radius > 6) {
                    const btcValue = (tx.value / 100000000).toFixed(2);
                    this.ctx.save();
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.font = `${Math.min(8, tx.radius/2)}px "Courier New", monospace`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(btcValue, tx.displayX, tx.displayY);
                    this.ctx.restore();
                }
            });
    
            // Draw connection status
            this.drawConnectionStatus();
            
            // Draw transaction monitor
            this.drawTransactionMonitor();
            
            // Draw hover information
            this.drawHoverInfo();
        }
    
        animate() {
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    
        playDotSound() {
            if (!this.audioContext) return;
            
            // Check if enough time has passed since last sound
            const now = Date.now();
            if (now - this.lastSoundTime < this.minSoundInterval) {
                return; // Skip sound if too soon
            }
            this.lastSoundTime = now;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Very short, high-pitched "dot" sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
                
                // Very quick attack and decay
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.005);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.05);
            } catch (e) {
                console.warn('Error playing dot sound:', e);
                this.audioContext = null;
            }
        }
    }

export default BlockchainVis; 