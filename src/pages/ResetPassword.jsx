import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Falha ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        title="Link inválido ⚠️"
        subtitle="Este link de redefinição está ausente ou inválido"
        footer={
          <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: "#D4A043" }}>
            Solicitar um novo link
          </Link>
        }
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(180,35,24,0.15)" }}>
              <AlertTriangle size={28} style={{ color: "#FCA5A5" }} />
            </div>
          </div>
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            O link utilizado parece estar incompleto. Solicite um novo e-mail de redefinição de senha.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nova senha 🔒"
      subtitle="Digite sua nova senha abaixo"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm font-inter" style={{ background: "rgba(180,35,24,0.15)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" style={{ color: "rgba(255,255,255,0.7)" }}>Nova Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              Redefinindo...
            </>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}