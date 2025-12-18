import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = "admin@admin.com";
    const password = "admin123";

    // Check if super admin already exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("role", "super_admin")
      .limit(1);

    if (existingRole && existingRole.length > 0) {
      return new Response(
        JSON.stringify({ message: "Super Admin already exists", email }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create super admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin" },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = authData.user.id;

    // Assign super_admin role
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "super_admin" });

    // Update profile
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: "Super Admin", must_change_password: false })
      .eq("user_id", userId);

    console.log("Super Admin created:", email);

    return new Response(
      JSON.stringify({ success: true, email, password, message: "Super Admin created!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
