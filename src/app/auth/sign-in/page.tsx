import SignInForm from "@/components/sign-in-form";

export const metadata = { title: "Advisor Sign In | BPIP" };

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="logo">BPIP</div>
        <small>BUSINESS PERFORMANCE INTELLIGENCE</small>
        <h1>Welcome back.</h1>
        <p>Sign in to your private advisor workspace.</p>
        <SignInForm />
        <footer>Authorized advisor access only</footer>
      </section>
    </main>
  );
}
