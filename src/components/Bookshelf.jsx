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
  DialogActions
} from '@mui/joy';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LanguageIcon from '@mui/icons-material/Language';
import PreviewIcon from '@mui/icons-material/Preview';
import QuizIcon from '@mui/icons-material/Quiz';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';

const Bookshelf = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [quizToStart, setQuizToStart] = useState(null);
  const [showStorageConsent, setShowStorageConsent] = useState(() => {
    return !localStorage.getItem('storage_consent');
  });
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

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
      onQuizSelect(quiz);
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
                      '&:hover': {
                        boxShadow: 'md',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
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
                    <AspectRatio 
                      ratio="2/1" 
                      sx={{ 
                        mb: 1,
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {quiz.logo_url && !imageLoadErrors[quiz.id] ? (
                          <img
                            src={quiz.logo_url}
                            alt={quiz.exam_title}
                            onError={() => handleImageError(quiz.id)}
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
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography level="h2" fontSize="md">
                          {quiz.exam_title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            variant="soft"
                            size="sm"
                            startDecorator={<LanguageIcon />}
                          >
                            {quiz.language}
                          </Chip>
                          <Chip
                            variant="soft"
                            size="sm"
                            startDecorator="📝"
                          >
                            {quiz.source}
                          </Chip>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Chip
                          variant="soft"
                          color="primary"
                          size="sm"
                          startDecorator={<BookmarkIcon />}
                        >
                          {quiz.total_questions} 題
                        </Chip>
                      </Box>

                      <Divider sx={{ my: 3 }} />
                      
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <Button
                          variant="outlined"
                          color="neutral"
                          startDecorator={<PreviewIcon />}
                          onClick={(e) => handleBrowseQuestions(quiz, e)}
                          sx={{ flex: 1 }}
                        >
                          瀏覽題目
                        </Button>
                        <Button
                          variant="solid"
                          color="primary"
                          startDecorator={<QuizIcon />}
                          onClick={(e) => handleStartQuiz(quiz, e)}
                          sx={{ flex: 1 }}
                        >
                          作答測驗
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
        >
          <ModalDialog
            aria-labelledby="questions-modal-title"
            aria-describedby="questions-modal-description"
            sx={{ 
              maxWidth: 800,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <ModalClose />
            <Typography
              id="questions-modal-title"
              component="h2"
              level="h4"
              mb={2}
            >
              {selectedQuiz?.exam_title} - 題目預覽
            </Typography>
            <List>
              {selectedQuiz?.questions.map((question, index) => (
                <ListItem
                  key={index}
                  sx={{
                    backgroundColor: 'background.level1',
                    mb: 1,
                    borderRadius: 'sm',
                    display: 'block',
                    p: 2
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <Typography level="body1" sx={{ fontWeight: 'bold' }}>
                      {index + 1}.
                    </Typography>
                    <Typography level="body1">
                      {question.question}
                    </Typography>
                    {(() => {
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
                      
                      return questionType && (
                        <Chip
                          size="sm"
                          variant="soft"
                          color="neutral"
                        >
                          {questionType === 'multiple_choice' ? '多選題' : 
                           questionType === 'ordered_list' ? '排序題' : '單選題'}
                        </Chip>
                      );
                    })()}
                  </Box>

                  {(() => {
                    // 推斷題型用於顯示選項
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
                    
                    if (questionType === 'ordered_list') {
                      return (
                        <Box sx={{ pl: 3 }}>
                          <Typography level="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            正確排序：
                          </Typography>
                          {question.correct_answer.map((key, index) => (
                            <Box 
                              key={key}
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 0.5,
                                py: 0.5,
                                position: 'relative'
                              }}
                            >
                              <Typography 
                                level="body2"
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: 'success.plainColor',
                                  minWidth: '24px'
                                }}
                              >
                                {index + 1}
                              </Typography>
                              <Typography 
                                level="body2" 
                                sx={{ 
                                  color: 'text.primary'
                                }}
                              >
                                {question.options[key]}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      );
                    } else {
                      return (
                        <Box sx={{ pl: 3 }}>
                          {Object.entries(question.options).map(([key, value]) => (
                            <Typography
                              key={key}
                              level="body2"
                              sx={{
                                color: Array.isArray(question.correct_answer)
                                  ? question.correct_answer.includes(key)
                                    ? 'success.plainColor'
                                    : 'text.secondary'
                                  : question.correct_answer === key
                                  ? 'success.plainColor'
                                  : 'text.secondary'
                              }}
                            >
                              {key}. {value}
                            </Typography>
                          ))}
                        </Box>
                      );
                    }
                  })()}

                  {question.explanation && (
                    <Box sx={{ mt: 1, pl: 3 }}>
                      <Typography
                        level="body2"
                        sx={{
                          color: 'text.secondary',
                          fontStyle: 'italic'
                        }}
                      >
                        解釋：{question.explanation}
                      </Typography>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </ModalDialog>
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
