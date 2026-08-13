"use client";

import { useEffect, useState } from "react";

const TOAST_EVENT = "app-toast";

export default function ToastProvider() {
   const [toasts, setToasts] = useState([]);

   useEffect(() => {
      function handleToast(event) {
         const { title, message, type, duration } = event.detail || {};

         const toast = {
            id: Date.now() + Math.random(),
            title: title || "Peringatan",
            message: message || "",
            type: type || "warning",
            duration: duration || 3000,
         };

         setToasts((current) => [...current, toast]);

         window.setTimeout(() => {
            setToasts((current) => current.filter((item) => item.id !== toast.id));
         }, toast.duration);
      }

      window.addEventListener(TOAST_EVENT, handleToast);
      return () => window.removeEventListener(TOAST_EVENT, handleToast);
   }, []);

   if (toasts.length === 0) {
      return null;
   }

   return (
      <div
         aria-live="polite"
         aria-atomic="true"
         style={{
            position: "fixed",
            left: "50%",
            top: "1.25rem",
            transform: "translateX(-50%)",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            width: "min(100vw - 2rem, 620px)",
         }}
      >
         {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";

            return (
               <div
                  key={toast.id}
                  role="status"
                  style={{
                     background: isError ? "#f3efe9" : isSuccess ? "#dff5e6" : "#fff7ed",
                     border: `1.5px solid ${isError ? "#b7a79a" : isSuccess ? "#62b57f" : "#f4b267"}`,
                     borderRadius: "0.8rem",
                     padding: "0.8rem 1rem",
                     boxShadow: "0 10px 22px rgba(26, 55, 40, 0.09)",
                     color: isSuccess ? "#1f4d34" : isError ? "#41362f" : "#5b3a19",
                     width: "100%",
                     minHeight: "2.8rem",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "flex-start",
                     fontSize: "0.98rem",
                  }}
               >
                  {toast.title ? (
                     <div style={{ fontWeight: 700, marginRight: "0.5rem" }}>{toast.title}</div>
                  ) : null}
                  <div style={{ lineHeight: 1.4, fontWeight: 500 }}>{toast.message}</div>
               </div>
            );
         })}
      </div>
   );
}
