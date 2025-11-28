// src/pages/Reviews.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AlertCircle, CheckCircle2, Loader2, Mail, User, Link2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Reviews() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      issue_type: formData.get("issue") as string,
      url: (formData.get("url") as string) || null,
      message: formData.get("message") as string,
      name: (formData.get("name") as string) || null,
      email: (formData.get("email") as string) || null,
    };

    const { error } = await supabase
      .from("reports")
      .insert(data);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Thank you! Report received",
        description: "We'll review it within 24–48 hours.",
      });
      e.currentTarget.reset();
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Report an Issue or Give Feedback
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Help us keep the data accurate and respectful
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Send us a message</CardTitle>
              <CardDescription>
                Found wrong information? Want something removed? Have a suggestion or bug report?<br />
                We read every single message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="issue" />

                <div className="space-y-2">
                  <Label htmlFor="issue">What kind of issue are you reporting? *</Label>
                  <Select name="issue" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose one..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wrong-info">Incorrect or outdated information</SelectItem>
                      <SelectItem value="remove">I want my/my company's data removed</SelectItem>
                      <SelectItem value="bug">Bug or technical problem</SelectItem>
                      <SelectItem value="copyright">Copyright / DMCA concern</SelectItem>
                      <SelectItem value="privacy">Privacy concern</SelectItem>
                      <SelectItem value="suggestion">Suggestion or feature request</SelectItem>
                      <SelectItem value="other">Something else</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Link to the page with the problem <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input name="url" type="url" placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Please describe the issue in detail *
                  </Label>
                  <Textarea
                    name="message"
                    required
                    placeholder="The phone number for XYZ is wrong..."
                    className="min-h-32"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Your name <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input name="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input name="email" type="email" placeholder="you@example.com" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    * required fields
                  </p>

                  <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-40">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            We respect your privacy • No spam, ever • Response within 48h
          </p>
        </div>
      </div>

      <Toaster />
    </>
  );
}