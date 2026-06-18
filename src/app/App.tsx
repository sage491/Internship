import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";

export default function App() {
  return (
    /* MARKER-MAKE-KIT-INVOKED */
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: { fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" },
          duration: 3500,
        }}
      />
    </>
  );
}
