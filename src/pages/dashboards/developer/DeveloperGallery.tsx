import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  FolderPlus,
  Upload,
  Folder,
  Image as ImageIcon,
  ArrowLeft,
  MoreVertical,
  Copy,
  Eye,
  Trash2,
  Edit,
  Grid,
  List,
  Search,
  X,
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  shop_id: string;
  created_at: string;
}

interface MediaFile {
  id: string;
  name: string;
  file_path: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  folder_id: string | null;
  shop_id: string;
  created_at: string;
}

export default function DeveloperGallery() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<MediaFolder | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [user]);

  useEffect(() => {
    if (selectedShopId) {
      fetchContent();
    }
  }, [selectedShopId, currentFolderId]);

  const fetchShops = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setShops(data || []);
      if (data && data.length > 0) {
        setSelectedShopId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchContent = async () => {
    if (!selectedShopId) return;
    setLoading(true);
    try {
      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('media_folders')
        .select('*')
        .eq('shop_id', selectedShopId)
        .eq('parent_id', currentFolderId || null)
        .order('name');

      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from('media_files')
        .select('*')
        .eq('shop_id', selectedShopId)
        .eq('folder_id', currentFolderId || null)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load gallery content');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = async (folder: MediaFolder | null) => {
    if (folder) {
      setCurrentFolderId(folder.id);
      setFolderPath(prev => [...prev, folder]);
    } else {
      setCurrentFolderId(null);
      setFolderPath([]);
    }
  };

  const navigateBack = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    } else {
      setFolderPath([]);
      setCurrentFolderId(null);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !selectedShopId || !user) return;
    
    try {
      const { error } = await supabase.from('media_folders').insert({
        name: newFolderName.trim(),
        parent_id: currentFolderId,
        shop_id: selectedShopId,
        created_by: user.id,
      });

      if (error) throw error;
      toast.success('Folder created');
      setNewFolderName('');
      setCreateFolderOpen(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create folder');
    }
  };

  const renameFolder = async () => {
    if (!renamingFolder || !newFolderName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('media_folders')
        .update({ name: newFolderName.trim() })
        .eq('id', renamingFolder.id);

      if (error) throw error;
      toast.success('Folder renamed');
      setRenamingFolder(null);
      setNewFolderName('');
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename folder');
    }
  };

  const deleteFolder = async (folder: MediaFolder) => {
    if (!confirm(`Delete folder "${folder.name}" and all its contents?`)) return;
    
    try {
      const { error } = await supabase
        .from('media_folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;
      toast.success('Folder deleted');
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete folder');
    }
  };

  const handleFileUpload = async (fileList: FileList | File[]) => {
    if (!selectedShopId || !user) return;
    
    const filesToUpload = Array.from(fileList).filter(file => 
      file.type.startsWith('image/')
    );

    if (filesToUpload.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    setUploadingFiles(true);

    try {
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${selectedShopId}/${currentFolderId || 'root'}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('builder-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('builder-assets')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase.from('media_files').insert({
          name: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          folder_id: currentFolderId,
          shop_id: selectedShopId,
          created_by: user.id,
        });

        if (dbError) throw dbError;
      }

      toast.success(`${filesToUpload.length} file(s) uploaded`);
      fetchContent();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    
    try {
      // Delete from storage
      await supabase.storage
        .from('builder-assets')
        .remove([file.file_path]);

      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
      toast.success('File deleted');
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file');
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [selectedShopId, currentFolderId, user]);

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground">Manage your media files and folders</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent>
              {shops.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {folderPath.length > 0 && (
            <Button variant="ghost" size="sm" onClick={navigateBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploadingFiles}
          >
            <Upload className="h-4 w-4 mr-1" />
            {uploadingFiles ? 'Uploading...' : 'Upload'}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => navigateToFolder(null)}
          className="text-primary hover:underline"
        >
          Root
        </button>
        {folderPath.map((folder, index) => (
          <span key={folder.id} className="flex items-center gap-1">
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => {
                const newPath = folderPath.slice(0, index + 1);
                setFolderPath(newPath);
                setCurrentFolderId(folder.id);
              }}
              className="text-primary hover:underline"
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[400px] border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        {isDragging ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <Upload className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Drop images here to upload</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No files or folders</p>
            <p className="text-sm">Create a folder or drag images to upload</p>
          </div>
        ) : (
          <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}`}>
            {/* Folders */}
            {filteredFolders.map(folder => (
              <div
                key={folder.id}
                className={`group relative ${viewMode === 'grid' ? '' : 'flex items-center gap-3 p-2 rounded-lg hover:bg-muted'}`}
              >
                {viewMode === 'grid' ? (
                  <Card
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => navigateToFolder(folder)}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Folder className="h-12 w-12 text-primary mb-2" />
                      <p className="text-sm font-medium truncate w-full text-center">{folder.name}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Folder className="h-5 w-5 text-primary" />
                    <span
                      className="flex-1 cursor-pointer hover:text-primary"
                      onClick={() => navigateToFolder(folder)}
                    >
                      {folder.name}
                    </span>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${viewMode === 'grid' ? 'absolute top-1 right-1 opacity-0 group-hover:opacity-100' : ''}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setRenamingFolder(folder);
                      setNewFolderName(folder.name);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteFolder(folder)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className={`group relative ${viewMode === 'grid' ? '' : 'flex items-center gap-3 p-2 rounded-lg hover:bg-muted'}`}
              >
                {viewMode === 'grid' ? (
                  <Card className="cursor-pointer hover:border-primary transition-colors overflow-hidden">
                    <CardContent className="p-0 relative">
                      <img
                        src={file.file_url}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                          onClick={() => copyLink(file.file_url)}
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                          onClick={() => setPreviewImage(file)}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                          onClick={() => deleteFile(file)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <img
                      src={file.file_url}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyLink(file.file_url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewImage(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFile(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={!!renamingFolder} onOpenChange={() => setRenamingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for the folder</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-folder">Folder Name</Label>
              <Input
                id="rename-folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={(e) => e.key === 'Enter' && renameFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamingFolder(null)}>
              Cancel
            </Button>
            <Button onClick={renameFolder} disabled={!newFolderName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.name}</DialogTitle>
            <DialogDescription>
              {formatFileSize(previewImage?.file_size || null)} • {previewImage?.mime_type}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={previewImage?.file_url}
              alt={previewImage?.name}
              className="max-h-[70vh] object-contain rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => copyLink(previewImage?.file_url || '')}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={() => window.open(previewImage?.file_url, '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              Open Original
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
