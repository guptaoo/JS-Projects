const totalImages = 31;

// Create an array of image paths: images/animal1.jpg to images/animal25.jpg
const images = Array.from(
  { length: totalImages },
  (_, i) => `images/img-${i + 1}.jpg`
);

const imageElement = document.getElementById("random-image");

function getRandomImage() {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

function generateImage() {
  imageElement.src = getRandomImage();
}

// Show one random image on initial page load
window.onload = () => {
  generateImage();

  // Change the image every 4 seconds
  setInterval(generateImage, 4000);
};
