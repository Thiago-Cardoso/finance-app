/**
 * Metro Configuration for React Native
 * Configurado para suportar symlinks e compartilhamento de código com frontend
 *
 * @see https://facebook.github.io/metro/docs/configuration
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ==========================================
// Configuração para Symlinks
// ==========================================

// Adicionar diretórios do frontend como watch folders
const frontendPath = path.resolve(__dirname, '../frontend/src');

config.watchFolders = [
  __dirname,
  path.join(frontendPath, 'types'),
  path.join(frontendPath, 'lib'),
  path.join(frontendPath, 'utils'),
];

// ==========================================
// Extensões de Arquivos
// ==========================================

config.resolver.sourceExts = [
  'expo.tsx',
  'expo.ts',
  'expo.js',
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
];

// ==========================================
// Configurações de Performance
// ==========================================

config.transformer = {
  ...config.transformer,
  // Suporte a symlinks
  unstable_enableSymlinks: true,
  // Minificação em produção
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// ==========================================
// Cache Busting (útil durante desenvolvimento)
// ==========================================

config.resetCache = false;

// ==========================================
// Resolver Configuration
// ==========================================

// Garantir que o Metro encontre os node_modules corretos
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../frontend/node_modules'),
];

// Desduplicação de dependências (útil com symlinks)
config.resolver.disableHierarchicalLookup = false;

// ==========================================
// Logging (útil para debug)
// ==========================================

if (process.env.DEBUG_METRO === 'true') {
  console.log('Metro Config:');
  console.log('- Watch Folders:', config.watchFolders);
  console.log('- Node Modules Paths:', config.resolver.nodeModulesPaths);
  console.log('- Symlinks Enabled:', config.transformer.unstable_enableSymlinks);
}

module.exports = config;
