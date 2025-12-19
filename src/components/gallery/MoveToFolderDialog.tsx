import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string; // 'my-files' for personal space or actual shop id
  currentFolderId: string | null;
  selectedCount: number;
  onMove: (targetFolderId: string | null) => Promise<void>;
  excludeFolderIds?: string[];
  userId?: string;
}

interface FolderTreeItemProps {
  folder: MediaFolder;
  allFolders: MediaFolder[];
  selectedFolderId: string | null;
  onSelect: (id: string | null) => void;
  excludeFolderIds: string[];
  level: number;
}

function FolderTreeItem({ 
  folder, 
  allFolders, 
  selectedFolderId, 
  onSelect, 
  excludeFolderIds,
  level 
}: FolderTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const children = allFolders.filter(f => f.parent_id === folder.id);
  const hasChildren = children.length > 0;
  const isExcluded = excludeFolderIds.includes(folder.id);
  const isSelected = selectedFolderId === folder.id;

  if (isExcluded) return null;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
          isExcluded && 'opacity-50 cursor-not-allowed'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => !isExcluded && onSelect(folder.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        {isSelected ? (
          <FolderOpen className="h-4 w-4 text-primary" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm truncate">{folder.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {children.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              excludeFolderIds={excludeFolderIds}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MoveToFolderDialog({
  open,
  onOpenChange,
  shopId,
  currentFolderId,
  selectedCount,
  onMove,
  excludeFolderIds = [],
  userId,
}: MoveToFolderDialogProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFolders();
      setSelectedFolderId(null);
    }
  }, [open, shopId]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const isMyFiles = shopId === 'my-files';
      
      let query = supabase.from('media_folders').select('id, name, parent_id');
      
      if (isMyFiles && userId) {
        query = query.is('shop_id', null).eq('created_by', userId);
      } else if (!isMyFiles) {
        query = query.eq('shop_id', shopId);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (selectedFolderId === currentFolderId) return;
    
    setMoving(true);
    try {
      await onMove(selectedFolderId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error moving items:', error);
    } finally {
      setMoving(false);
    }
  };

  const rootFolders = folders.filter(f => f.parent_id === null);
  const isRootSelected = selectedFolderId === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
          <DialogDescription>
            Select a destination folder for {selectedCount} item(s)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] border rounded-lg">
          <div className="p-2">
            {/* Root option */}
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                isRootSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
              onClick={() => setSelectedFolderId(null)}
            >
              <span className="w-5" />
              <Home className={cn('h-4 w-4', isRootSelected ? 'text-primary' : 'text-muted-foreground')} />
              <span className="text-sm font-medium">Root</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              rootFolders.map(folder => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  allFolders={folders}
                  selectedFolderId={selectedFolderId}
                  onSelect={setSelectedFolderId}
                  excludeFolderIds={excludeFolderIds}
                  level={0}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={moving}>
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            disabled={moving || (selectedFolderId === currentFolderId)}
          >
            {moving ? 'Moving...' : 'Move Here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
