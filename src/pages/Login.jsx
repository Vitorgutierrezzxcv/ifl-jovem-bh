import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta 👋"
      subtitle="Acesse sua conta no Central IFL Jovem BH"
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: "#D4A043" }}>
            Criar uma
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-5"
        onClick={handleGoogle}
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#FFFFFF",
        }}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Entrar com Google
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: "rgba(255,255,255,0.14)" }} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-3 font-inter" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.02)" }}>
            ou
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm font-inter" style={{ background: "rgba(180,35,24,0.15)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" style={{ color: "rgba(255,255,255,0.7)" }}>E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#FFFFFF",
              }}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" style={{ color: "rgba(255,255,255,0.7)" }}>Senha</Label>
            <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "#D4A043" }}>
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#FFFFFF",
              }}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-12 font-montserrat font-bold text-sm"
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #B8872A, #D4A043)",
            color: "#071D33",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}