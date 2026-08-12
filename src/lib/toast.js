const TOAST_EVENT = "app-toast";

export function showToast({ title = "Peringatan", message, type = "warning", duration = 3000 }) {
   if (typeof window === "undefined") {
      return;
   }

   window.dispatchEvent(
      new CustomEvent(TOAST_EVENT, {
         detail: { title, message, type, duration },
      })
   );
}

export function toastError(message, title = "Terjadi Kesalahan") {
   showToast({ title, message, type: "error" });
}

export function toastWarning(message, title = "Peringatan") {
   showToast({ title, message, type: "warning" });
}

export function toastSuccess(message, title = "") {
   showToast({ title, message, type: "success", duration: 4000 });
}
