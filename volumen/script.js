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
      feedbackEl.innerHTML = "✅ ¡Perfecto! Usaste correctamente la relación lineal al cubo.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        2{,}25\\,\\mathrm{m}^3
        = 2{,}25\\,\\mathrm{m}^3 \\times \\left( \\frac{10\\,\\mathrm{dm}}{1\\,\\mathrm{m}} \\right)^3
        = 2{,}25 \\times 10^{3}\\,\\mathrm{dm}^3
        = 2250\\,\\mathrm{dm}^3
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Debes usar la relación \\( \\left( \\frac{10\\,\\mathrm{dm}}{1\\,\\mathrm{m}} \\right)^3 \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex2') {
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
    slotElements = ['ex2-num1-power','ex2-num1-unit','ex2-den1-power','ex2-den1-unit',
                    'ex2-num2-power','ex2-num2-unit','ex2-den2-power','ex2-den2-unit',
                    'ex2-num3-power','ex2-num3-unit','ex2-den3-power','ex2-den3-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: cm³ → m³ → L → mL (3 pasos)
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^2" && slots.d1u.value === "cm" &&
      slots.n2p.value === "10^3" && slots.n2u.value === "L" &&
      slots.d2p.value === "1" && slots.d2u.value === "m3" &&
      slots.n3p.value === "10^3" && slots.n3u.value === "mL" &&
      slots.d3p.value === "1" && slots.d3u.value === "L";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión en 3 pasos: cm³ → m³ → L → mL.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        1850{,}2\\,\\mathrm{cm}^3
        = 1850{,}2\\,\\mathrm{cm}^3 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^3
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}}
        \\]
        \\[
        = 1850{,}2 \\times \\frac{1^3\\,\\mathrm{m}^3}{(10^{2})^3\\,\\mathrm{cm}^3} 
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}}
        \\]
        \\[
        = 1850{,}2 \\times \\frac{1}{10^{6}} 
        \\times 10^{3} 
        \\times 10^{3} \\,\\mathrm{mL}
        = 1850{,}2 \\times 10^{0} \\,\\mathrm{mL}
        = 1850{,}2\\,\\mathrm{mL}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: cm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\), m³→L con \\( \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3} \\), y L→mL con \\( \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex3') {
    const slots = {
      n1p: getSlotContent('ex3-num1-power'), n1u: getSlotContent('ex3-num1-unit'),
      d1p: getSlotContent('ex3-den1-power'), d1u: getSlotContent('ex3-den1-unit'),
      n2p: getSlotContent('ex3-num2-power'), n2u: getSlotContent('ex3-num2-unit'),
      d2p: getSlotContent('ex3-den2-power'), d2u: getSlotContent('ex3-den2-unit'),
      n3p: getSlotContent('ex3-num3-power'), n3u: getSlotContent('ex3-num3-unit'),
      d3p: getSlotContent('ex3-den3-power'), d3u: getSlotContent('ex3-den3-unit')
    };
    feedbackEl = document.getElementById('ex3-feedback');
    resultDiv = document.getElementById('ex3-result');
    slotElements = ['ex3-num1-power','ex3-num1-unit','ex3-den1-power','ex3-den1-unit',
                    'ex3-num2-power','ex3-num2-unit','ex3-den2-power','ex3-den2-unit',
                    'ex3-num3-power','ex3-num3-unit','ex3-den3-power','ex3-den3-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: hm³ → m³ → L → mL
    isCorrect =
      slots.n1p.value === "10^2" && slots.n1u.value === "m" &&
      slots.d1p.value === "1" && slots.d1u.value === "hm" &&
      slots.n2p.value === "10^3" && slots.n2u.value === "L" &&
      slots.d2p.value === "1" && slots.d2u.value === "m3" &&
      slots.n3p.value === "10^3" && slots.n3u.value === "mL" &&
      slots.d3p.value === "1" && slots.d3u.value === "L";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: hm³ → m³ → L → mL.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        0{,}00475\\,\\mathrm{hm}^3
        = 0{,}00475\\,\\mathrm{hm}^3 
        \\times \\left( \\frac{10^{2}\\,\\mathrm{m}}{1\\,\\mathrm{hm}} \\right)^3
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}}
        = 4{,}75 \\times 10^{9}\\,\\mathrm{mL}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: hm→m con \\( \\frac{10^{2}\\,\\mathrm{m}}{1\\,\\mathrm{hm}} \\), m³→L con \\( \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3} \\), y L→mL con \\( \\frac{10^{3}\\,\\mathrm{mL}}{1\\,\\mathrm{L}} \\).";
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
    
    // Conversión correcta: dm³ → m³ → dam³
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^1" && slots.d1u.value === "dm" &&
      slots.n2p.value === "1" && slots.n2u.value === "dam" &&
      slots.d2p.value === "10^1" && slots.d2u.value === "m";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: dm³ → m³ → dam³.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        4500\\,\\mathrm{dm}^3
        = 4500\\,\\mathrm{dm}^3 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}} \\right)^3
        \\times \\left( \\frac{1\\,\\mathrm{dam}}{10^{1}\\,\\mathrm{m}} \\right)^3
        = 4500 \\times 10^{-3} \\times 10^{-3}\\,\\mathrm{dam}^3
        = 4{,}5 \\times 10^{-3}\\,\\mathrm{dam}^3
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: dm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{1}\\,\\mathrm{dm}} \\) y m→dam con \\( \\frac{1\\,\\mathrm{dam}}{10^{1}\\,\\mathrm{m}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex5') {
    const slots = {
      n1p: getSlotContent('ex5-num1-power'), n1u: getSlotContent('ex5-num1-unit'),
      d1p: getSlotContent('ex5-den1-power'), d1u: getSlotContent('ex5-den1-unit')
    };
    feedbackEl = document.getElementById('ex5-feedback');
    resultDiv = document.getElementById('ex5-result');
    slotElements = ['ex5-num1-power','ex5-num1-unit','ex5-den1-power','ex5-den1-unit']
      .map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 4 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: km³ → m³
    isCorrect = slots.n1p.value === "10^3" && slots.n1u.value === "m" && slots.d1p.value === "1" && slots.d1u.value === "km";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión directa: km³ → m³.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        0{,}085\\,\\mathrm{km}^3
        = 0{,}085\\,\\mathrm{km}^3 
        \\times \\left( \\frac{10^{3}\\,\\mathrm{m}}{1\\,\\mathrm{km}} \\right)^3
        = 0{,}085 \\times 10^{9}\\,\\mathrm{m}^3
        = 8{,}5 \\times 10^{7}\\,\\mathrm{m}^3
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa la relación \\( \\left( \\frac{10^{3}\\,\\mathrm{m}}{1\\,\\mathrm{km}} \\right)^3 \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex6') {
    const slots = {
      n1p: getSlotContent('ex6-num1-power'), n1u: getSlotContent('ex6-num1-unit'),
      d1p: getSlotContent('ex6-den1-power'), d1u: getSlotContent('ex6-den1-unit'),
      n2p: getSlotContent('ex6-num2-power'), n2u: getSlotContent('ex6-num2-unit'),
      d2p: getSlotContent('ex6-den2-power'), d2u: getSlotContent('ex6-den2-unit')
    };
    feedbackEl = document.getElementById('ex6-feedback');
    resultDiv = document.getElementById('ex6-result');
    slotElements = ['ex6-num1-power','ex6-num1-unit','ex6-den1-power','ex6-den1-unit',
                    'ex6-num2-power','ex6-num2-unit','ex6-den2-power','ex6-den2-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: cm³ → m³ → L
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^2" && slots.d1u.value === "cm" &&
      slots.n2p.value === "10^3" && slots.n2u.value === "L" &&
      slots.d2p.value === "1" && slots.d2u.value === "m3";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: cm³ → m³ → L.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        140\\,\\mathrm{cm}^3
        = 140\\,\\mathrm{cm}^3 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^3
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        = 140 \\times 10^{-6} \\times 10^{3}\\,\\mathrm{L}
        = 0{,}14\\,\\mathrm{L}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: cm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\) y m³→L con \\( \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex7') {
    const slots = {
      n1p: getSlotContent('ex7-num1-power'), n1u: getSlotContent('ex7-num1-unit'),
      d1p: getSlotContent('ex7-den1-power'), d1u: getSlotContent('ex7-den1-unit')
    };
    feedbackEl = document.getElementById('ex7-feedback');
    resultDiv = document.getElementById('ex7-result');
    slotElements = ['ex7-num1-power','ex7-num1-unit','ex7-den1-power','ex7-den1-unit']
      .map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 4 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión correcta: L → m³
    isCorrect = slots.n1p.value === "1" && slots.n1u.value === "m3" && slots.d1p.value === "10^3" && slots.d1u.value === "L";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión directa usando 10³ L = 1 m³.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        45\\,\\mathrm{L}
        = 45\\,\\mathrm{L} 
        \\times \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}}
        = 45 \\times 10^{-3}\\,\\mathrm{m}^3
        = 4{,}5 \\times 10^{-2}\\,\\mathrm{m}^3
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa la relación directa \\( \\frac{1\\,\\mathrm{m}^3}{10^{3}\\,\\mathrm{L}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex8') {
    const slots = {
      n1p: getSlotContent('ex8-num1-power'), n1u: getSlotContent('ex8-num1-unit'),
      d1p: getSlotContent('ex8-den1-power'), d1u: getSlotContent('ex8-den1-unit'),
      n2p: getSlotContent('ex8-num2-power'), n2u: getSlotContent('ex8-num2-unit'),
      d2p: getSlotContent('ex8-den2-power'), d2u: getSlotContent('ex8-den2-unit')
    };
    feedbackEl = document.getElementById('ex8-feedback');
    resultDiv = document.getElementById('ex8-result');
    slotElements = ['ex8-num1-power','ex8-num1-unit','ex8-den1-power','ex8-den1-unit',
                    'ex8-num2-power','ex8-num2-unit','ex8-den2-power','ex8-den2-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 8 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión CORREGIDA: m³ → L → kL
    isCorrect =
      slots.n1p.value === "10^3" && slots.n1u.value === "L" &&
      slots.d1p.value === "1" && slots.d1u.value === "m3" &&
      slots.n2p.value === "1" && slots.n2u.value === "kL" &&
      slots.d2p.value === "10^3" && slots.d2u.value === "L";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: m³ → L → kL.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        300\\,\\mathrm{m}^3
        = 300\\,\\mathrm{m}^3 
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\frac{1\\,\\mathrm{kL}}{10^{3}\\,\\mathrm{L}}
        = 300\\,\\mathrm{kL}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: m³→L con \\( \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3} \\) y L→kL con \\( \\frac{1\\,\\mathrm{kL}}{10^{3}\\,\\mathrm{L}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex9') {
    const slots = {
      n1p: getSlotContent('ex9-num1-power'), n1u: getSlotContent('ex9-num1-unit'),
      d1p: getSlotContent('ex9-den1-power'), d1u: getSlotContent('ex9-den1-unit'),
      n2p: getSlotContent('ex9-num2-power'), n2u: getSlotContent('ex9-num2-unit'),
      d2p: getSlotContent('ex9-den2-power'), d2u: getSlotContent('ex9-den2-unit'),
      n3p: getSlotContent('ex9-num3-power'), n3u: getSlotContent('ex9-num3-unit'),
      d3p: getSlotContent('ex9-den3-power'), d3u: getSlotContent('ex9-den3-unit')
    };
    feedbackEl = document.getElementById('ex9-feedback');
    resultDiv = document.getElementById('ex9-result');
    slotElements = ['ex9-num1-power','ex9-num1-unit','ex9-den1-power','ex9-den1-unit',
                    'ex9-num2-power','ex9-num2-unit','ex9-den2-power','ex9-den2-unit',
                    'ex9-num3-power','ex9-num3-unit','ex9-den3-power','ex9-den3-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión CORREGIDA: mm³ → m³ → L → cL
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^3" && slots.d1u.value === "mm" &&
      slots.n2p.value === "10^3" && slots.n2u.value === "L" &&
      slots.d2p.value === "1" && slots.d2u.value === "m3" &&
      slots.n3p.value === "10^2" && slots.n3u.value === "cL" &&
      slots.d3p.value === "1" && slots.d3u.value === "L";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: mm³ → m³ → L → cL.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        2500\\,\\mathrm{mm}^3
        = 2500\\,\\mathrm{mm}^3 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{3}\\,\\mathrm{mm}} \\right)^3
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\frac{10^{2}\\,\\mathrm{cL}}{1\\,\\mathrm{L}}
        = 0{,}25\\,\\mathrm{cL}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: mm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{3}\\,\\mathrm{mm}} \\), m³→L con \\( \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3} \\), y L→cL con \\( \\frac{10^{2}\\,\\mathrm{cL}}{1\\,\\mathrm{L}} \\).";
      feedbackEl.innerHTML = errorMessage;
      feedbackEl.className = "feedback incorrect";
      renderMath(feedbackEl);
      resultDiv.classList.remove('show');
      slotElements.forEach(el => el.className = "fraction-slot invalid");
    }
  } else if (exerciseId === 'ex10') {
    const slots = {
      n1p: getSlotContent('ex10-num1-power'), n1u: getSlotContent('ex10-num1-unit'),
      d1p: getSlotContent('ex10-den1-power'), d1u: getSlotContent('ex10-den1-unit'),
      n2p: getSlotContent('ex10-num2-power'), n2u: getSlotContent('ex10-num2-unit'),
      d2p: getSlotContent('ex10-den2-power'), d2u: getSlotContent('ex10-den2-unit'),
      n3p: getSlotContent('ex10-num3-power'), n3u: getSlotContent('ex10-num3-unit'),
      d3p: getSlotContent('ex10-den3-power'), d3u: getSlotContent('ex10-den3-unit')
    };
    feedbackEl = document.getElementById('ex10-feedback');
    resultDiv = document.getElementById('ex10-result');
    slotElements = ['ex10-num1-power','ex10-num1-unit','ex10-den1-power','ex10-den1-unit',
                    'ex10-num2-power','ex10-num2-unit','ex10-den2-power','ex10-den2-unit',
                    'ex10-num3-power','ex10-num3-unit','ex10-den3-power','ex10-den3-unit'].map(id => document.getElementById(id));
    allFilled = Object.values(slots).every(s => s !== null);
    if (!allFilled) {
      feedbackEl.textContent = "⚠️ Completa los 12 espacios.";
      feedbackEl.className = "feedback incorrect";
      resultDiv.classList.remove('show');
      return;
    }
    
    // Conversión CORREGIDA: cm³ → m³ → L → dL
    isCorrect =
      slots.n1p.value === "1" && slots.n1u.value === "m" &&
      slots.d1p.value === "10^2" && slots.d1u.value === "cm" &&
      slots.n2p.value === "10^3" && slots.n2u.value === "L" &&
      slots.d2p.value === "1" && slots.d2u.value === "m3" &&
      slots.n3p.value === "10^1" && slots.n3u.value === "dL" &&
      slots.d3p.value === "1" && slots.d3u.value === "L";
      
    if (isCorrect) {
      feedbackEl.innerHTML = "✅ Correcto. Conversión: cm³ → m³ → L → dL.";
      feedbackEl.className = "feedback correct";
      mathTeX = `
        \\[
        180\\,\\mathrm{cm}^3
        = 180\\,\\mathrm{cm}^3 
        \\times \\left( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\right)^3
        \\times \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3}
        \\times \\frac{10^{1}\\,\\mathrm{dL}}{1\\,\\mathrm{L}}
        = 1{,}8\\,\\mathrm{dL}
        \\]
      `;
      resultDiv.innerHTML = mathTeX;
      resultDiv.classList.add('show');
      renderMath(resultDiv);
      slotElements.forEach(el => el.className = "fraction-slot valid");
    } else {
      errorMessage = "❌ Usa las relaciones: cm→m con \\( \\frac{1\\,\\mathrm{m}}{10^{2}\\,\\mathrm{cm}} \\), m³→L con \\( \\frac{10^{3}\\,\\mathrm{L}}{1\\,\\mathrm{m}^3} \\), y L→dL con \\( \\frac{10^{1}\\,\\mathrm{dL}}{1\\,\\mathrm{L}} \\).";
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
    slots = ['ex2-num1-power','ex2-num1-unit','ex2-den1-power','ex2-den1-unit',
             'ex2-num2-power','ex2-num2-unit','ex2-den2-power','ex2-den2-unit',
             'ex2-num3-power','ex2-num3-unit','ex2-den3-power','ex2-den3-unit'];
  } else if (exerciseId === 'ex3') {
    slots = ['ex3-num1-power','ex3-num1-unit','ex3-den1-power','ex3-den1-unit',
             'ex3-num2-power','ex3-num2-unit','ex3-den2-power','ex3-den2-unit',
             'ex3-num3-power','ex3-num3-unit','ex3-den3-power','ex3-den3-unit'];
  } else if (exerciseId === 'ex4') {
    slots = ['ex4-num1-power','ex4-num1-unit','ex4-den1-power','ex4-den1-unit',
             'ex4-num2-power','ex4-num2-unit','ex4-den2-power','ex4-den2-unit'];
  } else if (exerciseId === 'ex5') {
    slots = ['ex5-num1-power','ex5-num1-unit','ex5-den1-power','ex5-den1-unit'];
  } else if (exerciseId === 'ex6') {
    slots = ['ex6-num1-power','ex6-num1-unit','ex6-den1-power','ex6-den1-unit',
             'ex6-num2-power','ex6-num2-unit','ex6-den2-power','ex6-den2-unit'];
  } else if (exerciseId === 'ex7') {
    slots = ['ex7-num1-power','ex7-num1-unit','ex7-den1-power','ex7-den1-unit'];
  } else if (exerciseId === 'ex8') {
    slots = ['ex8-num1-power','ex8-num1-unit','ex8-den1-power','ex8-den1-unit',
             'ex8-num2-power','ex8-num2-unit','ex8-den2-power','ex8-den2-unit'];
  } else if (exerciseId === 'ex9') {
    slots = ['ex9-num1-power','ex9-num1-unit','ex9-den1-power','ex9-den1-unit',
             'ex9-num2-power','ex9-num2-unit','ex9-den2-power','ex9-den2-unit',
             'ex9-num3-power','ex9-num3-unit','ex9-den3-power','ex9-den3-unit'];
  } else if (exerciseId === 'ex10') {
    slots = ['ex10-num1-power','ex10-num1-unit','ex10-den1-power','ex10-den1-unit',
             'ex10-num2-power','ex10-num2-unit','ex10-den2-power','ex10-den2-unit',
             'ex10-num3-power','ex10-num3-unit','ex10-den3-power','ex10-den3-unit'];
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