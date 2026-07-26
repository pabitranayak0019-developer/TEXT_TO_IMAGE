// ============================================
// DOM ELEMENTS
// ============================================

const promptTextarea = document.getElementById('prompt');
const dimensionSelect = document.getElementById('dimension-select');
const modelSelect = document.getElementById('model-select');

// Multiple Image Upload DOM Elements
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
// Array to hold multiple uploaded Base64 photos
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
// MULTIPLE FILE UPLOAD HANDLERS
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

        // Reset file input value to allow selecting the same file again if deleted
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
                    style="width: 22px; height: 22px; transform: translate(30%, -30%); fs-6;" 
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
// GENERATION LOGIC WITH MULTIPLE REFERENCE PHOTOS
// ============================================

function generateImage(prompt) {
    showLoading();

    const cleanedPrompt = prompt
        .replace(/[^a-zA-Z0-9\s,.-]/g, '')
        .trim()
        .slice(0, 300);

    if (!cleanedPrompt && uploadedImagesList.length === 0) {
        showError('Please enter a text prompt or upload reference photos.');
        hideLoading();
        return;
    }

    const [width, height] = dimensionSelect.value.split('x');
    const selectedModel = modelSelect.value;

    let finalPrompt = cleanedPrompt;
    if (uploadedImagesList.length > 0) {
        const countText = `${uploadedImagesList.length} reference photo${uploadedImagesList.length > 1 ? 's' : ''}`;
        finalPrompt = `${cleanedPrompt || 'High quality art'} (combining subject, style, and features from ${countText})`;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const randomSeed = Math.floor(Math.random() * 1000000);

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

// Initialize on page load
initializeTheme();
