import { redirect } from "next/navigation";

// Middleware sends signed-out visitors to /login and signed-in ones to
// /today, so this route never actually renders — it just needs to exist.
export default function RootPage() {
  redirect("/today");
}
