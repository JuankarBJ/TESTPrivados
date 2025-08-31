document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM (Pantalla de Configuración) ---
    const setupContainerEl = document.getElementById('setup-container');
    const materiasContainerEl = document.getElementById('materias-container');
    const totalAvailableEl = document.getElementById('total-available-questions');
    const numQuestionsSliderEl = document.getElementById('num-questions-slider');
    const numQuestionsInputEl = document.getElementById('num-questions-input');
    const startButtonEl = document.getElementById('start-button');

    // --- Referencias a elementos del DOM (Pantalla de Test y Resultados) ---
    const quizContainerEl = document.getElementById('quiz-container');
    const resultsContainerEl = document.getElementById('results-container');
    const quizTitleEl = document.getElementById('quiz-title');
    const questionCounterEl = document.getElementById('question-counter');
    const questionGridEl = document.getElementById('question-grid');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainerEl = document.getElementById('options-container');
    const reviewFeedbackAreaEl = document.getElementById('review-feedback-area');
    const explanationTextEl = document.getElementById('explanation-text');
    const prevButtonEl = document.getElementById('prev-button');
    const nextButtonEl = document.getElementById('next-button');
    const finishButtonEl = document.getElementById('finish-button');
    
    // --- Variables de Estado Globales ---
    let configData = [];
    let questionsForTest = [];
    let userAnswers = [];
    let currentQuestionIndex = 0;
    let appState = 'SETUP'; // SETUP, TESTING, RESULTS, REVIEW

    // --- LÓGICA DE LA PANTALLA DE CONFIGURACIÓN ---

    async function initializeApp() {
        try {
            const response = await fetch('config.json');
            configData = (await response.json()).tests;
            renderMateriaCards();
        } catch (error) {
            materiasContainerEl.innerHTML = `<p style="color:red;">Error: No se pudo cargar el archivo 'config.json'.</p>`;
        }
    }

    function renderMateriaCards() {
        materiasContainerEl.innerHTML = '';
        configData.forEach(test => {
            const card = document.createElement('div');
            card.classList.add('materia-card');
            card.innerHTML = `
                <input type="checkbox" id="${test.id}" data-questions="${test.total_preguntas}" value="${test.valor}">
                <label for="${test.id}">${test.nombre}</label>
                <div class="materia-info"><span>${test.total_preguntas} preguntas disponibles</span></div>`;
            materiasContainerEl.appendChild(card);
        });
        materiasContainerEl.addEventListener('change', updateAvailableQuestions);
    }

    function updateAvailableQuestions() {
        const checkedBoxes = materiasContainerEl.querySelectorAll('input[type="checkbox"]:checked');
        let totalQuestions = 0;
        checkedBoxes.forEach(box => {
            totalQuestions += parseInt(box.dataset.questions, 10);
        });
        totalAvailableEl.textContent = totalQuestions;
        
        numQuestionsSliderEl.max = totalQuestions > 0 ? totalQuestions : 100;
        numQuestionsInputEl.max = totalQuestions > 0 ? totalQuestions : 100;
        if (parseInt(numQuestionsInputEl.value, 10) > totalQuestions) {
            numQuestionsInputEl.value = totalQuestions;
            numQuestionsSliderEl.value = totalQuestions;
        }
        
        startButtonEl.disabled = (checkedBoxes.length === 0 || totalQuestions === 0 || numQuestionsInputEl.value < 1);
    }
    
    function syncNumberInputs(e) {
        const value = e.target.value;
        if (parseInt(value) > parseInt(numQuestionsInputEl.max)) {
            e.target.value = numQuestionsInputEl.max;
        }
        numQuestionsSliderEl.value = e.target.value;
        numQuestionsInputEl.value = e.target.value;
        updateAvailableQuestions(); // Re-validar el botón de inicio
    }
    numQuestionsSliderEl.addEventListener('input', syncNumberInputs);
    numQuestionsInputEl.addEventListener('input', syncNumberInputs);

    // --- LÓGICA PARA INICIAR EL TEST ---
    
    startButtonEl.addEventListener('click', async () => {
        const checkedBoxes = materiasContainerEl.querySelectorAll('input[type="checkbox"]:checked');
        const filesToLoad = Array.from(checkedBoxes).map(box => box.value);
        const numQuestions = parseInt(numQuestionsInputEl.value, 10);

        setupContainerEl.innerHTML = '<h2>Cargando preguntas, por favor espera...</h2>';
        
        try {
            const promises = filesToLoad.map(file => fetch(file).then(res => res.json()));
            const questionArrays = await Promise.all(promises);
            const allQuestions = questionArrays.flat();
            
            allQuestions.sort(() => Math.random() - 0.5);
            const selectedQuestions = allQuestions.slice(0, numQuestions);
            
            // **FIX: Conectamos con el motor del test, pasando las preguntas cargadas**
            startQuiz(selectedQuestions);
            
        } catch (error) {
            setupContainerEl.innerHTML = `<p style="color:red;">Error al cargar uno de los archivos de preguntas. Revisa que los nombres en 'config.json' sean correctos.</p>`;
        }
    });

    // --- MOTOR DEL TEST Y REVISIÓN ---

    function startQuiz(loadedQuestions) {
        appState = 'TESTING';
        questionsForTest = loadedQuestions;
        userAnswers = new Array(questionsForTest.length).fill(null);
        currentQuestionIndex = 0;
        
        setupContainerEl.classList.add('hidden');
        resultsContainerEl.classList.add('hidden');
        quizContainerEl.innerHTML = `
            <div id="quiz-header">
                <h2 id="quiz-title">Test en Progreso</h2>
                <div id="question-counter"></div>
            </div>
            <div id="question-grid"></div>
            <div id="question-area">
                <p id="question-text"></p>
                <div id="options-container"></div>
            </div>
            <div id="review-feedback-area" class="hidden">
                <p id="explanation-text"></p>
            </div>
            <div id="quiz-navigation">
                <button id="prev-button">Anterior</button>
                <button id="next-button">Siguiente</button>
                <button id="finish-button">Finalizar Test</button>
            </div>`;
        quizContainerEl.classList.remove('hidden');

        // Re-asignar listeners a los nuevos elementos del DOM
        const prevBtn = document.getElementById('prev-button');
        const nextBtn = document.getElementById('next-button');
        const finishBtn = document.getElementById('finish-button');
        prevBtn.addEventListener('click', () => navigateToQuestion(currentQuestionIndex - 1));
        nextBtn.addEventListener('click', () => navigateToQuestion(currentQuestionIndex + 1));
        finishBtn.addEventListener('click', finishTest);

        renderQuestionGrid();
        navigateToQuestion(0);
    }
    
    function renderQuestionGrid() {
        const grid = quizContainerEl.querySelector('#question-grid');
        grid.innerHTML = '';
        questionsForTest.forEach((_, index) => {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.textContent = index + 1;
            gridItem.dataset.index = index;
            gridItem.addEventListener('click', () => navigateToQuestion(index));
            grid.appendChild(gridItem);
        });
    }

    function navigateToQuestion(index) {
        if (index < 0 || index >= questionsForTest.length) return;
        currentQuestionIndex = index;

        if (appState === 'TESTING') showQuestionForTest(index);
        else if (appState === 'REVIEW') showQuestionInReview(index);
    }

    function showQuestionForTest(index) {
        const question = questionsForTest[index];
        const qText = quizContainerEl.querySelector('#question-text');
        const optsContainer = quizContainerEl.querySelector('#options-container');

        qText.textContent = question.pregunta;
        optsContainer.innerHTML = '';
        
        for (const key in question.opciones) {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.dataset.key = key;
            button.innerHTML = `<b>${key.toUpperCase()}.</b> ${question.opciones[key]}`;
            if (userAnswers[index] === key) button.classList.add('selected');
            button.addEventListener('click', selectAnswer);
            optsContainer.appendChild(button);
        }
        updateUI();
    }
    
    function selectAnswer(e) {
        const selectedKey = e.currentTarget.dataset.key;
        userAnswers[currentQuestionIndex] = (userAnswers[currentQuestionIndex] === selectedKey) ? null : selectedKey;
        
        const gridItem = quizContainerEl.querySelector(`[data-index="${currentQuestionIndex}"]`);
        gridItem.classList.toggle('answered', userAnswers[currentQuestionIndex] !== null);
        showQuestionForTest(currentQuestionIndex);
    }

    function updateUI() {
        quizContainerEl.querySelector('#question-counter').innerHTML = `Pregunta <span>${currentQuestionIndex + 1}</span>/<span>${questionsForTest.length}</span>`;
        quizContainerEl.querySelectorAll('.grid-item').forEach(item => item.classList.remove('active'));
        quizContainerEl.querySelector(`[data-index="${currentQuestionIndex}"]`).classList.add('active');
        quizContainerEl.querySelector('#prev-button').disabled = currentQuestionIndex === 0;
        quizContainerEl.querySelector('#next-button').disabled = currentQuestionIndex === questionsForTest.length - 1;
    }

    function finishTest() {
        const unansweredCount = userAnswers.filter(a => a === null).length;
        if (confirm(`Has dejado ${unansweredCount} preguntas sin contestar. ¿Estás seguro de que quieres finalizar?`)) {
            calculateAndShowResults();
        }
    }

    function calculateAndShowResults() {
        appState = 'RESULTS';
        let correct = 0, incorrect = 0, unanswered = 0;
        questionsForTest.forEach((q, i) => {
            if (userAnswers[i] === null) unanswered++;
            else if (userAnswers[i] === q.respuestaCorrecta) correct++;
            else incorrect++;
        });
        const netScore = correct - (incorrect / 3);
        let finalGrade = Math.max(0, (netScore / questionsForTest.length) * 10);

        resultsContainerEl.innerHTML = `
            <h1>Resultados del Test</h1>
            <div class="results-summary">
                <p>Respuestas Correctas: <strong style="color:var(--success);">${correct}</strong></p>
                <p>Respuestas Incorrectas: <strong style="color:var(--danger);">${incorrect}</strong></p>
                <p>Sin Contestar: <strong>${unanswered}</strong></p><hr>
                <p>Puntos Netos (Aciertos - Errores/3): <strong>${netScore.toFixed(3)}</strong></p>
            </div>
            <div class="final-grade-container" style="background-color:var(--primary-color); color:white; padding:20px; border-radius:10px; text-align:center; margin:20px 0;">
                <p style="margin:0;">Nota Final:</p><p style="font-size:3em; font-weight:bold; margin:0;">${finalGrade.toFixed(2)} / 10</p>
            </div>
            <div class="results-buttons" style="display:flex; justify-content:space-between; margin-top:30px;">
                <button id="review-button" style="width:48%; padding:15px; font-size:1.1em; font-weight:bold; color:white; background-color:var(--primary-color); border:none; border-radius:8px; cursor:pointer;">Revisar Test</button>
                <button onclick="location.reload()" style="width:48%; padding:15px; font-size:1.1em; font-weight:bold; color:white; background-color:var(--secondary-color); border:none; border-radius:8px; cursor:pointer;">Hacer otro test</button>
            </div>`;
        quizContainerEl.classList.add('hidden');
        resultsContainerEl.classList.remove('hidden');

        document.getElementById('review-button').addEventListener('click', enterReviewMode);
    }
    
    function enterReviewMode() {
        appState = 'REVIEW';
        resultsContainerEl.classList.add('hidden');
        quizContainerEl.classList.remove('hidden');
        quizContainerEl.querySelector('#quiz-title').textContent = "Modo Revisión";
        quizContainerEl.querySelector('#finish-button').style.display = 'none';

        const grid = quizContainerEl.querySelector('#question-grid');
        grid.querySelectorAll('.grid-item').forEach((item, index) => {
            item.classList.remove('answered', 'active');
            if (userAnswers[index] === null) item.classList.add('unanswered');
            else if (userAnswers[index] === questionsForTest[index].respuestaCorrecta) item.classList.add('correct');
            else item.classList.add('incorrect');
        });
        navigateToQuestion(0);
    }
    
    function showQuestionInReview(index) {
        const question = questionsForTest[index];
        const userAnswer = userAnswers[index];
        const correctKey = question.respuestaCorrecta;

        const qText = quizContainerEl.querySelector('#question-text');
        const optsContainer = quizContainerEl.querySelector('#options-container');
        const feedbackArea = quizContainerEl.querySelector('#review-feedback-area');
        const explanationArea = quizContainerEl.querySelector('#explanation-text');

        qText.textContent = question.pregunta;
        optsContainer.innerHTML = '';
        
        for (const key in question.opciones) {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.innerHTML = `<b>${key.toUpperCase()}.</b> ${question.opciones[key]}`;
            if (key === correctKey) button.classList.add('correct');
            else if (key === userAnswer) button.classList.add('incorrect');
            optsContainer.appendChild(button);
        }
        
        explanationArea.innerHTML = question.explicacion;
        feedbackArea.classList.remove('hidden');
        updateUI();
    }

    // Iniciar la aplicación
    initializeApp();
});