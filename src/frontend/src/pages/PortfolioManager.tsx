import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HttpAgent } from "@icp-sdk/core/agent";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PortfolioItem } from "../backend.d";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { StorageClient } from "../utils/StorageClient";

const ADMIN_PASSWORD = "lensandlaughs2024";
const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

async function getImageUrl(blobKey: string): Promise<string> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  const client = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  return client.getDirectURL(blobKey);
}

export default function PortfolioManager() {
  const { actor, isFetching } = useActor();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [itemUrls, setItemUrls] = useState<Record<string, string>>({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getPortfolioItems()
      .then(async (fetched) => {
        setItems(fetched);
        const urlEntries = await Promise.all(
          fetched.map(async (item) => {
            try {
              const url = await getImageUrl(item.blobKey);
              return [item.id.toString(), url] as [string, string];
            } catch {
              return [item.id.toString(), ""] as [string, string];
            }
          }),
        );
        setItemUrls(Object.fromEntries(urlEntries));
      })
      .catch(() => toast.error("Failed to load portfolio"))
      .finally(() => setLoadingItems(false));
  }, [actor, isFetching]);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!actor) return;

      const imageFiles = files.filter((f) =>
        /\.(jpg|jpeg|png|webp|heic)$/i.test(f.name),
      );
      if (!imageFiles.length) {
        toast.error("Please select image files (jpg, png, webp, heic)");
        return;
      }

      const newUploads: UploadingFile[] = imageFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending",
      }));

      setUploading((prev) => [...prev, ...newUploads]);

      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      await Promise.all(
        newUploads.map(async (upload) => {
          try {
            setUploading((prev) =>
              prev.map((u) =>
                u.id === upload.id ? { ...u, status: "uploading" } : u,
              ),
            );

            const bytes = new Uint8Array(await upload.file.arrayBuffer());

            const { hash } = await storageClient.putFile(bytes, (pct) => {
              setUploading((prev) =>
                prev.map((u) =>
                  u.id === upload.id ? { ...u, progress: pct } : u,
                ),
              );
            });

            const newId = await actor.addPortfolioItem(
              ADMIN_PASSWORD,
              hash,
              upload.file.name,
            );

            const url = await storageClient.getDirectURL(hash);
            const newItem: PortfolioItem = {
              id: newId,
              blobKey: hash,
              caption: upload.file.name,
              displayOrder: newId,
            };

            setItems((prev) => [...prev, newItem]);
            setItemUrls((prev) => ({ ...prev, [newId.toString()]: url }));

            setUploading((prev) =>
              prev.map((u) =>
                u.id === upload.id
                  ? { ...u, status: "done", progress: 100 }
                  : u,
              ),
            );

            toast.success(`"${upload.file.name}" uploaded`);

            setTimeout(() => {
              setUploading((prev) => prev.filter((u) => u.id !== upload.id));
              URL.revokeObjectURL(upload.preview);
            }, 1500);
          } catch (_err) {
            setUploading((prev) =>
              prev.map((u) =>
                u.id === upload.id ? { ...u, status: "error" } : u,
              ),
            );
            toast.error(`Failed to upload "${upload.file.name}"`);
          }
        }),
      );
    },
    [actor],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles],
  );

  const handleDelete = async (item: PortfolioItem) => {
    if (!actor) return;
    const key = item.id.toString();
    setDeletingIds((prev) => new Set([...prev, key]));
    try {
      await actor.deletePortfolioItem(ADMIN_PASSWORD, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setItemUrls((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to delete photo");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Portfolio Manager
              </h1>
              <p className="text-xs text-muted-foreground">Lens &amp; Laughs</p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {items.length} photo{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Drop Zone — label wraps the hidden input for native click-to-browse */}
        <section>
          <label
            htmlFor="portfolio-file-input"
            data-ocid="portfolio.dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12 flex flex-col items-center justify-center gap-4 select-none ${
              isDragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10"
            }`}
          >
            <div
              className={`rounded-full p-4 transition-colors ${
                isDragOver ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <UploadCloud
                className={`w-8 h-8 transition-colors ${
                  isDragOver ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                {isDragOver ? "Drop to upload" : "Drag & drop photos here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or{" "}
                <span className="text-primary underline underline-offset-2">
                  click to browse
                </span>{" "}
                · JPG, PNG, WEBP, HEIC
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="portfolio-file-input"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,.heic"
              className="sr-only"
              data-ocid="portfolio.upload_button"
              onChange={(e) => {
                if (e.target.files) processFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </label>
        </section>

        {/* Upload Queue */}
        <AnimatePresence>
          {uploading.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                Uploading
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {uploading.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative rounded-xl overflow-hidden aspect-square bg-muted"
                  >
                    <img
                      src={u.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 p-3">
                      {u.status === "uploading" && (
                        <>
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                          <Progress value={u.progress} className="h-1 w-full" />
                          <span className="text-white text-xs">
                            {u.progress}%
                          </span>
                        </>
                      )}
                      {u.status === "done" && (
                        <span className="text-green-400 text-xs font-medium">
                          ✓ Done
                        </span>
                      )}
                      {u.status === "error" && (
                        <span className="text-red-400 text-xs font-medium">
                          ✗ Failed
                        </span>
                      )}
                      {u.status === "pending" && (
                        <span className="text-white/70 text-xs">Queued</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Photo Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Portfolio
            </h2>
          </div>

          {loadingItems || isFetching ? (
            <div
              data-ocid="portfolio.loading_state"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {SKELETON_KEYS.map((k) => (
                <div
                  key={k}
                  className="aspect-square rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="portfolio.empty_state"
              className="rounded-2xl border border-dashed border-border p-16 flex flex-col items-center gap-3 text-center"
            >
              <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-foreground font-medium">No photos yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload your first photos using the drop zone above to populate
                your portfolio.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                data-ocid="portfolio.primary_button"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.id.toString()}
                  data-ocid={`portfolio.item.${index + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative rounded-xl overflow-hidden aspect-square bg-muted"
                >
                  {itemUrls[item.id.toString()] ? (
                    <img
                      src={itemUrls[item.id.toString()]}
                      alt={item.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      data-ocid={`portfolio.delete_button.${index + 1}`}
                      onClick={() => handleDelete(item)}
                      disabled={deletingIds.has(item.id.toString())}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-foreground shadow-md disabled:opacity-50"
                      title="Remove photo"
                    >
                      {deletingIds.has(item.id.toString()) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Caption */}
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-xs truncate">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
