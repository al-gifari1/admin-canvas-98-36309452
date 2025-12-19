import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Folder, 
  Image as ImageIcon, 
  ArrowLeft, 
  Search, 
  Check,
  Loader2 
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
}

interface MediaFolder {
  id: string;
  name: string;
  shop_id: string | null;
  parent_id: string | null;
}

interface MediaFile {
  id: string;
  name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  folder_id: string | null;
  shop_id: string | null;
}

interface GalleryPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  shopId?: string;
}

export function GalleryPickerDialog({
  open,
  onOpenChange,
  onSelect,
  shopId,
}: GalleryPickerDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>(shopId || 'all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchShops();
      setSelectedUrl(null);
      setCurrentFolderId(null);
      setFolderPath([]);
      setSearchQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchContent();
    }
  }, [open, selectedShopId, currentFolderId]);

  const fetchShops = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchContent = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch folders
      let folderQuery = supabase
        .from('media_folders')
        .select('*')
        .eq('parent_id', currentFolderId || null);

      if (selectedShopId !== 'all') {
        folderQuery = folderQuery.eq('shop_id', selectedShopId);
      }

      const { data: foldersData } = await folderQuery.order('name');
      setFolders(foldersData || []);

      // Fetch files (only images)
      let fileQuery = supabase
        .from('media_files')
        .select('*')
        .eq('folder_id', currentFolderId || null)
        .ilike('mime_type', 'image/%');

      if (selectedShopId !== 'all') {
        fileQuery = fileQuery.eq('shop_id', selectedShopId);
      }

      const { data: filesData } = await fileQuery.order('name');
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder: MediaFolder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, folder]);
    setSelectedUrl(null);
  };

  const navigateBack = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
      setSelectedUrl(null);
    }
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setFolderPath([]);
    setSelectedUrl(null);
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
    }
  };

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Image from Gallery</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Shops" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shops</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {folderPath.length > 0 && (
            <Button variant="ghost" size="sm" onClick={navigateBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <button 
            onClick={navigateToRoot}
            className="text-muted-foreground hover:text-foreground"
          >
            Gallery
          </button>
          {folderPath.map((folder, index) => (
            <span key={folder.id} className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => {
                  const newPath = folderPath.slice(0, index + 1);
                  setFolderPath(newPath);
                  setCurrentFolderId(folder.id);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {folder.name}
              </button>
            </span>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-1">
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigateToFolder(folder)}
                  className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Folder className="h-10 w-10 text-primary mb-2" />
                  <span className="text-sm truncate w-full text-center">
                    {folder.name}
                  </span>
                </button>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedUrl(file.file_url)}
                  className={`relative flex flex-col items-center p-2 rounded-lg border transition-colors ${
                    selectedUrl === file.file_url 
                      ? 'border-primary ring-2 ring-primary bg-accent' 
                      : 'hover:bg-accent'
                  }`}
                >
                  {selectedUrl === file.file_url && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="aspect-square w-full rounded overflow-hidden bg-muted mb-2">
                    <img
                      src={file.file_url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs truncate w-full text-center">
                    {file.name}
                  </span>
                  {file.file_size && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </span>
                  )}
                </button>
              ))}

              {/* Empty state */}
              {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                <div className="col-span-4 py-12 text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No images found</p>
                  <p className="text-sm">Upload images in the Gallery first</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedUrl}>
            Select Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
