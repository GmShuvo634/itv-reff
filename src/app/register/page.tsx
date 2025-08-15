import { redirect } from "next/navigation";
import { getUserFromServer, registerAction } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const user = await getUserFromServer();
  if (user) redirect("/dashboard");

  return <RegisterForm registerAction={registerAction} />;
}
