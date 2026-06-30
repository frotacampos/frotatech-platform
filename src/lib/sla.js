/**
 * SLA Utilities for LumiCity
 */

/**
 * Calculate duration in milliseconds between two ISO date strings
 */
export function calcDuration(start, end) {
  if (!start) return null;
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return e - s;
}

/**
 * Format milliseconds to human readable string
 * e.g. "2d 4h" | "3h 15m" | "45m"
 */
export function formatDuration(ms) {
  if (ms === null || ms === undefined || ms < 0) return "—";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Returns SLA color class based on days elapsed
 * < 1 day → green, 1-3 days → yellow, > 3 days → red
 */
export function slaColor(ms) {
  if (!ms) return "text-white/40";
  const days = ms / 86400000;
  if (days < 1) return "text-green-400";
  if (days < 3) return "text-yellow-400";
  return "text-red-400";
}

/**
 * Calculate average resolution time in ms for resolved reports
 */
export function calcAvgResolutionTime(reportes) {
  const resolved = reportes.filter(r => r.status === "Resolvido" && r.data_resolucao);
  if (!resolved.length) return null;
  const total = resolved.reduce((sum, r) => {
    const start = r.data_criacao || r.created_date;
    const end = r.data_resolucao;
    if (!start || !end) return sum;
    return sum + (new Date(end) - new Date(start));
  }, 0);
  return total / resolved.length;
}

/**
 * Get individual SLA for a chamado
 */
export function getChamadoSla(reporte) {
  const start = reporte.data_criacao || reporte.created_date;
  const end = reporte.data_resolucao;
  return calcDuration(start, reporte.status === "Resolvido" ? end : null);
}

/**
 * Cluster nearby coordinates (simple grid-based)
 * Returns array of clusters: { lat, lng, items, count }
 */
export function clusterChamados(chamados, gridSize = 0.005) {
  const clusters = [];
  const used = new Set();

  chamados.forEach((c, i) => {
    if (used.has(i) || !c.latitude || !c.longitude) return;
    const cluster = { lat: c.latitude, lng: c.longitude, items: [c] };
    used.add(i);

    chamados.forEach((c2, j) => {
      if (used.has(j) || !c2.latitude || !c2.longitude) return;
      if (Math.abs(c2.latitude - c.latitude) < gridSize && Math.abs(c2.longitude - c.longitude) < gridSize) {
        cluster.items.push(c2);
        used.add(j);
      }
    });

    // Center of cluster
    cluster.lat = cluster.items.reduce((s, x) => s + x.latitude, 0) / cluster.items.length;
    cluster.lng = cluster.items.reduce((s, x) => s + x.longitude, 0) / cluster.items.length;
    cluster.count = cluster.items.length;
    clusters.push(cluster);
  });

  return clusters;
}

/**
 * Get top hotspot regions (grid cells with most chamados)
 */
export function getHotspots(chamados, topN = 5) {
  const grid = {};
  chamados.forEach(c => {
    if (!c.latitude || !c.longitude) return;
    const key = `${(c.latitude * 10).toFixed(0)},${(c.longitude * 10).toFixed(0)}`;
    if (!grid[key]) grid[key] = { count: 0, lat: c.latitude, lng: c.longitude, items: [] };
    grid[key].count++;
    grid[key].items.push(c);
  });
  return Object.values(grid)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}