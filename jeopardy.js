const TIMEOUT_DURATION = 10000;
const NUM_CATEGORIES = 6;
async function getCategoryIds() {
  try {
    const response = await Promise.race([
      axios.get(`https://jservice.io/api/categories?count=${NUM_CATEGORIES}`),
      new Promise((_, reject) => {
        // Reject the promise after the specified timeout
        setTimeout(() => {
          reject(new Error("Request timed out"));
        }, TIMEOUT_DURATION);
      }),
    ]);

    const categoryIds = response.data.map(category => category.id);
    return categoryIds;
  } catch (error) {
    console.error("Error fetching category IDs: ", error);
    throw error;
  }
}

async function getCategory(catId) {
  try {
    const response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    const categoryData = {
      title: response.data.title,
      clues: response.data.clues.map(clue => ({ question: clue.question, answer: clue.answer, showing: null })),
    };
    return categoryData;
  } catch (error) {
    console.error("Error fetching category data: ", error);
    throw error;
  }
}

async function fillTable() {
    const $jeopardyTable = document.getElementById('jeopardy');
    let categoryIds;
  
    try {
      categoryIds = await getCategoryIds(); // Fetch category IDs first
    } catch (error) {
      console.error("Error fetching category IDs: ", error);
      throw error;
    }
  
    // Create the table header with category titles
    const $thead = document.createElement('thead');
    const $tr = document.createElement('tr');
    categoryIds.forEach(async (catId) => {
      const category = await getCategory(catId);
      const $th = document.createElement('th');
      $th.textContent = category.title;
      $tr.appendChild($th);
    });
    $thead.appendChild($tr);
  
    // Create the table body with question cells
    const $tbody = document.createElement('tbody');
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
      const $tr = document.createElement('tr');
      categoryIds.forEach(() => {
        const $td = document.createElement('td');
        $td.textContent = '?';
        $tr.appendChild($td);
      });
      $tbody.appendChild($tr);
    }
  
    // Clear any existing table content and append the new content
    $jeopardyTable.innerHTML = '';
    $jeopardyTable.appendChild($thead);
    $jeopardyTable.appendChild($tbody);
  
    // Add event listeners to the 'td' elements after they are created
    const cells = $tbody.querySelectorAll('td');
    cells.forEach(cell => cell.addEventListener('click', handleClick));
  }
  

function handleClick(evt) {
  const $cell = evt.target;
  const currentShowing = $cell.getAttribute('data-showing');
  if (currentShowing === null) {
    // Show the question
    const question = $cell.getAttribute('data-question');
    $cell.textContent = question;
    $cell.setAttribute('data-showing', 'question');
  } else if (currentShowing === 'question') {
    // Show the answer
    const answer = $cell.getAttribute('data-answer');
    $cell.textContent = answer;
    $cell.setAttribute('data-showing', 'answer');
  }
}

function showLoadingView() {
  const loadingSpinner = document.getElementById('loading-spinner');
  loadingSpinner.style.display = 'block';
}

function hideLoadingView() {
  const loadingSpinner = document.getElementById('loading-spinner');
  loadingSpinner.style.display = 'none';
}

async function setupAndStart() {
  showLoadingView();

  try {
    await fillTable();
    hideLoadingView();
  } catch (error) {
    hideLoadingView();
    console.error("Error setting up and starting the game: ", error);
  }
}

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', setupAndStart);

window.addEventListener('load', () => {
  const cells = document.querySelectorAll('td');
  cells.forEach(cell => cell.addEventListener('click', handleClick));
});
