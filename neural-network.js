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
        
        this.nodes = [];
        this.connections = [];
        this.numNodes = 32;  // Reduced for smaller space
        this.numConnections = 1028;  // Reduced for smaller space
        
        this.resize();
        this.init();
        this.animate();
        
        // Update resize handler to use container dimensions
        window.addEventListener('resize', () => this.resize());
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
        // Create nodes with smaller movement range
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.15,  // Reduced speed
                vy: (Math.random() - 0.5) * 0.15,  // Reduced speed
                radius: 2  // Smaller nodes
            });
        }
        
        // Create connections
        for (let i = 0; i < this.numConnections; i++) {
            this.connections.push({
                from: Math.floor(Math.random() * this.numNodes),
                to: Math.floor(Math.random() * this.numNodes),
                weight: Math.random()
            });
        }
    }
    
    update() {
        // Update node positions
        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off walls
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
        });
    }
    
    draw() {
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw connections
            this.ctx.strokeStyle = '#0366d6';
            this.connections.forEach(conn => {
                const from = this.nodes[conn.from];
                const to = this.nodes[conn.to];
                
                // Only draw connections between nearby nodes
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    this.ctx.beginPath();
                    this.ctx.globalAlpha = (1 - distance / 200) * 0.7;  // Adjust this value (0.7) to control connection opacity
                    this.ctx.moveTo(from.x, from.y);
                    this.ctx.lineTo(to.x, to.y);
                    this.ctx.stroke();
                }
            });
            
            // Draw nodes
            this.ctx.fillStyle = '#0366d6';
            this.nodes.forEach(node => {
                this.ctx.beginPath();
                this.ctx.globalAlpha = 0.9;  // Adjust this value (0.9) to control node opacity
                this.ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
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