import test from 'node:test';
import assert from 'node:assert/strict';

import { getLoanEligibilityFromMemberState } from './loan-eligibility.js';

test('menolak ketika ada pengajuan pending', () => {
   const result = getLoanEligibilityFromMemberState({
      pendingLoanApplications: [{ status: 'PENDING' }],
      activeLoans: [],
   });

   assert.equal(result.allowed, false);
   assert.match(result.message, /pending|menunggu/iu);
});

test('menolak ketika ada pinjaman aktif yang belum lunas total', () => {
   const result = getLoanEligibilityFromMemberState({
      pendingLoanApplications: [],
      activeLoans: [{ status: 'ACTIVE', remaining_balance: 500000 }],
   });

   assert.equal(result.allowed, false);
   assert.match(result.message, /belum lunas|aktif/iu);
});

test('mengizinkan ketika tidak ada pending dan pinjaman aktif lunas', () => {
   const result = getLoanEligibilityFromMemberState({
      pendingLoanApplications: [],
      activeLoans: [{ status: 'ACTIVE', remaining_balance: 0 }],
   });

   assert.equal(result.allowed, true);
   assert.equal(result.message, '');
});
