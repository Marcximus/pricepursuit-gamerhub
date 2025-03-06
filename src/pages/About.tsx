
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Laptop, Sparkles, Heart, Trophy, Users, Clock, Target, Coffee, GitCompare, Zap, Brain, User, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            About <span className="text-gaming-600">Laptop Hunter</span> 💻
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your trusted companion in the digital wilderness of laptop shopping!
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Our Mission 🎯</h2>
          </div>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            At Laptop Hunter, we're on a wild mission to make laptop shopping actually... fun! 🤯 We believe finding your perfect tech companion shouldn't require a computer science degree or endless hours of research. We're here to simplify the hunt and help you track down your ideal laptop at the best possible price.
          </p>
        </div>

        {/* Origin Story Section */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Our Origin Story 📚</h2>
          </div>
          <div className="text-lg text-gray-600 max-w-3xl mx-auto">
            <p className="mb-4">
              Laptop Hunter was born from frustration (like all good things, right? 😅). Our founder spent three weeks comparing laptops across dozens of websites, creating spreadsheets, and still feeling uncertain about making the right choice.
            </p>
            <p className="mb-4">
              The breaking point? Finding the same laptop with a $400 price difference between two retailers! 💸 That's when the light bulb moment happened – why isn't there a single place to compare all laptop models AND track their prices across different retailers?
            </p>
            <p>
              And thus, in a caffeinated haze of determination <Coffee className="inline w-4 h-4" />, Laptop Hunter was born in 2023. We've been helping confused laptop shoppers ever since!
            </p>
          </div>
        </div>

        {/* Personal Recommendation Section - NEW */}
        <div className="mb-16 bg-blue-50 rounded-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <WandSparkles className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Personal Laptop Finder 🧙‍♂️</h2>
          </div>
          <div className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
            <p className="mb-6">
              Not sure where to start? Let our AI-powered recommendation tool find your perfect match!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
                  <User className="w-8 h-8 text-gaming-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tailored to You</h3>
                <p className="text-gray-600 text-center">
                  Answer a few simple questions about your needs and preferences.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gaming-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
                <p className="text-gray-600 text-center">
                  Our AI analyzes thousands of laptops to find your ideal matches.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gaming-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Results</h3>
                <p className="text-gray-600 text-center">
                  Get custom laptop recommendations with detailed explanations.
                </p>
              </div>
            </div>
            <Link to="/recommend">
              <Button className="bg-gaming-600 hover:bg-gaming-700">
                Find Your Perfect Laptop <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Find the best laptop Section */}
        <div className="mb-16 bg-gaming-50 rounded-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <GitCompare className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Find the Best Laptop 🔍</h2>
          </div>
          <div className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
            <p className="mb-6">
              Not sure which laptop is right for you? Let our powerful comparison tool do the hard work!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
                  <GitCompare className="w-8 h-8 text-gaming-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Compare Head-to-Head</h3>
                <p className="text-gray-600 text-center">
                  Put any two laptops side by side for a detailed spec comparison.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-gaming-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyze Performance</h3>
                <p className="text-gray-600 text-center">
                  See which laptop performs better for your specific needs.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gaming-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Recommendation</h3>
                <p className="text-gray-600 text-center">
                  Our AI analyzes the specs and gives you a clear winner.
                </p>
              </div>
            </div>
            <Link to="/compare">
              <Button className="bg-gaming-600 hover:bg-gaming-700">
                Compare Laptops Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Why We're Different ✨</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="w-8 h-8 text-gaming-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Price Tracking 📊</h3>
              <p className="text-gray-600">
                We hunt down the best deals so you don't have to. Our automated systems check prices across major retailers every 5 minutes!
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex justify-center mb-4">
                <Laptop className="w-8 h-8 text-gaming-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Apples-to-Apples Comparisons 🍎</h3>
              <p className="text-gray-600">
                We normalize tech specs across brands and models so you can compare laptops without the marketing jargon confusion.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-8 h-8 text-gaming-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Human-Friendly Tech Talk 🗣️</h3>
              <p className="text-gray-600">
                We translate complex specifications into human language. No more wondering what "integrated UHD graphics" actually means!
              </p>
            </div>
          </div>
        </div>

        {/* Fun Facts Section */}
        <div className="bg-gaming-50 rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Fun Facts About Us 🎮</h2>
          <ul className="space-y-4 max-w-2xl mx-auto text-lg">
            <li className="flex items-start">
              <span className="text-2xl mr-2">🔍</span>
              <span>We've analyzed over 5,000 laptops so you don't have to compare them yourself.</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-2">💰</span>
              <span>Our price tracking has helped users save an average of $247 on their laptop purchases.</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-2">🏆</span>
              <span>The most expensive laptop we've ever tracked cost more than our first car. We're still not over it.</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-2">☕</span>
              <span>Our team consumes approximately 738 cups of coffee per month to keep the laptop data flowing.</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-2">🐶</span>
              <span>We have an office dog named Pixel who has accidentally ordered three laptops with his paws. He has excellent taste though.</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to join the hunt? 🏹</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're a tech newbie or a seasoned spec-comparing veteran, we've got your back in the laptop jungle.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/">
              <Button className="bg-gaming-600 hover:bg-gaming-700">
                Start Hunting Laptops <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/recommend">
              <Button variant="outline">
                Find Your Perfect Match <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 py-8 text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} Laptop Hunter • Made with 💻 for people who love 💻
        </p>
        <p className="text-sm text-gray-400 mt-2">
          P.S. No laptops were harmed in the making of this website. They were all treated ethically and released back into the wild after data collection. 🌿
        </p>
      </div>
    </div>
  );
};

export default About;
