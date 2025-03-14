  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        async function convertBinary() {
            const input = document.getElementById('binaryInput').value;
            try {
                const binary = textToBinary(input);
                document.getElementById('result').value = binary;
                showToast('Converted to binary successfully!');
            } catch (error) {
                document.getElementById('error').textContent = error.message;
            }
        }

        async function convertToBinary() {
            const input = document.getElementById('binaryInput').value;
            try {
                const text = binaryToText(input);
                document.getElementById('result').value = text;
                showToast('Converted to text successfully!');
            } catch (error) {
                document.getElementById('error').textContent = error.message;
            }
        }

        function textToBinary(text) {
            const bytes = encoder.encode(text);
            return Array.from(bytes)
                .map(byte => byte.toString(2).padStart(8, '0'))
                .join(' ');
        }

        function binaryToText(binaryString) {
            const chunks = binaryString.trim().split(/\s+/);
            const errors = [];
            const bytes = new Uint8Array(chunks.length);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                if (chunk.length !== 8 || !/^[01]+$/.test(chunk)) {
                    errors.push(`Invalid chunk: ${chunk}`);
                    continue;
                }
                bytes[i] = parseInt(chunk, 2);
            }

            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            return decoder.decode(bytes);
        }

        function copyToClipboard() {
            const result = document.getElementById('result');
            navigator.clipboard.writeText(result.value)
                .then(() => showToast('Copied to clipboard!'))
                .catch(() => showToast('Copy failed!', true));
        }

        function downloadResult() {
            const result = document.getElementById('result').value;
            if (!result) return;

            const blob = new Blob([result], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversion_${new Date().toISOString().slice(0,10)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function clearFields() {
            document.getElementById('binaryInput').value = '';
            document.getElementById('result').value = '';
            document.getElementById('error').textContent = '';
        }

        // File upload handling
        document.getElementById('fileUpload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('binaryInput').value = e.target.result;
                showToast('File loaded successfully!');
            };
            reader.readAsText(file);
        });

        // Handle image upload and extract text using Tesseract.js
        document.getElementById('imageUpload').addEventListener('change', function(e) {
            const image = e.target.files[0];
            if (!image) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const imgElement = new Image();
                imgElement.src = e.target.result;
                imgElement.onload = function() {
                    // Start Tesseract.js OCR processing
                    Tesseract.recognize(
                        imgElement,
                        'eng', // Language (you can change or add others)
                        {
                            logger: info => console.log(info) // For logging progress
                        }
                    ).then(({ data: { text } }) => {
                        // Update the textarea with extracted text
                        document.getElementById('binaryInput').value = text;
                        showToast('Text extracted from image successfully!');
                    }).catch(err => {
                        showToast('Failed to extract text from image.', true);
                    });
                };
            };
            reader.readAsDataURL(image);
        });
// Fetch the JSON file
fetch('data.json')
  .then(response => response.json()) // Parse JSON data
  .then(data => {
    // Use the JSON data here
    displayAppInfo(data);
  })
  .catch(error => {
    console.error('Error loading JSON:', error);
  });

// Function to display JSON data in HTML
function displayAppInfo(data) {
  const appInfoDiv = document.getElementById('app-info');
  
  appInfoDiv.innerHTML = `
    <h1>${data.appName}</h1>
    <p>Version: ${data.version}</p>
    <p>Description: ${data.description}</p>
  `;
}

// config.json
{
  "features": [
    { "name": "Text to Binary", "enabled": true },
    { "name": "Binary to Text", "enabled": true }
  ]
}

// script.js
fetch('config.json')
  .then(response => response.json())
  .then(config => {
    config.features.forEach(feature => {
      if (feature.enabled) {
        // Dynamically create UI elements for enabled features
        console.log(`Enabled feature: ${feature.name}`);
      }
    });
  });
async function loadJSON() {
     try {
       const response = await fetch('data.json');
       const data = await response.json();
       displayAppInfo(data);
     } catch (error) {
       console.error('Error:', error);
     }
   }
   loadJSON();

        
// Save to localStorage
const userSettings = { theme: "dark", language: "en" };
localStorage.setItem('userSettings', JSON.stringify(userSettings));

// Load from localStorage
const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
