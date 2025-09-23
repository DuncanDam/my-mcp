import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Utility to get version information from package.json
 */

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
}

let cachedPackageInfo: PackageInfo | null = null;

export async function getPackageInfo(): Promise<PackageInfo> {
  if (cachedPackageInfo) {
    return cachedPackageInfo;
  }

  try {
    // Get the path to package.json from the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Go up from src/utils/ to project root
    const projectRoot = path.resolve(__dirname, '../..');
    const packageJsonPath = path.join(projectRoot, 'package.json');

    const packageJsonContent = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    cachedPackageInfo = {
      name: packageJson.name || 'my-mcp',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || 'MCP Server',
      author: packageJson.author || 'Unknown'
    };

    return cachedPackageInfo;
  } catch (error) {
    // Fallback to default values if package.json can't be read
    console.warn('Could not read package.json, using fallback version info:', error);

    cachedPackageInfo = {
      name: 'my-mcp',
      version: '1.0.0',
      description: 'Hono-based MCP server for content analysis and Excel integration',
      author: 'Your Team'
    };

    return cachedPackageInfo;
  }
}

export async function getVersion(): Promise<string> {
  const packageInfo = await getPackageInfo();
  return packageInfo.version;
}

export async function getServerInfo(): Promise<{ name: string; version: string; description: string; author: string }> {
  return await getPackageInfo();
}