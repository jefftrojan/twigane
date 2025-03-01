import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { chatService } from '../../services/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define color constants
const COLORS = {
  primary: "#FF7D00",
  accent: "#FF9A3D",
  background: "#FFF9F2",
  text: "#333333",
  textLight: "#888888",
  cardLight: "#FFFFFF",
  cardDark: "#FFF0E6",
};

// Define card width for flashcards
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

// Interface updated to match the ChatService
interface Message {
  _id: string;
  text: string; // For UI display
  sender: 'user' | 'bot';
  type?: 'text' | 'flipcard' | 'quiz';
  metadata?: {
    cardFront?: string;
    cardBack?: string;
    category?: string;
    points?: number;
    correctAnswer?: string;
  };
  content?: string; // For API response compatibility
  
  // Additional fields from ChatService
  role?: 'user' | 'assistant';
  timestamp?: Date;
}

// Add interface for flashcard type
interface Flashcard {
  question: string;
  answer: string;
  emoji: string;
}

// Type for flipped cards state
interface FlippedCardsState {
  [key: number]: boolean;
}

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string>(""); // Will be set by startChat()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      question: "How do I create a flashcard?",
      answer: "To create a flashcard, type 'make a flashcard' or 'create a flashcard'",
      emoji: "📝",
    },

  ]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<FlippedCardsState>({});
  const [isAddCardModalVisible, setAddCardModalVisible] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("");
  
  // Update the ref type
  const flatListRef = useRef<FlatList<Flashcard>>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('auth_token');
        
        if (!token) {
          // @ts-ignore (router is imported elsewhere in actual code)
          router.replace('/(auth)/login');
          return;
        }

        // Initialize chat with token
        const chatSession = await chatService.startChat(token);
        console.log('Chat session response:', chatSession); // Debug log
        
        if (!chatSession || !chatSession._id) {
          throw new Error('Invalid chat session response');
        }

        setChatId(chatSession._id);
        
        if (chatSession.messages?.length > 0) {
          const formattedMessages = chatSession.messages.map(msg => ({
            _id: msg._id || Date.now().toString(),
            text: msg.content || msg.text || '',
            sender: msg.role === 'user' ? 'user' : 'bot',
            type: msg.type || 'text',
            metadata: msg.metadata || {},
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Chat initialization error:', error);
        if (error instanceof Error && error.message.toLowerCase().includes('auth')) {
          // @ts-ignore (router is imported elsewhere in actual code)
          router.replace('/(auth)/login');
        } else {
          setError('Unable to start chat session. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
  }, []);

  // Pattern to detect flashcard creation requests in user messages
  const isFlashcardRequest = (text: string): boolean => {
    const patterns = [
      /make\s+(?:a\s+)?flashcard/i,
      /create\s+(?:a\s+)?flashcard/i,
      /add\s+(?:a\s+)?flashcard/i,
      /new\s+flashcard/i,
      /flashcard\s+for/i,
      /remember\s+this/i
    ];
    
    return patterns.some(pattern => pattern.test(text));
  };

  // Function to detect potential flashcard content in bot responses
  const extractPotentialFlashcard = (text: string): {question: string, answer: string, category: string} | null => {
    // Various patterns to detect Q&A formats in text
    const patterns = [
      // Q: ... A: ... format
      /Q:\s*(.+?)\s*A:\s*(.+?)(?:\s*C:\s*([^.$]*))?$/im,
      // Question: ... Answer: ... format
      /Question:\s*(.+?)\s*Answer:\s*(.+?)(?:\s*Category:\s*([^.$]*))?$/im,
      // Term: ... Definition: ... format
      /Term:\s*(.+?)\s*Definition:\s*(.+?)(?:\s*Category:\s*([^.$]*))?$/im
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          question: match[1].trim(),
          answer: match[2].trim(),
          category: match[3]?.trim() || ''
        };
      }
    }
    
    return null;
  };

  const getEmojiForCategory = (category?: string): string => {
    if (!category) return "📚";
  
    const categoryEmojis: Record<string, string> = {
      programming: "💻",
      math: "🔢",
      science: "🧪",
      history: "📜",
      language: "🗣️",
      geography: "🌎",
      art: "🎨",
      music: "🎵",
      biology: "🧬",
      chemistry: "⚗️",
      physics: "⚛️",
      literature: "📚",
      economics: "📊",
      psychology: "🧠",
    };
  
    const lowerCategory = category.toLowerCase();
    return categoryEmojis[lowerCategory] || "📚";
  };
  
  const processFlashcardData = (question: string, answer: string, category: string = '') => {
    // Validate data
    if (!question || !answer) return;
    
    // Create new flashcard
    const newFlashcard: Flashcard = {
      question: question,
      answer: answer,
      emoji: getEmojiForCategory(category)
    };
    
    // Add to flashcards state
    setFlashcards(prev => [...prev, newFlashcard]);
    
    // Show a notification that a flashcard was created
    const notificationMessage: Message = {
      _id: Date.now().toString() + '-fc-notification',
      text: `✅ Created a new flashcard: "${question.length > 30 ? question.substring(0, 30) + '...' : question}"`,
      sender: 'bot',
      type: 'text',
      timestamp: new Date()
    };
    
    // Add notification to messages
    setMessages(prev => [...prev, notificationMessage]);
    
    // Scroll to bottom to show the notification
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  // Update your handleSend function with enhanced flashcard detection
// Add these functions to your ChatScreen component to enable automatic flashcard creation

// Enhanced pattern detection for educational content in bot responses
const detectPotentialFlashcardContent = (text: string): Array<{question: string, answer: string, category: string}> => {
  const results = [];
  
  // Look for definitions and explanations
  const definitionPatterns = [
    // Definition pattern: Term is defined as explanation
    /([^.!?:]+)\s+(?:is defined as|is|means|refers to)\s+([^.!?]+[.!?])/gi,
    
    // Key concept pattern: X is a key concept in Y that means Z
    /([^.!?:]+)\s+is a (?:key|important|fundamental)\s+(?:concept|term|idea)\s+(?:in|for)\s+([^.!?:]+)\s+that\s+(?:means|refers to|is defined as)\s+([^.!?]+[.!?])/gi,
    
    // Important fact pattern: One important fact about X is Y
    /(?:One|An)\s+important\s+(?:fact|aspect|characteristic)\s+(?:about|of)\s+([^.!?:]+)\s+is\s+(?:that)?\s+([^.!?]+[.!?])/gi
  ];
  
  // Process definition patterns
  for (const pattern of definitionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Different patterns have different group positions
      if (match.length >= 3) {
        const term = match[1].trim();
        let definition;
        let category = '';
        
        // Handle different pattern matches
        if (match.length >= 4) {
          // This is the "key concept" pattern with category in group 2
          category = match[2].trim();
          definition = match[3].trim();
        } else {
          definition = match[2].trim();
          
          // Try to extract a subject category from the context
          const subjects = ["math", "science", "biology", "chemistry", "physics", 
                          "history", "geography", "literature", "language", 
                          "programming", "computing", "economics", "psychology"];
          
          for (const subject of subjects) {
            if (text.toLowerCase().includes(subject)) {
              category = subject;
              break;
            }
          }
        }
        
        // Validate lengths and create flashcard if reasonable
        if (term.length > 2 && definition.length > 10 && term.length < 100 && definition.length < 500) {
          results.push({
            question: term,
            answer: definition,
            category: category
          });
        }
      }
    }
  }
  
  // Find question-answer pairs in text
  const qaPatterns = [
    // Q: ... A: ... format
    /Q:\s*(.+?)\s*A:\s*(.+?)(?:\s*C:\s*([^.!?]*))?[.!?]/gi,
    
    // Question: ... Answer: ... format
    /Question:\s*(.+?)\s*Answer:\s*(.+?)(?:\s*Category:\s*([^.!?]*))?[.!?]/gi,
    
    // Direct question with answer format
    /([A-Z][^.!?]+\?)\s+([A-Z][^.!?]+[.!])/g
  ];
  
  // Process QA patterns
  for (const pattern of qaPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.length >= 3) {
        const question = match[1].trim();
        const answer = match[2].trim();
        const category = match[3] ? match[3].trim() : '';
        
        // Validate and add
        if (question.length > 5 && answer.length > 5) {
          results.push({
            question: question,
            answer: answer,
            category: category
          });
        }
      }
    }
  }
  
  return results;
};

