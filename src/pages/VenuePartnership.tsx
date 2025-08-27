import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Store, TrendingUp, Users, Shield, DollarSign, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const VenuePartnership = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    venueName: '',
    contactName: '',
    email: '',
    phone: '',
    venueType: '',
    location: '',
    currentPOS: '',
    avgDailyCustomers: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    console.log('Partnership inquiry submitted:', formData);
    
    toast({
      title: "Partnership Inquiry Submitted!",
      description: "Our sales team will contact you within 24 hours.",
    });

    // Reset form
    setFormData({
      venueName: '',
      contactName: '',
      email: '',
      phone: '',
      venueType: '',
      location: '',
      currentPOS: '',
      avgDailyCustomers: '',
      message: ''
    });
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Boost average order value by 25% with our smart ordering system and upselling features."
    },
    {
      icon: Users,
      title: "Attract New Customers",
      description: "Tap into our growing customer base and benefit from our marketing campaigns."
    },
    {
      icon: Clock,
      title: "Reduce Wait Times",
      description: "Streamline ordering and reduce staff workload with automated order management."
    },
    {
      icon: Shield,
      title: "Responsible Service",
      description: "Promote responsible drinking with our built-in consumption monitoring tools."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Access detailed analytics on customer behavior, popular items, and peak hours."
    },
    {
      icon: DollarSign,
      title: "Competitive Commission",
      description: "Industry-leading commission structure with transparent pricing and no hidden fees."
    }
  ];

  const features = [
    "Real-time order management dashboard",
    "Integrated payment processing",
    "Customer loyalty program integration",
    "Inventory management tools",
    "Staff training and support",
    "Marketing campaign collaboration",
    "24/7 technical support",
    "Compliance monitoring tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-white hover:text-yellow-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-4 py-2 mb-6">
              <Store className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Venue Partnership Program</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Partner with{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                pours+
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join hundreds of venues already benefiting from our premium ordering platform. 
              Increase revenue, attract customers, and streamline operations.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-black/40 backdrop-blur-sm border-purple-500/20 hover:border-yellow-400/30 transition-colors">
                <CardContent className="p-6">
                  <benefit.icon className="h-8 w-8 text-yellow-400 mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-300 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features & Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What's Included */}
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2">Success Story</h4>
                  <p className="text-blue-200 text-sm">
                    "Since partnering with pours+, we've seen a 40% increase in orders and our customers 
                    love the convenience. The analytics help us optimize our menu and staffing." 
                  </p>
                  <p className="text-blue-300 text-xs mt-2">- Sarah M., Bar Manager at The District</p>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Form */}
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Get Started Today</CardTitle>
                <p className="text-gray-300">Tell us about your venue and we'll get in touch within 24 hours.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venueName" className="text-white">Venue Name *</Label>
                      <Input
                        id="venueName"
                        name="venueName"
                        value={formData.venueName}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="Your venue name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName" className="text-white">Contact Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venueType" className="text-white">Venue Type *</Label>
                      <Select onValueChange={(value) => handleSelectChange('venueType', value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="nightclub">Nightclub</SelectItem>
                          <SelectItem value="brewery">Brewery</SelectItem>
                          <SelectItem value="hotel">Hotel Bar</SelectItem>
                          <SelectItem value="sports-bar">Sports Bar</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-white">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPOS" className="text-white">Current POS System</Label>
                      <Input
                        id="currentPOS"
                        name="currentPOS"
                        value={formData.currentPOS}
                        onChange={handleInputChange}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="e.g., Square, Toast, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="avgDailyCustomers" className="text-white">Avg. Daily Customers</Label>
                      <Select onValueChange={(value) => handleSelectChange('avgDailyCustomers', value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-50">Under 50</SelectItem>
                          <SelectItem value="50-100">50-100</SelectItem>
                          <SelectItem value="100-200">100-200</SelectItem>
                          <SelectItem value="200-500">200-500</SelectItem>
                          <SelectItem value="over-500">Over 500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">Additional Information</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="Tell us about your goals, challenges, or any specific questions..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 text-lg"
                  >
                    Submit Partnership Inquiry
                  </Button>
                </form>

                <p className="text-gray-400 text-xs mt-4 text-center">
                  By submitting this form, you agree to be contacted by our sales team regarding partnership opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuePartnership;