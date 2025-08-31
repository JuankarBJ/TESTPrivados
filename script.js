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
    
    // --- Variables de Estado Globales ---
    let configData = [];
    let questionsForTest = [];

    // --- LÓGICA DE CONFIGURACIÓN ---
    async function initializeApp() {
        try {
            const response = await fetch('config.json');
            configData = (await response.json()).tests;
            renderMateriaCards();
            updateAvailableQuestions();
        } catch (error) {
            materiasContainerEl.innerHTML = `<p style="color:red;">Error al cargar 'config.json'. Revisa que el archivo exista y no tenga errores de sintaxis.</p>`;
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

    // --- LÓGICA PARA INICIAR EL TEST ---
    startButtonEl.addEventListener('click', async () => {
        setupContainerEl.innerHTML = '<h2>Cargando y preparando preguntas, por favor espera...</h2>';
        
        const numQuestionsRequested = parseInt(numQuestionsInputEl.value, 10);
        const checkedBoxes = Array.from(materiasContainerEl.querySelectorAll('input[type="checkbox"]:checked'));
        
        const sources = checkedBoxes.map(box => {
            const config = configData.find(t => t.id === box.id);
            return {
                path: config.valor,
                available: parseInt(config.total_preguntas, 10)
            };
        });
        const totalAvailableQuestions = sources.reduce((sum, source) => sum + source.available, 0);

        let questionsToFetchFromEachSource = sources.map(source => ({
            ...source,
            count: Math.round((source.available / totalAvailableQuestions) * numQuestionsRequested)
        }));

        let currentSum = questionsToFetchFromEachSource.reduce((sum, source) => sum + source.count, 0);
        let i = 0;
        while (currentSum < numQuestionsRequested) {
            questionsToFetchFromEachSource[i % sources.length].count++;
            currentSum++;
            i++;
        }
        while (currentSum > numQuestionsRequested) {
            questionsToFetchFromEachSource[i % sources.length].count--;
            currentSum--;
            i++;
        }

        try {
            const promises = questionsToFetchFromEachSource.map(source => 
                fetch(source.path)
                    .then(res => res.json())
                    .then(questions => {
                        questions.sort(() => Math.random() - 0.5);
                        return questions.slice(0, source.count);
                    })
            );

            const questionSubsets = await Promise.all(promises);
            questionsForTest = questionSubsets.flat();
            questionsForTest.sort(() => Math.random() - 0.5);
            
            startQuiz();

        } catch (error) {
            setupContainerEl.innerHTML = `<p style="color:red;">Error al cargar archivos de preguntas. Revisa que los nombres en 'config.json' sean correctos y que los archivos existan.</p>`;
        }
    });

    // --- MOTOR DEL TEST Y REVISIÓN ---
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
            questionBlock.innerHTML = `
                <div class="question-header">
                    <span class="question-number">${index + 1}.</span>
                    <div class="question-content">
                        <span class="question-theme">${question.tema}</span>
                        <p class="question-text">${question.pregunta}</p>
                    </div>
                </div>
                <div class="options-group" data-question-index="${index}">
                    ${optionsHTML}
                </div>
                <div class="explanation hidden"></div>
            `;
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

    function calculateAndShowResults() {
        let correct = 0, incorrect = 0, unanswered = 0;

        // --- INICIO DE LA NUEVA LÓGICA ---
        // 1. Contar preguntas por tema mientras se calculan los resultados
        const themeCounts = {};
        questionsForTest.forEach((q, i) => {
            // Contar el tema
            themeCounts[q.tema] = (themeCounts[q.tema] || 0) + 1;

            // Contar aciertos y fallos
            const selectedOption = document.querySelector(`input[name="pregunta-${i}"]:checked`);
            if (!selectedOption) {
                unanswered++;
            } else if (selectedOption.value === q.respuestaCorrecta) {
                correct++;
            } else {
                incorrect++;
            }
        });

        // 2. Crear el HTML para el desglose de temas
        let breakdownHTML = '<ul class="results-breakdown">';
        for (const theme in themeCounts) {
            breakdownHTML += `<li><span>${theme}</span><strong>${themeCounts[theme]} p.</strong></li>`;
        }
        breakdownHTML += '</ul>';
        // --- FIN DE LA NUEVA LÓGICA ---

        const netScore = correct - (incorrect / 3);
        let finalGrade = Math.max(0, (netScore / questionsForTest.length) * 10);
        
        resultsContainerEl.innerHTML = `
            <h1>Resultados del Test</h1>
            <div class="results-summary">
                <p>Respuestas Correctas: <strong style="color:var(--success);">${correct}</strong></p>
                <p>Respuestas Incorrectas: <strong style="color:var(--danger);">${incorrect}</strong></p>
                <p>Sin Contestar: <strong>${unanswered}</strong></p>
                
                <hr>
                <h4>Desglose por Tema</h4>
                ${breakdownHTML}
                <hr>

                <p>Puntos Netos: <strong>${netScore.toFixed(3)}</strong></p>
            </div>
            <div class="final-grade-container">
                <p>Nota Final:</p><p class="final-grade">${finalGrade.toFixed(2)} / 10</p>
            </div>
            <div class="results-buttons">
                <button id="review-button">Revisar Test</button>
                <button id="restart-button">Hacer otro test</button>
            </div>`;
        
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

    modalOverlayEl.addEventListener('click', (e) => { if (e.target === modalOverlayEl) hideModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlayEl.classList.contains('visible')) hideModal(); });
    
    initializeApp();
});