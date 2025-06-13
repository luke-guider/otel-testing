import { metrics, Span, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

const counter = meter.createCounter('dice-lib.rolls.counter');
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    span.setAttribute('dicelib.rolled', result.toString());
    counter.add(1);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  console.log('rollTheDice');
  // Create a span. A span must be closed.
  return tracer.startActiveSpan(
    'rollTheDice',
    {
      attributes: {
        'dicelib.rolls': rolls.toString(),
        'dicelib.min': min.toString(),
        'dicelib.max': max.toString(),
      },
    },
    (span: Span) => {
      span.addEvent('rolling the dice', {
        'dicelib.rolls': rolls.toString(),
        'dicelib.min': min.toString(),
        'dicelib.max': max.toString(),
      });
      console.log('rolling the dice');
      const result: number[] = [];
      for (let i = 0; i < rolls; i++) {
        result.push(rollOnce(i, min, max));
      }
      // Be sure to end the span!
      span.end();
      return result;
    },
  );
}
