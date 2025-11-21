let draggedElement = null;

function dragStart(event) {
  draggedElement = event.target;
  event.dataTransfer.setData('text/plain', event.target.textContent);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, exerciseId) {
  event.preventDefault();
  if (!draggedElement) return;

  const slot = event.target.closest('.fraction-slot');
  if (!slot) return;

  slot.innerHTML = '';
  const clone = draggedElement.cloneNode(true);
  clone.style.cursor = 'default';
  clone.draggable = false;
  clone.classList.remove('draggable', 'draggable-unit', 'draggable-power');
  clone.classList.add('dropped');
  slot.appendChild(clone);
  draggedElement = null;
}

function getSlotContent(slotId) {
  const slot = document.getElementById(slotId);
  const child = slot.querySelector('.dropped');
  return child ? {
    value: child.dataset.value,
    type: child.dataset.type,
    latex: child.dataset.latex || '',
    power: parseInt(child.dataset.power) || (child.dataset.value === '1' ? 0 : null)
  } : null;
}

// Función auxiliar para renderizar MathJax en un elemento
function renderMath(element) {
  if (typeof MathJax !== 'undefined') {
    MathJax.typesetPromise([element]).catch(console.error);
  }
}

function checkAnswer(exerciseId) {
  let feedbackEl, resultDiv, slotElements, allFilled, isCorrect, mathTeX, errorMessage;
  
  if (exerciseId === 'e1') {
    const slots = {
      numPower: getSlotContent('e1-num-power'),
      numUnit: getSlotContent('e1-num-unit'),
      denPower: getSlotContent('e1-den-power'),
      denUnit: getSlotContent('e1-den-unit')
    };
    
    feedbackEl = document.getElementById('e1-feedback');
    resultDiv = document.getElementById('e1-result');
    slotElements = [
      document.getElementById('e1-num-power'),
      document.getElementById('e1-num-unit'),
      document.getElementById('e1-den-power'),
      document.getElementById('e1-den-unit')
    ];
    
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.innerHTML = "⚠️ Completa los 4 espacios.";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      resetSlotStyles('e1');
      return;
    }

    isCorrect = 
      slots.numPower.value === "10³" && 
      slots.numUnit.value === "g" &&
      slots.denPower.value === "1" &&
      slots.denUnit.value === "kg";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Correcto!";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        28\\,\\mathrm{kg}
        = 28\\,\\mathrm{kg} \\times
        \\frac{10^{3}\\,\\mathrm{g}}{1\\,\\mathrm{kg}}
        = 28 \\times 10^{3}\\,\\mathrm{g}
        = 2.8 \\times 10^{4}\\,\\mathrm{g}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa \\(\\frac{10^{3}\\,\\mathrm{g}}{1\\,\\mathrm{kg}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }

  } else if (exerciseId === 'e2') {
    const slots = {
      num1Power: getSlotContent('e2-num1-power'),
      num1Unit: getSlotContent('e2-num1-unit'),
      den1Power: getSlotContent('e2-den1-power'),
      den1Unit: getSlotContent('e2-den1-unit'),
      num2Power: getSlotContent('e2-num2-power'),
      num2Unit: getSlotContent('e2-num2-unit'),
      den2Power: getSlotContent('e2-den2-power'),
      den2Unit: getSlotContent('e2-den2-unit')
    };
    
    feedbackEl = document.getElementById('e2-feedback');
    resultDiv = document.getElementById('e2-result');
    slotElements = [
      'e2-num1-power', 'e2-num1-unit', 'e2-den1-power', 'e2-den1-unit',
      'e2-num2-power', 'e2-num2-unit', 'e2-den2-power', 'e2-den2-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.innerHTML = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      resetSlotStyles('e2');
      return;
    }

    isCorrect = 
      slots.num1Power.value === "1" && slots.num1Unit.value === "g" &&
      slots.den1Power.value === "10³" && slots.den1Unit.value === "mg" &&
      slots.num2Power.value === "1" && slots.num2Unit.value === "kg" &&
      slots.den2Power.value === "10³" && slots.den2Unit.value === "g";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Perfecto! Conversión en dos pasos.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        324500\\,\\mathrm{mg}
        = 3.245 \\times 10^{5}\\,\\mathrm{mg}
        \\times \\frac{1\\,\\mathrm{g}}{10^{3}\\,\\mathrm{mg}}
        \\times \\frac{1\\,\\mathrm{kg}}{10^{3}\\,\\mathrm{g}}
        = 3.245 \\times \\frac{10^{5}}{10^{6}}\\,\\mathrm{kg}
        = 3.245 \\times 10^{-1}\\,\\mathrm{kg}
        = 0.3245\\,\\mathrm{kg}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa: \\(\\frac{1\\,\\mathrm{g}}{10^{3}\\,\\mathrm{mg}}\\) y \\(\\frac{1\\,\\mathrm{kg}}{10^{3}\\,\\mathrm{g}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }

  } else if (exerciseId === 'e3') {
    const slots = {
      num1Power: getSlotContent('e3-num1-power'),
      num1Unit: getSlotContent('e3-num1-unit'),
      den1Power: getSlotContent('e3-den1-power'),
      den1Unit: getSlotContent('e3-den1-unit'),
      num2Power: getSlotContent('e3-num2-power'),
      num2Unit: getSlotContent('e3-num2-unit'),
      den2Power: getSlotContent('e3-den2-power'),
      den2Unit: getSlotContent('e3-den2-unit')
    };
    
    feedbackEl = document.getElementById('e3-feedback');
    resultDiv = document.getElementById('e3-result');
    slotElements = [
      'e3-num1-power', 'e3-num1-unit', 'e3-den1-power', 'e3-den1-unit',
      'e3-num2-power', 'e3-num2-unit', 'e3-den2-power', 'e3-den2-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.innerHTML = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      resetSlotStyles('e3');
      return;
    }

    isCorrect = 
      slots.num1Power.value === "1" && slots.num1Unit.value === "g" &&
      slots.den1Power.value === "10⁹" && slots.den1Unit.value === "ng" &&
      slots.num2Power.value === "1" && slots.num2Unit.value === "hg" &&
      slots.den2Power.value === "10²" && slots.den2Unit.value === "g";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Excelente! Conversión correcta.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        12000000\\,\\mathrm{ng}
        = 1.2 \\times 10^{7}\\,\\mathrm{ng}
        \\times \\frac{1\\,\\mathrm{g}}{10^{9}\\,\\mathrm{ng}}
        \\times \\frac{1\\,\\mathrm{hg}}{10^{2}\\,\\mathrm{g}}
        = 1.2 \\times \\frac{10^{7}}{10^{11}}\\,\\mathrm{hg}
        = 1.2 \\times 10^{-4}\\,\\mathrm{hg}
        = 0.00012\\,\\mathrm{hg}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa: \\(\\frac{1\\,\\mathrm{g}}{10^{9}\\,\\mathrm{ng}}\\) y \\(\\frac{1\\,\\mathrm{hg}}{10^{2}\\,\\mathrm{g}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }

  } else if (exerciseId === 'e4') {
    // Ejercicio 4: 45 Tg → dag
    const slots = {
      num1Power: getSlotContent('e4-num1-power'),
      num1Unit: getSlotContent('e4-num1-unit'),
      den1Power: getSlotContent('e4-den1-power'),
      den1Unit: getSlotContent('e4-den1-unit'),
      num2Power: getSlotContent('e4-num2-power'),
      num2Unit: getSlotContent('e4-num2-unit'),
      den2Power: getSlotContent('e4-den2-power'),
      den2Unit: getSlotContent('e4-den2-unit')
    };
    
    feedbackEl = document.getElementById('e4-feedback');
    resultDiv = document.getElementById('e4-result');
    slotElements = [
      'e4-num1-power', 'e4-num1-unit', 'e4-den1-power', 'e4-den1-unit',
      'e4-num2-power', 'e4-num2-unit', 'e4-den2-power', 'e4-den2-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.innerHTML = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      resetSlotStyles('e4');
      return;
    }

    // Solución:
    // Tg → g: (10¹² g) / (1 Tg)
    // g → dag: (1 dag) / (10¹ g)
    isCorrect = 
      slots.num1Power.value === "10¹²" && slots.num1Unit.value === "g" &&
      slots.den1Power.value === "1" && slots.den1Unit.value === "Tg" &&
      slots.num2Power.value === "1" && slots.num2Unit.value === "dag" &&
      slots.den2Power.value === "10¹" && slots.den2Unit.value === "g";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Impresionante! Conversión perfecta.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        45\\,\\mathrm{Tg}
        = 45\\,\\mathrm{Tg} \\times \\frac{10^{12}\\,\\mathrm{g}}{1\\,\\mathrm{Tg}}
        \\times \\frac{1\\,\\mathrm{dag}}{10^{1}\\,\\mathrm{g}}
        = 45 \\times \\frac{10^{12}}{10^{1}}\\,\\mathrm{dag}
        = 4.5 \\times 10^{12}\\,\\mathrm{dag}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa: \\(\\frac{10^{12}\\,\\mathrm{g}}{1\\,\\mathrm{Tg}}\\) y \\(\\frac{1\\,\\mathrm{dag}}{10^{1}\\,\\mathrm{g}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }
}

function resetSlotStyles(exerciseId) {
  let slots = [];
  if (exerciseId === 'e1') {
    slots = ['e1-num-power', 'e1-num-unit', 'e1-den-power', 'e1-den-unit'];
  } else if (exerciseId === 'e2') {
    slots = ['e2-num1-power', 'e2-num1-unit', 'e2-den1-power', 'e2-den1-unit',
             'e2-num2-power', 'e2-num2-unit', 'e2-den2-power', 'e2-den2-unit'];
  } else if (exerciseId === 'e3') {
    slots = ['e3-num1-power', 'e3-num1-unit', 'e3-den1-power', 'e3-den1-unit',
             'e3-num2-power', 'e3-num2-unit', 'e3-den2-power', 'e3-den2-unit'];
  } else if (exerciseId === 'e4') {
    slots = ['e4-num1-power', 'e4-num1-unit', 'e4-den1-power', 'e4-den1-unit',
             'e4-num2-power', 'e4-num2-unit', 'e4-den2-power', 'e4-den2-unit'];
  }

  slots.forEach(id => {
    const el = document.getElementById(id);
    el.className = "fraction-slot";
    if (!el.querySelector('.dropped')) {
      el.innerHTML = `<span class="placeholder">${id.includes('power') ? 'Potencia' : 'Unidad'}</span>`;
    }
  });
}

function resetExercise(exerciseId) {
  let slots = [];
  if (exerciseId === 'e1') {
    slots = ['e1-num-power', 'e1-num-unit', 'e1-den-power', 'e1-den-unit'];
  } else if (exerciseId === 'e2') {
    slots = ['e2-num1-power', 'e2-num1-unit', 'e2-den1-power', 'e2-den1-unit',
             'e2-num2-power', 'e2-num2-unit', 'e2-den2-power', 'e2-den2-unit'];
  } else if (exerciseId === 'e3') {
    slots = ['e3-num1-power', 'e3-num1-unit', 'e3-den1-power', 'e3-den1-unit',
             'e3-num2-power', 'e3-num2-unit', 'e3-den2-power', 'e3-den2-unit'];
  } else if (exerciseId === 'e4') {
    slots = ['e4-num1-power', 'e4-num1-unit', 'e4-den1-power', 'e4-den1-unit',
             'e4-num2-power', 'e4-num2-unit', 'e4-den2-power', 'e4-den2-unit'];
  }

  slots.forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = `<span class="placeholder">${id.includes('power') ? 'Potencia' : 'Unidad'}</span>`;
    el.className = "fraction-slot";
  });
  
  document.getElementById(`${exerciseId}-feedback`).innerHTML = '';
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
