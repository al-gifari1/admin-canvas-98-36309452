-- Create section_templates table for reusable UI sections
CREATE TABLE public.section_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  type TEXT NOT NULL DEFAULT 'visual_json',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE
);

-- Add constraint for category values
ALTER TABLE public.section_templates 
ADD CONSTRAINT section_templates_category_check 
CHECK (category IN ('hero', 'features', 'footer', 'testimonials', 'faq', 'checkout', 'product', 'gallery', 'custom'));

-- Add constraint for type values
ALTER TABLE public.section_templates 
ADD CONSTRAINT section_templates_type_check 
CHECK (type IN ('visual_json', 'raw_html'));

-- Enable RLS
ALTER TABLE public.section_templates ENABLE ROW LEVEL SECURITY;

-- Public can view system templates
CREATE POLICY "Anyone can view system templates"
ON public.section_templates
FOR SELECT
USING (is_system_template = true);

-- Developers can view their own templates
CREATE POLICY "Developers can manage their own templates"
ON public.section_templates
FOR ALL
USING (
  (NOT is_system_template AND created_by = auth.uid()) OR
  (shop_id IS NOT NULL AND is_developer_of_shop(auth.uid(), shop_id))
)
WITH CHECK (
  (NOT is_system_template AND created_by = auth.uid()) OR
  (shop_id IS NOT NULL AND is_developer_of_shop(auth.uid(), shop_id))
);

-- Super admins can manage all templates including system ones
CREATE POLICY "Super admins can manage all templates"
ON public.section_templates
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Shop owners can view templates for their shops
CREATE POLICY "Shop owners can view their shop templates"
ON public.section_templates
FOR SELECT
USING (shop_id IS NOT NULL AND is_shop_owner(auth.uid(), shop_id));

