import { html, $$ } from '../dom.js';

/** Render a list of questions as a form. name prefix must be unique on the page. */
export function quizHtml(questions, prefix, L) {
  return html`${questions.map((q, i) => html`
    <fieldset class="q" data-qid="${q.id}">
      <legend><span class="qn">Q${i + 1}</span> ${L(q.q)}</legend>
      ${q.options.map((o, j) => html`<label class="opt"><input type="radio" name="${prefix}-${q.id}" value="${j}"><span>${L(o)}</span></label>`)}
      <p class="qfeedback" hidden></p>
    </fieldset>`)}`;
}

/** Grade the questions in `root`. Returns [{ qid, correct, answered }]. Shows feedback inline. */
export function gradeQuiz(root, questions, prefix, L, t) {
  return questions.map(q => {
    const fs = root.querySelector(`fieldset[data-qid="${q.id}"]`);
    const picked = fs.querySelector(`input[name="${prefix}-${q.id}"]:checked`);
    const correct = !!picked && +picked.value === q.answer;
    const fb = fs.querySelector('.qfeedback');
    fb.hidden = false;
    fb.className = 'qfeedback ' + (correct ? 'ok' : 'bad');
    fb.textContent = `${correct ? '✓ ' + t('correct') : '✗ ' + t('incorrect')} — ${L(q.explain)}`;
    $$('label.opt', fs).forEach((lab, j) => { lab.classList.toggle('is-answer', j === q.answer); lab.classList.toggle('is-wrong', !!picked && j === +picked.value && !correct); });
    $$('input', fs).forEach(inp => { inp.disabled = true; });
    return { qid: q.id, correct, answered: !!picked };
  });
}
