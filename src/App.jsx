import { useState, useEffect } from 'react';
import { CssVarsProvider, CssBaseline, useColorScheme } from '@mui/joy';
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
      sx={{
        width: 'max-content',
        position: 'absolute',
        right: '20px',
        top: '20px',
        zIndex: 1000
      }}
    >
      <Option value="system">System</Option>
      <Option value="light">Light</Option>
      <Option value="dark">Dark</Option>
    </Select>
  );
}

function App() {
  const [selectedQuizId, setSelectedQuizId] = useState(null)
  const [quizData, setQuizData] = useState(null)

  const handleQuizSelect = async (id) => {
    try {
      // 動態導入選中的測驗文件
      const modules = import.meta.glob('./data/*/*/*questions.json');
      for (const path in modules) {
        if (path.includes(`${id}questions.json`)) {
          const module = await modules[path]();
          setQuizData(module);
          setSelectedQuizId(id);
          break;
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  }

  const handleBack = () => {
    setSelectedQuizId(null)
    setQuizData(null)
  }

  return (
    <CssVarsProvider defaultMode="dark">
      <CssBaseline />
      <div className="app-container">
        <ModeToggle />
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
