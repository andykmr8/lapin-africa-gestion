
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Construction de l\'application mobile...');

try {
  // Build de l'application
  console.log('📦 Construction du bundle de production...');
  execSync('npm run build', { stdio: 'inherit' });

  // Vérification que le dossier dist existe
  if (!fs.existsSync('dist')) {
    throw new Error('Le dossier dist n\'a pas été créé');
  }

  console.log('✅ Build terminé avec succès');
  
  // Instructions pour l'utilisateur
  console.log('\n📱 Pour compiler l\'APK :');
  console.log('1. Exportez le projet vers Github');
  console.log('2. Clonez le projet localement');
  console.log('3. Exécutez : npm install');
  console.log('4. Exécutez : npx cap add android');
  console.log('5. Exécutez : npx cap sync android');
  console.log('6. Exécutez : npx cap run android');
  console.log('\n🔧 Assurez-vous d\'avoir Android Studio installé');
  
} catch (error) {
  console.error('❌ Erreur lors du build :', error.message);
  process.exit(1);
}
