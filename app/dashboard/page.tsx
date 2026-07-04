import { redirect } from "next/navigation";

export default function DashboardIndex() {
  redirect("/dashboard/command-center");
}
