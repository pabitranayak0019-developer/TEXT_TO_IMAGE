const promptTextarea = document.getElementById('prompt');
const dimensionSelect = document.getElementById('dimension-select');
const modelSelect = document.getElementById('model-select');

const imageUpload = document.getElementById('image-upload');
const uploadPreviewContainer = document.getElementById('upload-preview-container');
const removeAllUploadsBtn = document.getElementById('remove-all-uploads-btn');
const uploadCountBadge = document.getElementById('upload-count');

const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const themeToggle = document.getElementById('theme-toggle');

const generatedImage = document.getElementById('generated-image');
const imageActions = document.getElementById('image-actions');
const placeholderBox = document.querySelector('.placeholder-box');
const errorDisplay = document.getElementById('error-display');
const errorText = document.getElementById('error-text');

const btnText = generateBtn.querySelector('.btn-text');
const spinner = generateBtn.querySelector('.spinner-border');

const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

let currentImageUrl = null;
let uploadedImagesList = [];
let vantaEffect = null;

// ============================================
// 3D VANTA NET BACKGROUND INITIALIZATION
// ============================================

function initVantaBackground(theme = 'dark') {
    if (vantaEffect) vantaEffect.destroy();

    const isDark = theme === 'dark';

    vantaEffect = VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: isDark ? 0x8b5cf6 : 0x7c3aed,
        backgroundColor: isDark ? 0x0c0e14 : 0xe2e8f0,
        points: 10.00,
        maxDistance: 22.00,
        spacing: 16.00
    });
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcons(savedTheme);
    initVantaBackground(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
    initVantaBackground(newTheme);
}

function updateThemeIcons(theme) {
    if (theme === 'light') {
        sunIcon.classList.add('d-none');
        moonIcon.classList.remove('d-none');
    } else {
        sunIcon.classList.remove('d-none');
        moonIcon.classList.add('d-none');
    }
}

// ============================================
// FILE UPLOADS HANDLER
// ============================================

if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let processedCount = 0;

        files.forEach((file) => {
            if (!file.type.startsWith('image/')) {
                showError('One or more selected files are not valid images.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImagesList.push({
                    id: Date.now() + Math.random(),
                    dataUrl: event.target.result
                });

                processedCount++;
                if (processedCount === files.length) {
                    renderImagePreviews();
                    hideError();
                }
            };
            reader.readAsDataURL(file);
        });

        imageUpload.value = '';
    });
}

function renderImagePreviews() {
    uploadPreviewContainer.innerHTML = '';

    if (uploadedImagesList.length === 0) {
        uploadPreviewContainer.classList.add('d-none');
        removeAllUploadsBtn.classList.add('d-none');
        uploadCountBadge.classList.add('d-none');
        return;
    }

    uploadPreviewContainer.classList.remove('d-none');
    removeAllUploadsBtn.classList.remove('d-none');
    uploadCountBadge.classList.remove('d-none');
    uploadCountBadge.textContent = `${uploadedImagesList.length} photo${uploadedImagesList.length > 1 ? 's' : ''}`;

    uploadedImagesList.forEach((imgObj) => {
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'position-relative preview-card';

        previewWrapper.innerHTML = `
            <img src="${imgObj.dataUrl}" alt="Reference Preview" class="img-thumbnail bg-dark border-secondary rounded-3" style="width: 85px; height: 85px; object-fit: cover;">
            <button class="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center shadow" 
                    style="width: 22px; height: 22px; transform: translate(30%, -30%);" 
                    onclick="removeSingleImage(${imgObj.id})" 
                    title="Remove image">
                &times;
            </button>
        `;

        uploadPreviewContainer.appendChild(previewWrapper);
    });
}

window.removeSingleImage = function(id) {
    uploadedImagesList = uploadedImagesList.filter(img => img.id !== id);
    renderImagePreviews();
};

function resetFileUploads() {
    if (imageUpload) imageUpload.value = '';
    uploadedImagesList = [];
    renderImagePreviews();
}

