import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const progressData = {
    totalLessons: 48,
    completedLessons: 32,
    streakDays: 7,
    totalPoints: 2450,
    recentAchievements: [
      { title: "Quick Learner", description: "Completed 5 lessons in one day", icon: "trophy" },
      { title: "Math Wizard", description: "Perfect score in Mathematics", icon: "calculator" },
      { title: "Reading Star", description: "Read 10 stories", icon: "book-reader" }
    ],
    subjects: [
      { name: "Mathematics", progress: 75, color: "#FC8F12" },
      { name: "Reading", progress: 60, color: "#4CAF50" },
      { name: "Science", progress: 45, color: "#FC8F12" },
      { name: "Language", progress: 80, color: "#4CAF50" }
    ]
  };

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
});