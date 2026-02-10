// ============================================
// INTRO OVERLAY WITH FLOWER PETALS
// ============================================

const petalEmojis = ["🌸", "🌺", "🌼", "🌻", "🌷", "🥀"];
const totalPetals = 28;
let remainingPetals = totalPetals;

// Generate flower petals
function generatePetals() {
  const petalsContainer = document.getElementById("petalsContainer");

  // Use window dimensions, accounting for mobile viewport issues
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Add padding to keep petals away from edges (especially for mobile)
  const padding = 60;
  const safeWidth = windowWidth - padding * 2;
  const safeHeight = windowHeight - padding * 2;

  for (let i = 0; i < totalPetals; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.textContent =
      petalEmojis[Math.floor(Math.random() * petalEmojis.length)];

    // Random position within safe area
    const x = Math.random() * safeWidth + padding;
    const y = Math.random() * safeHeight + padding;

    petal.style.left = x + "px";
    petal.style.top = y + "px";

    // Add random float animation class
    const floatClass = "petal-float-" + (Math.floor(Math.random() * 5) + 1);
    petal.classList.add(floatClass);

    // Add click/tap event
    petal.addEventListener("click", removePetal);

    // Add touch event for better mobile support
    petal.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
        removePetal(e);
      },
      { passive: false },
    );

    petalsContainer.appendChild(petal);
  }
}

// Remove petal with animation
function removePetal(e) {
  e.preventDefault();
  const petal = e.target.closest(".petal");
  if (!petal || petal.classList.contains("removing")) return;

  petal.classList.add("removing");

  // Play pop sound effect (optional - using Web Audio API)
  playPopSound();

  remainingPetals--;
  updatePetalCount();

  // Remove petal after animation
  setTimeout(() => {
    petal.remove();

    // Check if all petals are removed
    if (remainingPetals === 0) {
      revealTimer();
    }
  }, 500);
}

// Update petal counter
function updatePetalCount() {
  const petalCountElement = document.getElementById("petalCount");
  petalCountElement.textContent = remainingPetals;

  // Add pulse animation
  petalCountElement.style.transform = "scale(1.3)";
  setTimeout(() => {
    petalCountElement.style.transform = "scale(1)";
  }, 200);
}

// Reveal the countdown timer
function revealTimer() {
  const overlay = document.getElementById("introOverlay");
  const introContent = document.querySelector(".intro-content");

  // Show completion message briefly
  introContent.innerHTML = `
    <h2 class="intro-title" style="animation: fadeInScale 0.5s ease-out;">✨ Perfect! ✨</h2>
    <p class="intro-subtitle">Revealing our countdown...</p>
  `;

  // Hide overlay after delay
  setTimeout(() => {
    overlay.classList.add("hidden");

    // Remove from DOM after transition
    setTimeout(() => {
      overlay.remove();
    }, 800);
  }, 1500);
}

// Simple pop sound using Web Audio API
function playPopSound() {
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported or blocked
  }
}

// Initialize intro on page load
window.addEventListener("DOMContentLoaded", () => {
  generatePetals();

  // Add tap anywhere functionality
  const petalsContainer = document.getElementById("petalsContainer");

  petalsContainer.addEventListener("click", function (e) {
    // If clicking on a petal, the petal's own handler will fire
    // If clicking empty space, remove a random petal
    if (e.target === petalsContainer) {
      const visiblePetals = document.querySelectorAll(".petal:not(.removing)");
      if (visiblePetals.length > 0) {
        const randomPetal =
          visiblePetals[Math.floor(Math.random() * visiblePetals.length)];
        randomPetal.click();
      }
    }
  });

  // Also handle touch events for mobile
  petalsContainer.addEventListener(
    "touchstart",
    function (e) {
      if (e.target === petalsContainer) {
        e.preventDefault();
        const visiblePetals = document.querySelectorAll(
          ".petal:not(.removing)",
        );
        if (visiblePetals.length > 0) {
          const randomPetal =
            visiblePetals[Math.floor(Math.random() * visiblePetals.length)];
          randomPetal.click();
        }
      }
    },
    { passive: false },
  );
});

// ============================================
// COUNTDOWN TIMER
// ============================================

// Calculate next Friday from today
function getNextFriday() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 5 = Friday
  const daysUntilFriday = (5 - currentDay + 7) % 7 || 7; // Get days until next Friday

  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  nextFriday.setHours(23, 59, 59, 999); // Set to end of Friday

  return nextFriday.getTime();
}

// Set the target date to next Friday
const targetDate = getNextFriday();

// Update the countdown every 1 second
const countdownInterval = setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  // Calculate time units
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the time remaining with leading zeros
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(
    2,
    "0",
  );
  document.getElementById("seconds").textContent = String(seconds).padStart(
    2,
    "0",
  );

  // Add smooth number change animation
  animateValue(document.getElementById("seconds"));

  // If the countdown is finished
  if (distance < 0) {
    clearInterval(countdownInterval);
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    document.getElementById("message").textContent = "✨ It's Friday! ✨";

    // Celebrate with confetti-like animation
    createCelebration();
  }
}, 1000);

// Smooth animation for value changes
function animateValue(element) {
  element.style.transform = "scale(1.1)";
  setTimeout(() => {
    element.style.transform = "scale(1)";
  }, 200);
}

// Celebration animation
function createCelebration() {
  const hearts = ["❤️", "💕", "💖", "💗", "💓", "💝"];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.position = "fixed";
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.top = "-50px";
      heart.style.fontSize = Math.random() * 30 + 20 + "px";
      heart.style.zIndex = "1000";
      heart.style.animation = `fall ${Math.random() * 3 + 2}s linear`;
      heart.style.opacity = "0.8";
      document.body.appendChild(heart);

      setTimeout(() => heart.remove(), 5000);
    }, i * 100);
  }
}

// Add falling animation
const style = document.createElement("style");
style.textContent = `
    @keyframes fall {
        to {
            top: 100vh;
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Image upload functionality
function setupImageUpload(inputId, imageId) {
  const input = document.getElementById(inputId);
  const image = document.getElementById(imageId);

  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = function (event) {
        image.src = event.target.result;
        image.style.animation = "fadeIn 0.5s ease-in";
      };

      reader.readAsDataURL(file);
    }
  });
}

// Initialize image uploads
setupImageUpload("upload1", "image1");
setupImageUpload("upload2", "image2");

// Display target date info
console.log("Countdown to:", new Date(targetDate).toLocaleString());
