import { useState, useEffect, useRef } from 'react';
import { CssVarsProvider, CssBaseline, useColorScheme, Box, Sheet, Typography, Button, Modal, ModalDialog, ModalClose, Stack, IconButton } from '@mui/joy';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
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

  const modeIcons = {
    light: '☀️',
    dark: '🌙',
    system: '💻'
  };

  return (
    <Select
      value={mode}
      onChange={(event, newMode) => {
        setMode(newMode);
      }}
      variant="outlined"
      size="sm"
      sx={{ 
        minWidth: 'unset',
        '--Select-decoratorChildHeight': '24px',
      }}
    >
      <Option value="system">{modeIcons.system} 系統</Option>
      <Option value="light">{modeIcons.light} 淺色</Option>
      <Option value="dark">{modeIcons.dark} 深色</Option>
    </Select>
  );
}

function NavBar() {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleBackup = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.clear();
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          window.location.reload();
        } catch (error) {
          console.error('Error restoring backup:', error);
          alert('備份檔案格式錯誤');
        }
      };
      reader.readAsText(file);
    }
    setShowBackupModal(false);
  };

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
          fontWeight: 'bold'
        }}
      >
        認證考試模擬
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={handleBackup}
          title="備份進度"
        >
          💾
        </IconButton>
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setShowBackupModal(true)}
          title="恢復進度"
        >
          📥
        </IconButton>
        <ModeToggle />
      </Box>

      <Modal open={showBackupModal} onClose={() => setShowBackupModal(false)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          aria-labelledby="backup-modal-title"
          aria-describedby="backup-modal-description"
        >
          <ModalClose />
          <Typography id="backup-modal-title" level="h2" fontSize="xl">
            恢復備份
          </Typography>
          <Typography id="backup-modal-description" textColor="text.tertiary">
            選擇一個備份檔案來恢復你的進度。注意：這將會覆蓋目前的所有進度！
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="solid"
              color="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              選擇檔案
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setShowBackupModal(false)}
            >
              取消
            </Button>
          </Box>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestore}
            accept=".json"
            style={{ display: 'none' }}
          />
        </ModalDialog>
      </Modal>
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
