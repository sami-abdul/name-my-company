import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageCircle, Book, Video, Mail, ExternalLink, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  const faqs = [
    {
      question: "How many domains can I generate per month?",
      answer: "It depends on your subscription tier. Free users get 5 generations per month, Mid tier users get 50, and Premium users get unlimited generations."
    },
    {
      question: "What's included in the branding kit?",
      answer: "The branding kit includes AI-generated logos, color palettes, social media handle availability checking, and trademark risk assessment (Premium only)."
    },
    {
      question: "How accurate is the domain availability checking?",
      answer: "Our domain availability checking is real-time and highly accurate. However, domain availability can change quickly, so we recommend registering domains immediately when you find one you like."
    },
    {
      question: "Can I export my domain history?",
      answer: "Yes! Premium users can export their complete domain generation history, analytics, and branding assets in various formats."
    },
    {
      question: "How do I upgrade my subscription?",
      answer: "You can upgrade your subscription anytime from the Subscription page in your dashboard. Upgrades take effect immediately."
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-neutral-600">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for help articles, tutorials, or FAQs..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Help */}
        <div className="lg:col-span-2 space-y-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="font-medium mb-1">Quick Start Guide</div>
                  <div className="text-sm text-muted-foreground">Learn the basics in 5 minutes</div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="font-medium mb-1">Video Tutorials</div>
                  <div className="text-sm text-muted-foreground">Watch step-by-step guides</div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="font-medium mb-1">Feature Overview</div>
                  <div className="text-sm text-muted-foreground">Explore all available features</div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="font-medium mb-1">Best Practices</div>
                  <div className="text-sm text-muted-foreground">Tips for better results</div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Describe your issue in detail..."
                  className="min-h-[100px]"
                />
              </div>
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                We typically respond within 24 hours
              </div>
            </CardContent>
          </Card>

          {/* Support Options */}
          <Card>
            <CardHeader>
              <CardTitle>Support Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-muted-foreground">All users</div>
                </div>
                <Badge variant="outline">Free</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Priority Support</div>
                  <div className="text-sm text-muted-foreground">Faster response</div>
                </div>
                <Badge className="bg-blue-500">Mid</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Live Chat</div>
                  <div className="text-sm text-muted-foreground">Real-time help</div>
                </div>
                <Badge className="bg-purple-500">Premium</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Video Library
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Book className="h-4 w-4 mr-2" />
                Documentation
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Community Forum
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
