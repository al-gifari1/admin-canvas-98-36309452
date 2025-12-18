import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Layout, 
  Star, 
  MessageSquare, 
  HelpCircle, 
  ShoppingBag,
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  Code,
  Palette,
  Lock,
} from 'lucide-react';

type SectionCategory = 'hero' | 'features' | 'footer' | 'testimonials' | 'faq' | 'checkout' | 'product' | 'gallery' | 'custom';
type SectionType = 'visual_json' | 'raw_html';

interface SectionTemplate {
  id: string;
  name: string;
  category: SectionCategory;
  type: SectionType;
  content: { html?: string; sections?: unknown[] };
  thumbnail_url: string | null;
  is_system_template: boolean;
  created_at: string;
}

const CATEGORIES: { value: SectionCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Sections', icon: Layout },
  { value: 'hero', label: 'Hero', icon: Layout },
  { value: 'features', label: 'Features', icon: Star },
  { value: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { value: 'faq', label: 'FAQ', icon: HelpCircle },
  { value: 'product', label: 'Product', icon: ShoppingBag },
  { value: 'gallery', label: 'Gallery', icon: Image },
  { value: 'footer', label: 'Footer', icon: Layout },
  { value: 'custom', label: 'Custom', icon: Palette },
];

const getCategoryIcon = (category: SectionCategory) => {
  const found = CATEGORIES.find(c => c.value === category);
  return found?.icon || Layout;
};

export function DeveloperSectionLibrary() {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SectionTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SectionCategory>('custom');
  const [formType, setFormType] = useState<SectionType>('raw_html');
  const [formHtml, setFormHtml] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('section_templates')
        .select('*')
        .order('is_system_template', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as SectionTemplate[]);
    } catch (error: unknown) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load section templates');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    selectedCategory === 'all' || t.category === selectedCategory
  );

  const openCreateDialog = () => {
    setIsEditMode(false);
    setFormName('');
    setFormCategory('custom');
    setFormType('raw_html');
    setFormHtml('');
    setSelectedTemplate(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (template: SectionTemplate) => {
    if (template.is_system_template) {
      toast.error('System templates cannot be edited');
      return;
    }
    setIsEditMode(true);
    setFormName(template.name);
    setFormCategory(template.category);
    setFormType(template.type);
    setFormHtml(template.content?.html || '');
    setSelectedTemplate(template);
    setIsCreateDialogOpen(true);
  };

  const openPreviewDialog = (template: SectionTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const openDeleteDialog = (template: SectionTemplate) => {
    if (template.is_system_template) {
      toast.error('System templates cannot be deleted');
      return;
    }
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a section name');
      return;
    }
    if (formType === 'raw_html' && !formHtml.trim()) {
      toast.error('Please enter HTML content');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const content = { html: formHtml };

      if (isEditMode && selectedTemplate) {
        const { error } = await supabase
          .from('section_templates')
          .update({
            name: formName,
            category: formCategory,
            type: formType,
            content,
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Section updated successfully');
      } else {
        const { error } = await supabase
          .from('section_templates')
          .insert({
            name: formName,
            category: formCategory,
            type: formType,
            content,
            created_by: user.id,
            is_system_template: false,
          });

        if (error) throw error;
        toast.success('Section created successfully');
      }

      setIsCreateDialogOpen(false);
      fetchTemplates();
    } catch (error: unknown) {
      console.error('Error saving template:', error);
      toast.error('Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      const { error } = await supabase
        .from('section_templates')
        .delete()
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      toast.success('Section deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchTemplates();
    } catch (error: unknown) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete section');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Section Library</h1>
          <p className="text-muted-foreground">
            Reusable templates for building landing pages
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Section
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value as SectionCategory | 'all')}
          >
            <cat.icon className="mr-2 h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Layout className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No sections found in this category.
            </p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => {
            const Icon = getCategoryIcon(template.category);
            return (
              <Card 
                key={template.id} 
                className="group relative transition-all hover:border-primary hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1">
                      {template.is_system_template && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          System
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="flex items-center gap-1">
                    {template.type === 'raw_html' ? (
                      <>
                        <Code className="h-3 w-3" />
                        Raw HTML
                      </>
                    ) : (
                      <>
                        <Palette className="h-3 w-3" />
                        Visual JSON
                      </>
                    )}
                  </CardDescription>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openPreviewDialog(template)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    {!template.is_system_template && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(template)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Section' : 'Create New Section'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update your section template' : 'Create a reusable section template for your landing pages'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">
                <Code className="mr-2 h-4 w-4" />
                HTML Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Live Preview
              </TabsTrigger>
            </TabsList>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Section Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Modern Hero"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formCategory} onValueChange={(v) => setFormCategory(v as SectionCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="editor" className="mt-0">
                <div className="space-y-2">
                  <Label htmlFor="html">HTML Content (with Tailwind classes)</Label>
                  <Textarea
                    id="html"
                    placeholder="<section class='py-20 bg-background'>...</section>"
                    className="font-mono text-sm min-h-[300px]"
                    value={formHtml}
                    onChange={(e) => setFormHtml(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-lg overflow-hidden bg-background">
                  <ScrollArea className="h-[350px]">
                    {formHtml ? (
                      <div 
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: formHtml }} 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        Enter HTML to see preview
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditMode ? 'Update Section' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview of the section template
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-background">
            <ScrollArea className="h-[500px]">
              {selectedTemplate?.content?.html ? (
                <div 
                  className="w-full"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content.html }} 
                />
              ) : (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  No preview available
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
