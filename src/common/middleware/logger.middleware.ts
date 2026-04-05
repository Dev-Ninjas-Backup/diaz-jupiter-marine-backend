import { Injectable, NestMiddleware } from '@nestjs/common';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '[Unable to stringify]';
  }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, body, query, params } = req;

    const oldJson = res.json.bind(res);
    const oldSend = res.send.bind(res);

    const logError = (responseBody: unknown) => {
      if (res.statusCode >= 400) {
        const duration = Date.now() - startTime;

        console.group(chalk.bgRed.white.bold('❌ Error Response'));
        console.info(`${chalk.cyan('🔗 URL:')} ${chalk.white(originalUrl)}`);
        console.info(`${chalk.yellow('📬 Method:')} ${chalk.white(method)}`);
        console.info(
          `${chalk.magenta('📥 Request Body:')} ${chalk.gray(safeStringify(body))}`,
        );
        console.info(
          `${chalk.magenta('🔍 Query Params:')} ${chalk.gray(safeStringify(query))}`,
        );
        console.info(
          `${chalk.magenta('⚙️ Route Params:')} ${chalk.gray(safeStringify(params))}`,
        );
        console.info(`${chalk.green('📨 Status Code:')} ${res.statusCode}`);
        console.info(
          `${chalk.cyan('📦 Response Body:')} ${chalk.gray(safeStringify(responseBody))}`,
        );
        console.info(`${chalk.blue('🕒 Response Time:')} ${duration} ms`);
        console.groupEnd();
        console.info(chalk.gray('-'.repeat(60)));
      }
    };

    res.json = (data: unknown) => {
      logError(data);
      return oldJson(data);
    };

    res.send = (data: unknown) => {
      logError(data);
      return oldSend(data);
    };

    next();
  }
}
