import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add, subtract, multiply, divide } from '../src/index.js';

test('add returns the sum of two numbers', () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-1, 1), 0);
});

test('subtract returns the difference of two numbers', () => {
  assert.equal(subtract(5, 3), 2);
  assert.equal(subtract(0, 4), -4);
});

test('multiply returns the product of two numbers', () => {
  assert.equal(multiply(3, 4), 12);
  assert.equal(multiply(0, 7), 0);
});

test('divide returns the quotient of two numbers', () => {
  assert.equal(divide(10, 2), 5);
  assert.equal(divide(9, 3), 3);
});

test('divide throws when dividing by zero', () => {
  assert.throws(() => divide(1, 0), /Cannot divide by zero/);
});
