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
  } : null;
}

function renderMath(element) {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise)
    MathJax.typesetPromise([element]).catch(console.warn);
}

// ✅ Función para verificar factores permitidos
function isAllowedPower(val) {
  return ['1', '10', '10^2', '10^3', '10^6', '60', '3600'].includes(val);
}

function checkAnswer(exId) {
  let fb = document.getElementById(`${exId}-feedback`);
  let res = document.getElementById(`${exId}-result`);
  const g = id => getSlotContent(`${exId}-${id}`);

  const slots = {
    n1p: g('num1-power'), n1u: g('num1-unit'),
    d1p: g('den1-power'), d1u: g('den1-unit'),
    n2p: g('num2-power'), n2u: g('num2-unit'),
    d2p: g('den2-power'), d2u: g('den2-unit')
  };

  const allFilled = Object.values(slots).every(s => s);
  if (!allFilled) {
    fb.textContent = "⚠️ Completa los 8 espacios.";
    fb.className = "feedback incorrect";
    res.classList.remove('show');
    return;
  }

  // Validar que todos los factores sean permitidos
  const factors = [slots.n1p.value, slots.d1p.value, slots.n2p.value, slots.d2p.value];
  if (!factors.every(isAllowedPower)) {
    fb.textContent = "⚠️ Usa solo factores permitidos: 1, 10, 10², 10³, 10⁶, 60, 3600.";
    fb.className = "feedback incorrect";
    res.classList.remove('show');
    document.querySelectorAll(`#${exId} .fraction-slot`).forEach(el => el.className = "fraction-slot invalid");
    return;
  }

  let ok = false, tex = "", msg = "";

  if (exId === 'ex1') {
    // 90 m/s → km/h: × (1 km / 10^3 m) × (3600 s / 1 h)
    ok = 
      slots.n1p.value === "1" && slots.n1u.value === "km" &&
      slots.d1p.value === "10^3" && slots.d1u.value === "m" &&
      slots.n2p.value === "3600" && slots.n2u.value === "s" &&
      slots.d2p.value === "1" && slots.d2u.value === "h";
    
    msg = "✅ Correcto. Conversión: m→km y s→h.";
    tex = `
      \\[
      90\\,\\frac{\\mathrm{m}}{\\mathrm{s}} 
      = 90\\,\\frac{\\mathrm{m}}{\\mathrm{s}} 
      \\times \\frac{1\\,\\mathrm{km}}{10^{3}\\,\\mathrm{m}}
      \\times \\frac{3600\\,\\mathrm{s}}{1\\,\\mathrm{h}}
      = 90 \\times \\frac{3600}{10^{3}}\\,\\frac{\\mathrm{km}}{\\mathrm{h}}
      = 324\\,\\frac{\\mathrm{km}}{\\mathrm{h}}
      \\]
    `;
  }

  else if (exId === 'ex2') {
    // 540 km/h → m/s: × (10^3 m / 1 km) × (1 h / 3600 s)
    ok = 
      slots.n1p.value === "10^3" && slots.n1u.value === "m" &&
      slots.d1p.value === "1" && slots.d1u.value === "km" &&
      slots.n2p.value === "1" && slots.n2u.value === "h" &&
      slots.d2p.value === "3600" && slots.d2u.value === "s";
    
    msg = "✅ Correcto. Conversión: km→m y h→s.";
    tex = `
      \\[
      540\\,\\frac{\\mathrm{km}}{\\mathrm{h}}
      = 540\\,\\frac{\\mathrm{km}}{\\mathrm{h}}
      \\times \\frac{10^{3}\\,\\mathrm{m}}{1\\,\\mathrm{km}}
      \\times \\frac{1\\,\\mathrm{h}}{3600\\,\\mathrm{s}}
      = 540 \\times \\frac{10^{3}}{3600}\\,\\frac{\\mathrm{m}}{\\mathrm{s}}
      \\approx 150\\,\\frac{\\mathrm{m}}{\\mathrm{s}}
      \\]
    `;
  }

  else if (exId === 'ex3') {
    // 4,2 km/min → m/h: × (10^3 m / 1 km) × (60 min / 1 h)
    ok = 
      slots.n1p.value === "10^3" && slots.n1u.value === "m" &&
      slots.d1p.value === "1" && slots.d1u.value === "km" &&
      slots.n2p.value === "60" && slots.n2u.value === "min" &&
      slots.d2p.value === "1" && slots.d2u.value === "h";
    
    msg = "✅ Correcto. Conversión: km→m y min→h.";
    tex = `
      \\[
      4{,}2\\,\\frac{\\mathrm{km}}{\\mathrm{min}}
      = 4{,}2\\,\\frac{\\mathrm{km}}{\\mathrm{min}}
      \\times \\frac{10^{3}\\,\\mathrm{m}}{1\\,\\mathrm{km}}
      \\times \\frac{60\\,\\mathrm{min}}{1\\,\\mathrm{h}}
      = 4{,}2 \\times 10^{3} \\times 60\\,\\frac{\\mathrm{m}}{\\mathrm{h}}
      = 2{,}52 \\times 10^{5}\\,\\frac{\\mathrm{m}}{\\mathrm{h}}
      = 252000\\,\\frac{\\mathrm{m}}{\\mathrm{h}}
      \\]
    `;
  }

  if (ok) {
    fb.innerHTML = msg;
    fb.className = "feedback correct";
    res.innerHTML = tex;
    res.classList.add('show');
    renderMath(res);
    document.querySelectorAll(`#${exId} .fraction-slot`).forEach(el => el.className = "fraction-slot valid");
  } else {
    fb.innerHTML = "❌ Revisa los factores y unidades. Usa solo los permitidos.";
    fb.className = "feedback incorrect";
    res.classList.remove('show');
    document.querySelectorAll(`#${exId} .fraction-slot`).forEach(el => el.className = "fraction-slot invalid");
  }
}

function resetExercise(exId) {
  const ids = [
    'num1-power','num1-unit','den1-power','den1-unit',
    'num2-power','num2-unit','den2-power','den2-unit'
  ].map(s => `${exId}-${s}`);
  
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="placeholder">${id.includes('power') ? 'Factor' : 'Unidad'}</span>`;
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