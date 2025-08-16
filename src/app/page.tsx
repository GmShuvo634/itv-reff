import { redirect } from "next/navigation";
import { getUserFromServer, loginAction } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getUserFromServer();
  if (user) redirect("/dashboard");

  return <LoginForm loginAction={loginAction} />;
}
