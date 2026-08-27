import { Fragment, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PrivateMeta from "@/components/PrivateMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import logo from "@/assets/logo.png";

interface ConnectionRow {
  id: string;
  customerRef: string;
  utility: string;
  authorizationStatus: string;
  connectionStatus: string;
  authorizedAt: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  accountMatched: boolean;
  intervalDataAvailable: boolean;
  recordsReceived: number;
  syncBatches: number;
  processingStatus: string | null;
  verificationStatus: string | null;
  lastError: string | null;
}

interface IntervalRow {
  interval_start: string;
  interval_duration_seconds: number;
  value_wh: number;
  quality: string | null;
}

const statusTone = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
  if (!status) return "outline";
  if (["active", "authorized", "success", "verified", "verified_clean", "received"].includes(status)) return "default";
  if (["revoked", "failed", "error", "mismatch"].includes(status)) return "destructive";
  return "secondary";
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

const AdminDataConnections = () => {
  const { roles, signOut } = useAuth();
  const canViewUsage = roles.includes("utility_data_viewer");

  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const [usageFor, setUsageFor] = useState<string | null>(null);
  const [usage, setUsage] = useState<IntervalRow[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("admin-connections");
    if (fnError) {
      setError("Could not load connections.");
    } else {
      setConnections(data?.connections ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSync = async (id: string) => {
    setSyncing(id);
    await supabase.functions.invoke("utility-sync", { body: { connectionId: id } });
    setSyncing(null);
    await load();
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    await supabase.functions.invoke("utility-revoke", { body: { connectionId: id } });
    setRevoking(null);
    if (usageFor === id) {
      setUsageFor(null);
      setUsage([]);
    }
    await load();
  };

  const handleViewUsage = async (id: string) => {
    if (usageFor === id) {
      setUsageFor(null);
      setUsage([]);
      return;
    }
    setUsageFor(id);
    setUsage([]);
    setUsageError(null);
    setUsageLoading(true);
    const { data, error: fnError } = await supabase.functions.invoke("admin-view-usage", {
      body: { connectionId: id, limit: 200 },
    });
    setUsageLoading(false);
    if (fnError || !data?.intervals) {
      setUsageError("You do not have access to raw usage data.");
      return;
    }
    setUsage(data.intervals);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <PrivateMeta title="Data Connections — GridForge Admin" />
      <header className="border-b border-[#E2E8F0] bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="GridForge Energy" className="h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <button onClick={() => signOut()} className="text-sm text-[#5A6B82] hover:text-[#273A59]">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-[#273A59]">Utility Data Connections</h1>
        <p className="mt-1 text-sm text-[#5A6B82]">
          Metadata only. Raw usage requires the utility data viewer permission.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] text-xs uppercase text-[#8FA1B5]">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Utility</th>
                <th className="px-4 py-3">Authorization</th>
                <th className="px-4 py-3">Account matched</th>
                <th className="px-4 py-3">Interval data</th>
                <th className="px-4 py-3">Records</th>
                <th className="px-4 py-3">Last sync</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[#8FA1B5]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}
              {!loading && connections.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[#8FA1B5]">
                    No connections yet.
                  </td>
                </tr>
              )}
              {connections.map((c) => (
                <Fragment key={c.id}>
                  <tr className="border-b border-[#E2E8F0] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-[#273A59]">{c.customerRef}</td>
                    <td className="px-4 py-3 uppercase text-[#5A6B82]">{c.utility}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusTone(c.authorizationStatus)}>{c.authorizationStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#5A6B82]">{c.accountMatched ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-[#5A6B82]">{c.intervalDataAvailable ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-[#5A6B82]">{c.recordsReceived}</td>
                    <td className="px-4 py-3 text-[#5A6B82]">{fmt(c.lastSyncAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={statusTone(c.lastSyncStatus)}>
                          {c.lastSyncStatus ?? "never synced"}
                        </Badge>
                        {c.lastError && (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <ShieldAlert className="h-3 w-3" /> {c.lastError}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={syncing === c.id || c.authorizationStatus !== "authorized"}
                          onClick={() => handleSync(c.id)}
                        >
                          {syncing === c.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                          Retry sync
                        </Button>
                        {canViewUsage && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!c.intervalDataAvailable || usageLoading}
                            onClick={() => handleViewUsage(c.id)}
                          >
                            {usageFor === c.id ? "Hide usage" : "View usage"}
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={revoking === c.id || c.authorizationStatus === "revoked"}
                          onClick={() => handleRevoke(c.id)}
                        >
                          {revoking === c.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {usageFor === c.id && (
                    <tr className="bg-[#F7FAFC]">
                      <td colSpan={9} className="px-4 py-4">
                        {usageLoading ? (
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#4EB3A6]" />
                        ) : usageError ? (
                          <p className="text-sm text-red-600">{usageError}</p>
                        ) : (
                          <div className="max-h-72 overflow-y-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="text-[#8FA1B5]">
                                <tr>
                                  <th className="py-1 pr-4">Interval start</th>
                                  <th className="py-1 pr-4">Duration</th>
                                  <th className="py-1 pr-4">Wh</th>
                                  <th className="py-1">Quality</th>
                                </tr>
                              </thead>
                              <tbody>
                                {usage.map((i, idx) => (
                                  <tr key={idx} className="text-[#273A59]">
                                    <td className="py-1 pr-4">{fmt(i.interval_start)}</td>
                                    <td className="py-1 pr-4">{i.interval_duration_seconds}s</td>
                                    <td className="py-1 pr-4">{i.value_wh}</td>
                                    <td className="py-1">{i.quality ?? "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDataConnections;
