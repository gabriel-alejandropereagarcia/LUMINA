import { redirect } from "next/navigation";

/** Superficie corporativa es /empresa. El dashboard /sponsor era un mock de julio. */
export default function SponsorRedirect() {
  redirect("/empresa");
}
