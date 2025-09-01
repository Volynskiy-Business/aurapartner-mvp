import express, { Express, Request, Response } from 'express';

export const setupQdrant = (app: Express): void => {
  app.get('/api/qdrant/status', (req: Request, res: Response) => {
    res.json({
      status: 'Qdrant API ready',
      service: 'Qdrant Vector DB',
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/qdrant/health', (req: Request, res: Response) => {
    res.json({
      healthy: true,
      service: 'Qdrant Vector DB',
      timestamp: new Date().toISOString()
    });
  });
};
