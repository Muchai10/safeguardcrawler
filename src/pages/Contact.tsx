import { Shield, Mail, Users, Github, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
  const contacts = [
    {
      icon: Mail,
      title: 'General Inquiries',
      email: 'info@safeguardcrawler.org',
      description: 'For partnerships, demos, or collaborations.',
    },
    {
      icon: MessageSquare,
      title: 'Technical Support',
      email: 'support@safeguardcrawler.org',
      description: 'For dashboard issues, API help, or integration questions.',
    },
    {
      icon: Users,
      title: 'Partnerships & NGOs',
      email: 'partners@safeguardcrawler.org',
      description: 'For county gender desks, GBV helplines, and campus programs.',
    },
  ];

  const teamContacts = [
    { name: 'Margaret Muchai', role: 'Technical Lead', email: 'margaret@safeguardcrawler.org' },
    { name: 'Patrick Mbungu', role: 'Backend Engineer', email: 'patrick@safeguardcrawler.org' },
    { name: 'Antony Kiriinya', role: 'NLP & Research Engineer', email: 'antony@safeguardcrawler.org' },
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

      {/* Contact Content */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-center">Contact Us</h2>
          
          <p className="text-lg text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
            We'd love to hear from partners, NGOs, researchers, and anyone interested in using or contributing to{' '}
            <strong className="text-foreground">SafeGuard Crawler</strong>.
          </p>

          {/* Contact Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{contact.title}</h3>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline font-semibold block mb-3"
                    >
                      {contact.email}
                    </a>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Team Contacts */}
          <Card className="mb-12">
            <CardContent className="p-8 lg:p-12">
              <h3 className="text-3xl font-bold mb-8 text-center">Project Team Contacts</h3>
              
              <div className="space-y-6">
                {teamContacts.map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-primary hover:underline font-medium mt-2 sm:mt-0"
                    >
                      ✉️ {member.email}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 lg:p-12 text-center">
              <Github className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">Join the Community</h3>
              
              <div className="space-y-3 mb-6">
                <p className="text-foreground">
                  <strong>GitHub:</strong>{' '}
                  <a href="https://github.com/safeguardcrawler" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    github.com/safeguardcrawler
                  </a>
                </p>
                <p className="text-foreground">
                  <strong>Issue Tracker:</strong> Open issues for feature requests or bugs
                </p>
                <p className="text-foreground">
                  <strong>Partner With Us:</strong> Send a message with the subject <strong>"Partnership"</strong>
                </p>
              </div>
              
              <Button size="lg" asChild>
                <a href="mailto:partners@safeguardcrawler.org?subject=Partnership">
                  Become a Partner
                </a>
              </Button>
            </CardContent>
          </Card>
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

export default Contact;