let questionCount = 0;


function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const toggleButton = document.getElementById('toggle-dark');
  toggleButton.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
}


function addQuestion() {
  const container = document.getElementById('questions-container');
  const block = document.createElement('div');
  block.className = 'question-block';
  block.setAttribute('data-question-id', questionCount);

  block.innerHTML = `
    <label>Question:</label>
    <input type="text" name="question-${questionCount}" placeholder="Enter your question here">

    <div class="options-container" id="options-${questionCount}">
      <label>Options:</label>
      ${generateOptionInput(questionCount, 0)}
      ${generateOptionInput(questionCount, 1)}
      ${generateOptionInput(questionCount, 2)}
      ${generateOptionInput(questionCount, 3)}
    </div>
    <button class="add-option" onclick="addOption(${questionCount})" type="button">➕ Add Option</button>

    <label>Correct Answer (choose from options):</label>
    <select name="answer-${questionCount}" id="answer-${questionCount}">
      <!-- Options will be populated dynamically -->
    </select>

    <label>Difficulty:</label>
    <select name="difficulty-${questionCount}">
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
  `;

  container.appendChild(block);


  updateAnswerDropdown(questionCount);

  questionCount++;
}


function generateOptionInput(qid, oid) {
  return `
    <div class="option-group" data-option-id="${oid}">
      <input type="text" name="option-${qid}-${oid}" placeholder="Enter option text" oninput="updateAnswerDropdown(${qid})">
      <button type="button" class="rmvbtn" onclick="removeOption(this, ${qid})">✖</button>
    </div>
  `;
}


function updateAnswerDropdown(qid) {
  const answerSelect = document.getElementById(`answer-${qid}`);
  if (!answerSelect) return;
  
  const container = document.getElementById(`options-${qid}`);
  const optionInputs = container.querySelectorAll('input');

  answerSelect.innerHTML = '';
  optionInputs.forEach(input => {
    const val = input.value.trim();

    if (val) {
      const optionElem = document.createElement('option');
      optionElem.value = val;
      optionElem.textContent = val;
      answerSelect.appendChild(optionElem);
    }
  });

  if (answerSelect.options.length === 0) {
    const optionElem = document.createElement('option');
    optionElem.value = '';
    optionElem.textContent = '-- No Options --';
    answerSelect.appendChild(optionElem);
  }
}


function addOption(qid) {
  const container = document.getElementById(`options-${qid}`);
  const currentOptions = container.querySelectorAll('.option-group').length;
  container.insertAdjacentHTML('beforeend', generateOptionInput(qid, currentOptions));
  updateAnswerDropdown(qid);
}


function removeOption(button, qid) {
  const container = document.getElementById(`options-${qid}`);

  if (container.querySelectorAll('.option-group').length > 1) {
    button.parentElement.remove();
    updateAnswerDropdown(qid);
  } else {
    alert("At least one option is required.");
  }
}


function escapeYAML(str) {
  return `"${str.replace(/"/g, '\\"')}"`;
}


function generateYML() {
  let yaml = 'questions:\n';


  for (let i = 0; i < questionCount; i++) {
    const questionInput = document.querySelector(`[name="question-${i}"]`);
    if (!questionInput) continue; 
    const question = questionInput.value.trim();
    const optionsContainer = document.getElementById(`options-${i}`);
    const optionInputs = optionsContainer.querySelectorAll('input');
    const options = [];
    optionInputs.forEach(input => {
      const val = input.value.trim();
      if (val) options.push(val);
    });
    const answerSelect = document.getElementById(`answer-${i}`);
    const answer = answerSelect.value.trim();
    const difficulty = document.querySelector(`[name="difficulty-${i}"]`).value;


    if (!question || options.length === 0 || !answer || !difficulty) continue;

    yaml += `  q${i + 1}:\n`;
    yaml += `    question: ${escapeYAML(question)}\n`;
    yaml += `    options:\n`;
    options.forEach(opt => {
      yaml += `      - ${escapeYAML(opt)}\n`;
    });
    yaml += `    answer: ${escapeYAML(answer)}\n`;
    yaml += `    difficulty: ${escapeYAML(difficulty)}\n\n`;
  }

  document.getElementById('yaml-output').value = yaml;


  const blob = new Blob([yaml], { type: 'text/yaml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'trivia.yml';
  link.click();
}

// Initialize with one question block on page load
addQuestion();
