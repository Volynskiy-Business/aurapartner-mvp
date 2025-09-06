import express, { Express, Request, Response } from 'express';

export const setupMemory = (app: Express): void => {
  app.get('/api/memory/status', (req: Request, res: Response) => {
    res.json({
      status: 'Memory API ready',
      service: 'Mem0.ai',
      url: process.env.MEM0_URL || 'http://localhost:8000',
      timestamp: new Date().toISOString()
    });
  });
};
