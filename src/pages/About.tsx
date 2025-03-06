
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Laptop, Sparkles, Heart, Trophy, Users, Clock, Target, Coffee } from 'lucide-react';
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

        {/* What Makes Us Different */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Why We're Different ✨</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Trophy className="w-8 h-8 text-gaming-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-Time Price Tracking 📊</h3>
              <p className="text-gray-600">
                We hunt down the best deals so you don't have to. Our automated systems check prices across major retailers every 5 minutes!
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Laptop className="w-8 h-8 text-gaming-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Apples-to-Apples Comparisons 🍎</h3>
              <p className="text-gray-600">
                We normalize tech specs across brands and models so you can compare laptops without the marketing jargon confusion.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-gaming-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Human-Friendly Tech Talk 🗣️</h3>
              <p className="text-gray-600">
                We translate complex specifications into human language. No more wondering what "integrated UHD graphics" actually means!
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-8 h-8 text-gaming-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team ❤️</h2>
          </div>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-8">
            We're a small but mighty team of tech enthusiasts, deal hunters, and people who've been burned by bad laptop purchases in the past. We're united by our passion for helping people make smart tech decisions without the headache!
          </p>
          <div className="flex justify-center">
            <img 
              src="/placeholder.svg" 
              alt="The Laptop Hunter Team" 
              className="rounded-lg shadow-lg max-w-md mx-auto" 
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            *Okay, we're not actually this blurry in real life. Our photographer was just really excited about laptops. 📸
          </p>
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