// Enhanced automatic flashcard generation
const processAutomaticFlashcards = (botMessage: Message) => {
  // Skip processing if this is a notification or system message
  if (botMessage._id.includes('-notification') || botMessage.text.length < 50) {
    return;
  }
  
  // First check for explicitly marked flashcard content
  if (botMessage.type === 'flipcard' && botMessage.metadata) {
    processFlashcardData(
      botMessage.metadata.cardFront || '', 
      botMessage.metadata.cardBack || '', 
      botMessage.metadata.category || ''
    );
    return;
  }
  
  // Check for tagged flashcard content
  if (botMessage.text.includes('[FLASHCARD]')) {
    const flashcardRegex = /\[FLASHCARD\]\s*Q:\s*(.*?)\s*\|\s*A:\s*(.*?)(?:\s*\|\s*C:\s*([^|]*?))?(?:\s*\|.*)?$/;
    const match = botMessage.text.match(flashcardRegex);
    
    if (match) {
      const [, question, answer, category = ''] = match;
      
      // Process the flashcard data
      processFlashcardData(question.trim(), answer.trim(), category.trim());
      
      // Update the message to remove the flashcard markup
      const cleanedText = botMessage.text.replace(flashcardRegex, '').trim() 
        || "I've created a new flashcard for you!";
        
      // Update the message with cleaned text
      setMessages(prev => prev.map(msg => 
        msg._id === botMessage._id ? {...msg, text: cleanedText} : msg
      ));
      
      return;
    }
  }
  
  // Try to automatically detect potential flashcard content
  const potentialFlashcards = detectPotentialFlashcardContent(botMessage.text);
  
  if (potentialFlashcards.length > 0) {
    // Take only the first one to avoid creating too many cards at once
    const firstCard = potentialFlashcards[0];
    
    // Show a confirmation dialog before creating
    Alert.alert(
      "Create Flashcard",
      `Would you like to create a flashcard from this?\n\nQuestion: ${firstCard.question.substring(0, 40)}${firstCard.question.length > 40 ? '...' : ''}\n\nAnswer: ${firstCard.answer.substring(0, 40)}${firstCard.answer.length > 40 ? '...' : ''}`,
      [
        {
          text: "No Thanks",
          style: "cancel"
        },
        { 
          text: "Create", 
          onPress: () => processFlashcardData(firstCard.question, firstCard.answer, firstCard.category)
        }
      ]
    );
  }
};

