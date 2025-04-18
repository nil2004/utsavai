#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Log with colors
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Ask a question and get user input
const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}? ${question}${colors.reset} `, (answer) => {
      resolve(answer);
    });
  });
};

// Check if .env file exists and has Supabase configuration
const checkEnvFile = async () => {
  log.title('Checking Environment Configuration');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fileExists(envPath)) {
    log.warning('No .env file found');
    
    const createEnv = await ask('Would you like to create a .env file now? (y/n)');
    
    if (createEnv.toLowerCase() === 'y') {
      const supabaseUrl = await ask('Enter your Supabase URL (https://your-project.supabase.co):');
      const supabaseKey = await ask('Enter your Supabase anon key:');
      
      const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
`;
      
      fs.writeFileSync(envPath, envContent);
      log.success('.env file created successfully');
    } else {
      log.warning('You will need to create a .env file manually before proceeding');
    }
  } else {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
      log.success('.env file found with Supabase configuration');
    } else {
      log.warning('.env file exists but may be missing Supabase configuration');
      
      const updateEnv = await ask('Would you like to update the .env file with Supabase configuration? (y/n)');
      
      if (updateEnv.toLowerCase() === 'y') {
        const supabaseUrl = await ask('Enter your Supabase URL (https://your-project.supabase.co):');
        const supabaseKey = await ask('Enter your Supabase anon key:');
        
        const updatedContent = `${envContent.trim()}

# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
`;
        
        fs.writeFileSync(envPath, updatedContent);
        log.success('.env file updated with Supabase configuration');
      }
    }
  }
};

// Check SQL file
const checkSqlFile = async () => {
  log.title('Checking SQL Configuration Script');
  
  const sqlPath = path.join(process.cwd(), 'setup-admin-db.sql');
  
  if (!fileExists(sqlPath)) {
    log.warning('SQL setup file not found (setup-admin-db.sql)');
    log.info('Please make sure to create this file before running your application');
    log.info('You can find a template in the ADMIN-SETUP-GUIDE.md file');
  } else {
    log.success('SQL setup file found (setup-admin-db.sql)');
    log.info('Make sure to run this SQL script in your Supabase SQL editor');
  }
};

// Check dependencies
const checkDependencies = async () => {
  log.title('Checking Dependencies');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fileExists(packageJsonPath)) {
    log.error('package.json not found. Make sure you are in the correct directory.');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['@supabase/supabase-js'];
  const missingDeps = [];
  
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    }
  }
  
  if (missingDeps.length > 0) {
    log.warning(`Missing dependencies: ${missingDeps.join(', ')}`);
    
    const installDeps = await ask('Would you like to install missing dependencies now? (y/n)');
    
    if (installDeps.toLowerCase() === 'y') {
      try {
        log.info('Installing dependencies...');
        execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        log.success('Dependencies installed successfully');
      } catch (error) {
        log.error('Failed to install dependencies');
        log.error(error.message);
      }
    }
  } else {
    log.success('All required dependencies are installed');
  }
};

// Main function
const main = async () => {
  console.log('\n');
  log.title('EventBuddy Admin Panel Setup');
  log.info('This script will help you set up your EventBuddy admin panel with Supabase');
  
  await checkDependencies();
  await checkEnvFile();
  await checkSqlFile();
  
  console.log('\n');
  log.title('Setup Complete');
  log.info('Next steps:');
  log.info('1. Make sure you\'ve created a Supabase project at https://supabase.com');
  log.info('2. Run the SQL script in your Supabase SQL editor');
  log.info('3. Start your application with: npm run dev');
  log.info('4. Access the admin panel at: http://localhost:5173/admin/login');
  log.info('5. Log in with: nil@gmail.com / nil123');
  
  rl.close();
};

// Run the script
main().catch((error) => {
  log.error('An error occurred during setup:');
  log.error(error.message);
  rl.close();
}); 