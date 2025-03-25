// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, limit, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASiih6kfJVkJxe9tIWK0qo0hrsaZQHnQA",
    authDomain: "track-to-fit---fitness-tracker.firebaseapp.com",
    projectId: "track-to-fit---fitness-tracker",
    storageBucket: "track-to-fit---fitness-tracker.appspot.com",
    messagingSenderId: "211949186700",
    appId: "1:211949186700:web:da8951580495c671c6d5a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// References to the DOM elements
const workoutNameInput = document.getElementById('workout-name');
const caloriesBurnedInput = document.getElementById('calories-burned');
const workoutList = document.getElementById('workout-items');
const totalCaloriesElement = document.getElementById('total-calories');

// Variables to track total calories, workouts, and badges
let totalCalories = 0;
let workoutData = [];
let workoutLabels = [];

// Initialize Chart.js Bar Chart
const caloriesChartCtx = document.getElementById('caloriesChart').getContext('2d');
let caloriesChart = new Chart(caloriesChartCtx, {
    type: 'bar',
    data: {
        labels: workoutLabels,
        datasets: [{
            label: 'Calories Burned',
            data: workoutData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Function to update the chart
function updateChart() {
    caloriesChart.update();
}

// Badge System Logic: Check if user qualifies for any badges
function checkBadges() {
    if (waterIntake >= 8) {
        document.getElementById('badge-hydration').style.display = 'inline-block';
    }
    if (totalCalories >= 500) {
        document.getElementById('badge-calorie').style.display = 'inline-block';
    }
    if (workoutStreak >= 5) {
        document.getElementById('badge-streak').style.display = 'inline-block';
    }
}

// Add workout button event
document.getElementById('add-workout-btn').addEventListener('click', async function() {
    const workoutName = workoutNameInput.value;
    const caloriesBurned = parseInt(caloriesBurnedInput.value);

    if (workoutName && caloriesBurned > 0) {
        // Save workout to Firestore
        await addDoc(collection(db, 'workouts'), {
            name: workoutName,
            calories: caloriesBurned,
            timestamp: serverTimestamp()
        });

        // Add workout to list
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${workoutName} - ${caloriesBurned} Calories
            <span class="delete-btn">X</span>
        `;
        workoutList.appendChild(listItem);

        // Add delete functionality
        listItem.querySelector('.delete-btn').addEventListener('click', async function() {
            const q = query(collection(db, 'workouts'), where('name', '==', workoutName), limit(1));
            const workoutRef = await getDocs(q);

            workoutRef.forEach(async doc => {
                await deleteDoc(doc(doc.id));
            });

            listItem.remove();
            totalCalories -= caloriesBurned;
            totalCaloriesElement.textContent = `Total Calories Burned: ${totalCalories}`;
            updateChart();
            checkBadges(); // Check badges after deleting a workout
        });

        // Update total calories
        totalCalories += caloriesBurned;
        totalCaloriesElement.textContent = `Total Calories Burned: ${totalCalories}`;

        // Update chart data
        workoutLabels.push(workoutName);
        workoutData.push(caloriesBurned);
        updateChart();

        // Check badges after adding a workout
        checkBadges();
    }

    // Clear inputs
    workoutNameInput.value = '';
    caloriesBurnedInput.value = '';
});

// Run badge check when the dashboard loads
window.onload = checkBadges;

let waterCount = 0;
const maxGlasses = 8;

document.getElementById('add-water-btn').addEventListener('click', () => {
    if (waterCount < maxGlasses) {
        waterCount++;
        updateWaterStatus();
    }
});

function updateWaterStatus() {
    document.getElementById('water-intake-status').textContent = `${waterCount} / ${maxGlasses} Glasses`;
    document.getElementById('water-progress').value = waterCount;

    // Award hydration badge if goal is achieved
    if (waterCount === maxGlasses) {
        document.getElementById('badge-hydration').style.display = 'inline-block';
    }
}

document.getElementById('calculate-bmi-btn').addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('weight-input').value);
    const height = parseFloat(document.getElementById('height-input').value) / 100; // Convert cm to meters

    if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(2);
        document.getElementById('bmi-result').textContent = `Your BMI: ${bmi} (${getBMICategory(bmi)})`;
    } else {
        document.getElementById('bmi-result').textContent = "Please enter valid weight and height.";
    }
});

function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 24.9) return "Normal weight";
    if (bmi < 29.9) return "Overweight";
    return "Obesity";
}