// Update the handleSend function to include auto flashcard processing
const enhancedHandleSend = async () => {
  if (message.trim() && chatId) {
    setLoading(true);
    const currentMessage = message;
    setMessage("");
    
    // Check if this is a flashcard creation request
    const isFlashcardCreationRequest = isFlashcardRequest(currentMessage);
    
    try {
      // Create and add user message
      const userMessage: Message = {
        _id: Date.now().toString(),
        text: currentMessage,
        sender: 'user',
        type: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Add special tag if this is a flashcard request
      const apiMessage = isFlashcardCreationRequest 
        ? `[FLASHCARD_REQUEST] ${currentMessage}` 
        : currentMessage;

      const response = await chatService.sendMessage(chatId, apiMessage);
      console.log('Bot response:', response);
      
      // Handle the nested message structure from the backend
      const botContent = response.message?.content || response.content;
      const botType = response.message?.type || response.type || 'text';
      const botMetadata = response.message?.metadata || response.metadata || {};
      
      if (!botContent) {
        throw new Error('Invalid response format from assistant');
      }

      const botMessage: Message = {
        _id: response._id || Date.now().toString(),
        text: botContent,
        sender: 'bot',
        type: botType,
        metadata: botMetadata,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);

      // HANDLE EXPLICITLY TYPED FLASHCARD RESPONSES
      if (botType === 'flipcard' && botMetadata) {
        processFlashcardData(
          botMetadata.cardFront || '', 
          botMetadata.cardBack || '', 
          botMetadata.category || ''
        );
      }
      
      // HANDLE TEXT MESSAGES WITH EMBEDDED FLASHCARD DATA
      else if (botType === 'text') {
        // Check for explicit [FLASHCARD] tag
        if (botContent.includes('[FLASHCARD]')) {
          const flashcardRegex = /\[FLASHCARD\]\s*Q:\s*(.*?)\s*\|\s*A:\s*(.*?)(?:\s*\|\s*C:\s*([^|]*?))?(?:\s*\|.*)?$/;
          const match = botContent.match(flashcardRegex);
          
          if (match) {
            const [, question, answer, category = ''] = match;
            
            // Process the flashcard data
            processFlashcardData(question.trim(), answer.trim(), category.trim());
            
            // Update the message to remove the flashcard markup
            const cleanedText = botContent.replace(flashcardRegex, '').trim() 
              || "I've created a new flashcard for you!";
              
            // Update the message with cleaned text
            setMessages(prev => prev.map(msg => 
              msg._id === botMessage._id ? {...msg, text: cleanedText} : msg
            ));
          }
        }
        // Look for potential Q&A patterns if this was a flashcard request
        else if (isFlashcardCreationRequest) {
          const potentialFlashcard = extractPotentialFlashcard(botContent);
          
          if (potentialFlashcard) {
            const { question, answer, category } = potentialFlashcard;
            processFlashcardData(question, answer, category);
          }
        }
        // Try to automatically detect educational content for flashcards
        else {
          // Wait a bit to process auto flashcards so user can read the response first
          setTimeout(() => {
            processAutomaticFlashcards(botMessage);
          }, 2000);
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        text: "Sorry, I couldn't process your message. Please try again.",
        sender: 'bot',
        type: 'text',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      // Scroll to bottom after new messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }
};

const handleSend = enhancedHandleSend;

  const handleManualFlashcardCreation = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      processFlashcardData(
        newQuestion.trim(),
        newAnswer.trim(),
        newCategory.trim()
      );
      setNewQuestion("");
      setNewAnswer("");
      setNewCategory("");
      setAddCardModalVisible(false);
    } else {
      Alert.alert(
        "Incomplete Flashcard",
        "Both question and answer are required.",
        [{ text: "OK" }]
      );
    }
  };

  const toggleFlashcards = () => {
    setShowFlashcards(!showFlashcards);
    // Reset flipped states when toggling
    setFlippedCards({});
  };

  const flipCard = (index: number) => {
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

  // Render flashcard function with proper typing
  const renderFlashcard = ({ item, index }: { item: Flashcard; index: number }) => {
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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setAddCardModalVisible(true)}
            style={styles.createFlashcardButton}
          >
            <MaterialCommunityIcons
              name="card-plus-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          {flashcards.length > 0 && (
            <View style={styles.flashcardCounter}>
              <Text style={styles.counterText}>{flashcards.length}</Text>
            </View>
          )}
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
            {flashcards.length > 0 ? (
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
            ) : (
              <View style={styles.noCardsContainer}>
                <MaterialCommunityIcons 
                  name="card-outline" 
                  size={64} 
                  color={COLORS.textLight} 
                />
                <Text style={styles.noCardsText}>
                  No flashcards yet. Create some in chat!
                </Text>
                <TouchableOpacity 
                  style={styles.createCardButton}
                  onPress={() => {
                    toggleFlashcards();
                    setTimeout(() => setAddCardModalVisible(true), 300);
                  }}
                >
                  <Text style={styles.createCardButtonText}>
                    Create Your First Card
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {flashcards.length > 0 && (
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
          )}

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
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.length === 0 && !loading && (
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
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Pro Tip:</Text>
                <Text style={styles.tipsText}>
                  Try asking me to "make a flashcard about photosynthesis" or any topic you're studying!
                </Text>
              </View>
            </Animatable.View>
          )}
          
          {loading && messages.length === 0 && (
            <Animatable.View animation="fadeIn" style={styles.loadingContainer}>
              <Animatable.View 
                animation="pulse" 
                iterationCount="infinite" 
                duration={1000}
              >
                <MaterialCommunityIcons name="loading" size={48} color={COLORS.primary} />
              </Animatable.View>
              <Text style={styles.loadingText}>Starting up your learning session...</Text>
            </Animatable.View>
          )}
          
          {error && (
            <Animatable.View animation="fadeIn" style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={28} color="#E53935" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => setError(null)}
              >
                <Text style={styles.retryButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}

          {messages.map((msg, index) => (
            <Animatable.View
              key={index}
              animation={msg.sender === "user" ? "fadeInRight" : "fadeInLeft"}
              duration={500}
              delay={300}
            >
              {/* If this is a notification message, render it differently */}
              {msg._id.includes('-fc-notification') ? (
                <View style={styles.flashcardCreationFeedback}>
                  <MaterialCommunityIcons 
                    name="card-plus" 
                    size={24} 
                    color={COLORS.primary} 
                    style={styles.feedbackIcon}
                  />
                  <Text style={styles.feedbackText}>{msg.text}</Text>
                </View>
              ) : (
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
              )}
            </Animatable.View>
          ))}
          
          {loading && messages.length > 0 && (
            <Animatable.View 
              animation="fadeIn" 
              style={styles.typingIndicator}
            >
              <View style={styles.typingDot}></View>
              <View style={[styles.typingDot, {animationDelay: '0.2s'}]}></View>
              <View style={[styles.typingDot, {animationDelay: '0.4s'}]}></View>
            </Animatable.View>
          )}
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
          disabled={!message.trim() || loading}
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

      {/* Modal for creating flashcards manually */}
      <Modal
        visible={isAddCardModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddCardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Flashcard</Text>
            
            <Text style={styles.inputLabel}>Question/Front:</Text>
            <TextInput
              style={styles.modalInput}
              value={newQuestion}
              onChangeText={setNewQuestion}
              placeholder="Enter question or term"
              multiline
            />
            
            <Text style={styles.inputLabel}>Answer/Back:</Text>
            <TextInput
              style={styles.modalInput}
              value={newAnswer}
              onChangeText={setNewAnswer}
              placeholder="Enter answer or definition"
              multiline
            />
            
            <Text style={styles.inputLabel}>Category (optional):</Text>
            <TextInput
              style={styles.modalInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g., Math, Science, History"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddCardModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!newQuestion.trim() || !newAnswer.trim()) && styles.createButtonDisabled
                ]}
                onPress={handleManualFlashcardCreation}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashcardCounter: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  createFlashcardButton: {
    padding: 8,
    marginRight: 8,
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
    marginBottom: 20,
  },
  tipsContainer: {
    backgroundColor: "rgba(255, 125, 0, 0.1)",
    padding: 16,
    borderRadius: 12,
    width: '90%',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tipsTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  tipsText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
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
  noCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  noCardsText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: 16,
  },
  createCardButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  createCardButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  flashcardCreationFeedback: {
    backgroundColor: 'rgba(255, 125, 0, 0.1)',
    padding: 12,
    borderRadius: 12,
    margin: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackIcon: {
    marginRight: 8,
  },
  feedbackText: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
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
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginVertical: 8,
    marginLeft: 16,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
    opacity: 0.7,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginVertical: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  retryButtonText: {
    color: "#D32F2F",
    fontWeight: "bold",
    fontSize: 12,
  },
  // Modal styles for flashcard creation
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 240, 230, 0.3)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  createButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(255, 125, 0, 0.3)',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});