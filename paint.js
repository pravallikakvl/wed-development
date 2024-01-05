// paint.js

const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImg = document.querySelector(".save-img"),
  ctx = canvas.getContext("2d");

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColor = "#000";

const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
  setCanvasSize();
  setCanvasBackground();
});

const setCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Set willReadFrequently attribute to true
  canvas.willReadFrequently = true;
};

window.addEventListener("resize", () => {
  setCanvasSize();
  setCanvasBackground();
});

const drawRect = (e) => {
  ctx.beginPath();
  if (!fillColor.checked) {
    ctx.strokeRect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
  } else {
    ctx.fillRect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
  }
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(Math.pow(e.offsetX - prevMouseX, 2) + Math.pow(e.offsetY - prevMouseY, 2));
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
};

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
  });
});

colorPicker.addEventListener("input", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  selectedColor = colorPicker.value;
});

clearCanvas.addEventListener("click", () => {
  const confirmClear = confirm("Are you sure you want to clear the canvas?");
  if (confirmClear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  }
});

// ... (existing code)

saveImg.addEventListener("click", () => {
const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  const imageData = canvas.toDataURL();

  // Convert base64 data to Blob
  const blobData = dataURItoBlob(imageData);

  const formData = new FormData();
  formData.append('image', blobData, `drawing_${Date.now()}.png`);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Image saved:', data.imageUrl);
      // Handle success (e.g., display a success message)
    })
    .catch(error => {
      console.error('Error saving image:', error.message);
      // Handle error (e.g., display an error message)
    });
    alert('image saved');
});

function dataURItoBlob(dataURI) {
  // Split the data URI into metadata and base64 data parts
  const [metadata, base64Data] = dataURI.split(',');

  // Convert base64 to binary data
  const binaryData = atob(base64Data);

  // Create a Uint8Array from binary data
  const uint8Array = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }

  // Create a Blob from Uint8Array
  return new Blob([uint8Array], { type: metadata.split(':')[1].split(';')[0] });
}

function saveImageToMongoDB(imageData) {
  const formData = new FormData();
  formData.append('image', imageData);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Image saved:', data.imageUrl);
      // Handle success (e.g., display a success message)
    })
    .catch(error => {
      console.error('Error saving image:', error.message);
      // Handle error (e.g., display an error message)
    });
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));
