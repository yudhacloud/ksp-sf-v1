import { supabaseAdmin } from "../lib/supabase/client";

function getDefaultAmountForSavingType(savingType) {
   switch (savingType) {
      case "POKOK":
         return 100000;
      case "WAJIB":
         return 100000;
      case "SUKARELA":
         return 50000;
      default:
         return 100000;
   }
}

function formatDateInput(date) {
   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthStartDate() {
   const now = new Date();
   return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getLastDayOfPreviousMonth(referenceDate) {
   return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
}

function getLastDayOfCurrentMonth(referenceDate) {
   return new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
}

function getBillingPeriodForSavingType(savingType, referenceDate = new Date()) {
   if (savingType === "POKOK") {
      return getLastDayOfPreviousMonth(referenceDate);
   }

   return getLastDayOfCurrentMonth(referenceDate);
}

function getDueDateForBillingPeriod(periodDate) {
   return new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 9);
}

export async function enrollMemberInSavingProducts({ memberId, productIds }) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   if (!memberId) {
      throw new Error("Member ID tidak tersedia.");
   }

   const normalizedProductIds = Array.isArray(productIds) ? productIds.filter(Boolean) : [];
   if (normalizedProductIds.length === 0) {
      return [];
   }

   const monthStart = getMonthStartDate();
   const monthStartValue = formatDateInput(monthStart);

   const createdAccounts = [];

   for (const productId of normalizedProductIds) {
      const { data: existingAccount, error: existingError } = await supabaseAdmin
         .from("saving_accounts")
         .select("id")
         .eq("member_id", memberId)
         .eq("saving_product_id", productId)
         .limit(1)
         .maybeSingle();

      if (existingError) {
         throw new Error(existingError.message);
      }

      if (existingAccount) {
         continue;
      }

      const { data: productData, error: productError } = await supabaseAdmin
         .from("saving_products")
         .select("id, name, saving_type")
         .eq("id", productId)
         .eq("is_active", true)
         .single();

      if (productError || !productData) {
         continue;
      }

      const { data: createdAccount, error: accountError } = await supabaseAdmin
         .from("saving_accounts")
         .insert([
            {
               member_id: memberId,
               saving_product_id: productId,
               start_date: monthStartValue,
               status: "ACTIVE",
            },
         ])
         .select("id, member_id, saving_product_id, start_date, status")
         .single();

      if (accountError || !createdAccount) {
         throw new Error(accountError?.message || "Gagal membuat akun simpanan.");
      }

      if (productData.saving_type === "POKOK") {
         const obligationPeriodDate = getBillingPeriodForSavingType(productData.saving_type, monthStart);
         const obligationPeriodValue = formatDateInput(obligationPeriodDate);
         const obligationDueDateValue = formatDateInput(getDueDateForBillingPeriod(obligationPeriodDate));

         const { error: obligationError } = await supabaseAdmin
            .from("saving_obligations")
            .insert([
               {
                  saving_account_id: createdAccount.id,
                  billing_period: obligationPeriodValue,
                  due_date: obligationDueDateValue,
                  amount_due: getDefaultAmountForSavingType(productData.saving_type),
                  status: "PENDING",
               },
            ]);

         if (obligationError) {
            throw new Error(obligationError.message);
         }
      }

      createdAccounts.push({
         id: createdAccount.id,
         productId,
         name: productData.name,
         savingType: productData.saving_type,
      });
   }

   return createdAccounts;
}

export async function enrollMemberInDefaultSavingProducts({ memberId }) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   if (!memberId) {
      throw new Error("Member ID tidak tersedia.");
   }

   const { data: defaultProducts, error: productsError } = await supabaseAdmin
      .from("saving_products")
      .select("id, saving_type")
      .in("saving_type", ["POKOK", "WAJIB"])
      .eq("is_active", true);

   if (productsError) {
      throw new Error(productsError.message);
   }

   const productIds = (defaultProducts || []).map((product) => product.id).filter(Boolean);
   if (!productIds.length) {
      return [];
   }

   const enrolled = await enrollMemberInSavingProducts({ memberId, productIds });
   await ensureMemberObligationsForCurrentMonth({ memberId });

   return enrolled;
}

export async function ensureMemberObligationsForCurrentMonth({ memberId }) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   if (!memberId) {
      throw new Error("Member ID tidak tersedia.");
   }

   const monthStart = getMonthStartDate();
   const monthStartValue = formatDateInput(monthStart);

   const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("saving_accounts")
      .select(`
         id,
         start_date,
         saving_product:saving_products!saving_accounts_saving_product_id_fkey (
            id,
            saving_type
         )
      `)
      .eq("member_id", memberId)
      .eq("status", "ACTIVE");

   if (accountsError) {
      throw new Error(accountsError.message);
   }

   for (const account of accounts || []) {
      const productType = account.saving_product?.saving_type;
      if (!productType || productType === "SUKARELA") {
         continue;
      }

      const accountStartDate = new Date(account.start_date || monthStartValue);
      const isInitialMonth = accountStartDate.getFullYear() === monthStart.getFullYear() && accountStartDate.getMonth() === monthStart.getMonth();

      if (productType === "POKOK") {
         const obligationPeriodDate = getBillingPeriodForSavingType(productType, monthStart);
         const obligationPeriodValue = formatDateInput(obligationPeriodDate);
         const obligationDueDateValue = formatDateInput(getDueDateForBillingPeriod(obligationPeriodDate));

         const { data: existingObligation, error: obligationCheckError } = await supabaseAdmin
            .from("saving_obligations")
            .select("id")
            .eq("saving_account_id", account.id)
            .eq("billing_period", obligationPeriodValue)
            .maybeSingle();

         if (obligationCheckError) {
            throw new Error(obligationCheckError.message);
         }

         if (!existingObligation) {
            const { error: insertError } = await supabaseAdmin.from("saving_obligations").insert([
               {
                  saving_account_id: account.id,
                  billing_period: obligationPeriodValue,
                  due_date: obligationDueDateValue,
                  amount_due: getDefaultAmountForSavingType(productType),
                  status: "PENDING",
               },
            ]);

            if (insertError) {
               throw new Error(insertError.message);
            }
         }

         continue;
      }

      if (productType === "WAJIB" && !isInitialMonth) {
         const obligationPeriodDate = getBillingPeriodForSavingType(productType, monthStart);
         const obligationPeriodValue = formatDateInput(obligationPeriodDate);
         const obligationDueDateValue = formatDateInput(getDueDateForBillingPeriod(obligationPeriodDate));

         const { data: existingObligation, error: obligationCheckError } = await supabaseAdmin
            .from("saving_obligations")
            .select("id")
            .eq("saving_account_id", account.id)
            .eq("billing_period", obligationPeriodValue)
            .maybeSingle();

         if (obligationCheckError) {
            throw new Error(obligationCheckError.message);
         }

         if (!existingObligation) {
            const { error: insertError } = await supabaseAdmin.from("saving_obligations").insert([
               {
                  saving_account_id: account.id,
                  billing_period: obligationPeriodValue,
                  due_date: obligationDueDateValue,
                  amount_due: getDefaultAmountForSavingType(productType),
                  status: "PENDING",
               },
            ]);

            if (insertError) {
               throw new Error(insertError.message);
            }
         }
      }
   }
}
