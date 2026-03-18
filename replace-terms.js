const fs = require('fs');
const path = require('path');

const files = [
  'components/admin/staff-list.tsx',
  'components/admin/register-member-dialog.tsx',
  'components/admin/register-staff-dialog.tsx',
  'components/admin/members-list.tsx',
  'components/admin/pending-payments.tsx',
  'components/admin/expired-members-list.tsx',
  'components/member/attendance-history.tsx',
  'components/member/qr-code-display.tsx',
  'components/member/progress-notes.tsx',
  'components/member/member-profile.tsx'
];

const exactReplacements = [
  ['authorized signatures managing the vault', 'authorized staff managing the gym'],
  ['verified signatures in the vault', 'verified members in the gym'],
  ['Establishing a new elite profile in the vault.', 'Establishing a new profile in the gym.'],
  ['All systems synchronized. No pending payloads.', 'All systems updated. No pending transactions.'],
  ["Neural sync will automatically calculate expiry based on the operative's selected tier from this timestamp.", "The system will automatically calculate expiry based on the member's selected plan from this timestamp."],
  ['Filter signatures by identity or channel...', 'Filter members by name or email...'],
  ['Search personnel by identity, channel or designation...', 'Search personnel by name, email or role...'],
  ['No matching operatives found in the database.', 'No matching members found in the database.'],
  ['Signatures with revoked vault access requiring protocol renewal', 'Members with revoked gym access requiring membership renewal'],
  ['Search deactivated vault signatures...', 'Search deactivated gym members...'],
  ['No revoked signatures detected in the perimeter.', 'No revoked members detected at the check-in.'],
  ['Present this <span className="text-[#daa857]">Neural Link</span> at the perimeter terminal for instant vault decryption.', 'Present this <span className="text-[#daa857]">QR Code</span> at the check-in terminal for instant gym access.'],
  ['No mission records found in the vault.', 'No attendance records found in the gym.'],
  ['Sync Optimized Signature', 'Update Profile'],
  ['Adjust Profile Signature', 'Adjust Member Profile'],
  ['Vault Validity', 'Membership Validity'],
  ['Vault Tier', 'Membership Plan'],
  ['Trainer Intel', 'Trainer Notes'],
  ['Retry Neural Link', 'Retry QR Code'],
  ['Neural Link (QR)', 'QR Code'],
  ['Emergency Extraction Protocol', 'Emergency Check-out Protocol'],
  ['New Signature', 'New Member'],
  ['Sync Queue', 'Update Queue'],
  ['Sync Deactivated', 'Update Deactivated'],
  ['Current Cycle', 'Current Month'],
  ['CYCLES AGO', 'DAYS AGO'],
  ['Mission Tier', 'Membership Plan'],
  ['Deployment Tier', 'Membership Plan'],
  ['Mission Intelligence', 'Fitness Goals'],
  ['Cycle of Origin', 'Date of Birth'],
  ['Deployment Log', 'Attendance History'],
  ['Neural Link', 'QR Code'],
  ['Command Personnel', 'Staff'],
  ['Mission records', 'Attendance records'],
  ['mission records', 'attendance records'],
];

const regexReplacements = [
  { regex: /\bSanctuary\b/g, replace: 'Gym' },
  { regex: /\bsanctuary\b/g, replace: 'gym' },
  { regex: /\bOperatives\b/g, replace: 'Members' },
  { regex: /\boperatives\b/g, replace: 'members' },
  { regex: /\bOperative\b/g, replace: 'Member' },
  { regex: /\boperative\b/g, replace: 'member' },
  { regex: /\bSignatures\b/g, replace: 'Members' },
  { regex: /\bsignatures\b/g, replace: 'members' },
  { regex: /\bSignature\b/g, replace: 'Member' },
  { regex: /\bsignature\b/g, replace: 'member' },
  { regex: /\bVaults\b/g, replace: 'Gyms' },
  { regex: /\bvaults\b/g, replace: 'gyms' },
  { regex: /\bVault\b/g, replace: 'Gym' },
  { regex: /\bvault\b/g, replace: 'gym' },
  { regex: /\bSyncs\b/g, replace: 'Updates' },
  { regex: /\bsyncs\b/g, replace: 'updates' },
  { regex: /\bSyncing\b/g, replace: 'Updating' },
  { regex: /\bsyncing\b/g, replace: 'updating' },
  { regex: /\bSync\b/g, replace: 'Update' },
  { regex: /\bsync\b/g, replace: 'update' },
  { regex: /\bPerimeter\b/g, replace: 'Check-in' },
  { regex: /\bperimeter\b/g, replace: 'check-in' },
  { regex: /\bExtraction\b/g, replace: 'Check-out' },
  { regex: /\bextraction\b/g, replace: 'check-out' },
  { regex: /\bIntel\b/g, replace: 'Details' },
  { regex: /\bintel\b/g, replace: 'details' },
  { regex: /\bCycles\b/g, replace: 'Days' },
  { regex: /\bcycles\b/g, replace: 'days' },
  { regex: /\bCycle\b/g, replace: 'Month' },
  { regex: /\bcycle\b/g, replace: 'month' },
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Exact string replacements first
    for (const [oldStr, newStr] of exactReplacements) {
      content = content.split(oldStr).join(newStr);
    }
    
    // Regex replacements next
    for (const { regex, replace } of regexReplacements) {
      content = content.replace(regex, replace);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.error(`File not found: ${file}`);
  }
}
