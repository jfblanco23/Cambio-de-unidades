let draggedElement = null;

function dragStart(event) {
  draggedElement = event.target;
  event.dataTransfer.setData('text/plain', event.target.textContent);
}

function dragOverSlot(event) {
  event.preventDefault();
  const slot = event.target.closest('.fraction-slot');
  if (!slot || !draggedElement) return;

  const type = draggedElement.dataset.type;
  slot.classList.remove('dragover-unit', 'dragover-power');
  if (type === 'unit') {
    slot.classList.add('dragover-unit');
  } else if (type === 'power') {
    slot.classList.add('dragover-power');
  }
}

function dragLeaveSlot(event) {
  const slot = event.target.closest('.fraction-slot');
  if (slot) slot.classList.remove('dragover-unit', 'dragover-power');
}

function drop(event, exerciseId) {
  event.preventDefault();
  const slot = event.target.closest('.fraction-slot');
  if (!slot || !draggedElement) {
    draggedElement = null;
    return;
  }

  slot.classList.remove('dragover-unit', 'dragover-power');
  slot.innerHTML = '';

  const clone = draggedElement.cloneNode(true);
  clone.draggable = false;
  clone.classList.remove('draggable', 'draggable-unit', 'draggable-power');
  clone.classList.add('dropped');
  slot.appendChild(clone);

  if (clone.dataset.type === 'unit') {
    const unitClasses = [...clone.classList].filter(c => c.startsWith('unit-'));
    if (unitClasses.length > 0) {
      slot.className = 'fraction-slot ' + 'color-' + unitClasses[0].substring(5);
    }
  } else {
    slot.className = 'fraction-slot';
  }

  draggedElement = null;
}

function getSlotContent(slotId) {
  const slot = document.getElementById(slotId);
  const child = slot.querySelector('.dropped');
  return child ? {
    value: child.dataset.value,
    latex: child.dataset.latex || '',
    power: child.dataset.power !== undefined ? parseInt(child.dataset.power) : (child.dataset.value === '1' ? 0 : null)
  } : null;
}

function renderMath(element) {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise)
    MathJax.typesetPromise([element]).catch(console.warn);
}

