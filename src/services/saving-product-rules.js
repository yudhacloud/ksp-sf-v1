export const REQUIRED_SAVING_TYPES = ["POKOK", "WAJIB"];
export const ALLOWED_CREATE_SAVING_TYPES = ["SUKARELA"];

export function isRequiredSavingType(savingType) {
   return REQUIRED_SAVING_TYPES.includes(String(savingType || "").trim().toUpperCase());
}

export function isVoluntarySavingType(savingType) {
   return String(savingType || "").trim().toUpperCase() === "SUKARELA";
}

export function normalizeSavingType(value) {
   return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function validateSavingProductCreatePayload({ savingType, defaultAmount }) {
   const normalizedType = normalizeSavingType(savingType);
   const normalizedAmount = Number(defaultAmount || 0);

   if (!ALLOWED_CREATE_SAVING_TYPES.includes(normalizedType)) {
      return {
         valid: false,
         message: "Admin hanya dapat menambahkan simpanan sukarela.",
      };
   }

   if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return {
         valid: false,
         message: "Nominal simpanan wajib lebih dari 0.",
      };
   }

   return { valid: true, normalizedType, normalizedAmount };
}

export function normalizeSavingProductUpdatePayload(payload = {}) {
   const normalizedType = normalizeSavingType(payload.saving_type);
   const normalizedAmount = Number(payload.default_amount || 0);

   if (isRequiredSavingType(normalizedType)) {
      return {
         name: typeof payload.name === "string" ? payload.name.trim() : "",
         saving_type: normalizedType,
         default_amount: Number.isFinite(normalizedAmount) && normalizedAmount > 0 ? normalizedAmount : 0,
         description: typeof payload.description === "string" ? payload.description.trim() : null,
         is_active: true,
      };
   }

   return {
      name: typeof payload.name === "string" ? payload.name.trim() : "",
      saving_type: normalizedType,
      default_amount: Number.isFinite(normalizedAmount) && normalizedAmount > 0 ? normalizedAmount : 0,
      description: typeof payload.description === "string" ? payload.description.trim() : null,
      is_active: typeof payload.is_active === "boolean" ? payload.is_active : true,
   };
}
