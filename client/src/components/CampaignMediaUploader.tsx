import React, { useCallback, useState } from "react";
import { UploadCloud, X, Image as ImageIcon, Youtube, Loader2, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadToCloudinary } from "@/lib/cloudinaryService";
import type { CampaignMedia } from "@/api/types";
import { useToast } from "@/hooks/use-toast";

interface CampaignMediaUploaderProps {
  value: CampaignMedia[];
  onChange: (value: CampaignMedia[]) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

export function CampaignMediaUploader({ value, onChange }: CampaignMediaUploaderProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processFiles(Array.from(e.dataTransfer.files));
      }
    },
    [value, onChange]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    
    const validFiles = files.filter(f => validTypes.includes(f.type));
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG, and WEBP images are supported.",
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) return;

    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    const uploadedMedia: CampaignMedia[] = [];

    for (const upload of newUploads) {
      try {
        const result = await uploadToCloudinary(upload.file, {
          resourceType: "image",
          onProgress: (progress) => {
            setUploadingFiles(prev => 
              prev.map(f => f.id === upload.id ? { ...f, progress } : f)
            );
          }
        });

        uploadedMedia.push({
          type: "image",
          url: result.url,
        });

        setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload image.",
          variant: "destructive",
        });
        setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
      }
    }

    if (uploadedMedia.length > 0) {
      onChange([...value, ...uploadedMedia]);
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddYoutube = () => {
    if (!youtubeUrl.trim()) return;
    
    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video or embed URL.",
        variant: "destructive",
      });
      return;
    }

    const newMedia: CampaignMedia = {
      type: "youtube",
      url: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`,
    };

    onChange([...value, newMedia]);
    setYoutubeUrl("");
  };

  const handleRemove = (index: number) => {
    const newMedia = [...value];
    newMedia.splice(index, 1);
    onChange(newMedia);
  };

  // Reorder functionality
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newMedia = [...value];
    const draggedItem = newMedia[draggedIndex];
    newMedia.splice(draggedIndex, 1);
    newMedia.splice(index, 0, draggedItem);
    
    onChange(newMedia);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Upload Image(s)
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            YouTube Video
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="image" className="pt-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? "border-[#0d3d2e] bg-[#0d3d2e]/5" : "border-border hover:border-border/80"
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Upload Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images here, or click to browse
            </p>
            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                id="media-upload"
                className="hidden"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
              />
              <Button asChild variant="outline">
                <label htmlFor="media-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WEBP only
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="youtube" className="pt-4">
          <div className="border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Youtube className="h-10 w-10 text-red-500" />
              <div>
                <h3 className="font-semibold text-lg text-foreground">Add YouTube Video</h3>
                <p className="text-sm">Paste a standard or shortened YouTube URL</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. https://www.youtube.com/watch?v=..." 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddYoutube())}
              />
              <Button type="button" onClick={handleAddYoutube}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {(value.length > 0 || uploadingFiles.length > 0) && (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Added Media ({value.length})
          </h4>
          <div className="grid gap-3">
            {value.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-3 bg-card border rounded-lg group ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div className="h-16 w-24 rounded overflow-hidden bg-muted flex items-center justify-center relative flex-shrink-0">
                  {item.type === "image" ? (
                    <img src={item.url} alt="Campaign Media" className="w-full h-full object-cover" />
                  ) : item.type === "youtube" ? (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center relative">
                      <Youtube className="h-8 w-8 text-red-500 z-10" />
                      <div className="absolute inset-0 bg-black/5" />
                    </div>
                  ) : (
                    <>
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Youtube className="h-6 w-6 text-white" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.type === "image" ? "Image" : item.type === "youtube" ? "YouTube Video" : "Video"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {uploadingFiles.map((upload) => (
              <div key={upload.id} className="flex items-center gap-4 p-3 bg-muted/50 border rounded-lg">
                <div className="h-16 w-24 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate pr-4">{upload.file.name}</p>
                    <span className="text-xs font-medium flex-shrink-0">{upload.progress}%</span>
                  </div>
                  <Progress value={upload.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
