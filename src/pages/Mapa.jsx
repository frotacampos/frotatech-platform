import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { reportsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";
import { MapPin, Loader2 } from "lucide-react";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const statusColors = {
  Pendente: "#f59e0b",
  "Em Andamento": "#3b82f6",
};

function createColoredIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// Rio Preto da Eva - AM
const CENTRO = [-2.6936, -59.7006];

export default function Mapa() {
  const { user, role, loading } = useAppAuth();

  const { data: reportes = [], isLoading } = useQuery({
    queryKey: ["reportes-mapa"],
    queryFn: () => reportsApi.listReports(),
    enabled: !loading,
  });

  // Only active reportes (not resolved/cancelled) with GPS coordinates
  const reportesComGps = reportes.filter(
    (r) => r.latitude && r.longitude && r.status !== "Resolvido" && r.status !== "Cancelado"
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Mapa" />

      <main className="lg:pl-64 pt-20 lg:pt-0 h-screen flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
          <MapPin className="w-5 h-5 text-lumicity-cyan" />
          <h1 className="font-space text-lg font-bold text-white">Mapa de Ocorrências</h1>
          <span className="ml-auto text-white/40 text-sm font-inter">
            {reportesComGps.length} ocorrência(s) no mapa
          </span>
        </div>

        {/* Legend */}
        <div className="px-6 py-2 flex items-center gap-4 flex-shrink-0">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: color }}
              />
              <span className="text-white/50 text-xs font-inter">{status}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={CENTRO}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reportesComGps.map((reporte) => (
              <Marker
                key={reporte.id}
                position={[reporte.latitude, reporte.longitude]}
                icon={createColoredIcon(statusColors[reporte.status] || "#6b7280")}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-semibold mb-1">{reporte.categoria || "Iluminação Pública"}</p>
                    <p className="text-gray-600 mb-2 text-xs">{reporte.descricao?.slice(0, 100)}{reporte.descricao?.length > 100 ? "..." : ""}</p>
                    {reporte.endereco && (
                      <p className="text-gray-500 text-xs mb-1">📍 {reporte.endereco}</p>
                    )}
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
                      style={{ backgroundColor: statusColors[reporte.status] || "#6b7280" }}
                    >
                      {reporte.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}
