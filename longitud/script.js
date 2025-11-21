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
  if (slot) {
    slot.classList.remove('dragover-unit', 'dragover-power');
  }
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

  // Color the slot based on the unit color if dropped element is a unit
  if (clone.dataset.type === 'unit') {
    const unitClasses = [...clone.classList].filter(c => c.startsWith('unit-'));
    if (unitClasses.length > 0) {
      slot.className = 'fraction-slot ' + 'color-' + unitClasses[0].substring(5);
    }
  } else {
    // For power, remove color class to keep neutral style
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
    power: child.dataset.power ? parseInt(child.dataset.power) : (child.dataset.value === '1' ? 0 : null)
  } : null;
}

function renderMath(element) {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    MathJax.typesetPromise([element]).catch(console.warn);
  }
}

function checkAnswer(exerciseId) {
  let feedbackEl, resultDiv, slotElements, allFilled, isCorrect, mathTeX, errorMessage;

  if (exerciseId === 'e1') {
    const slots = {
      n1p: getSlotContent('e1-num1-power'), n1u: getSlotContent('e1-num1-unit'),
      d1p: getSlotContent('e1-den1-power'), d1u: getSlotContent('e1-den1-unit'),
      n2p: getSlotContent('e1-num2-power'), n2u: getSlotContent('e1-num2-unit'),
      d2p: getSlotContent('e1-den2-power'), d2u: getSlotContent('e1-den2-unit')
    };

    feedbackEl = document.getElementById('e1-feedback');
    resultDiv = document.getElementById('e1-result');
    slotElements = [
      'e1-num1-power', 'e1-num1-unit', 'e1-den1-power', 'e1-den1-unit',
      'e1-num2-power', 'e1-num2-unit', 'e1-den2-power', 'e1-den2-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^12" && slots.d1u.value === "pm" &&
      slots.n2p.value === "1" && slots.n2u.value === "km" &&
      slots.d2p.value === "10^3" && slots.d2u.value === "m";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Perfecto! Conversión en dos pasos: pm → m → km.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        750\\,\\mathrm{pm}
        = 750\\,\\mathrm{pm} \\times \\frac{1\\,\\mathrm{m}}{10^{12}\\,\\mathrm{pm}}
        \\times \\frac{1\\,\\mathrm{km}}{10^{3}\\,\\mathrm{m}}
        = 7.5 \\times 10^{-13}\\,\\mathrm{km}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa: \\(\\frac{1\\,\\mathrm{m}}{10^{12}\\,\\mathrm{pm}}\\) y \\(\\frac{1\\,\\mathrm{km}}{10^{3}\\,\\mathrm{m}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'e2') {
    const slots = {
      n1p: getSlotContent('e2-num1-power'), n1u: getSlotContent('e2-num1-unit'),
      d1p: getSlotContent('e2-den1-power'), d1u: getSlotContent('e2-den1-unit'),
      n2p: getSlotContent('e2-num2-power'), n2u: getSlotContent('e2-num2-unit'),
      d2p: getSlotContent('e2-den2-power'), d2u: getSlotContent('e2-den2-unit')
    };

    feedbackEl = document.getElementById('e2-feedback');
    resultDiv = document.getElementById('e2-result');
    slotElements = [
      'e2-num1-power', 'e2-num1-unit', 'e2-den1-power', 'e2-den1-unit',
      'e2-num2-power', 'e2-num2-unit', 'e2-den2-power', 'e2-den2-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^3" && slots.d1u.value === "mm" &&
      slots.n2p.value === "1" && slots.n2u.value === "hm" &&
      slots.d2p.value === "10^2" && slots.d2u.value === "m";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Perfecto! Conversión en dos pasos.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        4200\\,\\mathrm{mm}
        = 4.2 \\times 10^{3}\\,\\mathrm{mm}
        \\times \\frac{1\\,\\mathrm{m}}{10^{3}\\,\\mathrm{mm}}
        \\times \\frac{1\\,\\mathrm{hm}}{10^{2}\\,\\mathrm{m}}
        = 0.042\\,\\mathrm{hm}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa: \\(\\frac{1\\,\\mathrm{m}}{10^{3}\\,\\mathrm{mm}}\\) y \\(\\frac{1\\,\\mathrm{hm}}{10^{2}\\,\\mathrm{m}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'e3') {
    const slots = {
      np: getSlotContent('e3-num-power'), nu: getSlotContent('e3-num-unit'),
      dp: getSlotContent('e3-den-power'), du: getSlotContent('e3-den-unit')
    };

    feedbackEl = document.getElementById('e3-feedback');
    resultDiv = document.getElementById('e3-result');
    slotElements = [
      'e3-num-power', 'e3-num-unit', 'e3-den-power', 'e3-den-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 4 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      slots.np.value === "1" && slots.nu.value === "m" &&
      slots.dp.value === "10^1" && slots.du.value === "dm";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Correcto! Conversión directa.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        5.6\\,\\mathrm{dm}
        = 5.6\\,\\mathrm{dm} \\times \\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}}
        = 0.56\\,\\mathrm{m}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa \\(\\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'e4') {
    const slots = {
      n1p: getSlotContent('e4-num1-power'), n1u: getSlotContent('e4-num1-unit'),
      d1p: getSlotContent('e4-den1-power'), d1u: getSlotContent('e4-den1-unit'),
      n2p: getSlotContent('e4-num2-power'), n2u: getSlotContent('e4-num2-unit'),
      d2p: getSlotContent('e4-den2-power'), d2u: getSlotContent('e4-den2-unit')
    };

    feedbackEl = document.getElementById('e4-feedback');
    resultDiv = document.getElementById('e4-result');
    slotElements = [
      'e4-num1-power', 'e4-num1-unit', 'e4-den1-power', 'e4-den1-unit',
      'e4-num2-power', 'e4-num2-unit', 'e4-den2-power', 'e4-den2-unit'
    ].map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      slots.n1p.value === "10^6" && slots.n1u.value === "m" &&
      slots.d1p.value === "1" && slots.d1u.value === "Mm" &&
      slots.n2p.value === "10^2" && slots.n2u.value === "cm" &&
      slots.d2p.value === "1" && slots.d2u.value === "m";

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ ¡Impresionante! Conversión perfecta.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        3.2\\,\\mathrm{Mm}
        = 3.2\\,\\mathrm{Mm} \\times \\frac{10^{6}\\,\\mathrm{m}}{1\\,\\mathrm{Mm}}
        \\times \\frac{10^{2}\\,\\mathrm{cm}}{1\\,\\mathrm{m}}
        = 3.2 \\times 10^{8}\\,\\mathrm{cm}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa: \\(\\frac{10^{6}\\,\\mathrm{m}}{1\\,\\mathrm{Mm}}\\) y \\(\\frac{10^{2}\\,\\mathrm{cm}}{1\\,\\mathrm{m}}\\).";
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
    slots = ['e1-num1-power', 'e1-num1-unit', 'e1-den1-power', 'e1-den1-unit',
             'e1-num2-power', 'e1-num2-unit', 'e1-den2-power', 'e1-den2-unit'];
  } else if (exerciseId === 'e2') {
    slots = ['e2-num1-power', 'e2-num1-unit', 'e2-den1-power', 'e2-den1-unit',
             'e2-num2-power', 'e2-num2-unit', 'e2-den2-power', 'e2-den2-unit'];
  } else if (exerciseId === 'e3') {
    slots = ['e3-num-power', 'e3-num-unit', 'e3-den-power', 'e3-den-unit'];
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
    slots = ['e1-num1-power', 'e1-num1-unit', 'e1-den1-power', 'e1-den1-unit',
             'e1-num2-power', 'e1-num2-unit', 'e1-den2-power', 'e1-den2-unit'];
  } else if (exerciseId === 'e2') {
    slots = ['e2-num1-power', 'e2-num1-unit', 'e2-den1-power', 'e2-den1-unit',
             'e2-num2-power', 'e2-num2-unit', 'e2-den2-power', 'e2-den2-unit'];
  } else if (exerciseId === 'e3') {
    slots = ['e3-num-power', 'e3-num-unit', 'e3-den-power', 'e3-den-unit'];
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