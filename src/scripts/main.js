// Catch elements
const dropArea = document.getElementById('dropArea');
const predictForm = document.getElementById('predictForm');
const previewImg = document.getElementById('previewImg');

const waitingToPredicting = document.querySelector(
  '.result-container #waitingToPredicting',
);
const loadingPredict = document.querySelector('.result-container .loading');
const predictionError = document.querySelector('.result-container #predictionError');
const result = document.querySelector('.result-container #result');

// Form data
const predictFormData = new FormData();

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Prevent submitting form behaviors
['submit'].forEach((eventName) => {
  predictForm.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});
// Remove highlight drop area when item is drag leave
['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function preventDefaults(event) {
  event.preventDefault();
  event.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

// Handle dropped and submit files
dropArea.addEventListener('drop', dropHandler, false);
predictForm.elements.fruitFile.addEventListener('change', fruitFileInputHandler);
predictForm.addEventListener('submit', predictFormSubmitHandler);

function dropHandler(event) {
  const dataTransfer = event.dataTransfer;
  const files = dataTransfer.files;

  const fruitImage = files[0];
  predictFormData.set('image', fruitImage, fruitImage.name);

  previewFile(fruitImage);
}

// Handle file by input element
function fruitFileInputHandler(event) {
  const files = Array.from(event.target.files);

  const fruitImage = files[0];
  predictFormData.set('image', fruitImage, fruitImage.name);

  previewFile(fruitImage);
}

// Handle submit form
function predictFormSubmitHandler() {
  if (!predictFormData.has('image')) {
    alert('Silakan pilih gambar Anda terlebih dahulu');
    return;
  }

  uploadFile(predictFormData);
}

// Show preview after choose image
function previewFile(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    previewImg.innerHTML = '';

    const img = document.createElement('img');
    img.src = reader.result;
    previewImg.appendChild(img);
  };
}

// ... (bagian kode sebelumnya)

// Send image to server
async function uploadFile(formData) {
  try {
    hideElement(waitingToPredicting);
    hideElement(result);
    showElement(loadingPredict);

    const response = await PredictAPI.predict(formData);

    // Periksa status respons
    if (response.status === 'success') {
      showPredictionResult(response.data);
    } else {
      showErrorMessage(response.message);
    }
    showElement(result);
  } catch (error) {
    console.error(error);
    showErrorMessage(error.message);
  } finally {
    hideElement(loadingPredict);
  }
}

// Fungsi untuk menampilkan pesan kesalahan
function showErrorMessage(message) {
  result.innerHTML = `
    <div class="response-message">
      <i class="fas fa-times"></i>
      <span class="message">${message}</span>
    </div>
  `;
}

// Fungsi untuk menampilkan hasil prediksi
function showPredictionResult(data) {
  result.innerHTML = `
    <div class="response-message">
      <i class="fas fa-check"></i>
      <span class="message">Prediction succes!</span>
    </div>
    <div class="prediction-result">
      <div>
        <div class="result-title">Result:</div>
        <div>${data.result}</div>
      </div>
      <div>
        <div class="result-title">Benefit:</div>
        <div>${data.benefit}</div>
      </div>
    </div>
  `;
}
