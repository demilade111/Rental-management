import { useState, useEffect } from "react";
import LeaseCard from "./LeaseCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, SlidersHorizontal, X, Plus, User2 } from "lucide-react";
import CreateLeaseModal from "./lease-modal/CreateLeaseModal";

export default function LeasesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState(["Long term"]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const removeChip = (label) =>
    setChips((prev) => prev.filter((c) => c !== label));

  // Fetch leases from backend
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/leases`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to load leases");
        }

        const data = await res.json();
        console.log("Leases fetched:", data);
        setLeases(data?.data || []); 
      } catch (err) {
        console.error("Lease fetch error:", err);
        setError("Failed to load leases. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  const handleUploadCustom = (file) => {
    setUploadedFile(file);
    setOpenDrawer(true);
    setOpenModal(false);
  };

  return (
    <div className="h-full w-full px-6 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leases</h1>
          <p className="text-sm text-muted-foreground mt-1">Per Property</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary">
            <User2 className="mr-2 h-4 w-4" />
            My Leases
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Lease
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-[360px] grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="non-active">Non-Active</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 w-[360px]"
            placeholder="Search by name or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button variant="outline">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>

        {chips.map((label) => (
          <Badge
            key={label}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {label}
            <button
              onClick={() => removeChip(label)}
              className="ml-1 rounded hover:bg-muted/60"
              aria-label={`Remove ${label}`}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>

      <CreateLeaseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateStandard={() => {
          setShowCreateModal(false);
          // navigate to your guided lease creation flow
          window.location.href = "/landlord/leases/create";
        }}
        onUploadCustom={(file) => {
          console.log("Custom file selected:", file);
          // handle upload here
              setOpenDrawer(true);

        }}
      />

      <Separator className="my-6" />

      {loading && (
        <p className="text-gray-500 text-sm mt-2">Loading leases...</p>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}

      {!loading && !error && leases.length > 0 && (
        <div className="mt-6">
          {leases.map((lease) => (
            <LeaseCard key={lease.id} lease={lease} />
          ))}
        </div>
      )}

      {!loading && !error && leases.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">
          No leases found.
        </p>
      )}
    </div>
  );
}
