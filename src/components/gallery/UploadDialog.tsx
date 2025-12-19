import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, X, ImageIcon, Check, AlertCircle } from 'lucide-react';
import { optimizeImage, formatBytes, calculateSavings, OptimizedImage } from '@/utils/imageOptimizer';

interface FileToUpload {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'optimizing' | 'uploading' | 'done' | 'error';
  progress: number;
  optimized?: OptimizedImage;
  error?: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: { file: File | Blob; name: string }[]) => Promise<void>;
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setFilesToUpload([]);
      setIsDragging(false);
      setIsUploading(false);
    }
  }, [open]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const imageFiles = Array.from(fileList).filter(file => 
      file.type.startsWith('image/')
    );

    const newFiles: FileToUpload[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setFilesToUpload(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFilesToUpload(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    const filesToProcess = [...filesToUpload];

    try {
      // Process files (optimize if enabled)
      for (const fileItem of filesToProcess) {
        if (optimizeImages) {
          setFilesToUpload(prev => 
            prev.map(f => f.id === fileItem.id ? { ...f, status: 'optimizing', progress: 30 } : f)
          );
          
          try {
            const optimized = await optimizeImage(fileItem.file);
            setFilesToUpload(prev => 
              prev.map(f => f.id === fileItem.id ? { ...f, optimized, progress: 50 } : f)
            );
          } catch (error) {
            console.error('Optimization failed:', error);
            // Continue with original file if optimization fails
          }
        }
      }

      // Get updated files with optimizations
      const currentFiles = filesToUpload;
      
      // Mark as uploading
      setFilesToUpload(prev => 
        prev.map(f => ({ ...f, status: 'uploading', progress: 60 }))
      );

      // Prepare files for upload
      const uploadFiles = currentFiles.map(f => ({
        file: f.optimized?.blob || f.file,
        name: f.optimized?.fileName || f.file.name,
      }));

      await onUpload(uploadFiles);

      // Mark all as done
      setFilesToUpload(prev => 
        prev.map(f => ({ ...f, status: 'done', progress: 100 }))
      );

      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (error: any) {
      setFilesToUpload(prev => 
        prev.map(f => ({ ...f, status: 'error', error: error.message }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const totalOriginalSize = filesToUpload.reduce((sum, f) => sum + f.file.size, 0);
  const totalOptimizedSize = filesToUpload.reduce((sum, f) => sum + (f.optimized?.optimizedSize || f.file.size), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Drag and drop images or click to browse
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Drop images here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
        </div>

        {/* File List */}
        {filesToUpload.length > 0 && (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {filesToUpload.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(file.file.size)}</span>
                      {file.optimized && (
                        <>
                          <span>→</span>
                          <span className="text-primary">{formatBytes(file.optimized.optimizedSize)}</span>
                          <span className="text-primary">(-{calculateSavings(file.file.size, file.optimized.optimizedSize)})</span>
                        </>
                      )}
                    </div>
                    {(file.status === 'optimizing' || file.status === 'uploading') && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {file.status === 'done' && <Check className="h-4 w-4 text-primary" />}
                    {file.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    {file.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Options */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="optimize"
            checked={optimizeImages}
            onCheckedChange={(checked) => setOptimizeImages(checked === true)}
          />
          <Label htmlFor="optimize" className="text-sm cursor-pointer">
            Optimize images (convert to WebP, max 1920×1080)
          </Label>
        </div>

        {/* Size Summary */}
        {filesToUpload.length > 0 && optimizeImages && filesToUpload.some(f => f.optimized) && (
          <div className="text-xs text-muted-foreground text-center">
            Total: {formatBytes(totalOriginalSize)} → {formatBytes(totalOptimizedSize)}
            <span className="text-primary ml-1">
              (Save {calculateSavings(totalOriginalSize, totalOptimizedSize)})
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={filesToUpload.length === 0 || isUploading}>
            {isUploading ? 'Uploading...' : `Upload ${filesToUpload.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
