import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface PricingTablePropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  highlighted: boolean;
}

export function PricingTableProperties({ content, onUpdate, tab }: PricingTablePropertiesProps) {
  const pricingTable = content.pricingTable || { 
    plans: [
      { name: 'Basic', price: '৳999', features: ['Feature 1', 'Feature 2'], highlighted: false },
      { name: 'Pro', price: '৳2999', features: ['Everything in Basic', 'Feature 3'], highlighted: true }
    ] 
  };

  const updatePricingTable = (plans: PricingPlan[]) => {
    onUpdate({
      ...content,
      pricingTable: { plans },
    });
  };

  const updatePlan = (index: number, updates: Partial<PricingPlan>) => {
    const newPlans = [...pricingTable.plans];
    newPlans[index] = { ...newPlans[index], ...updates };
    updatePricingTable(newPlans);
  };

  const addPlan = () => {
    updatePricingTable([
      ...pricingTable.plans,
      { name: 'New Plan', price: '৳0', features: ['Feature 1'], highlighted: false }
    ]);
  };

  const removePlan = (index: number) => {
    const newPlans = pricingTable.plans.filter((_, i) => i !== index);
    updatePricingTable(newPlans);
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...pricingTable.plans];
    newPlans[planIndex].features.push('New feature');
    updatePricingTable(newPlans);
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...pricingTable.plans];
    newPlans[planIndex].features[featureIndex] = value;
    updatePricingTable(newPlans);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...pricingTable.plans];
    newPlans[planIndex].features = newPlans[planIndex].features.filter((_, i) => i !== featureIndex);
    updatePricingTable(newPlans);
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Pricing Plans ({pricingTable.plans.length})</Label>
          <Button size="sm" variant="outline" onClick={addPlan}>
            <Plus className="h-3 w-3 mr-1" />
            Add Plan
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-2">
            {pricingTable.plans.map((plan, planIndex) => (
              <div 
                key={planIndex} 
                className={`p-3 border rounded-lg space-y-3 ${
                  plan.highlighted ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Plan {planIndex + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removePlan(planIndex)}
                    disabled={pricingTable.plans.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={plan.name}
                      onChange={(e) => updatePlan(planIndex, { name: e.target.value })}
                      placeholder="Plan name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Price</Label>
                    <Input
                      value={plan.price}
                      onChange={(e) => updatePlan(planIndex, { price: e.target.value })}
                      placeholder="৳999"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Highlighted</Label>
                  <Switch
                    checked={plan.highlighted}
                    onCheckedChange={(checked) => updatePlan(planIndex, { highlighted: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Features</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => addFeature(planIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-1">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                          className="h-7 text-xs"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => removeFeature(planIndex, featureIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Pricing table styling options coming soon. The table inherits your theme colors.
        </p>
      </div>
    </div>
  );
}
