import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

// Define color constants (matching chat.tsx)
const COLORS = {
  primary: "#FF7D00",
  accent: "#FF9A3D",
  background: "#FFF9F2",
  text: "#333333",
  textLight: "#888888",
  cardLight: "#FFFFFF",
  cardDark: "#FFF0E6",
};

const { width } = Dimensions.get('window');
const GAME_CARD_WIDTH = width * 0.85;

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'quiz' | 'puzzle' | 'memory' | 'challenge';
  available: boolean;
}

export default function GamesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [games] = useState<Game[]>([
    {
      id: '1',
      title: 'Knowledge Quest',
      description: 'Test your knowledge with rapid-fire questions across various subjects',
      icon: '🎯',
      category: 'quiz',
      difficulty: 'medium',
      type: 'quiz',
      available: true,
    },
    {
      id: '2',
      title: 'Memory Match',
      description: 'Match pairs of cards to improve your memory and concentration',
      icon: '🧩',
      category: 'memory',
      difficulty: 'easy',
      type: 'memory',
      available: true,
    },
    {
      id: '3',
      title: 'Word Wizard',
      description: 'Form words and expand your vocabulary in this word puzzle game',
      icon: '📝',
      category: 'puzzle',
      difficulty: 'medium',
      type: 'puzzle',
      available: true,
    },
    {
      id: '4',
      title: 'Math Master',
      description: 'Solve mathematical challenges against the clock',
      icon: '🔢',
      category: 'challenge',
      difficulty: 'hard',
      type: 'challenge',
      available: false,
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'quiz', name: 'Quizzes', icon: '🎯' },
    { id: 'memory', name: 'Memory', icon: '🧩' },
    { id: 'puzzle', name: 'Puzzles', icon: '📝' },
    { id: 'challenge', name: 'Challenges', icon: '⚡' },
  ];

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const renderGameCard = ({ item }: { item: Game }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      delay={200}
      style={styles.gameCardContainer}
    >
      <TouchableOpacity
        style={[
          styles.gameCard,
          !item.available && styles.gameCardDisabled
        ]}
        onPress={() => {/* Handle game selection */}}
        disabled={!item.available}
      >
        <LinearGradient
          colors={[COLORS.cardLight, COLORS.cardDark]}
          style={styles.gameCardGradient}
        >
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>{item.icon}</Text>
            {!item.available && (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            )}
          </View>
          
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameDescription}>{item.description}</Text>
            
            <View style={styles.gameMetaContainer}>
              <View style={styles.difficultyBadge}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={14} 
                  color={COLORS.primary} 
                />
                <Text style={styles.difficultyText}>
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Text>
              </View>
              
              {item.available && (
                <TouchableOpacity style={styles.playButton}>
                  <Text style={styles.playButtonText}>Play Now</Text>
                  <Ionicons name="play" size={16} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, "#FFFFFF"]}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <FontAwesome5 name="gamepad" size={22} color={COLORS.primary} />{" "}
          Learning Games
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Categories</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Available Games</Text>
        
        <FlatList
          data={filteredGames}
          renderItem={renderGameCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.gamesContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginVertical: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  gamesContainer: {
    paddingBottom: 24,
  },
  gameCardContainer: {
    marginBottom: 16,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  gameCardDisabled: {
    opacity: 0.7,
  },
  gameCardGradient: {
    padding: 16,
    flexDirection: 'row',
  },
  gameIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 125, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameIcon: {
    fontSize: 36,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  gameMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 125, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  playButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginRight: 4,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
});