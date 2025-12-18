import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Role hierarchy for validation
const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 5,
  developer: 4,
  shop_owner: 3,
  order_manager: 2,
  employee: 1,
};

// What roles each role can create
const CREATABLE_ROLES: Record<string, string[]> = {
  super_admin: ["developer"],
  developer: ["shop_owner"],
  shop_owner: ["order_manager", "employee"],
  order_manager: [],
  employee: [],
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
  createdBy: string;
  creatorRole: string;
  shopId?: string;
  shopName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body: CreateUserRequest = await req.json();
    const { email, password, fullName, role, createdBy, creatorRole, shopId, shopName } = body;

    console.log("Creating user:", { email, role, creatorRole, createdBy });

    // Validate that creator can create this role
    const allowedRoles = CREATABLE_ROLES[creatorRole] || [];
    if (!allowedRoles.includes(role)) {
      console.error("Unauthorized: Cannot create this role", { creatorRole, role });
      return new Response(
        JSON.stringify({ error: `${creatorRole} cannot create ${role} users` }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the user using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const newUserId = authData.user.id;
    console.log("User created in auth:", newUserId);

    // Create the user role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role });

    if (roleError) {
      console.error("Role insert error:", roleError);
      // Cleanup: delete the user if role creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: "Failed to assign role" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update profile with additional info
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        full_name: fullName, 
        created_by: createdBy,
        must_change_password: true 
      })
      .eq("user_id", newUserId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // Handle role-specific assignments
    if (role === "shop_owner" && creatorRole === "developer") {
      // Create developer assignment
      const { error: assignError } = await supabaseAdmin
        .from("developer_assignments")
        .insert({ developer_id: createdBy, shop_owner_id: newUserId });

      if (assignError) {
        console.error("Developer assignment error:", assignError);
      }

      // Create a shop for the shop owner
      const { data: shopData, error: shopError } = await supabaseAdmin
        .from("shops")
        .insert({
          name: shopName || `${fullName}'s Shop`,
          owner_id: newUserId,
          created_by: createdBy,
        })
        .select()
        .single();

      if (shopError) {
        console.error("Shop creation error:", shopError);
      } else {
        console.log("Shop created:", shopData.id);
      }
    }

    if ((role === "order_manager" || role === "employee") && shopId) {
      // Create shop assignment for employees/order managers
      const { error: shopAssignError } = await supabaseAdmin
        .from("shop_assignments")
        .insert({ user_id: newUserId, shop_id: shopId, assigned_by: createdBy });

      if (shopAssignError) {
        console.error("Shop assignment error:", shopAssignError);
      }
    }

    console.log("User creation complete:", newUserId);

    return new Response(
      JSON.stringify({ success: true, userId: newUserId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
