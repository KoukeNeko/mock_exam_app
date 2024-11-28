import { useState, useEffect } from 'react';
import {
  CssVarsProvider,
  Sheet,
  Typography,
  Button,
  Box,
  Card,
  Chip,
  Container,
  IconButton,
  Alert,
  LinearProgress,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  Table,
  List,
  ListItem,
  ListItemDecorator,
  ListDivider,
  Select,
  Option
} from '@mui/joy';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HistoryIcon from '@mui/icons-material/History';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReactMarkdown from 'react-markdown';

const Quiz = ({ quizData, onBack }) => {
  console.log('Quiz component initialized with data:', quizData);

  useEffect(() => {
    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
      console.error('Invalid quiz data:', quizData);
      onBack();
      return;
    }
  }, [quizData]);

  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem(`quiz_${quizData?.exam_title}_state`);
    if (saved) {
      const state = JSON.parse(saved);
      return state.currentIndex;
    }
    return 0;
  });
  
  const [userAnswers, setUserAnswers] = useState(() => {
    const saved = localStorage.getItem(`quiz_${quizData?.exam_title}_state`);
    if (saved) {
      const state = JSON.parse(saved);
      return state.answers;
    }
    return {};
  });
  
  const [showResults, setShowResults] = useState(() => {
    const saved = localStorage.getItem(`quiz_${quizData?.exam_title}_state`);
    if (saved) {
      const state = JSON.parse(saved);
      return state.showResults;
    }
    return false;
  });
  
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(`quiz_${quizData?.exam_title}_state`);
    if (saved) {
      const state = JSON.parse(saved);
      return state.score;
    }
    return 0;
  });
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 儲存狀態到 localStorage
  const saveQuizState = () => {
    if (!quizData?.exam_title) return;
    
    const quizState = {
      currentIndex: currentQuestionIndex,
      answers: userAnswers,
      showResults: showResults,
      score: score,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem(`quiz_${quizData.exam_title}_state`, JSON.stringify(quizState));
    localStorage.setItem('current_quiz_title', quizData.exam_title);
  };

  // 清除 quiz 狀態
  const clearQuizState = () => {
    if (!quizData?.exam_title) return;
    
    localStorage.removeItem(`quiz_${quizData.exam_title}_state`);
    if (localStorage.getItem('current_quiz_title') === quizData.exam_title) {
      localStorage.removeItem('current_quiz_title');
    }
  };

  // 處理離開考試
  const handleExit = () => {
    setShowExitPrompt(true);
  };

  // 確認離開並儲存
  const handleConfirmExitWithSave = () => {
    saveQuizState();
    setShowExitPrompt(false);
    onBack();
  };

  // 確認離開但不儲存
  const handleConfirmExitWithoutSave = () => {
    clearQuizState();
    setShowExitPrompt(false);
    onBack();
  };

  // 取消離開
  const handleCancelExit = () => {
    setShowExitPrompt(false);
  };

  // 當狀態改變時自動儲存
  useEffect(() => {
    if (showResults) {
      saveQuizState();
    }
  }, [currentQuestionIndex, userAnswers, showResults, score]);

  // 載入已存在的進度
  useEffect(() => {
    if (!quizData?.exam_title) return;
    
    try {
      const savedState = localStorage.getItem(`quiz_${quizData.exam_title}_state`);
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentQuestionIndex(state.currentIndex);
        setUserAnswers(state.answers);
        setShowResults(state.showResults);
        setScore(state.score);

        // 如果有已儲存的答案，顯示答案狀態
        const savedAnswer = state.answers[state.currentIndex];
        if (savedAnswer) {
          setShowAnswer(true);
          const currentQuestion = quizData.questions[state.currentIndex];
          let correct = false;
          if (Array.isArray(currentQuestion.correct_answer)) {
            correct = arraysEqual(savedAnswer.sort(), currentQuestion.correct_answer.sort());
          } else {
            correct = savedAnswer[0] === currentQuestion.correct_answer;
          }
          setIsAnswerCorrect(correct);
        }
      } else {
        // 如果是新的測驗，重置所有狀態
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
        setShowAnswer(false);
        setIsAnswerCorrect(null);
      }
    } catch (error) {
      console.error('Error loading quiz state:', error);
      // 如果載入出錯，重置狀態
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setScore(0);
      setShowAnswer(false);
      setIsAnswerCorrect(null);
    }
  }, [quizData?.exam_title]);

  // 儲存測驗歷史
  const saveQuizHistory = (quizResult) => {
    const newHistory = [
      {
        date: new Date().toLocaleString(),
        exam_title: quizData.exam_title,
        score: quizResult.score,
        total_questions: quizData.questions.length,
        language: quizData.language,
        source: quizData.source
      },
      ...quizHistory
    ];
    setQuizHistory(newHistory);
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
  };

  // 當完成測驗時儲存歷史
  useEffect(() => {
    if (showResults) {
      saveQuizHistory({
        score: score
      });
    }
  }, [showResults]);

  const handleAnswer = (selectedOptions) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: selectedOptions
    });
    setShowAnswer(false);
    setIsAnswerCorrect(null);
  };

  const checkAnswer = () => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex] || [];
    
    let correct = false;
    if (Array.isArray(currentQuestion.correct_answer)) {
      correct = arraysEqual(userAnswer.sort(), currentQuestion.correct_answer.sort());
    } else {
      correct = userAnswer[0] === currentQuestion.correct_answer;
    }
    
    setIsAnswerCorrect(correct);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (!showAnswer) {
      checkAnswer();
    } else {
      if (currentQuestionIndex < quizData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowAnswer(false);
        setIsAnswerCorrect(null);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Load previous answer state
      const previousAnswer = userAnswers[currentQuestionIndex - 1];
      if (previousAnswer) {
        setShowAnswer(true);
        const currentQuestion = quizData.questions[currentQuestionIndex - 1];
        let correct = false;
        if (Array.isArray(currentQuestion.correct_answer)) {
          correct = arraysEqual(previousAnswer.sort(), currentQuestion.correct_answer.sort());
        } else {
          correct = previousAnswer[0] === currentQuestion.correct_answer;
        }
        setIsAnswerCorrect(correct);
      } else {
        setShowAnswer(false);
        setIsAnswerCorrect(null);
      }
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index] || [];
      if (Array.isArray(question.correct_answer)) {
        if (arraysEqual(userAnswer.sort(), question.correct_answer.sort())) {
          correctCount++;
        }
      } else {
        if (userAnswer[0] === question.correct_answer) {
          correctCount++;
        }
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  if (!quizData || !quizData.questions) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography level="h3">載入題目中...</Typography>
        </Box>
      </Container>
    );
  }

  if (showResults) {
    return (
      <Container maxWidth="lg">
        <Sheet
          variant="outlined"
          sx={{
            width: '100%',
            mx: 'auto',
            my: 4,
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 'sm',
            bgcolor: 'background.surface',
          }}
        >
          <Button 
            variant="outlined" 
            color="neutral" 
            onClick={handleConfirmExitWithoutSave}
            sx={{ alignSelf: 'flex-start' }}
            startDecorator="←"
          >
            返回書櫃
          </Button>
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography level="h2" component="h1">
              測驗完成！
            </Typography>
            <Typography level="h4" sx={{ mt: 2, mb: 4 }}>
              你的分數：{score} / {quizData.questions.length}
            </Typography>
            <LinearProgress
              determinate
              value={(score / quizData.questions.length) * 100}
              sx={{ my: 2 }}
            />
            <Typography level="body1" sx={{ mt: 2 }}>
              正確率：{((score / quizData.questions.length) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Sheet>
      </Container>
    );
  }

  return (
    <CssVarsProvider defaultMode="system" disableTransitionOnChange>
      <Container maxWidth="lg">
        <Modal open={showExitPrompt} onClose={handleCancelExit}>
          <ModalDialog
            variant="outlined"
            role="alertdialog"
            aria-labelledby="exit-modal-title"
            aria-describedby="exit-modal-description"
            sx={{
              maxWidth: '90%',
              width: {
                xs: '90%',
                sm: '400px'
              }
            }}
          >
            <ModalClose 
              variant="plain" 
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.surface'
              }} 
            />
            <Typography id="exit-modal-title" level="h2" fontSize="xl">
              確定要離開測驗嗎？
            </Typography>
            <Typography id="exit-modal-description" textColor="text.tertiary">
              你可以選擇儲存進度以便稍後繼續，或不儲存直接離開。
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1} 
              sx={{ mt: 2 }}
              justifyContent="flex-end"
            >
              <Button variant="solid" color="primary" onClick={handleConfirmExitWithSave}>
                儲存並離開
              </Button>
              <Button variant="soft" color="danger" onClick={handleConfirmExitWithoutSave}>
                刪除並離開
              </Button>
              <Button variant="outlined" color="neutral" onClick={handleCancelExit}>
                取消
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

        <Modal open={showHistory} onClose={() => setShowHistory(false)}>
          <ModalDialog
            aria-labelledby="history-modal-title"
            aria-describedby="history-modal-description"
            sx={{ maxWidth: 500 }}
          >
            <ModalClose />
            <Typography id="history-modal-title" component="h2" level="h4" mb={2}>
              測驗歷史紀錄
            </Typography>
            <Sheet sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>測驗名稱</th>
                    <th>語言</th>
                    <th>分數</th>
                    <th>來源</th>
                  </tr>
                </thead>
                <tbody>
                  {quizHistory.map((history, index) => (
                    <tr key={index}>
                      <td>{history.date}</td>
                      <td>{history.exam_title}</td>
                      <td>{history.language}</td>
                      <td>{Math.round((history.score / history.total_questions) * 100)}%</td>
                      <td>{history.source}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          </ModalDialog>
        </Modal>

        <Sheet
          variant="outlined"
          sx={{
            width: '100%',
            mx: 'auto',
            my: 4,
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 'sm',
            bgcolor: 'background.surface',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleExit}
            >
              返回
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setShowHistory(true)}
              startDecorator={<HistoryIcon />}
            >
              歷史紀錄
            </Button>
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography level="h2" component="h1">
              {quizData.exam_title}
            </Typography>
            <Typography level="body1" sx={{ mt: 1 }}>
              題目 {currentQuestionIndex + 1} / {quizData.questions.length}
            </Typography>
            <LinearProgress
              determinate
              value={(currentQuestionIndex + 1) / quizData.questions.length * 100}
              sx={{ mt: 2 }}
            />
          </Box>

          <QuestionCard
            question={quizData.questions[currentQuestionIndex]}
            userAnswer={userAnswers[currentQuestionIndex] || []}
            onAnswer={handleAnswer}
            showAnswer={showAnswer}
            isCorrect={isAnswerCorrect}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              上一題
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleNext}
            >
              {!showAnswer ? '檢查答案' : 
                currentQuestionIndex === quizData.questions.length - 1 ? '完成測驗' : '下一題'}
            </Button>
          </Box>
        </Sheet>
      </Container>
    </CssVarsProvider>
  );
};

