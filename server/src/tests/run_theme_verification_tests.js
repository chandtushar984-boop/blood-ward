import './testDb.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, '../../../client');

let passed = 0;
let total = 0;

function assert(title, condition, extraInfo = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`TEST ${total}: ${title} [✅ PASS]`);
  } else {
    console.error(`TEST ${total}: ${title} [❌ FAIL] ${extraInfo}`);
  }
}

console.log('=== BLOODWARD GLOBAL THEME & VISUAL CONTRAST VERIFICATION TESTS ===');

// 1. Check index.html inline script for zero-flash theme restoration
const indexHtmlPath = path.join(clientDir, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
const hasInlineScript = indexHtmlContent.includes("localStorage.getItem('bloodward-theme')") &&
  indexHtmlContent.includes("classList.add('dark')") &&
  indexHtmlContent.includes("setAttribute('data-theme'");
assert('1. index.html contains inline zero-flash theme initialization script in <head>', hasInlineScript);

// 2. Check index.css for Tailwind v4 custom-variant dark
const indexCssPath = path.join(clientDir, 'src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');
const hasCustomVariant = indexCssContent.includes('@custom-variant dark');
assert('2. index.css declares Tailwind v4 @custom-variant dark for selector-based dark mode', hasCustomVariant);

// 3. Check index.css has both data-theme="dark" and .dark selector blocks
const hasDarkSelectors = indexCssContent.includes('[data-theme="dark"]') && indexCssContent.includes('.dark');
assert('3. index.css supports both [data-theme="dark"] and .dark CSS variable blocks', hasDarkSelectors);

// 4. Check index.css color-scheme property
const hasColorScheme = indexCssContent.includes('color-scheme: dark') && indexCssContent.includes('color-scheme: light');
assert('4. index.css specifies color-scheme for browser native control adapting', hasColorScheme);

// 5. Check index.css refined palette tokens (#0f1115, #181b21, #343b47)
const hasPaletteTokens = indexCssContent.includes('#0f1115') &&
  indexCssContent.includes('#181b21') &&
  indexCssContent.includes('#343b47');
assert('5. index.css contains dark palette tokens (#0f1115, #181b21, #343b47)', hasPaletteTokens);

// 6. Check ThemeContext.jsx implementation
const themeContextPath = path.join(clientDir, 'src/context/ThemeContext.jsx');
const themeContextContent = fs.readFileSync(themeContextPath, 'utf-8');
const updatesDataTheme = themeContextContent.includes("root.setAttribute(\"data-theme\", theme)") ||
  themeContextContent.includes("setAttribute('data-theme'");
const updatesDarkClass = themeContextContent.includes("classList.add(\"dark\")") ||
  themeContextContent.includes("classList.add('dark')");
const persistsLocalStorage = themeContextContent.includes("localStorage.setItem(\"bloodward-theme\"");
assert('6. ThemeContext updates data-theme attribute, .dark class, and localStorage', updatesDataTheme && updatesDarkClass && persistsLocalStorage);

// 7. Check DonorLayout supports dark mode with permanent header ThemeToggle
const donorLayoutPath = path.join(clientDir, 'src/layouts/DonorLayout.jsx');
const donorLayoutContent = fs.readFileSync(donorLayoutPath, 'utf-8');
const donorLayoutDark = donorLayoutContent.includes('dark:bg-[#0F1115]') &&
  donorLayoutContent.includes('dark:bg-[#181B21]') &&
  donorLayoutContent.includes('<ThemeToggle />');
assert('7. DonorLayout top container & header specify dark tokens with permanent ThemeToggle', donorLayoutDark);

// 8. Check RecipientLayout supports dark mode with permanent header ThemeToggle
const recipientLayoutPath = path.join(clientDir, 'src/layouts/RecipientLayout.jsx');
const recipientLayoutContent = fs.readFileSync(recipientLayoutPath, 'utf-8');
const recipientLayoutDark = recipientLayoutContent.includes('dark:bg-[#0F1115]') &&
  recipientLayoutContent.includes('dark:bg-[#181B21]') &&
  recipientLayoutContent.includes('<ThemeToggle />');
assert('8. RecipientLayout top container & header specify dark tokens with permanent ThemeToggle', recipientLayoutDark);

// 9. Check AdminLayout supports dark mode with permanent header ThemeToggle
const adminLayoutPath = path.join(clientDir, 'src/layouts/AdminLayout.jsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf-8');
const adminLayoutDark = adminLayoutContent.includes('dark:bg-[#0F1115]') &&
  adminLayoutContent.includes('dark:bg-[#181B21]') &&
  adminLayoutContent.includes('<ThemeToggle />');
assert('9. AdminLayout top container & header specify dark tokens with permanent ThemeToggle', adminLayoutDark);

// 10. Check Button.jsx outline & ghost dark styles
const buttonPath = path.join(clientDir, 'src/components/common/Button.jsx');
const buttonContent = fs.readFileSync(buttonPath, 'utf-8');
const buttonDark = buttonContent.includes('dark:border-[#343B47]') || buttonContent.includes('dark:border-zinc-700');
assert('10. Button.jsx outline & ghost variants include dedicated dark-mode styles', buttonDark);

// 11. Check Navbar renders ThemeToggle permanently in header row across viewport states
const navbarPath = path.join(clientDir, 'src/components/common/Navbar.jsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf-8');
const navbarPermanentTheme = navbarContent.includes('<ThemeToggle />') &&
  !navbarContent.includes('Theme:');
assert('11. Navbar renders ThemeToggle permanently in top row and removes duplicate row from drawer', navbarPermanentTheme);

// 12. Check Navbar drawer layout & scrolling bounds
const navbarDrawerCorrect = navbarContent.includes('max-h-[calc(100dvh-3.5rem)]') &&
  navbarContent.includes('overflow-y-auto') &&
  navbarContent.includes('document.body.style.overflow = "hidden"');
assert('12. Navbar mobile drawer includes max-h bounds, internal scrolling and body scroll-lock', navbarDrawerCorrect);

// 13. Check Footer dark mode styling
const footerPath = path.join(clientDir, 'src/components/common/Footer.jsx');
const footerContent = fs.readFileSync(footerPath, 'utf-8');
const footerDark = footerContent.includes('dark:bg-[#181B21]') && footerContent.includes('dark:border-[#343B47]');
assert('13. Footer.jsx contains responsive dark mode surfaces and borders', footerDark);

// 14. Check ThemeToggle icon-only segmented control displaying Sun and Moon
const themeTogglePath = path.join(clientDir, 'src/components/common/ThemeToggle.jsx');
const themeToggleContent = fs.readFileSync(themeTogglePath, 'utf-8');
const themeToggleIconOnly = themeToggleContent.includes('Sun') &&
  themeToggleContent.includes('Moon') &&
  themeToggleContent.includes('Switch to Light mode') &&
  themeToggleContent.includes('Switch to Dark mode');
assert('14. ThemeToggle displays Sun and Moon icons with accessible tooltips & aria labels', themeToggleIconOnly);

// 15. Check BloodCompatibility.jsx dark mode contrast & clinical disclaimer
const bloodCompPath = path.join(clientDir, 'src/components/common/BloodCompatibility.jsx');
const bloodCompContent = fs.readFileSync(bloodCompPath, 'utf-8');
const bloodCompContrast = bloodCompContent.includes('dark:bg-[#181B21]') &&
  bloodCompContent.includes('dark:bg-[#152336]') &&
  bloodCompContent.includes('dark:text-sky-200');
assert('15. BloodCompatibility.jsx has high-contrast clinical disclaimer and readable groups', bloodCompContrast);

console.log('===================================');
console.log(`FINAL RESULTS: ${passed}/${total} PASSED.`);
process.exit(passed === total ? 0 : 1);
