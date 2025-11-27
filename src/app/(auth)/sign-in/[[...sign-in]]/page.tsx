import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
          card: "shadow-none",
          headerTitle: "text-xl font-semibold text-gray-900",
          headerSubtitle: "text-sm text-gray-600",
          socialButtonsBlockButton:
            "border border-gray-300 hover:bg-gray-50 text-gray-600",
          formFieldLabel: "text-sm font-medium text-gray-700",
          formFieldInput:
            "rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          footerActionLink: "text-blue-600 hover:text-blue-700",
        },
      }}
    />
  );
}
