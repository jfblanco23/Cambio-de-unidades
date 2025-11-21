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
    power: child.dataset.power !== undefined ? parseInt(child.dataset.power) : null
  } : null;
}

function renderMath(element) {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise)
    MathJax.typesetPromise([element]).catch(console.warn);
}

function checkAnswer(exerciseId) {
  let feedbackEl, resultDiv, slotIds, allFilled, isCorrect, mathTeX, errorMessage;

  // Función auxiliar para comparar con tolerancia en strings de potencia
  function matchesPower(given, expectedPower) {
    if (!given) return false;
    if (given.value === '1' && expectedPower === 0) return true;
    if (given.value === `10^${expectedPower}`) return true;
    if (given.value === expectedPower.toString() && expectedPower === 1) return true;
    return false;
  }

  // ———————— Ejercicio 1: 13,6 g/cm³ → kg/L ————————
  if (exerciseId === 'ex1') {
    const slots = {
      n1p: getSlotContent('ex1-num1-power'), n1u: getSlotContent('ex1-num1-unit'),
      d1p: getSlotContent('ex1-den1-power'), d1u: getSlotContent('ex1-den1-unit'),
      n2p: getSlotContent('ex1-num2-power'), n2u: getSlotContent('ex1-num2-unit'),
      d2p: getSlotContent('ex1-den2-power'), d2u: getSlotContent('ex1-den2-unit'),
      n3p: getSlotContent('ex1-num3-power'), n3u: getSlotContent('ex1-num3-unit'),
      d3p: getSlotContent('ex1-den3-power'), d3u: getSlotContent('ex1-den3-unit')
    };

    feedbackEl = document.getElementById('ex1-feedback');
    resultDiv = document.getElementById('ex1-result');
    slotIds = ['ex1-num1-power','ex1-num1-unit','ex1-den1-power','ex1-den1-unit',
               'ex1-num2-power','ex1-num2-unit','ex1-den2-power','ex1-den2-unit',
               'ex1-num3-power','ex1-num3-unit','ex1-den3-power','ex1-den3-unit'];
    const slotElements = slotIds.map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      slots.n1u.value === "kg" && slots.d1u.value === "g" && matchesPower(slots.n1p, 0) && matchesPower(slots.d1p, 3) &&
      slots.n2u.value === "cm" && slots.d2u.value === "m" && matchesPower(slots.n2p, 2) && matchesPower(slots.d2p, 0) &&
      slots.n3u.value === "m3" && slots.d3u.value === "L" && matchesPower(slots.n3p, 0) && matchesPower(slots.d3p, 3);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: g→kg, cm³→m³ y m³→L.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        13{,}6\\,\\frac{\\mathrm{g}}{\\mathrm{cm}^3}
        = 13{,}6\\,\\frac{\\mathrm{g}}{\\mathrm{cm}^3}
        \\times \\frac{1\\,\\mathrm{kg}}{10^{3}\\,\\mathrm{g}}
        \\times \\left( \\frac{10^{2}\\,\\mathrm{cm}}{1\\,\\mathrm{m}} \\right)^{3}
        \\times \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}}
        \\]
        \\[
        = 13{,}6 \\times \\frac{1}{10^{3}} \\times 10^{6} \\times \\frac{1}{10^{3}}\\,\\frac{\\mathrm{kg}}{\\mathrm{L}}
        = 13{,}6 \\times 10^{0} = 13{,}6\\,\\frac{\\mathrm{kg}}{\\mathrm{L}}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debe ser: \(\\dfrac{\\mathrm{kg}}{10^3\\,\\mathrm{g}}\), \\(\\left(\\dfrac{10^2\\,\\mathrm{cm}}{\\mathrm{m}}\\right)^3\\), \\(\\dfrac{\\mathrm{m}^3}{10^3\\,\\mathrm{L}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }

  // ———————— Ejercicio 2: 1000 kg/m³ → g/mL ————————
  else if (exerciseId === 'ex2') {
    const slots = {
      n1p: getSlotContent('ex2-num1-power'), n1u: getSlotContent('ex2-num1-unit'),
      d1p: getSlotContent('ex2-den1-power'), d1u: getSlotContent('ex2-den1-unit'),
      n2p: getSlotContent('ex2-num2-power'), n2u: getSlotContent('ex2-num2-unit'),
      d2p: getSlotContent('ex2-den2-power'), d2u: getSlotContent('ex2-den2-unit'),
      n3p: getSlotContent('ex2-num3-power'), n3u: getSlotContent('ex2-num3-unit'),
      d3p: getSlotContent('ex2-den3-power'), d3u: getSlotContent('ex2-den3-unit')
    };

    feedbackEl = document.getElementById('ex2-feedback');
    resultDiv = document.getElementById('ex2-result');
    slotIds = ['ex2-num1-power','ex2-num1-unit','ex2-den1-power','ex2-den1-unit',
               'ex2-num2-power','ex2-num2-unit','ex2-den2-power','ex2-den2-unit',
               'ex2-num3-power','ex2-num3-unit','ex2-den3-power','ex2-den3-unit'];
    const slotElements = slotIds.map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    // Según tu .tex: × (10³ g / kg) × (m³ / 10³ L) × (L / 10³ mL)
    isCorrect =
      slots.n1u.value === "g" && slots.d1u.value === "kg" && matchesPower(slots.n1p, 3) && matchesPower(slots.d1p, 0) &&
      slots.n2u.value === "m3" && slots.d2u.value === "L" && matchesPower(slots.n2p, 0) && matchesPower(slots.d2p, 3) &&
      slots.n3u.value === "L" && slots.d3u.value === "mL" && matchesPower(slots.n3p, 0) && matchesPower(slots.d3p, 3);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: kg→g, m³→L (inversa), L→mL (inversa).";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        1000\\,\\frac{\\mathrm{kg}}{\\mathrm{m}^3}
        = 1000\\,\\frac{\\mathrm{kg}}{\\mathrm{m}^3}
        \\times \\frac{10^{3}\\,\\mathrm{g}}{1\\,\\mathrm{kg}}
        \\times \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}}
        \\times \\frac{1\\,\\mathrm{L}}{10^{3}\\,\\mathrm{mL}}
        \\]
        \\[
        = 1000 \\times 10^{3} \\times \\frac{1}{10^{3}} \\times \\frac{1}{10^{3}}\\,\\frac{\\mathrm{g}}{\\mathrm{mL}}
        = 1\\,\\frac{\\mathrm{g}}{\\mathrm{mL}}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debe ser: \\(\\dfrac{10^3\\,\\mathrm{g}}{\\mathrm{kg}}\\), \\(\\dfrac{\\mathrm{m}^3}{10^3\\,\\mathrm{L}}\\), \\(\\dfrac{\\mathrm{L}}{10^3\\,\\mathrm{mL}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }

  // ———————— Ejercicio 3: sin cambios ————————
  else if (exerciseId === 'ex3') {
    const slots = {
      n1p: getSlotContent('ex3-num1-power'), n1u: getSlotContent('ex3-num1-unit'),
      d1p: getSlotContent('ex3-den1-power'), d1u: getSlotContent('ex3-den1-unit'),
      n2p: getSlotContent('ex3-num2-power'), n2u: getSlotContent('ex3-num2-unit'),
      d2p: getSlotContent('ex3-den2-power'), d2u: getSlotContent('ex3-den2-unit')
    };

    feedbackEl = document.getElementById('ex3-feedback');
    resultDiv = document.getElementById('ex3-result');
    slotIds = ['ex3-num1-power','ex3-num1-unit','ex3-den1-power','ex3-den1-unit',
               'ex3-num2-power','ex3-num2-unit','ex3-den2-power','ex3-den2-unit'];
    const slotElements = slotIds.map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      slots.n1u.value === "mg" && slots.d1u.value === "g" && matchesPower(slots.n1p, 3) && matchesPower(slots.d1p, 0) &&
      slots.n2u.value === "mL" && slots.d2u.value === "L" && matchesPower(slots.n2p, 3) && matchesPower(slots.d2p, 0);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: g→mg y mL→L.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        4{,}5\\,\\frac{\\mathrm{g}}{\\mathrm{mL}}
        = 4{,}5\\,\\frac{\\mathrm{g}}{\\mathrm{mL}}
        \\times \\frac{10^{3}\\,\\mathrm{mg}}{1\\,\\mathrm{g}}
        \\times \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}}
        = 4{,}5 \\times 10^{6}\\,\\frac{\\mathrm{mg}}{\\mathrm{L}}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debe ser: \\(\\dfrac{10^3\\,\\mathrm{mg}}{\\mathrm{g}}\\) y \\(\\dfrac{10^3\\,\\mathrm{mL}}{\\mathrm{L}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }

  // ———————— Ejercicio 4: 2,75 g/cL → hg/m³ ————————
  else if (exerciseId === 'ex4') {
    const slots = {
      n1p: getSlotContent('ex4-num1-power'), n1u: getSlotContent('ex4-num1-unit'),
      d1p: getSlotContent('ex4-den1-power'), d1u: getSlotContent('ex4-den1-unit'),
      n2p: getSlotContent('ex4-num2-power'), n2u: getSlotContent('ex4-num2-unit'),
      d2p: getSlotContent('ex4-den2-power'), d2u: getSlotContent('ex4-den2-unit'),
      n3p: getSlotContent('ex4-num3-power'), n3u: getSlotContent('ex4-num3-unit'),
      d3p: getSlotContent('ex4-den3-power'), d3u: getSlotContent('ex4-den3-unit')
    };

    feedbackEl = document.getElementById('ex4-feedback');
    resultDiv = document.getElementById('ex4-result');
    slotIds = ['ex4-num1-power','ex4-num1-unit','ex4-den1-power','ex4-den1-unit',
               'ex4-num2-power','ex4-num2-unit','ex4-den2-power','ex4-den2-unit',
               'ex4-num3-power','ex4-num3-unit','ex4-den3-power','ex4-den3-unit'];
    const slotElements = slotIds.map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    // Según tu .tex: × (hg / 10² g) × (10² cL / L) × (10³ L / m³)
    isCorrect =
      slots.n1u.value === "hg" && slots.d1u.value === "g" && matchesPower(slots.n1p, 0) && matchesPower(slots.d1p, 2) &&
      slots.n2u.value === "cL" && slots.d2u.value === "L" && matchesPower(slots.n2p, 2) && matchesPower(slots.d2p, 0) &&
      slots.n3u.value === "L" && slots.d3u.value === "m3" && matchesPower(slots.n3p, 3) && matchesPower(slots.d3p, 0);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: g→hg, cL→L, L→m³.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        2{,}75\\,\\frac{\\mathrm{g}}{\\mathrm{cL}}
        = 2{,}75\\,\\frac{\\mathrm{g}}{\\mathrm{cL}}
        \\times \\frac{1\\,\\mathrm{hg}}{10^{2}\\,\\mathrm{g}}
        \\times \\frac{10^{2}\\,\\mathrm{cL}}{1\\,\\mathrm{L}}
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\]
        \\[
        = 2{,}75 \\times \\frac{1}{10^{2}} \\times 10^{2} \\times 10^{3}\\,\\frac{\\mathrm{hg}}{\\mathrm{m}^3}
        = 2{,}75 \\times 10^{3} = 2750\\,\\frac{\\mathrm{hg}}{\\mathrm{m}^3}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debe ser: \\(\\dfrac{\\mathrm{hg}}{10^2\\,\\mathrm{g}}\\), \\(\\dfrac{10^2\\,\\mathrm{cL}}{\\mathrm{L}}\\), \\(\\dfrac{10^3\\,\\mathrm{L}}{\\mathrm{m}^3}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }

  // ———————— Ejercicio 5: 80 mg/cm³ → g/L ————————
  else if (exerciseId === 'ex5') {
    const slots = {
      n1p: getSlotContent('ex5-num1-power'), n1u: getSlotContent('ex5-num1-unit'),
      d1p: getSlotContent('ex5-den1-power'), d1u: getSlotContent('ex5-den1-unit'),
      n2p: getSlotContent('ex5-num2-power'), n2u: getSlotContent('ex5-num2-unit'),
      d2p: getSlotContent('ex5-den2-power'), d2u: getSlotContent('ex5-den2-unit'),
      n3p: getSlotContent('ex5-num3-power'), n3u: getSlotContent('ex5-num3-unit'),
      d3p: getSlotContent('ex5-den3-power'), d3u: getSlotContent('ex5-den3-unit')
    };

    feedbackEl = document.getElementById('ex5-feedback');
    resultDiv = document.getElementById('ex5-result');
    slotIds = ['ex5-num1-power','ex5-num1-unit','ex5-den1-power','ex5-den1-unit',
               'ex5-num2-power','ex5-num2-unit','ex5-den2-power','ex5-den2-unit',
               'ex5-num3-power','ex5-num3-unit','ex5-den3-power','ex5-den3-unit'];
    const slotElements = slotIds.map(id => document.getElementById(id));

    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    // Igual que ex1, pero mg→g
    isCorrect =
      slots.n1u.value === "g" && slots.d1u.value === "mg" && matchesPower(slots.n1p, 0) && matchesPower(slots.d1p, 3) &&
      slots.n2u.value === "cm" && slots.d2u.value === "m" && matchesPower(slots.n2p, 2) && matchesPower(slots.d2p, 0) &&
      slots.n3u.value === "m3" && slots.d3u.value === "L" && matchesPower(slots.n3p, 0) && matchesPower(slots.d3p, 3);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: mg→g, cm³→m³ y m³→L.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        80\\,\\frac{\\mathrm{mg}}{\\mathrm{cm}^3}
        = 80\\,\\frac{\\mathrm{mg}}{\\mathrm{cm}^3}
        \\times \\frac{1\\,\\mathrm{g}}{10^{3}\\,\\mathrm{mg}}
        \\times \\left( \\frac{10^{2}\\,\\mathrm{cm}}{1\\,\\mathrm{m}} \\right)^{3}
        \\times \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}}
        \\]
        \\[
        = 80 \\times \\frac{1}{10^{3}} \\times 10^{6} \\times \\frac{1}{10^{3}}\\,\\frac{\\mathrm{g}}{\\mathrm{L}}
        = 80 \\times 10^{0} = 80\\,\\frac{\\mathrm{g}}{\\mathrm{L}}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debe ser: \\(\\dfrac{\\mathrm{g}}{10^3\\,\\mathrm{mg}}\\), \\(\\left(\\dfrac{10^2\\,\\mathrm{cm}}{\\mathrm{m}}\\right)^3\\), \\(\\dfrac{\\mathrm{m}^3}{10^3\\,\\mathrm{L}}\\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  }
}

function resetExercise(exerciseId) {
  const maps = {
    ex1: 12, ex2: 12, ex3: 8, ex4: 12, ex5: 12
  };
  const count = maps[exerciseId];
  const slots = [];
  for (let i = 1; i <= count / 2; i++) {
    slots.push(`${exerciseId}-num${i}-power`, `${exerciseId}-num${i}-unit`,
               `${exerciseId}-den${i}-power`, `${exerciseId}-den${i}-unit`);
  }

  slots.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="placeholder">${id.includes('power') ? 'Potencia' : 'Unidad'}</span>`;
      el.className = "fraction-slot";
    }
  });

  const feedbackEl = document.getElementById(`${exerciseId}-feedback`);
  const resultDiv = document.getElementById(`${exerciseId}-result`);
  if (feedbackEl) feedbackEl.innerHTML = '';
  if (feedbackEl) feedbackEl.className = 'feedback';
  if (resultDiv) resultDiv.classList.remove('show');
}

function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  
  const button = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.textContent.includes(tabName.slice(2)));
  if (button) button.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('dragover', e => e.preventDefault());
  document.body.addEventListener('drop', e => {
    e.preventDefault();
    draggedElement = null;
  });
});