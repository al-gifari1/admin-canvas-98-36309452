import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  title: z.string().min(1, 'Page name is required').max(100, 'Page name must be less than 100 characters'),
  slug: z.string().min(1, 'URL slug is required').max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  shopId: z.string().min(1, 'Client selection is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface Shop {
  id: string;
  name: string;
  owner_id: string;
}

interface CreateLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPageCreated: (pageId: string) => void;
}

export function CreateLandingPageDialog({ open, onOpenChange, onPageCreated }: CreateLandingPageDialogProps) {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      shopId: '',
    },
  });

  const watchTitle = form.watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle) {
      const generatedSlug = slugify(watchTitle);
      form.setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [watchTitle, form]);

  // Fetch shops (clients) assigned to this developer
  useEffect(() => {
    async function fetchShops() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('shops')
        .select('id, name, owner_id');

      if (error) {
        console.error('Error fetching shops:', error);
        return;
      }

      setShops(data || []);
    }

    if (open) {
      fetchShops();
    }
  }, [user?.id, open]);

  async function onSubmit(values: FormValues) {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .insert({
          title: values.title,
          slug: values.slug,
          shop_id: values.shopId,
          created_by: user.id,
          is_published: false,
          content: {},
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Landing page created successfully');
      form.reset();
      onOpenChange(false);
      onPageCreated(data.id);
    } catch (error: any) {
      console.error('Error creating landing page:', error);
      toast.error(error.message || 'Failed to create landing page');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Landing Page</DialogTitle>
          <DialogDescription>
            Create a new landing page for one of your clients.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Sale Campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="summer-sale-campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Page'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}