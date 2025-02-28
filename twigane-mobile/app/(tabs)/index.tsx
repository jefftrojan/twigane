import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useRef, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable"; // Added for additional animations

export default function TabOneScreen() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State for FAQ accordion
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Toggle FAQ item
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // FAQ data
  const faqData = [
    {
      question: "How is Twigane different from other learning platforms?",
      answer:
        "Twigane is specially designed for children with diverse abilities. Our platform adapts to each child's learning style, providing an inclusive and personalized experience with colorful interactive content.",
    },
    {
      question: "What age groups is Twigane suitable for?",
      answer:
        "Twigane is designed for children aged 4-12, with content carefully tailored for different developmental stages and learning needs.",
    },
    {
      question: "Can parents track their child's progress?",
      answer:
        "Yes! Our parent dashboard provides detailed insights into your child's learning journey, achievements, and areas where they might need additional support.",
    },
    {
      question: "Is Twigane accessible for children with disabilities?",
      answer:
        "Absolutely! Accessibility is at the heart of Twigane. We offer screen reader compatibility, customizable text sizes, alternative navigation methods, and content designed for various learning styles.",
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Redesigned Hero Section with GIF and text side by side */}
        <View style={styles.heroContainer}>
          <RNView style={styles.heroGifContainer}>
            <Image
              source={require("../../assets/images/learning.jpg")} // Replace with your actual GIF
              style={styles.heroGif}
              resizeMode="contain"
            />
          </RNView>

          <Animated.View
            style={[
              styles.heroTextContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.heroTitle}>Twigane</Text>
            <Text style={styles.heroDescription}>
              An inclusive educational platform where every child discovers the
              joy of learning at their own pace.
            </Text>
          </Animated.View>
        </View>

        <View style={styles.contentSection}>
          {/* Value proposition section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.mainTitle}>
              Learning Made Fun For Everyone!
            </Text>

            <Text style={styles.description}>
              Twigane helps every child discover the joy of learning through
              interactive, accessible, and engaging educational content designed
              specifically for children with diverse abilities.
            </Text>
          </View>

          {/* Feature cards */}
          <Text style={styles.sectionTitle}>Discover Our Magic</Text>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={[styles.card, styles.cardOrangePrimary]}>
              <View style={styles.cardIconWrapper}>
                <FontAwesome5 name="book-reader" size={32} color="#FC8F12" />
              </View>
              <Text style={styles.cardTitle}>Magical Courses</Text>
              <Text style={styles.cardText}>
                Colorful lessons that adapt to your learning style
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.cardGreen]}>
              <View style={styles.cardIconWrapper}>
                <Ionicons name="chatbubbles" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>Friendly ChatBox</Text>
              <Text style={styles.cardText}>
                Your helpful learning companion is always ready to help
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={[styles.card, styles.cardGreen]}>
              <View style={styles.cardIconWrapper}>
                <Ionicons name="game-controller" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>Fun Games</Text>
              <Text style={styles.cardText}>
                Learn while playing exciting educational games
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.cardOrangePrimary]}>
              <View style={styles.cardIconWrapper}>
                <FontAwesome5 name="medal" size={32} color="#FC8F12" />
              </View>
              <Text style={styles.cardTitle}>Cool Rewards</Text>
              <Text style={styles.cardText}>
                Collect stars and badges as you learn new things
              </Text>
            </TouchableOpacity>
          </View>

          {/* New detailed features section with icons */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose Twigane?</Text>

            <View style={styles.featuresList}>
              <Animatable.View
                animation="fadeInLeft"
                duration={800}
                delay={300}
                style={styles.featureItem}
              >
                <MaterialIcons
                  name="accessibility-new"
                  size={28}
                  color="#4CAF50"
                />
                <View style={{ flex: 1, backgroundColor: "transparent" }}>
                  <Text style={styles.featureTitle}>Inclusive Learning</Text>
                  <Text style={styles.featureText}>
                    Designed for children of all abilities with customizable
                    interfaces
                  </Text>
                </View>
              </Animatable.View>

              <Animatable.View
                animation="fadeInLeft"
                duration={800}
                delay={400}
                style={styles.featureItem}
              >
                <MaterialCommunityIcons
                  name="brain"
                  size={28}
                  color="#FC8F12"
                />
                <View style={{ flex: 1, backgroundColor: "transparent" }}>
                  <Text style={styles.featureTitle}>Adaptive Learning</Text>
                  <Text style={styles.featureText}>
                    AI-powered system that adjusts to each child's unique
                    learning pace
                  </Text>
                </View>
              </Animatable.View>

              <Animatable.View
                animation="fadeInLeft"
                duration={800}
                delay={500}
                style={styles.featureItem}
              >
                <MaterialIcons
                  name="family-restroom"
                  size={28}
                  color="#4CAF50"
                />
                <View style={{ flex: 1, backgroundColor: "transparent" }}>
                  <Text style={styles.featureTitle}>Parent Dashboard</Text>
                  <Text style={styles.featureText}>
                    Track progress, set goals, and celebrate achievements
                    together
                  </Text>
                </View>
              </Animatable.View>

              <Animatable.View
                animation="fadeInLeft"
                duration={800}
                delay={600}
                style={styles.featureItem}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={28}
                  color="#FC8F12"
                />
                <View style={{ flex: 1, backgroundColor: "transparent" }}>
                  <Text style={styles.featureTitle}>Safe Environment</Text>
                  <Text style={styles.featureText}>
                    Ad-free platform with child-appropriate content and parental
                    controls
                  </Text>
                </View>
              </Animatable.View>
            </View>
          </View>

          {/* Multiple testimonials in a carousel-style layout */}
          <View style={styles.testimonialSection}>
            <Text style={styles.sectionTitle}>Happy Learners</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.testimonialCarousel}
            >
              <View style={styles.testimonialBubble}>
                <View style={styles.quoteIconContainer}>
                  <FontAwesome5
                    name="quote-left"
                    size={20}
                    color="#FC8F12"
                    style={styles.quoteIcon}
                  />
                </View>
                <Text style={styles.testimonialText}>
                  "Twigane helped me learn to read in a fun way! I love the
                  colorful games!"
                </Text>
                <Text style={styles.testimonialAuthor}>
                  - Maya, 8 years old
                </Text>
              </View>

              <View style={styles.testimonialBubble}>
                <View style={styles.quoteIconContainer}>
                  <FontAwesome5
                    name="quote-left"
                    size={20}
                    color="#FC8F12"
                    style={styles.quoteIcon}
                  />
                </View>
                <Text style={styles.testimonialText}>
                  "As a parent of a child with ADHD, Twigane has been a
                  game-changer. The short, engaging lessons keep my son focused
                  and excited about learning."
                </Text>
                <Text style={styles.testimonialAuthor}>- Sarah, Parent</Text>
              </View>

              <View style={styles.testimonialBubble}>
                <View style={styles.quoteIconContainer}>
                  <FontAwesome5
                    name="quote-left"
                    size={20}
                    color="#FC8F12"
                    style={styles.quoteIcon}
                  />
                </View>
                <Text style={styles.testimonialText}>
                  "The audio stories and voice controls have made learning
                  accessible for my visually impaired daughter. She's thriving!"
                </Text>
                <Text style={styles.testimonialAuthor}>- David, Parent</Text>
              </View>
            </ScrollView>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            {faqData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFaq(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <MaterialIcons
                    name={
                      expandedFaq === index
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={24}
                    color="#FC8F12"
                  />
                </View>

                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Educational partners section */}
          <View style={styles.partnersSection}>
            <Text style={styles.sectionTitle}>Our Educational Partners</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.partnersScroll}
            >
              <View style={styles.partnerCard}>
                <MaterialIcons name="school" size={40} color="#FC8F12" />
                <Text style={styles.partnerName}>Sunshine Schools</Text>
              </View>

              <View style={styles.partnerCard}>
                <MaterialCommunityIcons
                  name="book-education"
                  size={40}
                  color="#4CAF50"
                />
                <Text style={styles.partnerName}>Learn Together</Text>
              </View>

              <View style={styles.partnerCard}>
                <FontAwesome5 name="hands-helping" size={40} color="#FC8F12" />
                <Text style={styles.partnerName}>Ability Alliance</Text>
              </View>

              <View style={styles.partnerCard}>
                <MaterialCommunityIcons
                  name="certificate"
                  size={40}
                  color="#4CAF50"
                />
                <Text style={styles.partnerName}>EdCert Institute</Text>
              </View>
            </ScrollView>
          </View>

          {/* Call to action with orange gradient button */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to Start Learning?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of happy families learning with Twigane today
            </Text>

            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient
                colors={["#FC8F12", "#FF6B00"]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.gradientButton}
              >
                <Text style={styles.ctaButtonText}>
                  Start Your Learning Journey
                </Text>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#FDFBF8",
  },
  container: {
    flex: 1,
  },
  // New hero container with side-by-side layout
  heroContainer: {
    height: 400,
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
  },
  heroGifContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroGif: {
    width: "100%",
    height: 400,
  },
  heroTextContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 2,
    backgroundColor: "transparent",
  },

  heroTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FC8F12",
    marginBottom: 10,
  },

  heroDescription: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginBottom: 25,
    lineHeight: 24,
  },

  contentSection: {
    padding: 24,
    backgroundColor: "transparent",
  },
  welcomeSection: {
    backgroundColor: "transparent",
    marginTop: 5,
    marginBottom: 30,
    padding: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFEAD0",
    borderStyle: "dashed",
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FC8F12",
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  card: {
    width: "48%",
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6,
    alignItems: "center",
    minHeight: 200,
  },
  cardOrangePrimary: {
    backgroundColor: "#FFEAD0",
  },
  cardGreen: {
    backgroundColor: "#E8F5E9",
  },
  cardIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },
  featuresSection: {
    marginVertical: 40,
    backgroundColor: "transparent",
  },
  featuresList: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 15,
    lineHeight: 20,
  },
  testimonialSection: {
    marginVertical: 30,
    backgroundColor: "transparent",
  },
  testimonialCarousel: {
    paddingBottom: 20,
  },
  testimonialBubble: {
    backgroundColor: "#FFF8EE",
    padding: 24,
    borderRadius: 20,
    width: 300,
    marginRight: 15,
    shadowColor: "#FC8F12",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: "relative",
  },
  quoteIconContainer: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#333",
    lineHeight: 24,
    marginBottom: 10,
    paddingLeft: 24,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    fontWeight: "600",
  },
  faqSection: {
    marginVertical: 30,
    width: "100%",
  },
  faqItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFEAD0",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  partnersSection: {
    marginVertical: 30,
  },
  partnersScroll: {
    marginTop: 20,
  },
  partnerCard: {
    width: 150,
    height: 120,
    backgroundColor: "#FFF",
    marginRight: 15,
    borderRadius: 12,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  partnerName: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  ctaSection: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  ctaButton: {
    width: "70%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#FC8F12",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
});
