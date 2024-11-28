import { useState, useEffect } from 'react';
import { CssVarsProvider, CssBaseline, useColorScheme, Box, Sheet, Typography } from '@mui/joy';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import './App.css'
import Bookshelf from './components/Bookshelf'
import Quiz from './components/Quiz'

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Select
      value={mode}
      onChange={(event, newMode) => {
        setMode(newMode);
      }}
      variant="outlined"
      sx={{ 
        minWidth: 'unset',
        '--Select-decoratorChildHeight': '24px',
      }}
    >
      <Option value="system">系統</Option>
      <Option value="light">淺色</Option>
      <Option value="dark">深色</Option>
    </Select>
  );
}

function NavBar() {
  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: '0px 0px 1px 0px',
        bgcolor: 'background.surface',
      }}
    >
      <Typography
        level="h3"
        sx={{
          // background: 'linear-gradient(45deg, #4dabf7, #4dabf7)',
          // WebkitBackgroundClip: 'text',
          // WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}
      >
        認證考試模擬
      </Typography>
      <ModeToggle />
    </Sheet>
  );
}

function App() {
  const [selectedQuizId, setSelectedQuizId] = useState(null)
  const [quizData, setQuizData] = useState(null)

  const handleQuizSelect = async (quiz) => {
    try {
      console.log('Loading quiz:', quiz);
      
      if (quiz && quiz.questions) {
        console.log('Quiz data loaded:', quiz);
        setQuizData(quiz);
        setSelectedQuizId(quiz.exam_title);
      } else {
        console.error('Invalid quiz data:', quiz);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  };

  const handleBack = () => {
    setSelectedQuizId(null)
    setQuizData(null)
  }

  return (
    <CssVarsProvider defaultMode="dark">
      <CssBaseline />
      <div className="app-container">
        <NavBar />
        {selectedQuizId ? (
          <Quiz quizData={quizData} onBack={handleBack} />
        ) : (
          <Bookshelf onQuizSelect={handleQuizSelect} />
        )}
      </div>
    </CssVarsProvider>
  )
}

export default App
