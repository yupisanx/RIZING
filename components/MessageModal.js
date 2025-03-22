import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MessageModal = ({ visible, message, type, onClose, onAction, highlightWords = [] }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset states
      setTextIndex(0);
      setDisplayedText('');
      setIsTyping(true);
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, message]);

  useEffect(() => {
    if (isTyping && textIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + message[textIndex]);
        setTextIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (isTyping && textIndex >= message.length) {
      setIsTyping(false);
    }
  }, [textIndex, message, isTyping]);

  const handlePress = () => {
    if (isTyping) {
      // If still typing, show full message immediately
      setDisplayedText(message);
      setTextIndex(message.length);
      setIsTyping(false);
    } else if (type !== 'CONFIRM') {
      // If not typing and not a confirm message, go to next
      onClose();
    }
  };

  const highlightText = (text) => {
    let highlighted = text;
    highlightWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'g');
      highlighted = highlighted.replace(regex, `|^|$1|^|`);
    });
    
    return highlighted.split('|^|').map((part, index) => (
      highlightWords.includes(part) ? (
        <Text key={index} style={styles.highlightedText}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    ));
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.touchableArea}
        activeOpacity={1}
        onPress={handlePress}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#000000', '#000000', '#2e1065']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />
          <View style={styles.iconContainer}>
            <Text style={styles.infoText}>i</Text>
            <Text style={styles.infoLabel}>INFO</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {highlightText(displayedText)}
            </Text>
          </View>
          {type === 'CONFIRM' && !isTyping && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => onAction(true)}
              >
                <Text style={styles.buttonText}>YES</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => onAction(false)}
              >
                <Text style={styles.buttonText}>NO</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  touchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  modalContainer: {
    width: '85%',
    minHeight: 200,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d8b4fe',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    opacity: 0.95,
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#d8b4fe',
    textAlign: 'center',
    lineHeight: 30,
    color: '#d8b4fe',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoLabel: {
    color: '#d8b4fe',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messageContainer: {
    paddingTop: 70,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  highlightedText: {
    color: '#d8b4fe',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#d8b4fe',
    borderRadius: 5,
    backgroundColor: 'rgba(216, 180, 254, 0.1)',
  },
  buttonText: {
    color: '#d8b4fe',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessageModal; 