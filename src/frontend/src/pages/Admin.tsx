import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HttpAgent } from "@icp-sdk/core/agent";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Edit2,
  ImagePlus,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  BookingRequest,
  ContactSubmission,
  backendInterface as FullBackendInterface,
  PortfolioItem,
  ServicePackage,
} from "../backend.d";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { StorageClient } from "../utils/StorageClient";

const ADMIN_PASSWORD = "lensandlaughs2024";

function formatTime(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const CONTENT_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "hero.tagline", label: "Hero Tagline", multiline: true },
  { key: "hero.subtitle", label: "Hero Subtitle" },
  { key: "hero.cta_primary", label: "Hero Primary Button" },
  { key: "hero.cta_secondary", label: "Hero Secondary Button" },
  { key: "about.heading", label: "About Heading" },
  { key: "about.bio_1", label: "About Bio — Paragraph 1", multiline: true },
  { key: "about.bio_2", label: "About Bio — Paragraph 2", multiline: true },
  { key: "about.bio_3", label: "About Bio — Paragraph 3", multiline: true },
  { key: "about.bio_4", label: "About Bio — Paragraph 4", multiline: true },
  { key: "contact.whatsapp", label: "WhatsApp Number (digits only)" },
  { key: "contact.instagram", label: "Instagram Handle (without @)" },
  { key: "contact.email", label: "Contact Email" },
  { key: "contact.phone", label: "Contact Phone" },
  { key: "footer.tagline", label: "Footer Tagline", multiline: true },
];

// ── Portfolio Tab

