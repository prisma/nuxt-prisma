import type { PrismaModuleOptions } from '../types';

export class EnvironmentDetector {
  static detectEnvironment() {
    const npmLifecycleEvent = process.env?.npm_lifecycle_event;
    const nodeEnv = process.env.NODE_ENV;
    
    return {
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development' || npmLifecycleEvent === 'dev',
      isTest: nodeEnv === 'test' || Boolean(npmLifecycleEvent?.includes('test')),
      npmLifecycleEvent,
    };
  }

  static shouldSkipPrismaSetup(options: Partial<PrismaModuleOptions>): boolean {
    const env = this.detectEnvironment();
    
    // Skip if explicitly set via environment variable
    const forceSkip = process.env?.SKIP_PRISMA_SETUP === 'true';
    
    if (forceSkip) {
      return true;
    }

    // Skip during postinstall
    if (env.npmLifecycleEvent === 'postinstall') {
      return true;
    }

    // Skip if user explicitly disabled
    if (options.skipPrompts === true && env.npmLifecycleEvent === 'dev:build') {
      return true;
    }

    return false;
  }

  static shouldSkipPrompts(options: Partial<PrismaModuleOptions>): boolean {
    const env = this.detectEnvironment();
    
    const skipPrompts = options.skipPrompts === true;
    const devBuild = env.npmLifecycleEvent === 'dev:build';
    
    return skipPrompts || devBuild || env.isProduction || env.isTest;
  }
}