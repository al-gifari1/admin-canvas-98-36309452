import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Store, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Multi-Tenant Platform</h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          Secure role-based authentication with 5-tier hierarchy: Super Admin, Developer, Shop Owner, Order Manager, Employee.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/auth">Sign In <ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-4xl">
          <div className="flex flex-col items-center p-6 rounded-lg bg-muted/50">
            <Shield className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground text-center">5-tier role hierarchy with strict permissions</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-muted/50">
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Hierarchical Management</h3>
            <p className="text-sm text-muted-foreground text-center">Users manage only their subordinates</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-muted/50">
            <Store className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Multi-Tenant</h3>
            <p className="text-sm text-muted-foreground text-center">Data isolation with shop-based scoping</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
