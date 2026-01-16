import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * エラーハンドリングミドルウェア
 */
export const errorHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json(
        {
          message: error.message,
          code: error.status.toString(),
        },
        error.status
      );
    }

    console.error('Unexpected error:', error);
    return c.json(
      {
        message: 'Internal server error',
        code: '500',
      },
      500
    );
  }
};
