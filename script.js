document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const setupContainerEl = document.getElementById('setup-container');
    const quizPageLayoutEl = document.getElementById('quiz-page-layout');
    const modalOverlayEl = document.getElementById('modal-overlay'); // Nuevo
    const resultsContainerEl = document.getElementById('results-container');
    // ... (el resto de referencias se mantienen igual)
    const materiasContainerEl = document.getElementById('materias-container');
    const totalAvailableEl = document.getElementById('total-available-questions');
    const numQuestionsSliderEl = document.getElementById('num-questions-slider');
    const numQuestionsInputEl = document.getElementById('num-questions-input');
    const startButtonEl = document.getElementById('start-button');
    
    // --- Variables de Estado Globales ---
    let configData = [];
    let questionsForTest = [];

    // --- LÓGICA DE CONFIGURACIÓN (sin cambios) ---
    async function initializeApp() { /* ...código anterior sin cambios... */ }
    function renderMateriaCards() { /* ...código anterior sin cambios... */ }
    function updateAvailableQuestions() { /* ...código anterior sin cambios... */ }
    function syncNumberInputs(e) { /* ...código anterior sin cambios... */ }
    // ... (listeners de configuración sin cambios)
    
    // --- INICIO DEL TEST (sin cambios) ---
    startButtonEl.addEventListener('click', async () => { /* ...código anterior sin cambios... */ });

    function startQuiz() { /* ...código anterior sin cambios... */ }

    // --- FUNCIÓN PARA MOSTRAR LA VENTANA MODAL ---
    function showModal() {
        modalOverlayEl.classList.remove('hidden');
        setTimeout(() => { // Pequeño delay para que la transición CSS funcione
            modalOverlayEl.classList.add('visible');
            document.body.classList.add('modal-open'); // Bloquear scroll del fondo
        }, 10);
    }

    // --- FUNCIÓN PARA OCULTAR LA VENTANA MODAL ---
    function hideModal() {
        modalOverlayEl.classList.remove('visible');
        document.body.classList.remove('modal-open'); // Desbloquear scroll
        setTimeout(() => {
            modalOverlayEl.classList.add('hidden');
        }, 300); // Esperar que la transición de opacidad termine
    }

    // --- CÁLCULO DE RESULTADOS (MODIFICADO) ---
    function calculateAndShowResults() {
        let correct = 0, incorrect = 0, unanswered = 0;
        questionsForTest.forEach((q, i) => {
            const selectedOption = document.querySelector(`input[name="pregunta-${i}"]:checked`);
            if (!selectedOption) unanswered++;
            else if (selectedOption.value === q.respuestaCorrecta) correct++;
            else incorrect++;
        });

        const netScore = correct - (incorrect / 3);
        let finalGrade = Math.max(0, (netScore / questionsForTest.length) * 10);
        
        // Ya no ocultamos el quiz, el modal se superpondrá
        // quizPageLayoutEl.classList.add('hidden');
        
        resultsContainerEl.innerHTML = `
            <h1>Resultados del Test</h1>
            <div class="results-summary">
                <p>Respuestas Correctas: <strong style="color:var(--success);">${correct}</strong></p>
                <p>Respuestas Incorrectas: <strong style="color:var(--danger);">${incorrect}</strong></p>
                <p>Sin Contestar: <strong>${unanswered}</strong></p><hr>
                <p>Puntos Netos: <strong>${netScore.toFixed(3)}</strong></p>
            </div>
            <div class="final-grade-container">
                <p>Nota Final:</p><p class="final-grade">${finalGrade.toFixed(2)} / 10</p>
            </div>
            <div class="results-buttons">
                <button id="review-button">Revisar Test</button>
                <button id="restart-button">Hacer otro test</button>
            </div>`;
        
        showModal(); // Mostrar el modal en lugar del div
        
        document.getElementById('review-button').addEventListener('click', enterReviewMode);
        document.getElementById('restart-button').addEventListener('click', () => location.reload());
    }
    
    // --- MODO REVISIÓN (MODIFICADO) ---
    function enterReviewMode() {
        hideModal(); // Ocultar el modal antes de entrar en revisión

        // El resto de la lógica de revisión no cambia
        document.getElementById('quiz-title').textContent = "Modo Revisión";
        document.getElementById('finish-button-container').classList.add('hidden');
        
        questionsForTest.forEach((q, i) => {
            const questionBlock = document.getElementById(`question-${i}`);
            const optionsGroup = questionBlock.querySelector('.options-group');
            const explanationDiv = questionBlock.querySelector('.explanation');
            const gridItem = document.querySelector(`#question-grid a:nth-child(${i + 1})`);
            
            optionsGroup.classList.add('review-mode');
            const userChoice = document.querySelector(`input[name="pregunta-${i}"]:checked`);
            
            if (!userChoice) gridItem.classList.add('unanswered');
            else if (userChoice.value === q.respuestaCorrecta) gridItem.classList.add('correct');
            else {
                gridItem.classList.add('incorrect');
                document.querySelector(`label[for="${userChoice.id}"]`).classList.add('incorrect');
            }
            
            document.querySelector(`label[for="q${i}_${q.respuestaCorrecta}"]`).classList.add('correct');
            explanationDiv.innerHTML = q.explicacion;
            explanationDiv.classList.remove('hidden');
            optionsGroup.querySelectorAll('input').forEach(radio => radio.disabled = true);
        });

        quizPageLayoutEl.scrollIntoView({ behavior: 'smooth' });
    }

    // --- INICIALIZACIÓN Y EVENTOS ADICIONALES DEL MODAL ---
    
    // Cerrar modal al hacer clic en el fondo oscuro
    modalOverlayEl.addEventListener('click', (e) => {
        if (e.target === modalOverlayEl) {
            hideModal();
        }
    });

    // Cerrar modal al pulsar la tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlayEl.classList.contains('visible')) {
            hideModal();
        }
    });
    
    initializeApp();

    // El resto de funciones que no he incluido aquí se mantienen exactamente igual
    // Esto es para no pegar todo el bloque de código de nuevo.
    // Solo debes añadir/modificar las funciones `calculateAndShowResults` y `enterReviewMode`
    // y añadir las nuevas `showModal`, `hideModal` y los dos listeners del modal.
    // ***** PARA FACILITAR, A CONTINUACIÓN EL CÓDIGO COMPLETO *****
});


