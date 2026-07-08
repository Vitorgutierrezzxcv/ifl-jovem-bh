import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title="Esqueceu a senha? 🔑"
      subtitle="Enviaremos um link para redefini-la"
      footer={
        <Link to="/login" className="font-medium hover:underline inline-flex items-center" style={{ color: "#D4A043" }}>
          <ArrowLeft className="w-3 h-3 inline mr-1" />Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.15)" }}>
              <CheckCircle size={28} style={{ color: "#1F8A5B" }} />
            </div>
          </div>
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Se existir uma conta com esse e-mail, você receberá um link de redefinição em breve.
          </p>
        </div>
      ) : (
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
                Enviando...
              </>
            ) : (
              "Enviar link de redefinição"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}