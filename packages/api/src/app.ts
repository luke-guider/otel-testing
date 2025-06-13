import {
  context,
  metrics,
  propagation,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import cors from 'cors';
import express, { Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

// Enable CORS for all routes
app.use(cors());

const tracer = trace.getTracer('dice-roller-api', '0.1.0');
const meter = metrics.getMeter('dice-roller-api', '0.1.0');

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/rolldice', (req, res) => {
  // Extract the trace context from the request headers
  const carrier = req.headers;
  const ctx = propagation.extract(context.active(), carrier);

  // Create a span for the API endpoint, using the extracted context
  const span = tracer.startSpan('handle-rolldice-request', undefined, ctx);

  try {
    const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;

    if (isNaN(rolls)) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Invalid rolls parameter',
      });
      res
        .status(400)
        .send("Request parameter 'rolls' is missing or not a number.");
      return;
    }

    // Create a child span for the dice rolling operation
    const rollSpan = tracer.startSpan(
      'roll-dice',
      undefined,
      trace.setSpan(ctx, span),
    );
    try {
      const results = rollTheDice(rolls, 1, 6);
      rollSpan.setAttribute('dice.rolls', rolls);
      rollSpan.setAttribute('dice.results', results.join(','));
      rollSpan.setStatus({ code: SpanStatusCode.OK });
      res.json(results);
    } catch (error) {
      rollSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      rollSpan.end();
    }

    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).send('Internal server error');
  } finally {
    span.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
