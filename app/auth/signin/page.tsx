import { SignInForm } from "@/components/auth/signin-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Training Tracker</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