-- Create updated_at trigger
CREATE TRIGGER update_section_templates_updated_at
BEFORE UPDATE ON public.section_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert system templates (seed data)
INSERT INTO public.section_templates (name, category, type, content, is_system_template) VALUES
(
  'Modern Hero',
  'hero',
  'raw_html',
  '{"html": "<section class=\"relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 lg:py-32\"><div class=\"container mx-auto px-4\"><div class=\"max-w-4xl mx-auto text-center\"><span class=\"inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6\">New Release</span><h1 class=\"text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight\">Transform Your Business with Our Solution</h1><p class=\"text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto\">Streamline your workflow, boost productivity, and achieve your goals faster than ever before.</p><div class=\"flex flex-col sm:flex-row gap-4 justify-center\"><button class=\"px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors\">Get Started Free</button><button class=\"px-8 py-4 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors\">Watch Demo</button></div></div></div></section>"}'::jsonb,
  true
),
(
  'Three Column Features',
  'features',
  'raw_html',
  '{"html": "<section class=\"py-20 bg-background\"><div class=\"container mx-auto px-4\"><div class=\"text-center mb-16\"><h2 class=\"text-3xl md:text-4xl font-bold text-foreground mb-4\">Why Choose Us?</h2><p class=\"text-muted-foreground text-lg max-w-2xl mx-auto\">Discover the features that make us stand out from the competition.</p></div><div class=\"grid md:grid-cols-3 gap-8\"><div class=\"p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow\"><div class=\"w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6\"><svg class=\"w-7 h-7 text-primary\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13 10V3L4 14h7v7l9-11h-7z\"/></svg></div><h3 class=\"text-xl font-semibold text-foreground mb-3\">Lightning Fast</h3><p class=\"text-muted-foreground\">Experience blazing fast performance that keeps your workflow smooth and efficient.</p></div><div class=\"p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow\"><div class=\"w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6\"><svg class=\"w-7 h-7 text-primary\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z\"/></svg></div><h3 class=\"text-xl font-semibold text-foreground mb-3\">Secure & Reliable</h3><p class=\"text-muted-foreground\">Your data is protected with enterprise-grade security and 99.9% uptime guarantee.</p></div><div class=\"p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow\"><div class=\"w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6\"><svg class=\"w-7 h-7 text-primary\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z\"/></svg></div><h3 class=\"text-xl font-semibold text-foreground mb-3\">24/7 Support</h3><p class=\"text-muted-foreground\">Our dedicated team is always here to help you succeed, around the clock.</p></div></div></div></section>"}'::jsonb,
  true
),
(
  'Testimonials Carousel',
  'testimonials',
  'raw_html',
  '{"html": "<section class=\"py-20 bg-muted/30\"><div class=\"container mx-auto px-4\"><div class=\"text-center mb-16\"><h2 class=\"text-3xl md:text-4xl font-bold text-foreground mb-4\">What Our Customers Say</h2><p class=\"text-muted-foreground text-lg\">Join thousands of satisfied customers worldwide</p></div><div class=\"grid md:grid-cols-3 gap-8\"><div class=\"bg-card p-8 rounded-2xl border border-border\"><div class=\"flex gap-1 mb-4\"><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg></div><p class=\"text-muted-foreground mb-6\">\"This product has completely transformed how we work. The efficiency gains have been remarkable.\"</p><div class=\"flex items-center gap-3\"><div class=\"w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold\">JD</div><div><p class=\"font-semibold text-foreground\">John Doe</p><p class=\"text-sm text-muted-foreground\">CEO, TechCorp</p></div></div></div><div class=\"bg-card p-8 rounded-2xl border border-border\"><div class=\"flex gap-1 mb-4\"><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg></div><p class=\"text-muted-foreground mb-6\">\"Outstanding customer support and the features are exactly what we needed. Highly recommended!\"</p><div class=\"flex items-center gap-3\"><div class=\"w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold\">SJ</div><div><p class=\"font-semibold text-foreground\">Sarah Johnson</p><p class=\"text-sm text-muted-foreground\">Marketing Director</p></div></div></div><div class=\"bg-card p-8 rounded-2xl border border-border\"><div class=\"flex gap-1 mb-4\"><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg><svg class=\"w-5 h-5 text-yellow-500 fill-current\" viewBox=\"0 0 20 20\"><path d=\"M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z\"/></svg></div><p class=\"text-muted-foreground mb-6\">\"Easy to use, powerful features, and great value for money. Could not ask for more!\"</p><div class=\"flex items-center gap-3\"><div class=\"w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold\">MK</div><div><p class=\"font-semibold text-foreground\">Mike Kim</p><p class=\"text-sm text-muted-foreground\">Founder, StartupXYZ</p></div></div></div></div></div></section>"}'::jsonb,
  true
),
(
  'FAQ Accordion',
  'faq',
  'raw_html',
  '{"html": "<section class=\"py-20 bg-background\"><div class=\"container mx-auto px-4 max-w-3xl\"><div class=\"text-center mb-16\"><h2 class=\"text-3xl md:text-4xl font-bold text-foreground mb-4\">Frequently Asked Questions</h2><p class=\"text-muted-foreground text-lg\">Everything you need to know about our product</p></div><div class=\"space-y-4\"><details class=\"group bg-card border border-border rounded-xl\"><summary class=\"flex items-center justify-between p-6 cursor-pointer list-none\"><span class=\"font-semibold text-foreground\">How do I get started?</span><svg class=\"w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"/></svg></summary><div class=\"px-6 pb-6 text-muted-foreground\">Getting started is easy! Simply sign up for a free account, and you will be guided through the setup process. Our onboarding wizard will help you configure everything in just a few minutes.</div></details><details class=\"group bg-card border border-border rounded-xl\"><summary class=\"flex items-center justify-between p-6 cursor-pointer list-none\"><span class=\"font-semibold text-foreground\">What payment methods do you accept?</span><svg class=\"w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"/></svg></summary><div class=\"px-6 pb-6 text-muted-foreground\">We accept all major credit cards, PayPal, and bank transfers. For enterprise customers, we also offer invoice-based billing with NET 30 terms.</div></details><details class=\"group bg-card border border-border rounded-xl\"><summary class=\"flex items-center justify-between p-6 cursor-pointer list-none\"><span class=\"font-semibold text-foreground\">Can I cancel my subscription anytime?</span><svg class=\"w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"/></svg></summary><div class=\"px-6 pb-6 text-muted-foreground\">Yes, you can cancel your subscription at any time with no questions asked. Your data will be retained for 30 days after cancellation in case you change your mind.</div></details><details class=\"group bg-card border border-border rounded-xl\"><summary class=\"flex items-center justify-between p-6 cursor-pointer list-none\"><span class=\"font-semibold text-foreground\">Do you offer customer support?</span><svg class=\"w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"/></svg></summary><div class=\"px-6 pb-6 text-muted-foreground\">Absolutely! We offer 24/7 customer support via chat and email. Premium plans also include priority phone support and a dedicated account manager.</div></details></div></div></section>"}'::jsonb,
  true
),
(
  'Simple Footer',
  'footer',
  'raw_html',
  '{"html": "<footer class=\"bg-card border-t border-border py-12\"><div class=\"container mx-auto px-4\"><div class=\"grid md:grid-cols-4 gap-8\"><div><h3 class=\"font-bold text-foreground text-lg mb-4\">Company</h3><ul class=\"space-y-2\"><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">About Us</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Careers</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Press</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Contact</a></li></ul></div><div><h3 class=\"font-bold text-foreground text-lg mb-4\">Product</h3><ul class=\"space-y-2\"><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Features</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Pricing</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Integrations</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">API</a></li></ul></div><div><h3 class=\"font-bold text-foreground text-lg mb-4\">Resources</h3><ul class=\"space-y-2\"><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Documentation</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Blog</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Community</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Support</a></li></ul></div><div><h3 class=\"font-bold text-foreground text-lg mb-4\">Legal</h3><ul class=\"space-y-2\"><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Privacy Policy</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Terms of Service</a></li><li><a href=\"#\" class=\"text-muted-foreground hover:text-foreground transition-colors\">Cookie Policy</a></li></ul></div></div><div class=\"border-t border-border mt-12 pt-8 text-center text-muted-foreground\"><p>&copy; 2024 Your Company. All rights reserved.</p></div></div></footer>"}'::jsonb,
  true
),
(
  'Product Showcase',
  'product',
  'raw_html',
  '{"html": "<section class=\"py-20 bg-background\"><div class=\"container mx-auto px-4\"><div class=\"grid lg:grid-cols-2 gap-12 items-center\"><div class=\"aspect-square bg-muted rounded-2xl flex items-center justify-center\"><div class=\"text-center p-8\"><svg class=\"w-24 h-24 mx-auto text-muted-foreground mb-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\"/></svg><p class=\"text-muted-foreground\">Product Image</p></div></div><div><span class=\"text-primary font-medium mb-2 block\">Best Seller</span><h2 class=\"text-3xl md:text-4xl font-bold text-foreground mb-4\">Premium Product Name</h2><div class=\"flex items-center gap-4 mb-6\"><span class=\"text-3xl font-bold text-foreground\">$99.00</span><span class=\"text-xl text-muted-foreground line-through\">$149.00</span><span class=\"bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium\">Save 33%</span></div><p class=\"text-muted-foreground text-lg mb-6\">Experience premium quality with our best-selling product. Crafted with attention to detail and designed to exceed your expectations.</p><ul class=\"space-y-3 mb-8\"><li class=\"flex items-center gap-3 text-foreground\"><svg class=\"w-5 h-5 text-primary\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"/></svg>Premium quality materials</li><li class=\"flex items-center gap-3 text-foreground\"><svg class=\"w-5 h-5 text-primary\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"/></svg>30-day money-back guarantee</li><li class=\"flex items-center gap-3 text-foreground\"><svg class=\"w-5 h-5 text-primary\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"/></svg>Free shipping worldwide</li></ul><button class=\"w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors\">Add to Cart</button></div></div></div></section>"}'::jsonb,
  true
);