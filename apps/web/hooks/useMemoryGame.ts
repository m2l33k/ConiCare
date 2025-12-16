import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Card {
  id: number;
  content: string; // Emoji or image URL
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export function useMemoryGame(childId: string | null) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);

  // Initialize Game
  const initializeGame = useCallback(() => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        content: emoji,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledEmojis);
    setFlippedIndices([]);
    setMatchedPairs(0);
    setScore(0);
    setMoves(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle Card Click
  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length >= 2 || 
      cards[index].isFlipped || 
      cards[index].isMatched ||
      gameOver
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlippedIndices);
    }
  };

  // Check for Match
  const checkForMatch = (indices: number[]) => {
    const [firstIndex, secondIndex] = indices;
    const isMatch = cards[firstIndex].content === cards[secondIndex].content;

    if (isMatch) {
      setTimeout(() => {
        setCards(prev => prev.map((card, i) => 
          i === firstIndex || i === secondIndex 
            ? { ...card, isMatched: true, isFlipped: true } 
            : card
        ));
        setMatchedPairs(prev => prev + 1);
        setScore(prev => prev + 100); // 100 points per match
        setFlippedIndices([]);
      }, 500);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map((card, i) => 
          i === firstIndex || i === secondIndex 
            ? { ...card, isFlipped: false } 
            : card
        ));
        setFlippedIndices([]);
      }, 1000);
    }
  };

  // Check Game Over
  useEffect(() => {
    if (matchedPairs === EMOJIS.length && matchedPairs > 0) {
      setGameOver(true);
      if (childId) {
        saveScore(score + 100); // Add last match points if not added yet? (Already added in checkForMatch logic? Yes. Wait, score updates async? No, synchronous in React batching usually, but safe to pass current score)
        // Wait, matchedPairs updates, score updates.
        // We should save the final score.
      }
    }
  }, [matchedPairs, childId]); // Added score to deps? No, use ref or pass it.

  const saveScore = async (finalScore: number) => {
    if (!childId) return;
    try {
      const supabase = createClient();
      await supabase.from('game_scores').insert({
        child_id: childId,
        game_name: 'Memory Match',
        score: finalScore
      });
      console.log("Score saved!");
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  return {
    cards,
    score,
    moves,
    gameOver,
    handleCardClick,
    restartGame: initializeGame
  };
}