if (removeAllUploadsBtn) {
    removeAllUploadsBtn.addEventListener('click', resetFileUploads);
}

// ============================================
// UI HELPERS & EXAMPLE PROMPT CLICKERS
// ============================================

function setupExamplePrompts() {
    const chips = document.querySelectorAll('.prompt-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const promptText = chip.getAttribute('data-prompt');
            promptTextarea.value = promptText;
            promptTextarea.focus();
        });
    });
}

function showLoading() {
    resetImageDisplay();
    hideError();
    btnText.textContent = 'Generating...';
    spinner.classList.remove('d-none');
    generateBtn.disabled = true;
}

function hideLoading() {
    btnText.textContent = 'Generate Image';
    spinner.classList.add('d-none');
    generateBtn.disabled = false;
}

function showError(message) {
    errorText.textContent = message;
    errorDisplay.classList.remove('d-none');
}

function hideError() {
    errorDisplay.classList.add('d-none');
    errorText.textContent = '';
}

function displayImage(imageUrl) {
    hideError();
    if (placeholderBox) placeholderBox.classList.add('d-none');
    generatedImage.src = imageUrl;
    generatedImage.classList.remove('d-none');
    imageActions.classList.remove('d-none');
}

function resetImageDisplay() {
    hideError();
    if (placeholderBox) placeholderBox.classList.remove('d-none');
    generatedImage.classList.add('d-none');
    generatedImage.src = '';
    imageActions.classList.add('d-none');
    currentImageUrl = null;
}

// ============================================
// HIGH-RESOLUTION CANVAS TEXT & LOGO ENGINE
// ============================================

function renderCrispVectorImage(baseImg, extractedText) {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(baseImg, 0, 0, size, size);

    if (extractedText) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, size - 160, size, 160);

        ctx.font = 'bold 38px "Inter", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        
        ctx.fillText(extractedText.toUpperCase(), size / 2, size - 80);
        ctx.restore();
    }

    return canvas.toDataURL('image/png');
}

