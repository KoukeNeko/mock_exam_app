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

const Bookshelf = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [quizToStart, setQuizToStart] = useState(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const modules = import.meta.glob('../data/*/*/*questions.json');
        const quizData = [];
        
        for (const path in modules) {
          const module = await modules[path]();
          const pathParts = path.split('/');
          const publisher = pathParts[pathParts.length - 3];
          const exam = pathParts[pathParts.length - 2];
          const fileName = pathParts[pathParts.length - 1];
          const id = fileName.replace('questions.json', '');
          
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
            publisher: publisher.toUpperCase(),
            exam
          });
        }
        
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

  const exams = ['all', ...new Set(quizzes.map(quiz => quiz.exam))];
  const publishers = ['all', ...new Set(quizzes.map(quiz => quiz.publisher))];

  const filteredQuizzes = quizzes.filter(quiz => {
    const examMatch = selectedExam === 'all' || quiz.exam === selectedExam;
    const publisherMatch = selectedPublisher === 'all' || quiz.publisher === selectedPublisher;
    
    // 如果選擇了特定發布者，只顯示該發布者的考試
    if (selectedPublisher !== 'all') {
      return quiz.publisher === selectedPublisher && examMatch;
    }
    
    // 如果選擇了 'all'，顯示所有考試
    return examMatch && publisherMatch;
  });

  const getQuizProgress = (quiz) => {
    const savedIndex = localStorage.getItem(`quiz_${quiz.exam_title}_currentIndex`);
    const savedAnswers = localStorage.getItem(`quiz_${quiz.exam_title}_answers`);
    const showResults = localStorage.getItem(`quiz_${quiz.exam_title}_showResults`);
    
    if (!savedIndex || !savedAnswers) return null;
    
    const answers = JSON.parse(savedAnswers);
    const currentIndex = parseInt(savedIndex);
    const totalAnswered = Object.keys(answers).length;
    
    return {
      currentQuestion: currentIndex + 1,
      totalAnswered,
      completed: showResults === 'true',
      progress: Math.round((totalAnswered / quiz.total_questions) * 100)
    };
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
    const progress = getQuizProgress(quiz);
    
    if (progress && progress.totalAnswered > 0) {
      setQuizToStart(quiz);
      setShowStartPrompt(true);
    } else {
      onQuizSelect(quiz.id);
    }
  };

  // 繼續作答
  const handleContinueQuiz = () => {
    setShowStartPrompt(false);
    onQuizSelect(quizToStart.id);
  };

  // 重新開始
  const handleRestartQuiz = () => {
    // 清除進度
    localStorage.removeItem(`quiz_${quizToStart.exam_title}_currentIndex`);
    localStorage.removeItem(`quiz_${quizToStart.exam_title}_answers`);
    localStorage.removeItem(`quiz_${quizToStart.exam_title}_showResults`);
    localStorage.removeItem(`quiz_${quizToStart.exam_title}_score`);
    
    setShowStartPrompt(false);
    onQuizSelect(quizToStart.id);
  };

  return (
    <CssVarsProvider>
      <Container maxWidth="lg">
        <Sheet
          sx={{
            width: '100%',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography level="h2" component="h1" sx={{ textAlign: 'center' }}>
            選擇測驗
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Select
              value={selectedPublisher}
              onChange={(_, value) => setSelectedPublisher(value || 'all')}
              sx={{ minWidth: 200 }}
            >
              {publishers.map((publisher) => (
                <Option key={publisher} value={publisher}>
                  {publisher === 'all' ? '所有發布者' : publisher}
                </Option>
              ))}
            </Select>
            <Select
              value={selectedExam}
              onChange={(_, value) => setSelectedExam(value || 'all')}
              sx={{ minWidth: 200 }}
            >
              {exams.map((exam) => (
                <Option key={exam} value={exam}>
                  {exam === 'all' ? '所有考試' : exam}
                </Option>
              ))}
            </Select>
          </Box>

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
                      <Typography level="h2" fontSize="lg" mb={1}>
                        {quiz.exam_title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Chip
                          variant="soft"
                          color="primary"
                          size="sm"
                          startDecorator={<BookmarkIcon />}
                        >
                          {quiz.total_questions} 題
                        </Chip>
                        <Tooltip title={quiz.language} placement="top">
                          <Chip
                            variant="soft"
                            color="neutral"
                            size="sm"
                            startDecorator={<LanguageIcon />}
                          >
                            {quiz.language}
                          </Chip>
                        </Tooltip>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />
                      
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
                onClick={handleContinueQuiz}
              >
                繼續作答
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<RestartAltIcon />}
                onClick={handleRestartQuiz}
              >
                重新開始
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </Container>
    </CssVarsProvider>
  );
};

export default Bookshelf;
