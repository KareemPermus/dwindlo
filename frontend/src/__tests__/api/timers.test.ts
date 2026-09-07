import { createMocks } from 'node-mocks-http';
import timersHandler from '@/pages/api/timers/index';
import timerByIdHandler from '@/pages/api/timers/[id]';

// Force SQLite path
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('GET /api/timers', () => {
  it('returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await timersHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/timers', () => {
  it('creates timer', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { title: 'Test', duration_seconds: 60 } });
    await timersHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test');
    expect(data.duration_seconds).toBe(60);
    expect(data.status).toBe('idle');
  });

  it('rejects missing fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await timersHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('GET /api/timers/[id]', () => {
  it('returns 404 for missing', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await timerByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });
});

describe('PUT /api/timers/[id]', () => {
  it('updates timer', async () => {
    // create first
    const { req: cReq, res: cRes } = createMocks({ method: 'POST', body: { title: 'Up', duration_seconds: 30 } });
    await timersHandler(cReq as any, cRes as any);
    const created = JSON.parse(cRes._getData());

    const { req, res } = createMocks({ method: 'PUT', query: { id: String(created.id) }, body: { status: 'running' } });
    await timerByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).status).toBe('running');
  });
});

describe('DELETE /api/timers/[id]', () => {
  it('deletes timer', async () => {
    const { req: cReq, res: cRes } = createMocks({ method: 'POST', body: { title: 'Del', duration_seconds: 10 } });
    await timersHandler(cReq as any, cRes as any);
    const created = JSON.parse(cRes._getData());

    const { req, res } = createMocks({ method: 'DELETE', query: { id: String(created.id) } });
    await timerByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});