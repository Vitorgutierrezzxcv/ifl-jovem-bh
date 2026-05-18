import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function CheckInModal({ isOpen, onClose, eventId, eventName, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const handleCheckIn = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke("validateCheckIn", { event_id: eventId });
      
      if (response.data.status === "checked_in") {
        setStatus("success");
        setMessage(response.data.message);
        setPointsAwarded(response.data.points_awarded || 0);
        if (onSuccess) onSuccess(response.data);
      } else if (response.data.status === "already_checked") {
        setStatus("warning");
        setMessage(response.data.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Erro ao processar check-in");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSuccess = status === "success";
  const isError = status === "error";
  const isWarning = status === "warning";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-montserrat font-bold text-lg" style={{ color: "#071D33" }}>
            {isSuccess ? "Check-in Realizado!" : isWarning ? "Atenção" : isError ? "Erro" : "Confirmar Check-in"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X size={20} style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          {!status ? (
            <>
              <p className="font-inter text-sm mb-4" style={{ color: "#6B7280" }}>
                Deseja confirmar presença em:
              </p>
              <div className="p-4 rounded-2xl mb-6" style={{ background: "#071D33" }}>
                <p className="font-montserrat font-bold text-lg text-white">{eventName || "Evento"}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {isSuccess && (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.2)" }}>
                    <CheckCircle size={32} style={{ color: "#1F8A5B" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-inter text-sm" style={{ color: "#6B7280" }}>
                      {message}
                    </p>
                    {pointsAwarded > 0 && (
                      <p className="font-montserrat font-bold text-lg mt-2" style={{ color: "#B8872A" }}>
                        +{pointsAwarded} pontos!
                      </p>
                    )}
                  </div>
                </>
              )}
              {isWarning && (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(217,154,34,0.2)" }}>
                    <AlertCircle size={32} style={{ color: "#D99A22" }} />
                  </div>
                  <p className="font-inter text-sm text-center" style={{ color: "#6B7280" }}>
                    {message}
                  </p>
                </>
              )}
              {isError && (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(180,35,24,0.2)" }}>
                    <AlertCircle size={32} style={{ color: "#B42318" }} />
                  </div>
                  <p className="font-inter text-sm text-center" style={{ color: "#6B7280" }}>
                    {message}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-2 border-t border-gray-200">
          {!status ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl font-inter font-semibold transition-colors"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl font-inter font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ background: "#071D33", color: "#FFFFFF" }}
              >
                {loading && <Loader size={16} className="animate-spin" />}
                Confirmar
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-xl font-inter font-semibold"
              style={{ background: "#071D33", color: "#FFFFFF" }}
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}