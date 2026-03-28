import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Props = {
  message?: string;
};

export default function LoginPrompt({ message }: Props) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <Lock className="h-7 w-7 text-teal" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Inloggen vereist
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {message ?? "Log in om toegang te krijgen tot deze functie."}
        </p>
      </div>
      <Button
        onClick={login}
        disabled={isLoggingIn}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        data-ocid="auth.primary_button"
      >
        {isLoggingIn ? "Inloggen..." : "Inloggen"}
      </Button>
    </div>
  );
}
