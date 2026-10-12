import fs from 'fs';
import path from 'path';

export function emitExecutionEvent(data: any): void {
  const event = {
    ...data,
    eventId: data.eventId || `${data.type || 'EVENT'}:${data.testNumber || 'NA'}:${Date.now()}:${Math.random().toString(36).slice(2)}`
  };
  console.log(`EXECUTION_EVENT:${JSON.stringify(event)}`);

  const sessionId = process.env.SESSION_ID;
  if (!sessionId) return;

  const eventsPath = path.join(process.cwd(), 'sessions', sessionId, 'execution-events.ndjson');
  fs.mkdirSync(path.dirname(eventsPath), { recursive: true });
  fs.appendFileSync(eventsPath, `${JSON.stringify(event)}\n`, 'utf8');
}
