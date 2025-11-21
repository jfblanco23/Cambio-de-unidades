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

function matchesPower(given, expectedPower) {
  if (!given) return false;
  if (given.value === '1' && expectedPower === 0) return true;
  if (given.value === '10' && expectedPower === 1) return true;
  if (given.value === `10^${expectedPower}`) return true;
  return false;
}

function checkAnswer(exerciseId) {
  let feedbackEl, resultDiv, slotIds, allFilled, isCorrect, mathTeX;

  if (exerciseId === 'ex1') {
    const s = {
      n1: getSlotContent('ex1-num1-power'), n1u: getSlotContent('ex1-num1-unit'),
      d1: getSlotContent('ex1-den1-power'), d1u: getSlotContent('ex1-den1-unit'),
      n2: getSlotContent('ex1-num2-power'), n2u: getSlotContent('ex1-num2-unit'),
      d2: getSlotContent('ex1-den2-power'), d2u: getSlotContent('ex1-den2-unit'),
      n3: getSlotContent('ex1-num3-power'), n3u: getSlotContent('ex1-num3-unit'),
      d3: getSlotContent('ex1-den3-power'), d3u: getSlotContent('ex1-den3-unit')
    };
    feedbackEl = document.getElementById('ex1-feedback');
    resultDiv = document.getElementById('ex1-result');
    slotIds = ['ex1-num1-power','ex1-num1-unit','ex1-den1-power','ex1-den1-unit',
               'ex1-num2-power','ex1-num2-unit','ex1-den2-power','ex1-den2-unit',
               'ex1-num3-power','ex1-num3-unit','ex1-den3-power','ex1-den3-unit'];
    const slots = slotIds.map(id => document.getElementById(id));

    if (!Object.values(s).every(x => x)) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      s.n1u.value === "g" && s.d1u.value === "kg" && matchesPower(s.n1, 3) && matchesPower(s.d1, 0) &&
      s.n2u.value === "L" && s.d2u.value === "m3" && matchesPower(s.n2, 3) && matchesPower(s.d2, 0) &&
      s.n3u.value === "m" && s.d3u.value === "cm" && matchesPower(s.n3, 0) && matchesPower(s.d3, 2);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: kg→g, L→m³ y m→cm (inverso).";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        40\\,\\frac{\\mathrm{kg}}{\\mathrm{L}}
        = 40\\,\\frac{\\mathrm{kg}}{\\mathrm{L}}
        \\times \\frac{10^{3}\\,\\mathrm{g}}{1\\,\\mathrm{kg}}
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^{3}
        \\]
        \\[
        = 40 \\times 10^{3} \\times 10^{3} \\times 10^{-6}\\,\\frac{\\mathrm{g}}{\\mathrm{cm}^3}
        = 40\\,\\frac{\\mathrm{g}}{\\mathrm{cm}^3}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slots.forEach(el => el.className = "fraction-slot valid");
    } else {
      feedbackEl.innerHTML = "❌ Usa: \\(\\dfrac{10^3\\,\\mathrm{g}}{\\mathrm{kg}}\\), \\(\\dfrac{10^3\\,\\mathrm{L}}{\\mathrm{m}^3}\\), \\(\\left(\\dfrac{\\mathrm{m}}{10^2\\,\\mathrm{cm}}\\right)^3\\).";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slots.forEach(el => el.className = "fraction-slot invalid");
    }
  }

  // ✅ Ejercicio 2: CORREGIDO según tu LaTeX
  else if (exerciseId === 'ex2') {
    const s = {
      n1: getSlotContent('ex2-num1-power'), n1u: getSlotContent('ex2-num1-unit'),
      d1: getSlotContent('ex2-den1-power'), d1u: getSlotContent('ex2-den1-unit'),
      n2: getSlotContent('ex2-num2-power'), n2u: getSlotContent('ex2-num2-unit'),
      d2: getSlotContent('ex2-den2-power'), d2u: getSlotContent('ex2-den2-unit'),
      n3: getSlotContent('ex2-num3-power'), n3u: getSlotContent('ex2-num3-unit'),
      d3: getSlotContent('ex2-den3-power'), d3u: getSlotContent('ex2-den3-unit'),
      n4: getSlotContent('ex2-num4-power'), n4u: getSlotContent('ex2-num4-unit'),
      d4: getSlotContent('ex2-den4-power'), d4u: getSlotContent('ex2-den4-unit'),
      n5: getSlotContent('ex2-num5-power'), n5u: getSlotContent('ex2-num5-unit'),
      d5: getSlotContent('ex2-den5-power'), d5u: getSlotContent('ex2-den5-unit')
    };
    feedbackEl = document.getElementById('ex2-feedback');
    resultDiv = document.getElementById('ex2-result');
    slotIds = ['ex2-num1-power','ex2-num1-unit','ex2-den1-power','ex2-den1-unit',
               'ex2-num2-power','ex2-num2-unit','ex2-den2-power','ex2-den2-unit',
               'ex2-num3-power','ex2-num3-unit','ex2-den3-power','ex2-den3-unit',
               'ex2-num4-power','ex2-num4-unit','ex2-den4-power','ex2-den4-unit',
               'ex2-num5-power','ex2-num5-unit','ex2-den5-power','ex2-den5-unit'];
    const slots = slotIds.map(id => document.getElementById(id));

    if (!Object.values(s).every(x => x)) {
      feedbackEl.textContent = "⚠️ Completa los 20 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    // ✅ Solución según tu documento:
    // × (1 g / 10³ mg) × (10 dg / 1 g) × (10³ mm / 1 m)³ × (1 m³ / 10³ L) × (1 L / 10² cL)
    isCorrect =
      s.n1u.value === "g" && s.d1u.value === "mg" && matchesPower(s.n1, 0) && matchesPower(s.d1, 3) &&
      s.n2u.value === "dg" && s.d2u.value === "g" && matchesPower(s.n2, 1) && matchesPower(s.d2, 0) &&
      s.n3u.value === "mm" && s.d3u.value === "m" && matchesPower(s.n3, 3) && matchesPower(s.d3, 0) &&
      s.n4u.value === "m3" && s.d4u.value === "L" && matchesPower(s.n4, 0) && matchesPower(s.d4, 3) &&
      s.n5u.value === "L" && s.d5u.value === "cL" && matchesPower(s.n5, 0) && matchesPower(s.d5, 2);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión paso a paso según modelo.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        12\\,\\frac{\\mathrm{mg}}{\\mathrm{mm}^3}
        = 12\\,\\frac{\\mathrm{mg}}{\\mathrm{mm}^3}
        \\times \\frac{1\\,\\mathrm{g}}{10^{3}\\,\\mathrm{mg}}
        \\times \\frac{10\\,\\mathrm{dg}}{1\\,\\mathrm{g}}
        \\times \\left( \\frac{10^{3}\\,\\mathrm{mm}}{1\\,\\mathrm{m}} \\right)^{3}
        \\times \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}}
        \\times \\frac{1\\,\\mathrm{L}}{10^{2}\\,\\mathrm{cL}}
        \\]
        \\[
        = 12 \\times \\frac{1}{10^{3}} \\times 10 \\times 10^{9} \\times \\frac{1}{10^{3}} \\times \\frac{1}{10^{2}}\\,\\frac{\\mathrm{dg}}{\\mathrm{cL}}
        = 1{,}2 \\times 10^{3}\\,\\frac{\\mathrm{dg}}{\\mathrm{cL}}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slots.forEach(el => el.className = "fraction-slot valid");
    } else {
      feedbackEl.innerHTML = "❌ Usa: \\(\\frac{\\mathrm{g}}{10^3\\,\\mathrm{mg}}\\), \\(\\frac{10\\,\\mathrm{dg}}{\\mathrm{g}}\\), \\(\\left(\\frac{10^3\\,\\mathrm{mm}}{\\mathrm{m}}\\right)^3\\), \\(\\frac{\\mathrm{m}^3}{10^3\\,\\mathrm{L}}\\), \\(\\frac{\\mathrm{L}}{10^2\\,\\mathrm{cL}}\\).";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slots.forEach(el => el.className = "fraction-slot invalid");
    }
  }

  else if (exerciseId === 'ex3') {
    const s = {
      n1: getSlotContent('ex3-num1-power'), n1u: getSlotContent('ex3-num1-unit'),
      d1: getSlotContent('ex3-den1-power'), d1u: getSlotContent('ex3-den1-unit'),
      n2: getSlotContent('ex3-num2-power'), n2u: getSlotContent('ex3-num2-unit'),
      d2: getSlotContent('ex3-den2-power'), d2u: getSlotContent('ex3-den2-unit'),
      n3: getSlotContent('ex3-num3-power'), n3u: getSlotContent('ex3-num3-unit'),
      d3: getSlotContent('ex3-den3-power'), d3u: getSlotContent('ex3-den3-unit'),
      n4: getSlotContent('ex3-num4-power'), n4u: getSlotContent('ex3-num4-unit'),
      d4: getSlotContent('ex3-den4-power'), d4u: getSlotContent('ex3-den4-unit')
    };
    feedbackEl = document.getElementById('ex3-feedback');
    resultDiv = document.getElementById('ex3-result');
    slotIds = ['ex3-num1-power','ex3-num1-unit','ex3-den1-power','ex3-den1-unit',
               'ex3-num2-power','ex3-num2-unit','ex3-den2-power','ex3-den2-unit',
               'ex3-num3-power','ex3-num3-unit','ex3-den3-power','ex3-den3-unit',
               'ex3-num4-power','ex3-num4-unit','ex3-den4-power','ex3-den4-unit'];
    const slots = slotIds.map(id => document.getElementById(id));

    if (!Object.values(s).every(x => x)) {
      feedbackEl.textContent = "⚠️ Completa los 16 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }

    isCorrect =
      s.n1u.value === "kg" && s.d1u.value === "g" && matchesPower(s.n1, 0) && matchesPower(s.d1, 3) &&
      s.n2u.value === "mL" && s.d2u.value === "L" && matchesPower(s.n2, 3) && matchesPower(s.d2, 0) &&
      s.n3u.value === "L" && s.d3u.value === "m3" && matchesPower(s.n3, 3) && matchesPower(s.d3, 0) &&
      s.n4u.value === "m" && s.d4u.value === "dm" && matchesPower(s.n4, 0) && matchesPower(s.d4, 1);

    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: g→kg, mL→L→m³ y m→dm (inverso).";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        0{,}9\\,\\frac{\\mathrm{g}}{\\mathrm{mL}}
        = 0{,}9\\,\\frac{\\mathrm{g}}{\\mathrm{mL}}
        \\times \\frac{1\\,\\mathrm{kg}}{10^{3}\\,\\mathrm{g}}
        \\times \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}}
        \\times \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}}
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}} \\right)^{3}
        \\]
        \\[
        = 0{,}9 \\times 10^{-3} \\times 10^{3} \\times 10^{-3} \\times 10^{-3}\\,\\frac{\\mathrm{kg}}{\\mathrm{dm}^3}
        = 0{,}9 \\times 10^{0} = 0{,}9\\,\\frac{\\mathrm{kg}}{\\mathrm{dm}^3}
        \\]
      `;
      // ✅ Nota: el resultado final es 0,9 kg/dm³, no 90 — corregido lógica aritmética según tu LaTeX
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slots.forEach(el => el.className = "fraction-slot valid");
    } else {
      feedbackEl.innerHTML = "❌ Usa: \\(\\frac{\\mathrm{kg}}{10^3\\,\\mathrm{g}}\\), \\(\\frac{10^3\\,\\mathrm{mL}}{\\mathrm{L}}\\), \\(\\frac{\\mathrm{m}^3}{10^3\\,\\mathrm{L}}\\), \\(\\left(\\frac{\\mathrm{m}}{10\\,\\mathrm{dm}}\\right)^3\\).";
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slots.forEach(el => el.className = "fraction-slot invalid");
    }
  }
}

function resetExercise(exId) {
  const maps = { ex1: 12, ex2: 20, ex3: 16 };
  const total = maps[exId];
  const slots = [];
  const pairs = total / 2;
  for (let i = 1; i <= pairs; i++) {
    slots.push(`${exId}-num${i}-power`, `${exId}-num${i}-unit`,
               `${exId}-den${i}-power`, `${exId}-den${i}-unit`);
  }
  slots.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="placeholder">${id.includes('power') ? 'Potencia' : 'Unidad'}</span>`;
      el.className = "fraction-slot";
    }
  });
  const fb = document.getElementById(`${exId}-feedback`);
  const res = document.getElementById(`${exId}-result`);
  if (fb) { fb.innerHTML = ''; fb.className = 'feedback'; }
  if (res) res.classList.remove('show');
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