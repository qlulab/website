class NeuralNetworkAnimation {
    constructor() {
        console.log('NeuralNetworkAnimation constructor called');
        this.canvas = document.getElementById('neural-network-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        console.log('Canvas found:', this.canvas);
        
        try {
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                console.error('Could not get 2D context from canvas');
                return;
            }
        } catch (e) {
            console.error('Error getting canvas context:', e);
            return;
        }
        
        // Get the link color from CSS
        this.networkColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--link-color').trim();
        
        // Check if device is mobile using media query
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        
        // Set number of nodes and connections based on device type
        this.numNodes = isMobile ? 16 : 64;
        this.numConnections = isMobile ? 128 : 1028;
        
        this.nodes = [];
        this.connections = [];
        
        // Activation properties
        this.activationThreshold = 0.5;  // Connection weight threshold for activation
        this.activationDecay = 0.98;     // Slower decay
        this.propagationInterval = 3000;  // Time between activations
        this.lastActivationTime = 0;
        this.propagationSpeed = 0.1;     // How quickly activation spreads (0-1)
        this.activationPercentage = 0.25; // Activate 25% of nodes each time
        
        // Movement speed control
        this.movementSpeed = 0.15;
        
        this.resize();
        this.init();
        this.animate();
        
        // Update resize handler to use container dimensions
        window.addEventListener('resize', () => {
            this.resize();
            // Reinitialize nodes and connections when screen size changes
            const wasMobile = isMobile;
            const isNowMobile = window.matchMedia("(max-width: 768px)").matches;
            if (wasMobile !== isNowMobile) {
                this.numNodes = isNowMobile ? 16 : 32;
                this.numConnections = isNowMobile ? 256 : 1024;
                this.init();
            }
        });
    }
    
    resize() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.offsetWidth;
            this.canvas.height = container.offsetHeight;
            console.log('Resizing canvas to:', this.canvas.width, 'x', this.canvas.height);
        }
    }
    
    init() {
        // Create nodes with activation state
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.movementSpeed,  // Use movementSpeed
                vy: (Math.random() - 0.5) * this.movementSpeed,  // Use movementSpeed
                radius: 2,
                activation: 0,  // Current activation level (0 to 1)
                nextActivation: 0  // Activation level for next frame
            });
        }
        
        // Create connections with weights
        for (let i = 0; i < this.numConnections; i++) {
            this.connections.push({
                from: Math.floor(Math.random() * this.numNodes),
                to: Math.floor(Math.random() * this.numNodes),
                weight: Math.random()  // Connection strength (0 to 1)
            });
        }
    }
    
    update() {
        const currentTime = Date.now();
        
        // Check if it's time to start new activations
        if (currentTime - this.lastActivationTime > this.propagationInterval) {
            // Calculate number of nodes to activate (25% of total)
            const numNodesToActivate = Math.max(1, Math.floor(this.numNodes * this.activationPercentage));
            
            // Create array of all node indices
            const nodeIndices = Array.from({length: this.numNodes}, (_, i) => i);
            
            // Shuffle the array to get random nodes
            for (let i = nodeIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nodeIndices[i], nodeIndices[j]] = [nodeIndices[j], nodeIndices[i]];
            }
            
            // Activate the first numNodesToActivate nodes
            for (let i = 0; i < numNodesToActivate; i++) {
                this.nodes[nodeIndices[i]].activation = 1;
            }
            
            this.lastActivationTime = currentTime;
        }
        
        // Update node positions
        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off walls
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
            
            // Decay activation
            node.activation *= this.activationDecay;
        });
        
        // Propagate activation through connections with slower speed
        this.connections.forEach(conn => {
            const fromNode = this.nodes[conn.from];
            const toNode = this.nodes[conn.to];
            
            // If the source node is activated and connection is strong enough
            if (fromNode.activation > 0.3 && conn.weight > this.activationThreshold) {
                // Calculate activation transfer with propagation speed factor
                const activationTransfer = fromNode.activation * conn.weight * this.propagationSpeed;
                // Only transfer if it would increase the target node's activation
                if (activationTransfer > toNode.nextActivation) {
                    toNode.nextActivation = activationTransfer;
                }
            }
        });
        
        // Update activations for next frame
        this.nodes.forEach(node => {
            // Smoothly blend current and next activation
            node.activation = Math.max(node.activation, node.nextActivation);
            node.nextActivation = 0;
        });
    }
    
    draw() {
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw connections
            this.connections.forEach(conn => {
                const from = this.nodes[conn.from];
                const to = this.nodes[conn.to];
                
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    // Make connections more visible when nodes are activated
                    const activationLevel = Math.max(from.activation, to.activation);
                    this.ctx.beginPath();
                    this.ctx.globalAlpha = (1 - distance / 200) * 0.7 * (1 + activationLevel * 0.5);
                    this.ctx.strokeStyle = this.networkColor;
                    this.ctx.moveTo(from.x, from.y);
                    this.ctx.lineTo(to.x, to.y);
                    this.ctx.stroke();
                }
            });
            
            // Draw nodes with activation effect
            this.nodes.forEach(node => {
                this.ctx.beginPath();
                // Increase size and opacity based on activation
                const size = node.radius * (1 + node.activation * 2);
                const opacity = 0.9 + node.activation * 0.1;
                this.ctx.globalAlpha = opacity;
                this.ctx.fillStyle = this.networkColor;
                this.ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.ctx.globalAlpha = 1;
        } catch (e) {
            console.error('Error in draw method:', e);
        }
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Start the animation when the page loads
console.log('Script loaded, waiting for window load event...');
if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
        console.log('Window loaded, creating animation...');
        new NeuralNetworkAnimation();
    });
} else {
    console.log('Document already loaded, creating animation immediately...');
    new NeuralNetworkAnimation();
} 