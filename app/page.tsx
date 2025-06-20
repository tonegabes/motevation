"use client";

import {
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Tooltip
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from 'react';
import { toast } from "sonner";
import AchievementModal from './components/AchievementModal';
import Footer from './components/Footer';
import { ShareIcon } from './components/Icons';
import AppNavbar from './components/Navbar';
import QuoteCard from './components/QuoteCard';
import QuoteCardSkeleton from './components/QuoteCardSkeleton';
import QuoteShareOptions from './components/QuoteShareOptions';
import ScreenReaderAnnouncement from './components/ScreenReaderAnnouncement';
import SwipeHandler from './components/SwipeHandler';
import { formatDate, generateQuote } from './utils/quoteGenerator';

export default function Home() {
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [screenReaderMessage, setScreenReaderMessage] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState({
    title: '',
    description: '',
    icon: '',
    level: 'bronze' as 'bronze' | 'silver' | 'gold'
  });
  const [errorState, setErrorState] = useState<Error | null>(null);
  const inputNameRef = useRef<HTMLInputElement>(null);

  // Add error boundary handling
  useEffect(() => {
    // Handle any initialization errors
    try {
      // Set the current date on component mount
      const today = new Date();
      setCurrentDate(formatDate(today));

      // Set first load to false after 3 seconds
      setTimeout(() => {
        setFirstLoad(false);
      }, 3000);
    } catch (error) {
      console.error('Error during initialization:', error);
      setErrorState(error as Error);
    }
  }, []);

  const handleGenerateQuote = () => {
    if (name.trim() === "") return;

    setIsGenerating(true);
    setShowSkeleton(true);

    // Simulate loading for better UX
    setTimeout(() => {
      const result = generateQuote(name, currentDate);
      setQuote(result.text);
      setHasGenerated(true);
      setShowSkeleton(false);

      // Set screen reader announcement
      setScreenReaderMessage(`Quote generated for ${name}: ${result.text}`);

      // Check for achievements
      checkForAchievements();

      setIsGenerating(false);

      toast.success('Quote generated!', {
        description: 'Your personalized quote is ready',
        duration: 3000,
      });
    }, 600);
  };

  // Check for achievements based on number of quotes generated
  const checkForAchievements = () => {
    // Only show one achievement at a time
    let achievementUnlocked = false;

    // Get previously unlocked achievements
    const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');

    // Get quote count from localStorage or start at 1
    let quoteCount = parseInt(localStorage.getItem('quoteCount') || '0') + 1;
    localStorage.setItem('quoteCount', quoteCount.toString());

    // First quote achievement
    if (quoteCount === 1 && !unlockedAchievements.includes('first_quote')) {
      setCurrentAchievement({
        title: 'First Steps',
        description: 'Generated your first motivational quote!',
        icon: '✨',
        level: 'bronze'
      });
      achievementUnlocked = true;
      unlockedAchievements.push('first_quote');
    }
    // 5 quotes achievement
    else if (quoteCount >= 5 && !unlockedAchievements.includes('quote_collector')) {
      setCurrentAchievement({
        title: 'Quote Collector',
        description: 'Generated 5 different quotes',
        icon: '📚',
        level: 'silver'
      });
      achievementUnlocked = true;
      unlockedAchievements.push('quote_collector');
    }
    // 10 quotes achievement
    else if (quoteCount >= 10 && !unlockedAchievements.includes('quote_enthusiast')) {
      setCurrentAchievement({
        title: 'Quote Enthusiast',
        description: 'Generated 10 different quotes',
        icon: '🏆',
        level: 'gold'
      });
      achievementUnlocked = true;
      unlockedAchievements.push('quote_enthusiast');
    }

    // If an achievement was unlocked, save and show it
    if (achievementUnlocked) {
      localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));

      // Delay showing the achievement until after the quote is displayed
      setTimeout(() => {
        setShowAchievement(true);
      }, 1500);
    }
  };

  const shareQuote = async () => {
    if (!quote) return;

    // Open the share options modal
    setShowShareOptions(true);

    // Log sharing attempt
    try {
      // Analytics could be added here
      console.log('User attempted to share quote');
    } catch (error) {
      console.error('Error logging share event:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Quote copied to clipboard!', {
          description: 'You can now paste it anywhere',
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy to clipboard', {
          description: 'Please try again',
        });
      });
  };

  // Handle touch gestures
  const handleSwipeLeft = () => {
    // Only respond to swipes when we have a quote
    if (hasGenerated) {
      shareQuote();
    }
  };

  const handleSwipeRight = () => {
    // No longer toggles history, could be used for something else in the future
    return;
  };

  return (    <SwipeHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className="min-h-screen flex flex-col bg-background relative overflow-hidden"
    >      {/* Handle error state */}
      {errorState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90">
          <div className="bg-background-contrast rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Something went wrong</h2>
            <p className="text-default-500 mb-4">
              We encountered an error while loading the application. Please try refreshing the page.
            </p>
            <div className="flex justify-end">
              <Button
                color="secondary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader announcements */}
      {screenReaderMessage && (
        <ScreenReaderAnnouncement message={screenReaderMessage} />
      )}

      {/* Modals */}
      <QuoteShareOptions
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        quote={quote}
        name={name}
        date={currentDate}
      />

      <AchievementModal
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        achievement={currentAchievement}
      />

      <AppNavbar />

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">        <motion.div
          className="absolute top-1/5 left-10 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-pink-600/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.7, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-12 flex flex-col items-center flex-grow z-10">
        <header className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Daily Motivation
          </motion.h1>
        </header>

        <main className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="w-full shadow-md glass-card" radius="lg">
              <CardBody className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <Input
                    ref={inputNameRef}
                    label="Your Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="bordered"
                    radius="lg"                    fullWidth
                    isClearable
                    classNames={{
                      inputWrapper: "backdrop-blur-sm bg-content1/30",
                      label: "text-sm",
                      input: "text-sm md:text-base",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim() && !isGenerating) {
                        handleGenerateQuote();
                      }
                    }}
                  />

                  <Input
                    label="Date"
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    variant="bordered"
                    radius="lg"                    fullWidth
                    classNames={{
                      inputWrapper: "backdrop-blur-sm bg-content1/30",
                      label: "text-sm",
                      input: "text-sm md:text-base",
                    }}
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1"
                    >
                      <Button
                          color="secondary"
                          size="lg"
                          radius="lg"
                          fullWidth
                          isDisabled={!name.trim() || isGenerating}
                          isLoading={isGenerating}
                          spinner={<Spinner size="sm" color="white" />}
                          onClick={handleGenerateQuote}
                          className="font-medium text-sm md:text-base"
                        >
                          {isGenerating ? "Generating..." : "Generate Quote"}
                        </Button>
                    </motion.div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Show skeleton while loading */}
          {showSkeleton && !hasGenerated && (
            <motion.div
              className="mt-8 md:mt-12 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuoteCardSkeleton />
            </motion.div>
          )}

          {/* Show the actual quote */}
          {hasGenerated && !showSkeleton && (
            <motion.div
              id="quote-section"
              className="mt-8 md:mt-12 w-full relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <QuoteCard
                name={name}
                date={currentDate}
                quote={quote}
                isUnmotivational={quote.length > 0 ? quote.toLowerCase().includes('sorry') || quote.toLowerCase().includes('reality') : false}
                onCopy={copyToClipboard}
              />

              <div className="flex justify-center mt-4">
                <Tooltip content="Share this quote">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      isIconOnly
                      variant="light"
                      color="secondary"
                      radius="full"
                      className="text-lg"
                      onClick={shareQuote}
                    >
                      <ShareIcon />
                    </Button>
                  </motion.div>
                </Tooltip>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <Footer />
    </SwipeHandler>
  );
}