function PortfolioTab() {
  const { actor: _actor } = useActor();
  const actor = _actor as FullBackendInterface | null;
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCaption, setNewCaption] = useState("");
  const [editingCaption, setEditingCaption] = useState<Record<string, string>>(
    {},
  );
  const [savingCaption, setSavingCaption] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageClientRef = useRef<StorageClient | null>(null);

  const getStorageClient = useCallback(async () => {
    if (storageClientRef.current) return storageClientRef.current;
    const config = await loadConfig();
    const agent = new HttpAgent({ host: config.backend_host });
    if (config.backend_host?.includes("localhost")) {
      await agent.fetchRootKey().catch(() => {});
    }
    storageClientRef.current = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    return storageClientRef.current;
  }, []);

  const resolveUrls = useCallback(
    async (portfolioItems: PortfolioItem[]) => {
      const sc = await getStorageClient();
      const entries = await Promise.all(
        portfolioItems
          .filter((item) => item.blobKey)
          .map(async (item) => {
            try {
              const url = await sc.getDirectURL(item.blobKey);
              return [String(item.id), url] as [string, string];
            } catch {
              return [String(item.id), ""] as [string, string];
            }
          }),
      );
      setImageUrls((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    },
    [getStorageClient],
  );

  const loadItems = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const data = await actor.getPortfolioItems();
      setItems(data);
      await resolveUrls(data);
    } catch {
      toast.error("Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  }, [actor, resolveUrls]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleUpload = async () => {
    if (!actor || !fileInputRef.current?.files?.[0]) {
      toast.error("Please select a file first.");
      return;
    }
    const file = fileInputRef.current.files[0];
    setUploading(true);
    setUploadProgress(0);
    try {
      const sc = await getStorageClient();
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const { hash } = await sc.putFile(bytes, (pct) => setUploadProgress(pct));
      await actor.addPortfolioItem(ADMIN_PASSWORD, hash, newCaption);
      toast.success("Photo uploaded!");
      setNewCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadItems();
    } catch (e) {
      toast.error(
        `Upload failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deletePortfolioItem(ADMIN_PASSWORD, id);
      toast.success("Photo deleted.");
      await loadItems();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const startEditCaption = (item: PortfolioItem) => {
    setEditingCaption((prev) => ({ ...prev, [String(item.id)]: item.caption }));
  };

  const handleSaveCaption = async (item: PortfolioItem) => {
    if (!actor) return;
    const key = String(item.id);
    const caption = editingCaption[key] ?? item.caption;
    setSavingCaption(key);
    try {
      await actor.updatePortfolioCaption(ADMIN_PASSWORD, item.id, caption);
      toast.success("Caption updated.");
      setEditingCaption((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await loadItems();
    } catch {
      toast.error("Failed to save caption.");
    } finally {
      setSavingCaption(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-card border border-border p-6 rounded">
        <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
          <ImagePlus size={18} className="text-gold" />
          Add New Photo
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider">
              Select Image
            </Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="cursor-pointer"
              data-ocid="portfolio.upload_button"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider">Caption</Label>
            <Input
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="e.g. Editorial Edge"
              data-ocid="portfolio.input"
            />
          </div>
        </div>
        {uploading && (
          <div className="mt-4" data-ocid="portfolio.loading_state">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Uploading...
              </span>
              <span className="text-xs text-muted-foreground">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}
        <Button
          onClick={handleUpload}
          disabled={uploading || !actor}
          className="mt-4 bg-gold text-white hover:bg-gold/90 border-0"
          data-ocid="portfolio.primary_button"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus size={14} className="mr-2" />
              Upload Photo
            </>
          )}
        </Button>
      </div>

      {/* Portfolio Grid */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">
          Portfolio Photos ({items.length})
        </h3>
        {loading ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="portfolio.loading_state"
          >
            <Loader2
              size={28}
              className="mx-auto mb-3 animate-spin opacity-40"
            />
            <p>Loading photos...</p>
          </div>
        ) : items.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground bg-card border border-dashed border-border rounded"
            data-ocid="portfolio.empty_state"
          >
            <ImagePlus size={36} className="mx-auto mb-3 opacity-25" />
            <p>No photos yet. Upload your first photo above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, i) => {
              const key = String(item.id);
              const isEditing = key in editingCaption;
              return (
                <div
                  key={key}
                  className="group relative bg-card border border-border rounded overflow-hidden"
                  data-ocid={`portfolio.item.${i + 1}`}
                >
                  <div className="aspect-[3/4] bg-muted">
                    {imageUrls[key] ? (
                      <img
                        src={imageUrls[key]}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2
                          size={20}
                          className="animate-spin text-muted-foreground/40"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingCaption[key]}
                          onChange={(e) =>
                            setEditingCaption((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="text-xs h-8"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 flex-shrink-0"
                          onClick={() => handleSaveCaption(item)}
                          disabled={savingCaption === key}
                          data-ocid={`portfolio.save_button.${i + 1}`}
                        >
                          {savingCaption === key ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Save size={12} />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-foreground flex-1 truncate font-medium">
                          {item.caption || "Untitled"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditCaption(item)}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                          data-ocid={`portfolio.edit_button.${i + 1}`}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    data-ocid={`portfolio.delete_button.${i + 1}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Site Content Tab

function SiteContentTab() {
  const { actor: _actor } = useActor();
  const actor = _actor as FullBackendInterface | null;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getSiteContent()
      .then((entries) => {
        const map: Record<string, string> = {};
        for (const entry of entries) map[entry.key] = entry.value;
        setFormData(map);
      })
      .catch(() => toast.error("Failed to load site content."))
      .finally(() => setLoading(false));
  }, [actor]);

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      const entries = Object.entries(formData) as [string, string][];
      await actor.setSiteContentBatch(ADMIN_PASSWORD, entries);
      toast.success("All content saved!");
    } catch {
      toast.error("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="content.loading_state"
      >
        <Loader2 size={28} className="mx-auto mb-3 animate-spin opacity-40" />
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded space-y-5">
        {CONTENT_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label className="text-xs uppercase tracking-wider">
              {field.label}
            </Label>
            {field.multiline ? (
              <Textarea
                value={formData[field.key] ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                rows={3}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                data-ocid="content.textarea"
              />
            ) : (
              <Input
                value={formData[field.key] ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                data-ocid="content.input"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !actor}
        className="bg-gold text-white hover:bg-gold/90 border-0 px-8 h-11"
        data-ocid="content.submit_button"
      >
        {saving ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={14} className="mr-2" />
            Save All Content
          </>
        )}
      </Button>
    </div>
  );
}

// ── Services Tab

interface ServiceFormState {
  name: string;
  subtitle: string;
  price: string;
  description: string;
  featuresText: string;
  highlighted: boolean;
}

function ServicesTab() {
  const { actor: _actor } = useActor();
  const actor = _actor as FullBackendInterface | null;
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [forms, setForms] = useState<Record<string, ServiceFormState>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const loadPackages = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      try {
        await actor.initializeServices(ADMIN_PASSWORD);
      } catch {
        /* already initialized */
      }
      const pkgs = await actor.getServicePackages();
      const sorted = [...pkgs].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
      setPackages(sorted);
      const initialForms: Record<string, ServiceFormState> = {};
      for (const pkg of sorted) {
        initialForms[String(pkg.id)] = {
          name: pkg.name,
          subtitle: pkg.subtitle,
          price: pkg.price,
          description: pkg.description,
          featuresText: pkg.features.join("\n"),
          highlighted: pkg.highlighted,
        };
      }
      setForms(initialForms);
    } catch {
      toast.error("Failed to load service packages.");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const updateForm = (
    id: string,
    field: keyof ServiceFormState,
    value: string | boolean,
  ) => {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (pkg: ServicePackage) => {
    if (!actor) return;
    const key = String(pkg.id);
    const form = forms[key];
    if (!form) return;
    setSaving(key);
    try {
      const features = form.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
      await actor.updateServicePackage(
        ADMIN_PASSWORD,
        pkg.id,
        form.name,
        form.subtitle,
        form.price,
        form.description,
        features,
        form.highlighted,
      );
      toast.success(`"${form.name}" saved!`);
    } catch {
      toast.error("Failed to save package.");
    } finally {
      setSaving(null);
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleMove = async (index: number, direction: -1 | 1) => {
    if (!actor) return;
    const newPackages = [...packages];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newPackages.length) return;
    [newPackages[index], newPackages[swapIndex]] = [
      newPackages[swapIndex],
      newPackages[index],
    ];
    setPackages(newPackages);
    setReordering(true);
    try {
      const orderedIds = newPackages.map((p) => p.id);
      await actor.reorderServicePackages(ADMIN_PASSWORD, orderedIds);
      toast.success("Order saved!");
    } catch {
      toast.error("Failed to save order.");
      setPackages(packages);
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="services.loading_state"
      >
        <Loader2 size={28} className="mx-auto mb-3 animate-spin opacity-40" />
        <p>Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {packages.map((pkg, i) => {
        const key = String(pkg.id);
        const form = forms[key];
        if (!form) return null;
        return (
          <div
            key={key}
            className="bg-card border border-border rounded p-6 space-y-4"
            data-ocid={`services.card.${i + 1}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0 || reordering}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  title="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 1)}
                  disabled={i === packages.length - 1 || reordering}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  title="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <span className="text-xs text-muted-foreground font-mono ml-1">
                  #{i + 1}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold flex-1 text-center">
                {pkg.name}
              </h3>
              <Badge
                variant={form.highlighted ? "default" : "secondary"}
                className="text-xs shrink-0"
              >
                {form.highlighted ? "Most Popular" : "Standard"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs uppercase tracking-wider">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm(key, "name", e.target.value)}
                  data-ocid={`services.input.${i + 1}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs uppercase tracking-wider">
                  Subtitle
                </Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => updateForm(key, "subtitle", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs uppercase tracking-wider">Price</Label>
              <Input
                value={form.price}
                onChange={(e) => updateForm(key, "price", e.target.value)}
                placeholder="e.g. ₹4,999"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm(key, "description", e.target.value)}
                rows={3}
                data-ocid={`services.textarea.${i + 1}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs uppercase tracking-wider">
                Features (one per line)
              </Label>
              <Textarea
                value={form.featuresText}
                onChange={(e) =>
                  updateForm(key, "featuresText", e.target.value)
                }
                rows={5}
                placeholder="1-hour session\n1 location\n10 edited photos"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.highlighted}
                onCheckedChange={(v) => updateForm(key, "highlighted", v)}
                id={`highlighted-${key}`}
                data-ocid={`services.switch.${i + 1}`}
              />
              <Label
                htmlFor={`highlighted-${key}`}
                className="text-sm cursor-pointer"
              >
                Mark as Most Popular
              </Label>
            </div>

            <Button
              onClick={() => handleSave(pkg)}
              disabled={saving === key || !actor}
              className="w-full bg-gold text-white hover:bg-gold/90 border-0"
              data-ocid={`services.save_button.${i + 1}`}
            >
              {saving === key ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="mr-2" />
                  Save Package
                </>
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Admin

export default function Admin() {
  const { actor: _actor } = useActor();
  const actor = _actor as FullBackendInterface | null;
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setDataLoading(true);
    try {
      const [c, b] = await Promise.all([
        actor.getAllContactSubmissions(ADMIN_PASSWORD),
        actor.getAllBookings(ADMIN_PASSWORD),
      ]);
      setContacts(c);
      setBookings(b);
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setDataLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markRead = async (idx: number) => {
    if (!actor) return;
    try {
      await actor.markContactAsRead(ADMIN_PASSWORD, BigInt(idx));
      await loadData();
      toast.success("Marked as read.");
    } catch {
      toast.error("Failed to update.");
    }
  };

  const markReplied = async (idx: number) => {
    if (!actor) return;
    try {
      await actor.markContactAsReplied(ADMIN_PASSWORD, BigInt(idx));
      await loadData();
      toast.success("Marked as replied.");
    } catch {
      toast.error("Failed to update.");
    }
  };

  const updateStatus = async (idx: number, status: string) => {
    if (!actor) return;
    try {
      await actor.updateBookingStatus(ADMIN_PASSWORD, BigInt(idx), status);
      await loadData();
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-bold">Lens &amp; Laughs</h1>
            <Badge variant="secondary" className="text-xs">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={dataLoading}
              data-ocid="admin.secondary_button"
            >
              <RefreshCw
                size={14}
                className={`mr-1.5 ${dataLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to site
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Contacts", value: contacts.length, icon: Mail },
            {
              label: "Unread",
              value: contacts.filter((c) => !c.isRead).length,
              icon: Clock,
            },
            { label: "Total Bookings", value: bookings.length, icon: Calendar },
            {
              label: "Pending",
              value: bookings.filter((b) => b.status === "pending").length,
              icon: User,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-card border border-border p-5 rounded"
              data-ocid={`admin.card.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <stat.icon size={16} className="text-gold" />
              </div>
              <p className="font-serif text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="contacts" data-ocid="admin.tab">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="contacts">
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="bookings">
              Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="content">Site Content</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            {dataLoading ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="admin.loading_state"
              >
                Loading...
              </div>
            ) : contacts.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <Mail size={40} className="mx-auto mb-3 opacity-30" />
                <p>No contact submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((c, i) => (
                  <div
                    key={`${c.email}-${String(c.timestamp)}`}
                    className={`bg-card border rounded p-5 ${
                      !c.isRead ? "border-gold/40" : "border-border"
                    }`}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {c.name}
                          </h3>
                          {!c.isRead && (
                            <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                              New
                            </Badge>
                          )}
                          {c.isReplied && (
                            <Badge variant="secondary" className="text-xs">
                              Replied
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {c.email}
                          </span>
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {c.phone}
                            </span>
                          )}
                          {c.eventDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {c.eventDate}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTime(c.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground bg-muted/50 rounded p-3">
                          {c.message}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!c.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markRead(i)}
                            className="text-xs"
                            data-ocid={`admin.edit_button.${i + 1}`}
                          >
                            Mark Read
                          </Button>
                        )}
                        {!c.isReplied && (
                          <Button
                            size="sm"
                            onClick={() => markReplied(i)}
                            className="bg-gold text-white hover:bg-gold/90 border-0 text-xs"
                            data-ocid={`admin.save_button.${i + 1}`}
                          >
                            Mark Replied
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {dataLoading ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="admin.loading_state"
              >
                Loading...
              </div>
            ) : bookings.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p>No booking requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b, i) => (
                  <div
                    key={`${b.email}-${String(b.timestamp)}`}
                    className="bg-card border border-border rounded p-5"
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {b.name}
                          </h3>
                          <Badge
                            className={`text-xs ${
                              b.status === "confirmed"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : b.status === "declined"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-gold/20 text-gold border-gold/30"
                            }`}
                          >
                            {b.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {b.email}
                          </span>
                          {b.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {b.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {b.eventDate}
                          </span>
                          <span className="font-medium text-foreground">
                            {b.eventType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTime(b.timestamp)}
                          </span>
                        </div>
                        {b.message && (
                          <p className="text-sm text-foreground bg-muted/50 rounded p-3">
                            {b.message}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-36">
                        <Select
                          value={b.status}
                          onValueChange={(v) => updateStatus(i, v)}
                        >
                          <SelectTrigger
                            className="h-8 text-xs"
                            data-ocid={`admin.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>

          <TabsContent value="content">
            <SiteContentTab />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
