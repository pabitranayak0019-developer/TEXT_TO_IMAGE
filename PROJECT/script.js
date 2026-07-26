// ============================================
// DOM ELEMENTS
// ============================================

const promptTextarea = document.getElementById('prompt');
const dimensionSelect = document.getElementById('dimension-select');
const modelSelect = document.getElementById('model-select');

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
let vantaEffect = null;

// ============================================
// 3D VANTA BACKGROUND INITIALIZATION
// ============================================

function initVantaBackground(theme = 'dark') {
    if (vantaEffect) vantaEffect.destroy();

    const isDark = theme === 'dark';

    vantaEffect = VANTA.DOTS({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: isDark ? 0x8b5cf6 : 0x7c3aed,
        color2: isDark ? 0x6366f1 : 0x4f46e5,
        backgroundColor: isDark ? 0x0c0e14 : 0xe2e8f0,
        size: 3.5,
        spacing: 35.0
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
// UI HELPERS
// ============================================

function showLoading() {
    resetImageDisplay();
    hideError();
    btnText.textContent = 'Creating magic...';
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
    placeholderBox.classList.add('d-none');
    generatedImage.src = imageUrl;
    generatedImage.classList.remove('d-none');
    imageActions.classList.remove('d-none');
}

function resetImageDisplay() {
    hideError();
    placeholderBox.classList.remove('d-none');
    generatedImage.classList.add('d-none');
    generatedImage.src = '';
    imageActions.classList.add('d-none');
    currentImageUrl = null;
}

// ============================================
// GENERATION LOGIC WITH DIMENSIONS & MODEL ENGINE
// ============================================

function generateImage(prompt) {
    showLoading();

    const cleanedPrompt = prompt
        .replace(/[^a-zA-Z0-9\s,.-]/g, '')
        .trim()
        .slice(0, 300);

    if (!cleanedPrompt) {
        showError('Please enter a valid text prompt.');
        hideLoading();
        return;
    }

    // Extract Dimensions
    const [width, height] = dimensionSelect.value.split('x');
    const selectedModel = modelSelect.value;

    const encodedPrompt = encodeURIComponent(cleanedPrompt);
    const randomSeed = Math.floor(Math.random() * 1000000);

    // Pollinations URL with model, width, and height dynamic parameters
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${selectedModel}&seed=${randomSeed}&nologo=true`;

    generatedImage.onload = () => {
        currentImageUrl = imageUrl;
        displayImage(imageUrl);
        hideLoading();
    };

    generatedImage.onerror = () => {
        showError('Failed to generate image. Please try again.');
        hideLoading();
    };

    generatedImage.src = imageUrl;
}

// ============================================
// EVENT LISTENERS
// ============================================

async function downloadImage() {
    if (!currentImageUrl) return;

    try {
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `visionary-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        showError('Unable to download automatically. Right click image to save.');
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

function clearPrompt() {
    promptTextarea.value = '';
    resetImageDisplay();
    promptTextarea.focus();
}

generateBtn.addEventListener('click', () => {
    const prompt = promptTextarea.value.trim();
    if (prompt) generateImage(prompt);
});

clearBtn.addEventListener('click', clearPrompt);
copyBtn.addEventListener('click', copyPrompt);
downloadBtn.addEventListener('click', downloadImage);
themeToggle.addEventListener('click', toggleTheme);

initializeTheme();