/**
 * Simple script to install jsonwebtoken
 */
import { execSync } from 'child_process';

try {
  console.log('Installing jsonwebtoken...');
  execSync('npm install --save jsonwebtoken', { stdio: 'inherit' });
  console.log('Successfully installed jsonwebtoken!');
} catch (error) {
  console.error('Failed to install jsonwebtoken:', error.message);
  process.exit(1);
}
