export function getLoanEligibilityFromMemberState({
   pendingLoanApplications = [],
   activeLoans = [],
}) {
   const hasPendingApplication = (pendingLoanApplications || []).some(
      (application) => application?.status === 'PENDING'
   );

   const hasUnpaidActiveLoan = (activeLoans || []).some((loan) => {
      const status = String(loan?.status || '').toUpperCase();
      const remainingBalance = Number(loan?.remaining_balance ?? loan?.remaining ?? 0);

      return status === 'ACTIVE' && remainingBalance > 0;
   });

   if (hasPendingApplication) {
      return {
         allowed: false,
         message: 'Masih ada pengajuan pinjaman yang menunggu persetujuan.',
      };
   }

   if (hasUnpaidActiveLoan) {
      return {
         allowed: false,
         message: 'Masih ada pinjaman aktif yang belum lunas total.',
      };
   }

   return {
      allowed: true,
      message: '',
   };
}
