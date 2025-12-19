import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export type CourierProvider = 'pathao' | 'redx' | 'steadfast' | 'paperfly';

interface CourierConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: CourierProvider | null;
  existingConfig?: {
    api_credentials: Record<string, string>;
    is_active: boolean;
    test_mode: boolean;
  } | null;
  onSave: (config: {
    api_credentials: Record<string, string>;
    is_active: boolean;
    test_mode: boolean;
  }) => Promise<void>;
  isSaving: boolean;
}

const providerFields: Record<CourierProvider, { key: string; label: string; type: 'text' | 'password' }[]> = {
  pathao: [
    { key: 'client_id', label: 'Client ID', type: 'text' },
    { key: 'client_secret', label: 'Client Secret', type: 'password' },
    { key: 'username', label: 'Username (Email)', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' },
  ],
  redx: [
    { key: 'access_token', label: 'Access Token', type: 'password' },
  ],
  steadfast: [
    { key: 'api_key', label: 'API Key', type: 'password' },
    { key: 'secret_key', label: 'Secret Key', type: 'password' },
  ],
  paperfly: [
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' },
  ],
};

const providerInfo: Record<CourierProvider, { name: string; description: string }> = {
  pathao: { name: 'Pathao', description: 'Connect your Pathao Courier account for delivery services.' },
  redx: { name: 'Redx', description: 'Integrate with Redx for nationwide delivery coverage.' },
  steadfast: { name: 'Steadfast', description: 'Configure Steadfast Courier for reliable deliveries.' },
  paperfly: { name: 'Paperfly', description: 'Set up Paperfly for efficient logistics solutions.' },
};

export function CourierConfigDialog({
  open,
  onOpenChange,
  provider,
  existingConfig,
  onSave,
  isSaving,
}: CourierConfigDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (provider && open) {
      if (existingConfig) {
        setCredentials(existingConfig.api_credentials || {});
        setIsActive(existingConfig.is_active);
        setTestMode(existingConfig.test_mode);
      } else {
        setCredentials({});
        setIsActive(false);
        setTestMode(true);
      }
      setVisibleFields({});
    }
  }, [provider, existingConfig, open]);

  if (!provider) return null;

  const fields = providerFields[provider];
  const info = providerInfo[provider];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      api_credentials: credentials,
      is_active: isActive,
      test_mode: testMode,
    });
  };

  const toggleVisibility = (key: string) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {info.name}</DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={field.key}
                  type={field.type === 'password' && !visibleFields[field.key] ? 'password' : 'text'}
                  value={credentials[field.key] || ''}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                />
                {field.type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => toggleVisibility(field.key)}
                  >
                    {visibleFields[field.key] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="test-mode">Test Mode</Label>
              <p className="text-xs text-muted-foreground">Use sandbox environment</p>
            </div>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-active">Active</Label>
              <p className="text-xs text-muted-foreground">Enable this integration</p>
            </div>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Connect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
