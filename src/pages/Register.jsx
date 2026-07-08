import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Código de verificação inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Código enviado",
        description: "Confira seu e-mail para o novo código.",
      });
    } catch (err) {
      setError(err.message || "Falha ao reenviar código");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  if (showOtp) {
    return (
      <AuthLayout
        title="Verifique seu e-mail 📩"
        subtitle={`Enviamos um código para ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm font-inter" style={{ background: "rgba(180,35,24,0.15)", color: "#FCA5A5" }}>
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6 auth-otp">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="auth-otp-slot" />
              <InputOTPSlot index={1} className="auth-otp-slot" />
              <InputOTPSlot index={2} className="auth-otp-slot" />
              <InputOTPSlot index={3} className="auth-otp-slot" />
              <InputOTPSlot index={4} className="auth-otp-slot" />
              <InputOTPSlot index={5} className="auth-otp-slot" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-montserrat font-bold text-sm"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
          style={{
            background: "linear-gradient(135deg, #B8872A, #D4A043)",
            color: "#071D33",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar código"
          )}
        </Button>
        <p className="text-center font-inter text-sm mt-4" style={{ color: "rgba(255,255,255,0.55)" }}>
          Não recebeu o código?{" "}
          <button onClick={handleResend} className="font-semibold hover:underline" style={{ color: "#D4A043" }}>
            Reenviar
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crie sua conta ✨"
      subtitle="Cadastre-se para começar sua jornada no IFL"
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: "#D4A043" }}>
            Entrar
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
        Cadastrar com Google
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
              className="auth-input pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" style={{ color: "rgba(255,255,255,0.7)" }}>Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" style={{ color: "rgba(255,255,255,0.7)" }}>Confirmar Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input pl-10 h-12"
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
              Criando conta...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Criar conta
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}