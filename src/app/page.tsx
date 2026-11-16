import { connection } from "next/server";
import Dashboard from "@/components/dashboard";
import { getStats } from "@/lib/db";

export const instant = false;

export default async function Page() {
  await connection();
  return <Dashboard stats={await getStats()} />;
}
