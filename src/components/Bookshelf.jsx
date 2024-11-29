import React, { useState, useEffect } from 'react';
import { 
  CssVarsProvider, 
  useColorScheme,
  Sheet,
  Typography,
  Select,
  Option,
  Card,
  AspectRatio,
  Box,
  Chip,
  Grid,
  Container,
  Tooltip,
  Badge,
  Divider,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  List,
  ListItem,
  ListItemContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  Input,
  FormHelperText
} from '@mui/joy';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LanguageIcon from '@mui/icons-material/Language';
import PreviewIcon from '@mui/icons-material/Preview';
import QuizIcon from '@mui/icons-material/Quiz';
import SourceIcon from '@mui/icons-material/Source';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ReactMarkdown from 'react-markdown';

const Bookshelf = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [quizToStart, setQuizToStart] = useState(null);
  const [questionCount, setQuestionCount] = useState('all');
  const [showQuestionCountPrompt, setShowQuestionCountPrompt] = useState(false);
  const [showStorageConsent, setShowStorageConsent] = useState(() => {
    return !localStorage.getItem('storage_consent');
  });
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quiz_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [customCount, setCustomCount] = useState('');
  const [customError, setCustomError] = useState('');

  const handleStorageConsent = () => {
    localStorage.setItem('storage_consent', 'true');
    setShowStorageConsent(false);
  };

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        console.log('Starting to load quizzes...');
        // 使用更寬鬆的 glob 模式
        const modules = import.meta.glob(['../data/**/*.json'], { eager: true });
        const quizData = [];
        
        console.log('Available module paths:', Object.keys(modules));
        
        for (const path in modules) {
          const module = modules[path];
          console.log('Processing module path:', path);
          console.log('Module content:', module);
          
          const pathParts = path.split('/');
          const publisher = pathParts[pathParts.length - 3];
          const exam = pathParts[pathParts.length - 2];
          const fileName = pathParts[pathParts.length - 1];
          const id = fileName.replace(/questions\.json|test\.json/, '');
          
          let emoji = '📚';
          if (module.total_questions >= 80) {
            emoji = '📝';
          } else if (module.total_questions >= 60) {
            emoji = '📖';
          }

          quizData.push({
            ...module,
            id,
            emoji,
            publisher,
            exam
          });
        }
        
        console.log('Final quiz data:', quizData);
        setQuizzes(quizData);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      }
    };

    loadQuizzes();
  }, []);

  const handleImageError = (quizId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [quizId]: true
    }));
  };

  // 獲取所有發布者
  const publishers = ['all', ...new Set(quizzes.map(quiz => quiz.publisher))];
  
  // 根據選擇的發布者過濾考試選項
  const exams = ['all', ...new Set(quizzes
    .filter(quiz => selectedPublisher === 'all' || quiz.publisher === selectedPublisher)
    .map(quiz => quiz.exam))];

  const filteredQuizzes = quizzes.filter(quiz => {
    // 如果選擇了特定發布者，只顯示該發布者的考試
    if (selectedPublisher !== 'all') {
      return quiz.publisher === selectedPublisher;
    }
    
    // 如果選擇了特定考試，只顯示該考試
    if (selectedExam !== 'all') {
      return quiz.exam === selectedExam;
    }
    
    // 如果都選擇 'all'，顯示所有考試
    return true;
  });

  const getQuizProgress = (quiz) => {
    const savedState = localStorage.getItem(`quiz_${quiz.exam_title}_state`);
    
    if (!savedState) return null;
    
    try {
      const state = JSON.parse(savedState);
      const totalAnswered = Object.keys(state.answers).length;
      
      return {
        currentQuestion: state.currentIndex + 1,
        totalAnswered,
        completed: state.showResults,
        progress: Math.round((totalAnswered / quiz.total_questions) * 100)
      };
    } catch (error) {
      console.error('Error parsing quiz progress:', error);
      return null;
    }
  };

  // 瀏覽題目
  const handleBrowseQuestions = (quiz, event) => {
    event.stopPropagation();
    setSelectedQuiz(quiz);
    setShowQuestions(true);
  };

  // 開始作答
  const handleStartQuiz = (quiz, event) => {
    event.stopPropagation();
    console.log('Starting quiz:', quiz);
    
    const progress = getQuizProgress(quiz);
    
    if (progress && progress.totalAnswered > 0) {
      setQuizToStart(quiz);
      setShowStartPrompt(true);
    } else {
      setQuizToStart(quiz);
      setShowQuestionCountPrompt(true);
    }
  };

  // 繼續作答
  const handleContinue = () => {
    console.log('Continuing quiz:', quizToStart);
    setShowStartPrompt(false);
    onQuizSelect(quizToStart);
  };

  // 重新開始
  const handleRestart = () => {
    console.log('Restarting quiz:', quizToStart);
    // 清除進度
    localStorage.removeItem(`quiz_${quizToStart.exam_title}_state`);
    if (localStorage.getItem('current_quiz_title') === quizToStart.exam_title) {
      localStorage.removeItem('current_quiz_title');
    }
    
    setShowStartPrompt(false);
    onQuizSelect(quizToStart);
  };

  const handleQuestionCountSubmit = (count) => {
    setQuestionCount(count);
    setShowQuestionCountPrompt(false);
    
    let processedQuiz = { ...quizToStart };
    
    if (count !== 'all' && count < processedQuiz.questions.length) {
      // Shuffle questions and take the specified count
      const shuffled = [...processedQuiz.questions].sort(() => Math.random() - 0.5);
      processedQuiz = {
        ...processedQuiz,
        questions: shuffled.slice(0, count),
        total_questions: count
      };
    }
    
    setSelectedQuiz(processedQuiz);
    setShowQuestions(true);
    onQuizSelect(processedQuiz);
  };

  const handleCustomCountSubmit = () => {
    const count = parseInt(customCount);
    if (isNaN(count) || count < 1 || count > quizToStart?.questions.length) {
      setCustomError(`請輸入1到${quizToStart?.questions.length}之間的數字`);
      return;
    }
    setCustomError('');
    handleQuestionCountSubmit(count);
  };

  const inferQuestionType = (question) => {
    // 推斷題型
    let questionType = question.type;
    if (!questionType) {
      if (Array.isArray(question.correct_answer)) {
        if (question.correct_answer.length > 1) {
          questionType = 'multiple_choice';
        } else {
          questionType = 'single_choice';
        }
      }
    }
    return questionType;
  };

  return (
    <CssVarsProvider defaultMode="system" disableTransitionOnChange>
      <Container maxWidth="lg" sx={{ background: 'transparent' }}>
        {showStorageConsent && (
          <Sheet
            variant="soft"
            color="neutral"
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              zIndex: 1000,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'sm',
              borderTopLeftRadius: 'sm',
              borderTopRightRadius: 'sm',
            }}
          >
            <Typography level="body-sm">
              本網站使用本機儲存空間（Local Storage）來儲存您的測驗進度和答案。繼續使用表示您同意此做法。
            </Typography>
            <Button
              size="sm"
              variant="solid"
              color="primary"
              onClick={handleStorageConsent}
            >
              我明白了
            </Button>
          </Sheet>
        )}
        <Sheet
          sx={{
            width: '100%',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            background: 'transparent'
          }}
        >
          <Typography level="h2" component="h1" sx={{ textAlign: 'center' }}>
            選擇測驗
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid xs={12} sm={4}>
              <Select
                value={selectedPublisher}
                onChange={(_, value) => setSelectedPublisher(value)}
                sx={{ width: '100%' }}
              >
                {publishers.map((publisher) => (
                  <Option key={publisher} value={publisher}>
                    {publisher === 'all' ? '全部發布者' : publisher}
                  </Option>
                ))}
              </Select>
            </Grid>
            <Grid xs={12} sm={4}>
              <Select
                value={selectedExam}
                onChange={(_, value) => setSelectedExam(value)}
                sx={{ width: '100%' }}
              >
                {exams.map((exam) => (
                  <Option key={exam} value={exam}>
                    {exam === 'all' ? '全部考試' : exam}
                  </Option>
                ))}
              </Select>
            </Grid>
            
            <Grid xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setShowHistory(true)}
                startDecorator={<HistoryIcon />}
              >
                歷史紀錄
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {filteredQuizzes.map((quiz) => {
              const progress = getQuizProgress(quiz);
              return (
                <Grid key={quiz.id} xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 'lg',
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    {progress && (
                      <Tooltip
                        title={
                          progress.completed 
                            ? "已完成測驗" 
                            : `進度：${progress.progress}% (${progress.totalAnswered}/${quiz.total_questions}題)`
                        }
                        placement="top"
                      >
                        <Badge
                          size="md"
                          color={progress.completed ? "success" : "primary"}
                          variant="solid"
                          badgeContent={progress.completed ? "✓" : `${progress.progress}%`}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          }}
                        />
                      </Tooltip>
                    )}
                    <AspectRatio ratio="2">
                      <Box
                        sx={{
                          background: '#1B1B1B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                        }}
                      >
                        {quiz.logo_url && !imageLoadErrors[quiz.id] ? (
                          <img
                            src={quiz.logo_url}
                            alt={quiz.exam_title}
                            style={{
                              maxWidth: '60%',
                              maxHeight: '60%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <Typography level="h1" sx={{ fontSize: '3rem' }}>
                            {quiz.emoji}
                          </Typography>
                        )}
                      </Box>
                    </AspectRatio>
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography 
                          level="h2" 
                          fontSize="sm"
                          sx={{
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.5em',
                            lineHeight: '1.25em'
                          }}
                        >
                          {quiz.exam_title}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <Chip
                            variant="soft"
                            size="sm"
                            startDecorator={<LanguageIcon sx={{ fontSize: 16 }} />}
                            sx={{ 
                              maxWidth: '100%',
                              '& .MuiChip-startDecorator': { 
                                fontSize: '14px',
                                margin: 0
                              }
                            }}
                          >
                            <Typography level="body-xs" noWrap>
                              {quiz.language}
                            </Typography>
                          </Chip>
                          <Chip
                            variant="soft"
                            size="sm"
                            startDecorator={<SourceIcon sx={{ fontSize: 16 }} />}
                            sx={{ 
                              maxWidth: '100%',
                              '& .MuiChip-startDecorator': { 
                                fontSize: '14px',
                                margin: 0
                              }
                            }}
                          >
                            <Typography level="body-xs" noWrap>
                              {quiz.source}
                            </Typography>
                          </Chip>
                          <Chip
                            variant="soft"
                            color="primary"
                            size="sm"
                            startDecorator={<BookmarkIcon sx={{ fontSize: 16 }} />}
                          >
                            {quiz.total_questions} 題
                          </Chip>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        justifyContent: 'space-between'
                      }}>
                        <Button
                          variant="plain"
                          color="neutral"
                          startDecorator={<PreviewIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => handleBrowseQuestions(quiz, e)}
                          sx={{ 
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          瀏覽
                        </Button>
                        <Button
                          variant="solid"
                          color="primary"
                          startDecorator={<QuizIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => handleStartQuiz(quiz, e)}
                          sx={{ 
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          作答
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Sheet>

        {/* 瀏覽題目對話框 */}
        <Modal 
          open={showQuestions} 
          onClose={() => setShowQuestions(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw'
          }}
        >
          <Box sx={{ 
            position: 'relative',
            width: {
              xs: '95%',  // 手機版
              sm: '80%',  // 平板
              md: '70%',  // 桌面
              lg: '60%'   // 大螢幕
            },
            height: '95vh',
          }}>
            <ModalClose 
              variant="plain" 
              sx={{ 
                position: 'absolute',
                top: {
                  xs: 8,    // 手機版時在內部
                  sm: -20   // 平板以上在外部
                },
                right: {
                  xs: 8,
                  sm: -20
                },
                bgcolor: 'background.surface',
                zIndex: 1,
              }} 
            />
            
            <Sheet
              variant="outlined"
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                p: 3,
                borderRadius: 'md',
                boxShadow: 'lg',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                overflow: 'auto',
                height: '100%',
              }}>
                <Typography level="h3" fontSize="xl">
                  {selectedQuiz?.exam_title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    variant="soft"
                    size="sm"
                    color="primary"
                    startDecorator={<BookmarkIcon sx={{ fontSize: 16 }} />}
                  >
                    {selectedQuiz?.total_questions} 題
                  </Chip>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={<LanguageIcon sx={{ fontSize: 16 }} />}
                  >
                    {selectedQuiz?.language}
                  </Chip>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={<SourceIcon sx={{ fontSize: 16 }} />}
                  >
                    {selectedQuiz?.source}
                  </Chip>
                </Box>

                <Divider />

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  overflow: 'auto',
                }}>
                  {selectedQuiz?.questions.map((question, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 3,
                        bgcolor: 'background.level1',
                        borderColor: 'neutral.700',
                        mb: 2,
                        width: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Typography 
                          level="body1" 
                          sx={{ 
                            fontWeight: 'bold', 
                            minWidth: '30px', 
                            color: 'text.primary',
                            pt: '2px'
                          }}
                        >
                          {index + 1}.
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {/* 題型標籤 */}
                          <Box sx={{ mb: 1.5 }}>
                            <Chip
                              size="sm"
                              variant="soft"
                              color="neutral"
                              sx={{ bgcolor: 'neutral.700' }}
                            >
                              {(() => {
                                const type = inferQuestionType(question);
                                switch(type) {
                                  case 'single_choice':
                                    return '單選題';
                                  case 'multiple_choice':
                                    return '多選題';
                                  case 'ordered_list':
                                    return '排序題';
                                  default:
                                    return '未知題型';
                                }
                              })()}
                            </Chip>
                          </Box>

                          {/* 題目內容 */}
                          <Typography 
                            level="body1" 
                            sx={{ 
                              color: 'text.primary',
                              mb: 2,
                              lineHeight: 1.6
                            }}
                          >
                            <ReactMarkdown components={{
                              code({ node, inline, className, children, ...props }) {
                                return (
                                  <code
                                    style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                      padding: inline ? '0.2em 0.4em' : '1em',
                                      borderRadius: '4px',
                                      display: inline ? 'inline' : 'block',
                                      whiteSpace: 'pre-wrap',
                                      overflowX: 'auto',
                                      maxWidth: '100%',
                                      color: 'inherit'
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
                        </Box>
                      </Box>

                      <Divider sx={{ bgcolor: 'neutral.700' }} />

                      <Box sx={{ pl: 4 }}>
                        {(() => {
                          const questionType = inferQuestionType(question);
                          const correctAnswers = Array.isArray(question.correct_answer) 
                            ? question.correct_answer 
                            : [question.correct_answer];

                          if (questionType === 'ordered_list') {
                            return (
                              <List>
                                {Object.entries(question.options).map(([key, value], index) => {
                                  const correctIndex = question.correct_answer.indexOf(key);
                                  return (
                                    <ListItem 
                                      key={key}
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 'sm',
                                        mb: 1,
                                        p: 1
                                      }}
                                    >
                                      <Typography 
                                        level="body2" 
                                        sx={{ 
                                          color: 'success.main',
                                          minWidth: '24px',
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        {correctIndex + 1}
                                      </Typography>
                                      <Typography 
                                        level="body2" 
                                        sx={{ 
                                          color: 'text.primary',
                                          flex: 1
                                        }}
                                      >
                                        {value}
                                      </Typography>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            );
                          }

                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {Object.entries(question.options).map(([key, value]) => {
                                const isCorrect = correctAnswers.includes(key);
                                return (
                                  <Box 
                                    key={key} 
                                    sx={{ 
                                      display: 'flex', 
                                      gap: 1, 
                                      alignItems: 'flex-start',
                                      bgcolor: isCorrect ? 'rgba(102, 187, 106, 0.1)' : 'transparent',
                                      p: 1,
                                      borderRadius: 'sm'
                                    }}
                                  >
                                    <Typography level="body2" sx={{ fontWeight: 'bold', minWidth: '20px', color: 'text.primary' }}>
                                      {key}.
                                    </Typography>
                                    <Typography 
                                      level="body2"
                                      sx={{
                                        flex: 1,
                                        color: 'text.primary',
                                        '& code': {
                                          maxWidth: '100%',
                                          overflowX: 'auto',
                                          display: 'inline-block',
                                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                          color: 'inherit'
                                        }
                                      }}
                                    >
                                      <ReactMarkdown components={{
                                        code({ node, inline, className, children, ...props }) {
                                          return (
                                            <code
                                              style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                padding: inline ? '0.2em 0.4em' : '1em',
                                                borderRadius: '4px',
                                                display: inline ? 'inline' : 'block',
                                                whiteSpace: 'pre-wrap',
                                                overflowX: 'auto',
                                                maxWidth: '100%',
                                                color: 'inherit'
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
                                    </Typography>
                                    {isCorrect && (
                                      <CheckCircleRoundedIcon 
                                        sx={{ 
                                          color: 'success.main',
                                          fontSize: 20,
                                          flexShrink: 0
                                        }} 
                                      />
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          );
                        })()}

                        {/* 顯示解釋 */}
                        {question.explanation && (
                          <Box sx={{ 
                            mt: 2,
                            p: 2,
                            borderRadius: 'sm',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: 'text.secondary'
                          }}>
                            <Typography level="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                              解釋：{question.explanation}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Sheet>
          </Box>
        </Modal>

        {/* 開始測驗確認對話框 */}
        <Modal
          open={showStartPrompt}
          onClose={() => setShowStartPrompt(false)}
        >
          <ModalDialog
            variant="outlined"
            role="alertdialog"
          >
            <DialogTitle>
              繼續上次進度？
            </DialogTitle>
            <DialogContent>
              <Typography level="body1">
                您有未完成的測驗進度，請選擇：
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="solid"
                color="primary"
                startDecorator={<PlayArrowIcon />}
                onClick={handleContinue}
              >
                繼續作答
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<RestartAltIcon />}
                onClick={handleRestart}
              >
                重新開始
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>

        {/* 選擇題目數量對話框 */}
        {showQuestionCountPrompt && (
          <Modal
            aria-labelledby="question-count-modal-title"
            open={showQuestionCountPrompt}
            onClose={() => setShowQuestionCountPrompt(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sheet
              variant="outlined"
              sx={{
                width: 400,
                borderRadius: 'md',
                p: 3,
                boxShadow: 'lg',
              }}
            >
              <ModalClose />
              <Typography
                component="h2"
                id="question-count-modal-title"
                level="h4"
                textColor="inherit"
                fontWeight="lg"
                mb={1}
              >
                選擇題目數量
              </Typography>
              <Typography id="question-count-modal-desc" textColor="text.tertiary" mb={3}>
                選擇要作答的題目數量，或選擇全部題目
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="solid"
                  color="primary"
                  onClick={() => handleQuestionCountSubmit('all')}
                >
                  全部題目 ({quizToStart?.questions.length}題)
                </Button>
                {[10, 20, 30, 65].map((count) => (
                  count <= quizToStart?.questions.length && (
                    <Button
                      key={count}
                      variant="outlined"
                      color="neutral"
                      onClick={() => handleQuestionCountSubmit(count)}
                    >
                      {count} 題
                    </Button>
                  )
                ))}
                <FormControl error={!!customError}>
                  <Input
                    placeholder="自訂題目數量"
                    value={customCount}
                    onChange={(e) => {
                      setCustomCount(e.target.value);
                      setCustomError('');
                    }}
                    endDecorator={
                      <Button 
                        variant="outlined"
                        color="neutral"
                        onClick={handleCustomCountSubmit}
                      >
                        確認
                      </Button>
                    }
                  />
                  {customError && (
                    <FormHelperText>{customError}</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </Sheet>
          </Modal>
        )}

        {/* 歷史紀錄對話框 */}
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
              {quizHistory.length > 0 ? (
                <List>
                  {quizHistory.map((history, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemContent>
                          <Typography level="title-sm">
                            {history.exam_title}
                          </Typography>
                          <Typography level="body-sm">
                            來源：{history.source}
                          </Typography>
                          <Typography level="body-sm">
                            日期：{history.date}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: 'success.main' }}>
                            分數：{Math.round((history.score / history.total_questions) * 100)}%
                          </Typography>
                        </ListItemContent>
                      </ListItem>
                      {index < quizHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography level="body-sm" sx={{ textAlign: 'center', py: 2 }}>
                  尚無測驗紀錄
                </Typography>
              )}
            </Sheet>
          </ModalDialog>
        </Modal>
      </Container>
    </CssVarsProvider>
  );
};

export default Bookshelf;
