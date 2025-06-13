import {
  ContextAPI,
  SpanStatusCode,
  TraceAPI,
  propagation,
} from '@opentelemetry/api';
import { useState } from 'react';
import { faro } from '../instrumentation';
import styles from './DiceRoller.module.css';

const otelApi = faro.api.getOTEL();
const trace = otelApi?.trace as TraceAPI;
const context = otelApi?.context as ContextAPI;
const tracer = trace?.getTracer('dice-roller-web');

export function DiceRoller() {
  const rollDice = async () => {
    console.log('rollDice');
    const span = tracer.startSpan('roll-dice-operation');

    try {
      await context.with(trace.setSpan(context.active(), span), async () => {
        const apiSpan = tracer.startSpan('call-dice-api');

        try {
          const carrier = {};
          propagation.inject(context.active(), carrier);

          const response = await fetch(
            `${process.env.VITE_API_URL}/rolldice?rolls=4`,
            {
              headers: {
                ...carrier,
              },
            },
          );

          const data = await response.json();
          console.log('rolled dice', data);
          setResults(`Results: ${data.join(', ')}`);

          apiSpan.setAttribute('dice.results', data.join(','));
          apiSpan.setStatus({ code: SpanStatusCode.OK });
        } catch (error) {
          if (error instanceof Error) {
            apiSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
          }

          throw error;
        } finally {
          apiSpan.end();
        }
      });

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      if (error instanceof Error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        setResults(`Error: ${error.message}`);
      }
    } finally {
      span.end();
    }
  };

  const throwError = async () => {
    const span = tracer.startSpan('error-operation');
    try {
      throw new Error('This is a test error');
    } catch (error) {
      console.error('error', error);
      if (error instanceof Error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        setResults(`Error: ${error.message}`);
      }
    } finally {
      span.end();
    }
  };

  const [results, setResults] = useState('');

  return (
    <div className={styles.container}>
      <h1>Dice Roller</h1>
      <button onClick={rollDice}>Roll 12 Dice</button>
      <button onClick={throwError}>Throw Error</button>
      <div id="results" className={styles.results}>
        {results}
      </div>
    </div>
  );
}
