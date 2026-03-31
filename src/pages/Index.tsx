import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Shield, 
  Stethoscope, 
  Activity, 
  Pill,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Users,
  Lock,
  ClipboardList,
  Sparkles,
  BellRing
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Health Dashboard',
    description: 'Track your vital health metrics and get personalized insights',
  },
  {
    icon: Stethoscope,
    title: 'AI Symptom Checker',
    description: 'Get instant analysis of your symptoms powered by advanced AI',
  },
  {
    icon: Calendar,
    title: 'Appointment Management',
    description: 'Book and manage appointments with doctors and specialists',
  },
  {
    icon: Pill,
    title: 'Medicine Reminders',
    description: 'Never miss a dose with smart medication tracking',
  },
];

const trustMetrics = [
  {
    icon: Users,
    value: '50K+',
    label: 'Active users',
  },
  {
    icon: Clock3,
    value: '< 30 sec',
    label: 'Symptom response time',
  },
  {
    icon: Lock,
    value: '256-bit',
    label: 'Data encryption',
  },
];

const onboardingSteps = [
  {
    icon: ClipboardList,
    title: 'Create your profile',
    description: 'Add your medical details once to get smarter recommendations across the app.',
  },
  {
    icon: Sparkles,
    title: 'Get AI health insights',
    description: 'Describe symptoms and receive quick, easy-to-understand guidance in seconds.',
  },
  {
    icon: BellRing,
    title: 'Stay on track daily',
    description: 'Use reminders and appointments to build healthy routines that actually stick.',
  },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        
        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">HealthHub</span>
            </div>
            <Button onClick={() => navigate('/auth')}>Get Started</Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-12 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              Your Health, Simplified
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Take Control of Your{' '}
              <span className="text-primary">Health Journey</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage your health with AI-powered insights, connect with doctors, track medications, and access emergency services—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" onClick={() => navigate('/auth')}>
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <metric.icon className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Trusted platform</span>
                  </div>
                  <p className="text-xl font-semibold text-foreground leading-none">{metric.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive healthcare platform designed to keep you healthy and informed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="health-card group cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 to-primary" />
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
                <div className="mt-5 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">How it works</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Three Steps To Better Care
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start fast, stay informed, and keep your healthcare journey organized in one simple flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {onboardingSteps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary/80">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                Why Choose HealthHub?
              </h2>
              <div className="space-y-4">
                {[
                  'AI-powered symptom analysis for quick insights',
                  'Secure storage of your health records',
                  'Easy appointment scheduling with specialists',
                  'Smart medicine reminders and tracking',
                  'Emergency services at your fingertips',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-8" onClick={() => navigate('/auth')}>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Heart className="w-16 h-16 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_10%,white_0,transparent_40%)]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm px-6 py-10 lg:px-10 lg:py-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4">
              Start Your Health Journey Today
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who are taking control of their health with HealthHub
            </p>
            <Button 
              size="xl" 
              variant="secondary"
              onClick={() => navigate('/auth')}
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">HealthHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 HealthHub. Your health, our priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
