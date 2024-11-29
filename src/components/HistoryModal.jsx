import React from 'react';
import { Modal, ModalDialog, Typography, Box, Button, List, ListItem, ListItemButton, ListDivider } from '@mui/joy';

function HistoryModal({ open, onClose, history = [] }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="history-modal-title"
        sx={{
          maxWidth: 500,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <Typography id="history-modal-title" component="h2" level="h4" mb={2}>
          歷史紀錄
        </Typography>
        {history.length === 0 ? (
          <Typography level="body-md" mb={2}>
            暫無歷史紀錄
          </Typography>
        ) : (
          <List>
            {history.map((record, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemButton sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                    <Typography level="title-sm">
                      {record.quizTitle}
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography level="body-sm">
                        完成時間：{new Date(record.timestamp).toLocaleString()}
                      </Typography>
                      <Typography level="body-sm">
                        得分：{record.score}%
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < history.length - 1 && <ListDivider />}
              </React.Fragment>
            ))}
          </List>
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="neutral" onClick={onClose}>
            關閉
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default HistoryModal;
