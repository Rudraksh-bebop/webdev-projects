// Typewriter effect for "Welcome To Track To Fit"
const text = "Welcome To Track To Fit";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        document.getElementById('welcome-text').innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);  // Speed of typing (100ms per character)
    }
}

// Start the typewriter effect when the page loads
window.onload = function() {
    typeWriter();
};
