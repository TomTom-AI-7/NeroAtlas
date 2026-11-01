import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, isCorrect, isExpression } from '../js/calc.js';

test('expressions evaluate like a calculator', () => {
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);
  near(evaluate('0.05/320'), 0.00015625);
  near(evaluate('ln(8)-ln(4)'), Math.LN2);
  near(evaluate('10 ÷ √25'), 2);
  near(evaluate('10/sqrt(25)'), 2);
  near(evaluate('2 + 1.96 × 1.0 ÷ sqrt(100)'), 2.196);
  near(evaluate('0.9*0.05/(0.9*0.05+0.1*0.95)'), 0.32142857142857145);
  near(evaluate('1,712 × 24%'), 410.88);
  near(evaluate('−55 − (−70)'), 15);
  near(evaluate('2^10'), 1024);
  near(evaluate('５００×１２０'), 60000);
  assert.ok(Number.isNaN(evaluate('2+')));
  assert.ok(Number.isNaN(evaluate('alert(1)')));
  assert.ok(Number.isNaN(evaluate('')));
});

test('grading: tolerance and percent answers', () => {
  assert.ok(isCorrect('32.1', 32.14, 0.6, true));
  assert.ok(isCorrect('0.321', 32.14, 0.6, true));
  assert.ok(!isCorrect('0.321', 32.14, 0.6, false));
  assert.ok(isCorrect('60000', 60000, 0));
  assert.ok(!isCorrect('60001', 60000, 0));
});

test('plain numbers are not shown as expressions', () => {
  assert.equal(isExpression('-12.5'), false);
  assert.equal(isExpression('0.05/320'), true);
  assert.equal(isExpression('ln(2)'), true);
});