function checkAnswer(exerciseId) {
  let feedbackEl, resultDiv, slotElements, allFilled, isCorrect, mathTeX, errorMessage;

  if (exerciseId === 'ex1') {
    const slots = {
      n1p: getSlotContent('ex1-num1-power'), n1u: getSlotContent('ex1-num1-unit'),
      d1p: getSlotContent('ex1-den1-power'), d1u: getSlotContent('ex1-den1-unit')
    };
    feedbackEl = document.getElementById('ex1-feedback');
    resultDiv = document.getElementById('ex1-result');
    slotElements = ['ex1-num1-power','ex1-num1-unit','ex1-den1-power','ex1-den1-unit']
      .map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 4 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    isCorrect = slots.n1p.value === "10^1" && slots.n1u.value === "dm" && slots.d1p.value === "1" && slots.d1u.value === "m";
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Perfecto! Usaste correctamente la relación lineal al cuadrado.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        2{,}25\\,\\mathrm{m}^2
        = 2{,}25\\,\\mathrm{m}^2 \\times \\left( \\frac{10\\,\\mathrm{dm}}{1\\,\\mathrm{m}} \\right)^2
        = 2{,}25 \\times 10^{2}\\,\\mathrm{dm}^2
        = 225\\,\\mathrm{dm}^2
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debes usar la relación \\( \\left( \\frac{10\\,\\mathrm{dm}}{1\\,\\mathrm{m}} \\right)^2 \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex2') {
    const slots = {
      n1p: getSlotContent('ex2-num1-power'), n1u: getSlotContent('ex2-num1-unit'),
      d1p: getSlotContent('ex2-den1-power'), d1u: getSlotContent('ex2-den1-unit')
    };
    feedbackEl = document.getElementById('ex2-feedback');
    resultDiv = document.getElementById('ex2-result');
    slotElements = ['ex2-num1-power','ex2-num1-unit','ex2-den1-power','ex2-den1-unit']
      .map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 4 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    isCorrect = slots.n1p.value === "1" && slots.n1u.value === "m" && slots.d1p.value === "10^2" && slots.d1u.value === "cm";
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Muy bien, usaste la relación lineal correctamente para convertir al cuadrado.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        1850{,}2\\,\\mathrm{cm}^2
        = 1850{,}2\\,\\mathrm{cm}^2 \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^2
        = 1850{,}2 \\times 10^{-4}\\,\\mathrm{m}^2
        = 0{,}18502\\,\\mathrm{m}^2
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa \\( \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^2 \\) para la conversión.";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex3') {
    // CORREGIDO: Conversión correcta cm² → m² → dam²
    const slots = {
      n1p: getSlotContent('ex3-num1-power'), n1u: getSlotContent('ex3-num1-unit'),
      d1p: getSlotContent('ex3-den1-power'), d1u: getSlotContent('ex3-den1-unit'),
      n2p: getSlotContent('ex3-num2-power'), n2u: getSlotContent('ex3-num2-unit'),
      d2p: getSlotContent('ex3-den2-power'), d2u: getSlotContent('ex3-den2-unit')
    };
    feedbackEl = document.getElementById('ex3-feedback');
    resultDiv = document.getElementById('ex3-result');
    slotElements = ['ex3-num1-power','ex3-num1-unit','ex3-den1-power','ex3-den1-unit',
                    'ex3-num2-power','ex3-num2-unit','ex3-den2-power','ex3-den2-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: cm² → m² usa (1 m / 10² cm)² y m² → dam² usa (1 dam / 10¹ m)²
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^2" && slots.d1u.value === "cm" &&
      slots.n2p.value === "1" && slots.n2u.value === "dam" &&
      slots.d2p.value === "10^1" && slots.d2u.value === "m";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión en dos pasos: cm² → m² → dam².";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        500000\\,\\mathrm{cm}^2
        = 500000\\,\\mathrm{cm}^2 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^2
        \\times \\left( \\frac{1\\,\\mathrm{dam}}{10^{1}\\,\\mathrm{m}} \\right)^2
        = 500000 \\times 10^{-4} \\times 10^{-2}\\,\\mathrm{dam}^2
        = 500000 \\times 10^{-6}\\,\\mathrm{dam}^2
        = 0.5\\,\\mathrm{dam}^2
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa la relación correcta: primero cm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\) y luego m→dam con \\( \\frac{1\\,\\mathrm{dam}}{10^{1}\\,\\mathrm{m}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex4') {
    const slots = {
      n1p: getSlotContent('ex4-num1-power'), n1u: getSlotContent('ex4-num1-unit'),
      d1p: getSlotContent('ex4-den1-power'), d1u: getSlotContent('ex4-den1-unit'),
      n2p: getSlotContent('ex4-num2-power'), n2u: getSlotContent('ex4-num2-unit'),
      d2p: getSlotContent('ex4-den2-power'), d2u: getSlotContent('ex4-den2-unit')
    };
    feedbackEl = document.getElementById('ex4-feedback');
    resultDiv = document.getElementById('ex4-result');
    slotElements = ['ex4-num1-power','ex4-num1-unit','ex4-den1-power','ex4-den1-unit',
                    'ex4-num2-power','ex4-num2-unit','ex4-den2-power','ex4-den2-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: dm² → m² usa (1 m / 10¹ dm)² y m² → km² usa (1 km / 10³ m)²
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^1" && slots.d1u.value === "dm" &&
      slots.n2p.value === "1" && slots.n2u.value === "km" &&
      slots.d2p.value === "10^3" && slots.d2u.value === "m";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión en dos pasos: dm² → m² → km².";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        1200\\,\\mathrm{dm}^2
        = 1200\\,\\mathrm{dm}^2 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}} \\right)^2
        \\times \\left( \\frac{1\\,\\mathrm{km}}{10^{3}\\,\\mathrm{m}} \\right)^2
        = 1200 \\times 10^{-2} \\times 10^{-6}\\,\\mathrm{km}^2
        = 1200 \\times 10^{-8}\\,\\mathrm{km}^2
        = 0.000012\\,\\mathrm{km}^2
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa la relación correcta: primero dm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}} \\) y luego m→km con \\( \\frac{1\\,\\mathrm{km}}{10^{3}\\,\\mathrm{m}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }
}

function resetExercise(exerciseId) {
  let slots = [];
  if (exerciseId === 'ex1') {
    slots = ['ex1-num1-power','ex1-num1-unit','ex1-den1-power','ex1-den1-unit'];
  } else if (exerciseId === 'ex2') {
    slots = ['ex2-num1-power','ex2-num1-unit','ex2-den1-power','ex2-den1-unit'];
  } else if (exerciseId === 'ex3') {
    slots = ['ex3-num1-power','ex3-num1-unit','ex3-den1-power','ex3-den1-unit',
             'ex3-num2-power','ex3-num2-unit','ex3-den2-power','ex3-den2-unit'];
  } else if (exerciseId === 'ex4') {
    slots = ['ex4-num1-power','ex4-num1-unit','ex4-den1-power','ex4-den1-unit',
             'ex4-num2-power','ex4-num2-unit','ex4-den2-power','ex4-den2-unit'];
  }
  
  slots.forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = `<span class="placeholder">${id.includes('power') ? 'Potencia' : 'Unidad'}</span>`;
    el.className = "fraction-slot";
  });
  
  document.getElementById(`${exerciseId}-feedback`).innerHTML = '';
  document.getElementById(`${exerciseId}-feedback`).className = 'feedback';
  document.getElementById(`${exerciseId}-result`).classList.remove('show');
}

function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('dragover', e => e.preventDefault());
  document.body.addEventListener('drop', e => {
    e.preventDefault();
    draggedElement = null;
  });
});