document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const dropZone = document.getElementById('dropZone');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const originalCanvas = document.getElementById('originalCanvas');
    const convertedCanvas = document.getElementById('convertedCanvas');
    
    // Target color palette (clay, cement, biscuit, brown)
    const targetColors = [
        { name: 'clay', hex: '#D7A583', rgb: [215, 165, 131] },
        { name: 'biscuit', hex: '#E3C8AB', rgb: [227, 200, 171] },
        { name: 'brown', hex: '#8B4513', rgb: [139, 69, 19] }
    ];
    
    let originalImage = null;
    
    // Event listeners
    imageUpload.addEventListener('change', handleImageUpload);
    convertBtn.addEventListener('click', convertImage);
    downloadBtn.addEventListener('click', downloadConvertedImage);
    
    // Drag and drop functionality
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            imageUpload.files = e.dataTransfer.files;
            handleImageUpload();
        }
    });
    
    // Handle image upload
    function handleImageUpload() {
        const file = imageUpload.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                displayOriginalImage();
                convertBtn.disabled = false;
                downloadBtn.disabled = true;
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Display original image on canvas
    function displayOriginalImage() {
        const ctx = originalCanvas.getContext('2d');
        
        // Set canvas dimensions to match image, but limit to a reasonable size
        const maxWidth = 600;
        const maxHeight = 600;
        let width = originalImage.width;
        let height = originalImage.height;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        originalCanvas.width = width;
        originalCanvas.height = height;
        convertedCanvas.width = width;
        convertedCanvas.height = height;
        
        ctx.drawImage(originalImage, 0, 0, width, height);
    }
    
    // Convert image to target color palette
    function convertImage() {
        if (!originalImage) return;
        
        const originalCtx = originalCanvas.getContext('2d');
        const convertedCtx = convertedCanvas.getContext('2d');
        
        // Get image data from original canvas
        const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
        const data = imageData.data;
        
        // Convert each pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Find the closest color in our palette
            const closestColor = findClosestColor(r, g, b);
            
            // Set the new color
            data[i] = closestColor.rgb[0];
            data[i + 1] = closestColor.rgb[1];
            data[i + 2] = closestColor.rgb[2];
            // Alpha channel (data[i+3]) remains unchanged
        }
        
        // Put the converted data back to the converted canvas
        convertedCtx.putImageData(imageData, 0, 0);
        downloadBtn.disabled = false;
    }
    
    // Find the closest color in our palette using Euclidean distance
    function findClosestColor(r, g, b) {
        let minDistance = Infinity;
        let closestColor = targetColors[0];
        
        for (const color of targetColors) {
            const distance = Math.sqrt(
                Math.pow(r - color.rgb[0], 2) +
                Math.pow(g - color.rgb[1], 2) +
                Math.pow(b - color.rgb[2], 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = color;
            }
        }
        
        return closestColor;
    }
    
    // Download the converted image
    function downloadConvertedImage() {
        const link = document.createElement('a');
        link.download = 'converted-image.png';
        link.href = convertedCanvas.toDataURL('image/png');
        link.click();
    }
});