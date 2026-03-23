import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Message, FlipCard } from '../types';
import { getSessionById } from '../services/storage';

export const TestPage: React.FC = () => {
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (conversation_id) {
      const session = getSessionById(conversation_id);
      if (session) {
        setMessages(session.messages);
      } else if (location.state?.messages) {
        setMessages(location.state.messages);
      }
    } else if (location.state?.messages) {
      setMessages(location.state.messages);
    }
  }, [conversation_id, location.state]);

  const flipCards = useMemo(() => {
    const cards: FlipCard[] = [];
    messages.forEach(m => {
      if (m.followUp?.flipCard) {
        cards.push(m.followUp.flipCard);
      }
    });
    // Shuffle cards
    return cards.sort(() => Math.random() - 0.5);
  }, [messages]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const onClose = () => {
    navigate(-1);
  };

  if (flipCards.length === 0) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Test Available</h2>
          <p className="text-slate-500 mb-8">You need to collect some flip cards by chatting with EduBuddy first!</p>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go Back to Chat
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flipCards[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === currentCard.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flipCards.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-indigo-600 font-bold">
          <Trophy size={24} />
          <h1 className="text-xl">Knowledge Test</h1>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="bg-indigo-50 p-6 border-b border-indigo-100">
                <div className="flex justify-between items-center mb-4 text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                  <span>Question {currentIndex + 1} of {flipCards.length}</span>
                  <span>{currentCard.title}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 leading-snug">
                  {currentCard.question}
                </h2>
              </div>

              <div className="p-6 space-y-3">
                {currentCard.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentCard.correctAnswerIndex;
                  
                  let optionClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700";
                  let icon = null;

                  if (isAnswered) {
                    if (isCorrect) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                      icon = <CheckCircle className="text-emerald-500" size={20} />;
                    } else if (isSelected) {
                      optionClass = "border-red-500 bg-red-50 text-red-800";
                      icon = <XCircle className="text-red-500" size={20} />;
                    } else {
                      optionClass = "border-slate-200 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${optionClass}`}
                    >
                      <span className="font-medium">{option}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-6 pb-6"
                >
                  <div className={`p-4 rounded-xl mb-6 ${selectedOption === currentCard.correctAnswerIndex ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    <p className="font-bold mb-1">
                      {selectedOption === currentCard.correctAnswerIndex ? 'Correct!' : 'Incorrect!'}
                    </p>
                    <p className="text-sm opacity-90">{currentCard.knowledge}</p>
                  </div>
                  
                  <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {currentIndex < flipCards.length - 1 ? 'Next Question' : 'See Results'}
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center"
            >
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Test Complete!</h2>
              <p className="text-slate-500 mb-8">You answered {score} out of {flipCards.length} questions correctly.</p>
              
              <div className="text-6xl font-black text-indigo-600 mb-8">
                {Math.round((score / flipCards.length) * 100)}%
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleRestart}
                  className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Retake Test
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Back to Chat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