// =========================================================================================
// === CÓDIGO COMPLETO DE SCRIPT.JS PARA COPIAR Y PEGAR (INCLUYE LAS PARTES SIN CAMBIOS) ===
// =========================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const setupContainerEl = document.getElementById('setup-container');
    const materiasContainerEl = document.getElementById('materias-container');
    const totalAvailableEl = document.getElementById('total-available-questions');
    const numQuestionsSliderEl = document.getElementById('num-questions-slider');
    const numQuestionsInputEl = document.getElementById('num-questions-input');
    const startButtonEl = document.getElementById('start-button');
    const quizPageLayoutEl = document.getElementById('quiz-page-layout');
    const modalOverlayEl = document.getElementById('modal-overlay');
    const resultsContainerEl = document.getElementById('results-container');
    
    let configData = [], questionsForTest = [];

    async function initializeApp() {
        try {
            const response = await fetch('config.json');
            configData = (await response.json()).tests;
            renderMateriaCards();
            updateAvailableQuestions();
        } catch (error) {
            materiasContainerEl.innerHTML = `<p style="color:red;">Error al cargar 'config.json'.</p>`;
        }
    }

    function renderMateriaCards() {
        materiasContainerEl.innerHTML = '';
        configData.forEach(test => {
            const card = document.createElement('div');
            card.classList.add('materia-card');
            card.innerHTML = `<input type="checkbox" id="${test.id}" data-questions="${test.total_preguntas}" value="${test.valor}"><label for="${test.id}">${test.nombre}</label><div class="materia-info"><span>${test.total_preguntas} preguntas disponibles</span></div>`;
            materiasContainerEl.appendChild(card);
        });
        materiasContainerEl.addEventListener('change', updateAvailableQuestions);
    }

    function updateAvailableQuestions() {
        const checkedBoxes = materiasContainerEl.querySelectorAll('input[type="checkbox"]:checked');
        let totalQuestions = 0;
        checkedBoxes.forEach(box => { totalQuestions += parseInt(box.dataset.questions, 10); });
        totalAvailableEl.textContent = totalQuestions;
        numQuestionsSliderEl.max = totalQuestions > 0 ? totalQuestions : 1;
        numQuestionsInputEl.max = totalQuestions > 0 ? totalQuestions : 1;
        numQuestionsSliderEl.min = totalQuestions > 0 ? 1 : 1;
        numQuestionsInputEl.min = totalQuestions > 0 ? 1 : 1;
        if (parseInt(numQuestionsInputEl.value, 10) > totalQuestions || parseInt(numQuestionsInputEl.value, 10) < 1) {
            numQuestionsInputEl.value = totalQuestions > 0 ? Math.min(25, totalQuestions) : 1;
            numQuestionsSliderEl.value = numQuestionsInputEl.value;
        } else if (checkedBoxes.length > 0 && totalQuestions > 0 && parseInt(numQuestionsInputEl.value, 10) === 0) {
            numQuestionsInputEl.value = 1;
            numQuestionsSliderEl.value = 1;
        }
        startButtonEl.disabled = (checkedBoxes.length === 0 || totalQuestions === 0 || parseInt(numQuestionsInputEl.value, 10) < 1);
    }

    function syncNumberInputs(e) {
        let value = parseInt(e.target.value, 10);
        const max = parseInt(numQuestionsInputEl.max, 10);
        const min = parseInt(numQuestionsInputEl.min, 10);
        if (isNaN(value)) value = min;
        if (value > max) value = max;
        if (value < min) value = min;
        numQuestionsSliderEl.value = value;
        numQuestionsInputEl.value = value;
        updateAvailableQuestions();
    }
    numQuestionsSliderEl.addEventListener('input', syncNumberInputs);
    numQuestionsInputEl.addEventListener('input', syncNumberInputs);

    startButtonEl.addEventListener('click', async () => {
        const checkedBoxes = materiasContainerEl.querySelectorAll('input[type="checkbox"]:checked');
        const filesToLoad = Array.from(checkedBoxes).map(box => configData.find(t => t.id === box.id).valor);
        const numQuestions = parseInt(numQuestionsInputEl.value, 10);
        setupContainerEl.innerHTML = '<h2>Cargando preguntas, por favor espera...</h2>';
        try {
            const promises = filesToLoad.map(file => fetch(file).then(res => res.json()));
            const questionArrays = await Promise.all(promises);
            const allQuestions = questionArrays.flat();
            allQuestions.sort(() => Math.random() - 0.5);
            questionsForTest = allQuestions.slice(0, numQuestions);
            startQuiz();
        } catch (error) {
            setupContainerEl.innerHTML = `<p style="color:red;">Error al cargar archivos de preguntas.</p>`;
        }
    });

    function startQuiz() {
        setupContainerEl.classList.add('hidden');
        quizPageLayoutEl.classList.remove('hidden');
        const allQuestionsContainer = document.getElementById('all-questions-container');
        const questionGrid = document.getElementById('question-grid');
        allQuestionsContainer.innerHTML = '';
        questionGrid.innerHTML = '';
        questionsForTest.forEach((question, index) => {
            let optionsHTML = '';
            for (const key in question.opciones) {
                optionsHTML += `<input type="radio" name="pregunta-${index}" id="q${index}_${key}" value="${key}"><label for="q${index}_${key}"><b>${key.toUpperCase()}.</b> ${question.opciones[key]}</label>`;
            }
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            questionBlock.id = `question-${index}`;
            questionBlock.innerHTML = `<div class="question-header"><span class="question-number">${index + 1}.</span><p class="question-text">${question.pregunta}</p></div><div class="options-group" data-question-index="${index}">${optionsHTML}</div><div class="explanation hidden"></div>`;
            allQuestionsContainer.appendChild(questionBlock);
            const gridItem = document.createElement('a');
            gridItem.classList.add('grid-item');
            gridItem.textContent = index + 1;
            gridItem.href = `#question-${index}`;
            gridItem.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(`question-${index}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            questionGrid.appendChild(gridItem);
        });
        allQuestionsContainer.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const questionIndex = e.target.name.split('-')[1];
                document.querySelector(`#question-grid a:nth-child(${parseInt(questionIndex) + 1})`).classList.add('answered');
            }
        });
        document.getElementById('finish-button').addEventListener('click', calculateAndShowResults);
    }

    function showModal() {
        modalOverlayEl.classList.remove('hidden');
        setTimeout(() => {
            modalOverlayEl.classList.add('visible');
            document.body.classList.add('modal-open');
        }, 10);
    }

    function hideModal() {
        modalOverlayEl.classList.remove('visible');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            modalOverlayEl.classList.add('hidden');
        }, 300);
    }

    function calculateAndShowResults() {
        let correct = 0, incorrect = 0, unanswered = 0;
        questionsForTest.forEach((q, i) => {
            const selectedOption = document.querySelector(`input[name="pregunta-${i}"]:checked`);
            if (!selectedOption) unanswered++;
            else if (selectedOption.value === q.respuestaCorrecta) correct++;
            else incorrect++;
        });
        const netScore = correct - (incorrect / 3);
        let finalGrade = Math.max(0, (netScore / questionsForTest.length) * 10);
        resultsContainerEl.innerHTML = `<h1>Resultados del Test</h1><div class="results-summary"><p>Respuestas Correctas: <strong style="color:var(--success);">${correct}</strong></p><p>Respuestas Incorrectas: <strong style="color:var(--danger);">${incorrect}</strong></p><p>Sin Contestar: <strong>${unanswered}</strong></p><hr><p>Puntos Netos: <strong>${netScore.toFixed(3)}</strong></p></div><div class="final-grade-container"><p>Nota Final:</p><p class="final-grade">${finalGrade.toFixed(2)} / 10</p></div><div class="results-buttons"><button id="review-button">Revisar Test</button><button id="restart-button">Hacer otro test</button></div>`;
        showModal();
        document.getElementById('review-button').addEventListener('click', enterReviewMode);
        document.getElementById('restart-button').addEventListener('click', () => location.reload());
    }
    
    function enterReviewMode() {
        hideModal();
        document.getElementById('quiz-title').textContent = "Modo Revisión";
        document.getElementById('finish-button-container').classList.add('hidden');
        questionsForTest.forEach((q, i) => {
            const questionBlock = document.getElementById(`question-${i}`);
            const optionsGroup = questionBlock.querySelector('.options-group');
            const explanationDiv = questionBlock.querySelector('.explanation');
            const gridItem = document.querySelector(`#question-grid a:nth-child(${i + 1})`);
            optionsGroup.classList.add('review-mode');
            const userChoice = document.querySelector(`input[name="pregunta-${i}"]:checked`);
            if (!userChoice) gridItem.classList.add('unanswered');
            else if (userChoice.value === q.respuestaCorrecta) gridItem.classList.add('correct');
            else {
                gridItem.classList.add('incorrect');
                if (userChoice) document.querySelector(`label[for="${userChoice.id}"]`).classList.add('incorrect');
            }
            document.querySelector(`label[for="q${i}_${q.respuestaCorrecta}"]`).classList.add('correct');
            explanationDiv.innerHTML = q.explicacion;
            explanationDiv.classList.remove('hidden');
            optionsGroup.querySelectorAll('input').forEach(radio => radio.disabled = true);
        });
        document.getElementById('quiz-page-layout').scrollIntoView({ behavior: 'smooth' });
    }

    modalOverlayEl.addEventListener('click', (e) => { if (e.target === modalOverlayEl) hideModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlayEl.classList.contains('visible')) hideModal(); });
    
    initializeApp();
});