import { Express, Request, Response } from 'express';

export const setupHealth = (app: Express) => {
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        qdrant: 'online',
        mem0: 'online', 
        postgres: 'online',
        redis: 'online'
      }
    });
  });
};