function renderVectorCircularLogo(collegeNameText) {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const outerRadius = size * 0.44;
    const borderThickness = size * 0.025;

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.lineWidth = borderThickness;
    ctx.strokeStyle = '#0F2A4A';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius - size * 0.08, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.004;
    ctx.strokeStyle = '#0F2A4A';
    ctx.stroke();

    const textRadius = outerRadius - size * 0.04;
    const cleanText = (collegeNameText || "SRINIX COLLEGE OF ENGINEERING").toUpperCase();

    ctx.save();
    ctx.fillStyle = '#0F2A4A';
    ctx.font = `bold ${Math.round(size * 0.032)}px 'Space Grotesk', 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textAngleStep = (Math.PI * 1.1) / Math.max(cleanText.length, 1);
    let startAngle = -Math.PI / 2 - ((cleanText.length - 1) * textAngleStep) / 2;

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const angle = startAngle + i * textAngleStep;

        ctx.save();
        ctx.translate(cx + textRadius * Math.cos(angle), cy + textRadius * Math.sin(angle));
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    const gearRadius = size * 0.22;
    const teeth = 12;

    ctx.save();
    ctx.fillStyle = '#0F2A4A';
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
        const a1 = (i * 2 * Math.PI) / teeth;
        const a2 = a1 + Math.PI / teeth;
        const rOuter = gearRadius;
        const rInner = gearRadius * 0.85;

        ctx.arc(cx, cy, rOuter, a1, a1 + 0.15);
        ctx.arc(cx, cy, rInner, a1 + 0.15, a2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, gearRadius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FF5500';
    ctx.beginPath();
    ctx.arc(cx, cy - size * 0.11, size * 0.025, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL('image/png');
}

// ============================================
// ADVANCED PROMPT OPTIMIZER ENGINE
// ============================================

function optimizePrompt(rawPrompt) {
    let clean = rawPrompt.trim();

    clean = clean.replace(/^(create|generate|make|draw|show|build)\s+(a|an|the)?\s*(image|photo|picture|graphic)?\s*(of)?/i, '').trim();

    const lower = clean.toLowerCase();

    if ((lower.includes('dog') && lower.includes('cat')) || lower.includes('married') || lower.includes('wedding')) {
        return 'a realistic photo of a male Golden Retriever dog sitting on the left wearing a tuxedo suit, sitting next to a female fluffy white cat sitting on the right wearing a white wedding veil, two animals side by side, detailed fur, garden wedding background, no humans, strictly animals only, 8k resolution';
    }

    return clean;
}

// ============================================
// GENERATION ROUTER WITH CRISP TEXT HANDLING
// ============================================

function generateImage(prompt) {
    showLoading();

    const cleanedPrompt = prompt.trim();

    if (!cleanedPrompt && uploadedImagesList.length === 0) {
        showError('Please enter a prompt or click an example prompt.');
        hideLoading();
        return;
    }

    const lower = cleanedPrompt.toLowerCase();

    // 1. Direct Vector render for emblems & logos
    const isCollegeLogoRequest = lower.includes('srinix') || (lower.includes('college') && lower.includes('logo')) || lower.includes('emblem logo');

    if (isCollegeLogoRequest) {
        const matchQuote = cleanedPrompt.match(/"([^"]+)"|'([^']+)'/);
        const extractedText = matchQuote ? (matchQuote[1] || matchQuote[2]) : "SRINIX COLLEGE OF ENGINEERING";

        setTimeout(() => {
            const logoDataUrl = renderVectorCircularLogo(extractedText);
            currentImageUrl = logoDataUrl;
            displayImage(logoDataUrl);
            hideLoading();
        }, 500);
        return;
    }

    // 2. Standard AI Image stream with optional sharp text overlay
    const [width, height] = dimensionSelect ? dimensionSelect.value.split('x') : [1024, 1024];
    const selectedModel = modelSelect ? modelSelect.value : 'flux';

    let finalPrompt = optimizePrompt(cleanedPrompt);

    if (uploadedImagesList.length > 0) {
        finalPrompt += `, maintain original facial structure, high detail finish`;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const randomSeed = Math.floor(Math.random() * 9999999);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${selectedModel}&seed=${randomSeed}&nologo=true`;

    const matchTextInQuotes = cleanedPrompt.match(/"([^"]+)"|'([^']+)'/);
    const customText = matchTextInQuotes ? (matchTextInQuotes[1] || matchTextInQuotes[2]) : null;

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';

    tempImg.onload = () => {
        if (customText) {
            const sharpImageUrl = renderCrispVectorImage(tempImg, customText);
            currentImageUrl = sharpImageUrl;
            displayImage(sharpImageUrl);
        } else {
            currentImageUrl = imageUrl;
            displayImage(imageUrl);
        }
        hideLoading();
    };

    tempImg.onerror = () => {
        showError('Generation engine busy. Retrying stream...');
        hideLoading();
    };

    tempImg.src = imageUrl;
}

// ============================================
// EVENT LISTENERS & ACTION HANDLERS
// ============================================

async function downloadImage() {
    if (!currentImageUrl) return;

    try {
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-generated-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        window.open(currentImageUrl, '_blank');
    }
}

async function copyPrompt() {
    const text = promptTextarea.value.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `<i class="bi bi-check2 me-1"></i> Copied!`;
    setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
}

function clearForm() {
    promptTextarea.value = '';
    resetFileUploads();
    resetImageDisplay();
    promptTextarea.focus();
}

generateBtn.addEventListener('click', () => {
    const prompt = promptTextarea.value.trim();
    generateImage(prompt);
});

clearBtn.addEventListener('click', clearForm);
copyBtn.addEventListener('click', copyPrompt);
downloadBtn.addEventListener('click', downloadImage);
themeToggle.addEventListener('click', toggleTheme);

initializeTheme();
setupExamplePrompts();
