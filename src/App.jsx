import { useState, useEffect, useRef } from 'react';
import { CssVarsProvider, CssBaseline, useColorScheme, Box, Sheet, Typography, Button, Modal, ModalDialog, ModalClose, Stack, IconButton } from '@mui/joy';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import './App.css'
import './styles/App.css'
import Bookshelf from './components/Bookshelf'
import Quiz from './components/Quiz'
import HistoryModal from './components/HistoryModal'

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

function NavBar({ selectedQuizId, onBack, showHistory, setShowHistory, showBackupModal, setShowBackupModal }) {
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
    a.download = 'quiz-backup.json';
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
          for (const key in data) {
            localStorage.setItem(key, data[key]);
          }
          setShowBackupModal(false);
          window.location.reload();
        } catch (error) {
          console.error('Error restoring backup:', error);
          alert('備份檔案格式錯誤');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Sheet
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 9995,
        p: 2,
        gap: 1,
        background: 'background.surface',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {selectedQuizId ? (
          <Button
            variant="outlined"
            color="neutral"
            onClick={onBack}
            size="sm"
          >
            返回
          </Button>
        ) : (
          <Typography level="title-lg" sx={{ mr: 2 }}>
            模擬測驗
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {selectedQuizId && (
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => setShowHistory(true)}
            size="sm"
          >
            歷史紀錄
          </Button>
        )}
        <ModeToggle />
        <IconButton
          variant="outlined"
          color="neutral"
          onClick={handleBackup}
          size="sm"
        >
          <BackupIcon />
        </IconButton>
        <IconButton
          variant="outlined"
          color="neutral"
          onClick={() => setShowBackupModal(true)}
          size="sm"
        >
          <RestoreIcon />
        </IconButton>
      </Box>

      <Modal open={showBackupModal} onClose={() => setShowBackupModal(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" mb={2}>
            恢復備份
          </Typography>
          <Typography mb={2}>
            請選擇備份檔案進行恢復。注意：這將會覆蓋當前的所有進度！
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
  const [showHistory, setShowHistory] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [quizHistory, setQuizHistory] = useState([])

  useEffect(() => {
    // Load quiz history from localStorage
    const loadHistory = () => {
      const history = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('quiz_result_')) {
          try {
            const record = JSON.parse(localStorage.getItem(key));
            history.push(record);
          } catch (error) {
            console.error('Error parsing quiz history:', error);
          }
        }
      }
      setQuizHistory(history.sort((a, b) => b.timestamp - a.timestamp));
    };

    loadHistory();
  }, [showHistory]); // Reload when showHistory changes

  useEffect(() => {
    // Add/remove modal-open class for blur effect
    if (showHistory || showBackupModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showHistory, showBackupModal]);

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
      <div className="app-root">
        <NavBar 
          selectedQuizId={selectedQuizId} 
          onBack={handleBack} 
          showHistory={showHistory} 
          setShowHistory={setShowHistory}
          showBackupModal={showBackupModal}
          setShowBackupModal={setShowBackupModal}
        />
        <div className="app-content">
          {selectedQuizId ? (
            <Quiz 
              quizData={quizData} 
              onBack={handleBack} 
            />
          ) : (
            <Bookshelf onQuizSelect={handleQuizSelect} />
          )}
        </div>

        {/* History Modal */}
        <HistoryModal 
          open={showHistory}
          onClose={() => setShowHistory(false)}
          history={quizHistory}
        />
      </div>
    </CssVarsProvider>
  );
}

export default App;
