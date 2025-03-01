import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { progressService } from '../../services/progress';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

interface Subject {
  name: string;
  progress: number;
  color: string;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
}

interface ProgressData {
  totalLessons: number;
  completedLessons: number;
  streakDays: number;
  totalPoints: number;
  recentAchievements: Achievement[];
  subjects: Subject[];
}

// Add these interfaces after the existing interfaces
interface Lesson {
  _id: string;
  title: string;
  subject: string;
}

interface ProgressResponse {
  _id: string;
  lessonId: Lesson;
  score: number;
  timeSpent: number;
  mistakes: number;
}

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData>({
    totalLessons: 0,
    completedLessons: 0,
    streakDays: 0,
    totalPoints: 0,
    recentAchievements: [],
    subjects: []
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [progressResponse, statsResponse] = await Promise.all([
        progressService.getProgress(),
        progressService.getLearningStats()
      ]);

      // Group progress by subject and calculate average scores
      const subjectProgress = (progressResponse as ProgressResponse[]).reduce((acc, curr) => {
        const subject = curr.lessonId.subject;
        if (!acc[subject]) {
          acc[subject] = { total: 0, count: 0 };
        }
        acc[subject].total += curr.score;
        acc[subject].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      const subjects = Object.entries(subjectProgress).map(([name, data]) => ({
        name,
        progress: Math.round(((data as { total: number; count: number }).total / (data as { total: number; count: number }).count) || 0),
        color: ((data as { total: number; count: number }).total / (data as { total: number; count: number }).count) >= 70 ? "#4CAF50" : "#FC8F12"
      }));

      setProgressData({
        totalLessons: statsResponse.totalLessons || 0,
        completedLessons: statsResponse.completedLessons || 0,
        streakDays: statsResponse.streakDays || 0,
        totalPoints: statsResponse.totalPoints || 0,
        recentAchievements: statsResponse.achievements || [],
        subjects,
      });
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FC8F12" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header Section */}
        <LinearGradient
          colors={["#FFF8EE", "#FFEAD0"]}
          style={styles.headerSection}
        >
          <Animatable.View animation="fadeIn" style={styles.statsContainer}>
            <View style={styles.statCard}>
              <FontAwesome5 name="book-open" size={24} color="#FC8F12" />
              <Text style={styles.statNumber}>{progressData.completedLessons}/{progressData.totalLessons}</Text>
              <Text style={styles.statLabel}>Lessons Done</Text>
            </View>
            
            <View style={styles.statCard}>
              <FontAwesome5 name="fire" size={24} color="#FC8F12" />
              <Text style={styles.statNumber}>{progressData.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <FontAwesome5 name="star" size={24} color="#FC8F12" />
              <Text style={styles.statNumber}>{progressData.totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Subjects Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          {progressData.subjects.map((subject, index) => (
            <Animatable.View 
              key={index}
              animation="fadeInUp"
              delay={index * 200}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.progressPercentage}>{subject.progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${subject.progress}%`, backgroundColor: subject.color }]} />
              </View>
            </Animatable.View>
          ))}
        </View>

        {/* Recent Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {progressData.recentAchievements.map((achievement, index) => (
            <Animatable.View
              key={index}
              animation="fadeInRight"
              delay={index * 300}
              style={styles.achievementCard}
            >
              <View style={styles.achievementIcon}>
                <FontAwesome5 name={achievement.icon} size={24} color="#FC8F12" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              </View>
            </Animatable.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FDFBF8',
  },
  container: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: width * 0.25,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FC8F12',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF8EE',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});