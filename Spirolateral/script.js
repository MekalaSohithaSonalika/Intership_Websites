document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('spiralCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    const ctx = canvas.getContext('2d');
    const generateBtn = document.getElementById('generateBtn');
    const gridToggleBtn = document.getElementById('gridToggleBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    let showGrid = false;  // Initialize grid visibility to false
    let scale = 1.0;
    const ZOOM_FACTOR = 1.2;
    let lineThickness = 1; // Default line thickness

    // Add grid toggle button event listener
    gridToggleBtn.addEventListener('click', function() {
        showGrid = !showGrid;
        gridToggleBtn.textContent = showGrid ? 'Grid Not Needed' : 'Grid Needed';
        drawSpiral();
    });
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        // Set canvas size to be larger than container to accommodate large patterns
        canvas.width = Math.max(container.clientWidth * 2, 2400);
        canvas.height = Math.max(container.clientHeight * 2, 2000);
        drawSpiral(); // Redraw when resizing
    }
    
    // Add resize observer for smoother resizing
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas.parentElement);
    
    resizeCanvas();
    
    generateBtn.addEventListener('click', drawSpiral);
    
    // Add zoom controls
    zoomInBtn.addEventListener('click', () => {
        scale *= ZOOM_FACTOR;
        ctx.scale(ZOOM_FACTOR, ZOOM_FACTOR);
        drawSpiral();
    });

    zoomOutBtn.addEventListener('click', () => {
        scale /= ZOOM_FACTOR;
        ctx.scale(1/ZOOM_FACTOR, 1/ZOOM_FACTOR);
        drawSpiral();
    });

    // Add line thickness controls
    document.getElementById('reduceLineBtn').addEventListener('click', () => {
        if (lineThickness > 0.1) {
            lineThickness -= 0.1;
            drawSpiral(); // Redraw the spiral with new thickness
        }
    });

    document.getElementById('increaseLineBtn').addEventListener('click', () => {
        lineThickness += 0.1;
        drawSpiral(); // Redraw the spiral with new thickness
    });

    function drawSpiral() {
        // Reset transformation matrix before clearing
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply the current scale
        ctx.setTransform(scale, 0, 0, scale, canvas.width*(1-scale)/2, canvas.height*(1-scale)/2);

        // Get user inputs
        const userAngle = parseFloat(document.getElementById('angle').value);
        const angle = 180 - userAngle;  // Convert the input angle
        const initialStep = parseFloat(document.getElementById('initialStep').value);
        const stepIncrement = parseFloat(document.getElementById('stepIncrement').value);
        const innerSegments = parseInt(document.getElementById('innerSegments').value);
        const outerRepeats = parseInt(document.getElementById('outerRepeats').value);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid if enabled
        if (showGrid) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;
            
            // Draw vertical lines
            for (let x = 0; x <= canvas.width; x += initialStep) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            
            // Draw horizontal lines
            for (let y = 0; y <= canvas.height; y += initialStep) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            
            ctx.stroke();
        }
        
        // Set drawing parameters
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let x = centerX;
        let y = centerY;
        let currentAngle = 0;
        let stepSize = initialStep;
        
        // Draw start point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'green';
        ctx.fill();
        
        // Begin spiral path
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Draw the spiral
        for (let i = 0; i < outerRepeats; i++) {
            stepSize = initialStep; // Reset step size for each repeat
            
            for (let j = 0; j < innerSegments; j++) {
                const radianAngle = currentAngle * Math.PI / 180;
                x += stepSize * Math.cos(radianAngle);
                y += stepSize * Math.sin(radianAngle);
                
                ctx.lineTo(x, y);
                
                currentAngle += angle;
                stepSize += stepIncrement;
            }
        }
        
        // Draw the spiral path
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = lineThickness;
        ctx.stroke();
        
        // Draw end point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        
        // Add information text
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.fillText(`Angle: ${userAngle}°`, 20, 30);
        ctx.fillText(`Step: ${initialStep}`, 20, 50);
        ctx.fillText(`Increment: ${stepIncrement}`, 20, 70);
    }
    
    // Draw initial spiral
    drawSpiral();
});
