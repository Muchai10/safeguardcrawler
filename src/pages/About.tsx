import { Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import teamWorkingImg from '@/assets/team-working.jpg';

const About = () => {
  const team = [
    {
      name: 'Margaret Muchai',
      role: 'Technical Lead',
      description: 'Leads system architecture, dashboard development, and AI integration.',
    },
    {
      name: 'Patrick Mbungu',
      role: 'Backend Engineer',
      description: 'Builds the API layer, data pipelines, and crawler infrastructure.',
    },
    {
      name: 'Antony Kiriinya',
      role: 'NLP & Research Engineer',
      description: 'Handles multilingual harm detection, NER, and model research.',
    },
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
            <nav className="flex items-center gap-4">
              <Link to="/"><Button variant="ghost" size="sm">Home</Button></Link>
              <Link to="/about"><Button variant="ghost" size="sm">About</Button></Link>
              <Link to="/contact"><Button variant="ghost" size="sm">Contact</Button></Link>
              <Link to="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
            </nav>
          </div>
        </div>
      </header>

      {/* About Content */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-center">About Us</h2>
          
          <Card className="mb-12">
            <CardContent className="p-8 lg:p-12">
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                <strong>SafeGuard Crawler</strong> is an ethical, AI-powered early-warning system that detects{' '}
                <strong>GBV threats, harassment, sextortion patterns, and harmful narratives</strong> across Kenyan digital spaces.
              </p>
              
              <div className="bg-muted/50 border-l-4 border-primary p-6 mb-6">
                <p className="text-xl font-semibold text-foreground">
                  Spot harm early. Protect communities faster.
                </p>
              </div>

              <p className="text-base text-foreground mb-6 leading-relaxed">
                We use multilingual AI (English, Kiswahili, Kikuyu) to scan permitted public sources, identify rising risks, 
                extract locations, and send explainable alerts to responders. The platform provides a real-time dashboard with 
                severity scores, hotspots, and trend insights—helping NGOs, campuses, journalists, and gender desks act before 
                harm escalates.
              </p>

              <p className="text-base text-foreground leading-relaxed">
                We are committed to <strong>privacy, ethics, and responsible AI</strong>, ensuring all monitoring respects 
                Kenya's Data Protection Act and platform policies.
              </p>
            </CardContent>
          </Card>

          {/* Team Image */}
          <div className="mb-12">
            <img 
              src={teamWorkingImg} 
              alt="SafeGuard Crawler team working on digital safety solutions" 
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Meet the Team */}
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Meet the Team
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold mb-2 text-foreground">{member.name}</h4>
                    <p className="text-primary font-semibold mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
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

export default About;