const QuestionCard = ({ question, userAnswer, onAnswer, showAnswer, isCorrect }) => {
  const handleOptionClick = (optionKey) => {
    if (showAnswer) return;
    
    let newAnswer;
    if (question.type === 'multiple_choice') {
      if (userAnswer.includes(optionKey)) {
        newAnswer = userAnswer.filter(key => key !== optionKey);
      } else {
        newAnswer = [...userAnswer, optionKey];
      }
    } else if (question.type === 'ordered_list') {
      // 如果選項已經在答案中，不做任何操作
      if (userAnswer.includes(optionKey)) {
        return;
      }
      // 添加新選項到排序列表
      newAnswer = [...userAnswer, optionKey];
    } else {
      newAnswer = [optionKey];
    }
    onAnswer(newAnswer);
  };

  const handleMoveOption = (index, direction) => {
    if (showAnswer) return;
    
    const newAnswer = [...userAnswer];
    if (direction === 'up' && index > 0) {
      [newAnswer[index], newAnswer[index - 1]] = [newAnswer[index - 1], newAnswer[index]];
    } else if (direction === 'down' && index < newAnswer.length - 1) {
      [newAnswer[index], newAnswer[index + 1]] = [newAnswer[index + 1], newAnswer[index]];
    }
    onAnswer(newAnswer);
  };

  const handleRemoveOption = (optionKey) => {
    if (showAnswer) return;
    
    const newAnswer = userAnswer.filter(key => key !== optionKey);
    onAnswer(newAnswer);
  };

  const getOptionColor = (optionKey) => {
    if (!showAnswer) {
      return userAnswer.includes(optionKey) ? 'primary' : 'neutral';
    }
    
    if (question.type === 'ordered_list') {
      const userIndex = userAnswer.indexOf(optionKey);
      const correctIndex = question.correct_answer.indexOf(optionKey);
      if (userIndex === correctIndex) {
        return 'success';
      }
      return userAnswer.includes(optionKey) ? 'danger' : 'neutral';
    } else if (Array.isArray(question.correct_answer)) {
      if (question.correct_answer.includes(optionKey)) {
        return 'success';
      }
      return userAnswer.includes(optionKey) ? 'danger' : 'neutral';
    } else {
      if (optionKey === question.correct_answer) {
        return 'success';
      }
      return userAnswer.includes(optionKey) ? 'danger' : 'neutral';
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>
        <ReactMarkdown components={{
          code({ node, inline, className, children, ...props }) {
            return (
              <code
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  padding: inline ? '0.2em 0.4em' : '1em',
                  borderRadius: '4px',
                  display: inline ? 'inline' : 'block',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                }}
                {...props}
              >
                {children}
              </code>
            )
          }
        }}>
          {question.question}
        </ReactMarkdown>
      </Typography>
      
      {question.type === 'ordered_list' ? (
        <Box sx={{ mb: 2 }}>
          {/* 已選擇的選項（排序列表） */}
          {userAnswer.length > 0 && (
            <List
              variant="outlined"
              sx={{ 
                mb: 2,
                borderRadius: 'sm',
                '--ListItem-paddingY': '0.75rem',
              }}
            >
              {userAnswer.map((key, index) => (
                <ListItem
                  key={key}
                  sx={{
                    bgcolor: showAnswer ? 
                      (getOptionColor(key) === 'success' ? 'success.softBg' : 'danger.softBg') 
                      : 'background.surface'
                  }}
                >
                  <ListItemDecorator>
                    <Typography level="body2" sx={{ fontWeight: 'bold', minWidth: '2rem' }}>
                      {index + 1}.
                    </Typography>
                  </ListItemDecorator>
                  <Typography sx={{ flex: 1 }}>
                    {question.options[key]}
                  </Typography>
                  {!showAnswer && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        disabled={index === 0}
                        onClick={() => handleMoveOption(index, 'up')}
                      >
                        <KeyboardArrowUpIcon />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        disabled={index === userAnswer.length - 1}
                        onClick={() => handleMoveOption(index, 'down')}
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="soft"
                        color="danger"
                        onClick={() => handleRemoveOption(key)}
                      >
                        <CancelRoundedIcon />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          )}

          {/* 未選擇的選項 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(question.options)
              .filter(([key]) => !userAnswer.includes(key))
              .map(([key, value]) => (
                <Button
                  key={key}
                  variant="soft"
                  color="neutral"
                  onClick={() => handleOptionClick(key)}
                  startDecorator={<DragIndicatorIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                  }}
                >
                  {value}
                </Button>
              ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(question.options).map(([key, value]) => (
            <Button
              key={key}
              variant={userAnswer.includes(key) ? "solid" : "soft"}
              color={getOptionColor(key)}
              onClick={() => handleOptionClick(key)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
              }}
            >
              <Typography component="span" sx={{ mr: 1, fontWeight: 'bold' }}>
                {key}.
              </Typography>
              <Box sx={{ flex: 1 }}>
                <ReactMarkdown components={{
                  code({ node, inline, className, children, ...props }) {
                    return (
                      <code
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          padding: inline ? '0.2em 0.4em' : '1em',
                          borderRadius: '4px',
                          display: inline ? 'inline' : 'block',
                          whiteSpace: 'pre-wrap',
                          overflowX: 'auto',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                }}>
                  {value}
                </ReactMarkdown>
              </Box>
            </Button>
          ))}
        </Box>
      )}

      {question.type === 'multiple_choice' && (
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          sx={{ mt: 2 }}
        >
          多選題
        </Chip>
      )}

      {question.type === 'ordered_list' && (
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          sx={{ mt: 2 }}
        >
          排序題
        </Chip>
      )}

      {showAnswer && (
        <Alert
          variant="soft"
          color={isCorrect ? 'success' : 'danger'}
          sx={{ mt: 2 }}
          startDecorator={isCorrect ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
        >
          <Box>
            <Typography level="body2" sx={{ mb: 1 }}>
              <strong>正確答案：</strong>
              {question.type === 'ordered_list' ? (
                <Box component="span" sx={{ display: 'block', mt: 1 }}>
                  {question.correct_answer.map((key, index) => (
                    <Typography key={key} level="body2">
                      {index + 1}. {question.options[key]}
                    </Typography>
                  ))}
                </Box>
              ) : (
                Array.isArray(question.correct_answer) 
                  ? question.correct_answer.join(', ')
                  : question.correct_answer
              )}
            </Typography>
            {question.explanation && (
              <Typography level="body2">
                <strong>解釋：</strong> <ReactMarkdown components={{
                  code({ node, inline, className, children, ...props }) {
                    return (
                      <code
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          padding: inline ? '0.2em 0.4em' : '1em',
                          borderRadius: '4px',
                          display: inline ? 'inline' : 'block',
                          whiteSpace: 'pre-wrap',
                          overflowX: 'auto',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                }}>
                  {question.explanation}
                </ReactMarkdown>
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Card>
  );
};

export default Quiz;
