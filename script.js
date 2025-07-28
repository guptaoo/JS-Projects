const imageContainer = document.getElementById("image-container");
const loader = document.getElementById("loader");

let loading = false;
let page = 1;
const limit = 9;

// 👇 Generate image paths like images/img-1.jpg to images/img-31.jpg
const totalImages = 31;
const imageSet = Array.from(
  { length: totalImages },
  (_, i) => `images/img-${i + 1}.jpg`
);

// 🔁 Get random images from imageSet
function getRandomImages(count) {
  const images = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * imageSet.length);
    images.push(imageSet[randomIndex]);
  }
  return images;
}

// 📦 Load and display images
async function loadImages() {
  if (loading) return;
  loading = true;
  loader.style.display = "block";

  const newImages = getRandomImages(limit);

  newImages.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    imageContainer.appendChild(img);
  });

  loader.style.display = "none";
  loading = false;
  page++;
}

// 🧭 Scroll detection
function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadImages();
  }
}

window.addEventListener("scroll", handleScroll);

// 🔰 Initial Load
loadImages();
