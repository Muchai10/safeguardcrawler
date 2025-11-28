import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Shield, AlertTriangle, Eye, Activity, TrendingUp, MapPin, Bell, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import { NewsletterSubscribe } from '@/components/NewsletterSubscribe';
import citizensImg from '@/assets/citizens-digital.jpg';
import safetyNetworkImg from '@/assets/safety-network.jpg';

const Landing = () => {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const carouselSlides = [
    {
      icon: Shield,
      title: 'Early Warning System',
      description: 'Detect GBV threats 4-6 hours before they escalate with AI-powered monitoring across Kenyan digital spaces.',
      gradient: 'from-primary/20 to-primary/5'
    },
    {
      icon: MapPin,
      title: 'Hotspot Mapping',
      description: 'Visualize threat patterns with interactive maps showing incident clustering and severity levels in real-time.',
      gradient: 'from-severity-high/20 to-severity-high/5'
    },
    {
      icon: Eye,
      title: 'Multi-Source Intelligence',
      description: 'Aggregate signals from Twitter, Facebook, Reddit, and news sources while respecting privacy and platform policies.',
      gradient: 'from-accent/20 to-accent/5'
    },
    {
      icon: Lock,
      title: 'Privacy-First Design',
      description: 'PII redaction, encryption at rest, pseudonymization, and short retention windows protect user privacy.',
      gradient: 'from-secondary/20 to-secondary/5'
    }
  ];

  const features = [
    {
      icon: AlertTriangle,
      title: 'Real-time Alerts',
      description: '3-tier severity system with actionable notifications'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Detect emerging patterns and narrative shifts'
    },
    {
      icon: Activity,
      title: 'Multi-lingual NLP',
      description: 'English, Kiswahili, and Sheng language support'
    },
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Dashboard and push notifications for responders'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">SafeGuard Crawler</h1>
                <p className="text-xs text-muted-foreground">Early signals, safer spaces</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/"><Button variant="ghost" size="sm">Home</Button></Link>
              <Link to="/about"><Button variant="ghost" size="sm">About</Button></Link>
              <Link to="/contact"><Button variant="ghost" size="sm">Contact</Button></Link>
              <Link to="/reviews"><Button variant="ghost" size="sm">Complaints</Button></Link>
              <Link to="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Detect Online Harm Before It Escalates
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered monitoring for GBV-related abuse, cyber-harassment, and misinformation in Kenyan digital spaces.
            Built for NGOs, newsrooms, and safety responders.
          </p>

          {/* Three Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
            <Link to="/news" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-6">
                News Articles
              </Button>
            </Link>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg px-12 py-6 hover-scale shadow-lg">
                Analytics
              </Button>
            </Link>

            <Link to="/socials" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-6">
                Social Media
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="max-w-3xl mx-auto">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {carouselSlides.map((slide, index) => {
                const Icon = slide.icon;
                return (
                  <CarouselItem key={index}>
                    <Card className="border-2 hover:border-primary/50 transition-all duration-300">
                      <CardContent className={`p-8 lg:p-12 bg-gradient-to-br ${slide.gradient}`}>
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
                            <Icon className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-2xl lg:text-3xl font-bold">{slide.title}</h3>
                          <p className="text-muted-foreground text-base lg:text-lg max-w-xl">
                            {slide.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>

      {/* Citizens Section with Image */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
            <div>
              <img 
                src={citizensImg} 
                alt="Kenyan citizens using digital devices for safer communities" 
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                Protecting Communities Through Technology
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                SafeGuard Crawler monitors digital spaces to identify threats before they escalate, 
                helping protect vulnerable communities across Kenya.
              </p>
              <img 
                src={safetyNetworkImg} 
                alt="Digital safety network visualization" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <h3 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Powerful Features for Digital Safety
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30"
                >
                  <CardContent className="p-6">
                    <Icon className="w-10 h-10 text-primary mb-4" />
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-2 border-primary/20">
            <CardContent className="p-8 lg:p-12 text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Stay Updated
              </h3>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Subscribe to receive updates on new features, threat insights, and digital safety tips.
              </p>
              <NewsletterSubscribe />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8 lg:p-12 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-center">
              Ready to Protect Your Community?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
              Join digital-safety NGOs, newsroom moderators, and GBV helpline responders using SafeGuard Crawler
              to detect threats before they escalate.
            </p>
            <div className="flex justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-12 hover-scale">
                  Access Analytics Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold">SafeGuard Crawler</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Ethical AI monitoring for safer digital spaces in Kenya
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;