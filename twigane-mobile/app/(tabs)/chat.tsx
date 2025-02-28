import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

// Orange-based color palette
const COLORS = {
  primary: "#FF7D00", // Main orange
  secondary: "#FF9E2C", // Lighter orange
  accent: "#FF5B00", // Darker orange accent
  background: "#FFF9F4", // Light warm background
  cardLight: "#FFFFFF", // Card background
  cardDark: "#FFF2E6", // Darker card background
  text: "#333333", // Main text
  textLight: "#8C8C8C", // Secondary text
  success: "#67D990", // Success green
};

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [flashcards, setFlashcards] = useState([
    {
      question: "What is a variable?",
      answer: "A container for storing data values",
      emoji: "📦",
    },
    {
      question: "What is a function?",
      answer: "A reusable block of code that performs a specific task",
      emoji: "🔄",
    },
    {
      question: "What is an array?",
      answer: "A collection of items stored at contiguous memory locations",
      emoji: "📚",
    },
    {
      question: "What is a loop?",
      answer: "A programming structure that repeats a sequence of instructions",
      emoji: "🔁",
    },
  ]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: "user" }]);
      // Simulate bot response
      setTimeout(() => {
        let botResponse = "";
        if (message.toLowerCase().includes("help") || messages.length === 0) {
          botResponse =
            "Hey there! 👋 I'm your learning buddy! Want to try some cool flashcards on this topic?";
        } else if (
          message.toLowerCase().includes("yes") ||
          message.toLowerCase().includes("flashcard")
        ) {
          botResponse =
            "Awesome! 🎉 I've created some flashcards for you. Tap the cards icon in the top right to see them!";
        } else {
          botResponse =
            "That's interesting! 🤔 Would you like to learn more about this or create some flashcards to help you remember?";
        }

        setMessages((prev) => [
          ...prev,
          {
            text: botResponse,
            sender: "bot",
          },
        ]);
      }, 1000);
      setMessage("");
    }
  };

  const toggleFlashcards = () => {
    setShowFlashcards(!showFlashcards);
    // Reset flipped states when toggling
    setFlippedCards({});
  };

  const flipCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const goToNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentCardIndex(nextIndex);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
      setCurrentCardIndex(prevIndex);
    }
  };

  const renderFlashcard = ({ item, index }) => {
    const isFlipped = flippedCards[index] || false;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => flipCard(index)}
        style={styles.cardContainer}
      >
        <Animatable.View
          animation={isFlipped ? "flipInY" : "fadeIn"}
          duration={500}
          style={[
            styles.flashcard,
            { backgroundColor: isFlipped ? COLORS.cardDark : COLORS.cardLight },
          ]}
        >
          {!isFlipped ? (
            <View style={styles.cardContent}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.questionText}>{item.question}</Text>
              <View style={styles.tapHintContainer}>
                <Text style={styles.tapHint}>Tap to reveal answer</Text>
                <MaterialCommunityIcons
                  name="gesture-tap"
                  size={18}
                  color={COLORS.textLight}
                />
              </View>
            </View>
          ) : (
            <View style={styles.cardContent}>
              <Text style={styles.answerText}>{item.answer}</Text>
              <View style={styles.tapHintContainer}>
                <Text style={styles.tapHint}>Tap to flip back</Text>
                <MaterialCommunityIcons
                  name="gesture-tap"
                  size={18}
                  color={COLORS.textLight}
                />
              </View>
            </View>
          )}
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LinearGradient
        colors={[COLORS.background, "#FFFFFF"]}
        style={styles.background}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <FontAwesome5 name="brain" size={22} color={COLORS.primary} />{" "}
          Learning Buddy
        </Text>
        <TouchableOpacity
          onPress={toggleFlashcards}
          style={styles.flashcardButton}
        >
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
          >
            <MaterialCommunityIcons
              name="cards-outline"
              size={28}
              color={COLORS.primary}
            />
          </Animatable.View>
        </TouchableOpacity>
      </View>

      {showFlashcards ? (
        <View style={styles.carouselContainer}>
          {/* Prominent Return to Chat Button at Top */}
          <TouchableOpacity
            style={styles.returnToChatTopButton}
            onPress={toggleFlashcards}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.returnToChatText}>Return to Chat</Text>
          </TouchableOpacity>

          <Text style={styles.carouselTitle}>Flip Cards to Learn!</Text>

          <View style={styles.carouselWrapper}>
            <FlatList
              ref={flatListRef}
              data={flashcards}
              renderItem={renderFlashcard}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={CARD_WIDTH + 20}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / (CARD_WIDTH + 20)
                );
                setCurrentCardIndex(index);
              }}
              scrollEnabled={true}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH + 20,
                offset: (CARD_WIDTH + 20) * index,
                index,
              })}
            />
          </View>

          <View style={styles.carouselControls}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentCardIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPrevCard}
              disabled={currentCardIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  currentCardIndex === 0 ? COLORS.textLight : COLORS.primary
                }
              />
            </TouchableOpacity>

            <View style={styles.pagination}>
              {flashcards.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentCardIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentCardIndex === flashcards.length - 1 &&
                  styles.navButtonDisabled,
              ]}
              onPress={goToNextCard}
              disabled={currentCardIndex === flashcards.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  currentCardIndex === flashcards.length - 1
                    ? COLORS.textLight
                    : COLORS.primary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Additional Return to Chat Button at Bottom */}
          <TouchableOpacity
            style={styles.backToChatButton}
            onPress={toggleFlashcards}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientButton}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.backToChatText}>Return to Chat</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.length === 0 && (
            <Animatable.View animation="fadeIn" style={styles.welcomeContainer}>
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={3000}
                style={styles.robotImageContainer}
              >
                <FontAwesome5 name="robot" size={64} color={COLORS.primary} />
              </Animatable.View>
              <Text style={styles.welcomeText}>
                Hi there! I'm your Learning Buddy! 👋{"\n"}
                Ask me anything about your homework or studies!
              </Text>
            </Animatable.View>
          )}

          {messages.map((msg, index) => (
            <Animatable.View
              key={index}
              animation={msg.sender === "user" ? "fadeInRight" : "fadeInLeft"}
              duration={500}
              delay={300}
            >
              <View
                style={[
                  styles.message,
                  msg.sender === "user"
                    ? styles.userMessage
                    : styles.botMessage,
                ]}
              >
                {msg.sender === "bot" && (
                  <View style={styles.botIcon}>
                    <FontAwesome5 name="robot" size={16} color="#FFF" />
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "user"
                      ? styles.userMessageText
                      : styles.botMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </Animatable.View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask your learning buddy..."
          placeholderTextColor={COLORS.textLight}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendButton}
          disabled={!message.trim()}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.gradientButton}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderBottomColor: "rgba(0,0,0,0.05)",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  flashcardButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  robotImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 125, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 24,
  },
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 16,
  },
  returnToChatTopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  returnToChatText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  carouselWrapper: {
    height: CARD_WIDTH * 1.4,
    width: "100%",
  },
  carouselContent: {
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    marginHorizontal: 10,
  },
  flashcard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 125, 0, 0.1)",
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  cardEmoji: {
    fontSize: 56,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  answerText: {
    fontSize: 22,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 30,
  },
  tapHintContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  tapHint: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 4,
  },
  carouselControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginTop: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 125, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(140, 140, 140, 0.1)",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 125, 0, 0.3)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
    height: 8,
  },
  backToChatButton: {
    marginTop: 24,
    width: 160,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  backToChatText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  message: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: "rgba(255, 125, 0, 0.1)",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    paddingLeft: 18,
  },
  userMessageText: {
    color: COLORS.text,
  },
  botMessageText: {
    color: "#FFFFFF",
  },
  botIcon: {
    position: "absolute",
    left: -12,
    top: -12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFF",
    borderTopColor: "rgba(0,0,0,0.05)",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 240, 230, 0.6)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
});
