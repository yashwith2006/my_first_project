const workoutDataUrl = 'data/workouts.json';

let workouts = [];

async function loadWorkouts() {
  try {
    const response = await fetch(workoutDataUrl);
    if (!response.ok) throw new Error('Unable to load workout data');
    workouts = await response.json();
    populateDatalist();
  } catch (error) {
    document.getElementById('result').innerHTML = `
      <div class="empty">
        Could not load workout data. Please make sure the server is running and try again.
      </div>
    `;
    console.error(error);
  }
}

function populateDatalist() {
  const datalist = document.getElementById('muscleList');
  workouts.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.muscle;
    datalist.appendChild(option);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getWorkoutByMuscle(input) {
  const query = (input || '').trim().toLowerCase();
  if (!query) return null;

  const exactMatch = workouts.find((item) => item.muscle.toLowerCase() === query);
  if (exactMatch) return exactMatch;

  const partialMatch = workouts.find((item) => item.muscle.toLowerCase().includes(query));
  if (partialMatch) return partialMatch;

  return workouts.find((item) => item.description.toLowerCase().includes(query));
}

function renderWorkout(workout) {
  const result = document.getElementById('result');

  if (!workout) {
    result.innerHTML = `
      <div class="empty">
        No matching muscle found. Try one of: ${workouts.map((item) => item.muscle).join(', ')}
      </div>
    `;
    return;
  }

  const exercisesHtml = workout.exercises
    .map(
      (exercise) => `
        <article class="exercise">
          <h3 class="exercise-name">${escapeHtml(exercise.name)}</h3>
          <div class="exercise-meta">
            ${escapeHtml(exercise.description)}<br />
            Sets: ${escapeHtml(exercise.sets)} • Reps: ${escapeHtml(exercise.reps)} • Rest: ${escapeHtml(exercise.rest)}
          </div>
          ${exercise.tips ? `<div class="tip">Tip: ${escapeHtml(exercise.tips)}</div>` : ''}
        </article>
      `
    )
    .join('');

  result.innerHTML = `
    <article class="card">
      <div class="muscle-header">
        <h2>${escapeHtml(workout.muscle)}</h2>
        <span class="badge">Target Muscle</span>
      </div>
      <p class="description">${escapeHtml(workout.description)}</p>
      <div class="exercise-list">
        ${exercisesHtml}
      </div>
    </article>
  `;
}

const searchBtn = document.getElementById('searchBtn');
const muscleInput = document.getElementById('muscleInput');

searchBtn.addEventListener('click', () => {
  const selected = getWorkoutByMuscle(muscleInput.value);
  renderWorkout(selected);
});

muscleInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchBtn.click();
  }
});

loadWorkouts();
